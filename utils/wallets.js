import { useState, useEffect, useContext } from "react";
import * as anchor from "@project-serum/anchor";
import {
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { ORDERDATA_SIZE, CONTRACT_IDL } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';
import { CRYPTO_VALUES } from "../constants/offers";
import { AppContext } from "./AppContext";

const rpcHost = NEXT_PUBLIC_SOLANA_RPC_HOST;
const connection = new anchor.web3.Connection(rpcHost);
const programId = new PublicKey(NEXT_PUBLIC_CONTRACT_ID);
const pool = new PublicKey(NEXT_PUBLIC_POOL_ID);
const idl = CONTRACT_IDL;

const useWallet = () => {
    const { walletAddress } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [allTokens, setAllTokens] = useState([]);
    // const anchorWallet = useAnchorWallet();

    const getTokens = async (wallet) => {
        const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
        const program = new anchor.Program(idl, programId, provider);
        let orders = [];
        let filterOrders = [];

        try {
            const filter =  [
                {
                    dataSize: ORDERDATA_SIZE
                },
                {
                    memcmp: {
                        offset: 8,
                        bytes: wallet
                    },
                },
                {
                    memcmp: {
                        offset: 40,
                        bytes: pool.toBase58()
                    }
                }
            ];
            const resp = await connection.getProgramAccounts(programId,
                {
                    dataSlice: {
                        length: 0, 
                        offset: 0
                    },
                    filters: filter
                }
            );

            

            for(let orderAccount of resp){
                const order = await program.account.orderData.fetch(orderAccount.pubkey);
                if (order.status !== 0) continue;
                const offer = await program.account.offerData.fetch(order.offer);
                const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                orders.push({
                    balance: order.sellAmount.toNumber() / LAMPORTS_PER_SOL,
                    tokenName: offer.sol ? "SOL" : tokenName[0].title,
                });
            }
            orders.forEach(item => {
                const data = filterOrders.filter(subItem => item.tokenName === subItem.tokenName);
                if (data.length > 0) {
                    filterOrders = filterOrders.map(subItem => item.tokenName === subItem.tokenName && {...item, balance: item.balance + subItem.balance});
                } else {
                    filterOrders.push(item);
                }
            });
        } catch (error) {
            console.log(error);
        }

        return filterOrders;
    }

    useEffect(() => {
        (async () => {
            if (!walletAddress) {
                return;
            }

            setIsLoading(true);
            const newTokens = await getTokens(walletAddress);
            setAllTokens(newTokens);
            setIsLoading(false);
        })();
    }, [walletAddress])

    return { isLoading, allTokens };

}

export default useWallet;