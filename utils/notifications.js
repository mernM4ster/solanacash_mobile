import { useEffect, useState, useContext } from 'react';
import * as anchor from "@project-serum/anchor";
import {
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { ORDERDATA_SIZE, CONTRACT_IDL } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';
import { CRYPTO_VALUES } from '../constants/offers';
import { AppContext } from './AppContext';

// const rpcHost = NEXT_PUBLIC_SOLANA_RPC_HOST;
const rpcHost = "https://api.devnet.solana.com";
const connection = new anchor.web3.Connection(rpcHost);
const programId = new PublicKey(NEXT_PUBLIC_CONTRACT_ID);
const pool = new PublicKey(NEXT_PUBLIC_POOL_ID);
const idl = CONTRACT_IDL;

const useNotification = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [allNotification, setAllNotification] = useState([]);
    const [unReadNum, setUnReadNum] = useState(0);
    const { walletAddress } = useContext(AppContext)

    const getNotifications = async (wallet) => {
        const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
        const program = new anchor.Program(idl, programId, provider);
        let newUnReadNum = 0;
        let notifications = [];
        let newNotifications = [];

        const TXs = await connection.getConfirmedSignaturesForAddress2(programId);
        const signatures = TXs.map(item => item.signature);
        const txDetails = await connection.getParsedTransactions(signatures);
        for (const tx of txDetails) {
            const logs = tx.meta.logMessages;
            const logFilter = logs.filter(log => log.indexOf("Confirm Order") > -1 || log.indexOf("Buyer Confirm") > -1 || log.indexOf("Cancel Order") > -1)

            if (logFilter.length > 0) {
                if (logFilter[0].indexOf("Confirm Order") > -1) {
                    const accounts = tx.transaction.message.instructions[0].accounts;
                    const order = await program.account.orderData.fetch(accounts[3]);
                    if (order.owner.toString() === wallet.toString() || order.buyer.toString() === wallet.toString()) {
                        const offer = await program.account.offerData.fetch(order.offer);
                        const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                        notifications.push({
                            tx: tx.transaction.signatures[0],
                            user: accounts[0].toString(),
                            type: "seller_confirm",
                            createdTime: tx.blockTime,
                            amount: order.sellAmount.toNumber() / LAMPORTS_PER_SOL,
                            tokenName: offer.sol ? "SOL" : tokenName[0].title,
                            orderType: wallet.toString() === order.owner.toString() ? `sell` : `buy`,
                            orderIndex: accounts[3]
                        })
                    }
                }
                if (logFilter[0].indexOf("Buyer Confirm") > -1) {
                    const accounts = tx.transaction.message.instructions[0].accounts;
                    const order = await program.account.orderData.fetch(accounts[1]);
                    if (order.owner.toString() === wallet.toString() || order.buyer.toString() === wallet.toString()) {
                        const offer = await program.account.offerData.fetch(order.offer);
                        const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                        notifications.push({
                            user: accounts[0].toString(),
                            type: "buyer_confirm",
                            createdTime: tx.blockTime,
                            amount: order.sellAmount.toNumber() / LAMPORTS_PER_SOL,
                            tokenName: offer.sol ? "SOL" : tokenName[0].title,
                            orderType: wallet.toString() === order.owner.toString() ? `sell` : `buy`,
                            orderIndex: accounts[1]
                        })
                    }
                }
                if (logFilter[0].indexOf("Cancel Order") > -1) {
                    const accounts = tx.transaction.message.instructions[0].accounts;
                    const order = await program.account.orderData.fetch(accounts[2]);
                    if (order.owner.toString() === wallet.toString() || order.buyer.toString() === wallet.toString()) {
                        const offer = await program.account.offerData.fetch(order.offer);
                        const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                        notifications.push({
                            user: accounts[0].toString(),
                            type: "cancel",
                            createdTime: tx.blockTime,
                            amount: order.sellAmount.toNumber() / LAMPORTS_PER_SOL,
                            tokenName: offer.sol ? "SOL" : tokenName[0].title,
                            orderType: wallet.toString() === order.owner.toString() ? `sell` : `buy`,
                            orderIndex: accounts[2]
                        })
                    }
                }
            }
        }

        try {
            const orderFilter = [
                {
                    dataSize: ORDERDATA_SIZE
                },
                {
                    memcmp: {
                        offset: 40,
                        bytes: pool.toBase58()
                    }
                },
                {
                    memcmp: {
                        offset: 104,
                        bytes: wallet.toBase58()
                    }
                }
            ]

            const orderResp = await connection.getProgramAccounts(programId,
                {
                    dataSlice: {
                        length: 0, 
                        offset: 0
                    },
                    filters: orderFilter
                }
            );

            for(let orderAccount of orderResp){
                const order = await program.account.orderData.fetch(orderAccount.pubkey);
                const offer = await program.account.offerData.fetch(order.offer);
                const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                notifications.push({
                    user: order.owner.toString(),
                    type: "create",
                    createdTime: order.createdTime.toNumber(),
                    amount: order.sellAmount.toNumber() / LAMPORTS_PER_SOL,
                    tokenName: offer.sol ? "SOL" : tokenName[0].title,
                    orderType: wallet.toString() === order.owner.toString() ? `sell` : `buy`,
                    orderIndex: orderAccount.pubkey
                })
            }

            const lastTx = 0;

            notifications.forEach(item => {
                if (item.createdTime > lastTx) newUnReadNum++;
            })

            notifications.sort((a, b) => b.createdTime - a.createdTime);
            newNotifications = notifications.map(item => {
                const date = new Date(item.createdTime * 1000);
                return {...item, createdAt: date.toDateString() + " " + date.toLocaleTimeString(),}
            })
        } catch (error) {
            console.log(error);
        }

        return {newUnReadNum, newNotifications};
    }

    useEffect(() => {
        (async () => {
            if (
                !walletAddress
            ) {
                return;
            }
            const wallet = new PublicKey(walletAddress);
            setIsLoading(true);
            const {newUnReadNum, newNotifications} = await getNotifications(wallet);
            setAllNotification(newNotifications);
            setUnReadNum(newUnReadNum);
            setIsLoading(false);
        })();
    }, [walletAddress]);

    return { isLoading, allNotification, unReadNum, getNotifications };
}


export default useNotification;