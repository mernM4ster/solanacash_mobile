import { useEffect, useState, useContext } from 'react';
import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
    PublicKey,
    Transaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import Toast from "react-native-toast-message";
import { OFFERDATA_SIZE, CONTRACT_IDL, USERINFO_SIZE } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';
import { CRYPTO_VALUES } from '../constants/offers';
import { AppContext } from './AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rpcHost = NEXT_PUBLIC_SOLANA_RPC_HOST;
const connection = new anchor.web3.Connection(rpcHost);
const programId = new PublicKey(NEXT_PUBLIC_CONTRACT_ID);
const pool = new PublicKey(NEXT_PUBLIC_POOL_ID);
const idl = CONTRACT_IDL;
const confirmOption = {
    commitment : 'finalized',
    preflightCommitment : 'finalized',
    skipPreflight : false
}

async function sendAllTransaction(transactions, wallet, conn, signers){
    try {
        let commitment = "max"
        let unsignedTxns = []
        let block = await conn.getRecentBlockhash(commitment);
        for(let i = 0; i < transactions.length; i++){
            let transaction = transactions[i]
            transaction.recentBlockhash = block.blockhash;
            transaction.setSigners(wallet.publicKey, ...signers.map(s => s.publicKey));
            if(signers.length !== 0) await transaction.partialSign(...signers);
            unsignedTxns.push(transaction);
        }
        const signedTxns = await wallet.signAllTransactions(unsignedTxns)
        for(let i=0;i<signedTxns.length;i++){
            try {
              console.log(i)
              let hash = await conn.sendRawTransaction(await signedTxns[i].serialize())
              await conn.confirmTransaction(hash)
              // console.log(hash)
            } catch(error) {
              console.log(error)
              return {result: false, number: i, kind: 1}
            }
        }
        Toast.show({
          type: "success",
          text1: "Transaction succeed.",
        });
        return {result: true, number: 0, kind: 0}
      } catch (error) {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Transaction failed. Please try again.",
        });
        return {result: false};
    }
}

const useMyOffer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [myOffers, setMyOffers] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const { walletAddress, chainID } = useContext(AppContext);

    const updateBalance = async (wallet) => {
        const balance = await connection.getBalance(wallet);
    }

    const getOffers = async (wallet, own) => {
        let provider = new anchor.Provider(connection, anchor.Provider.defaultOptions())
        const program = new anchor.Program(idl, programId, provider);
        const allOffers = [];
        try {
            let filterOpt = [
                {
                    dataSize: OFFERDATA_SIZE
                },
                {
                    memcmp: {
                        offset: 40,
                        bytes: pool.toBase58()
                    }
                }
            ]

            if (own) {
                filterOpt.push({
                    memcmp:{
                        offset: 8,
                        bytes: wallet.toBase58()
                    }
                })
            }
            
            let resp = await connection.getProgramAccounts(programId,
                {
                    dataSlice: {
                        length: 0, 
                        offset: 0
                    },
                    filters: filterOpt
                }
            );
            for(let offerAccount of resp){
                let offer = await program.account.offerData.fetch(offerAccount.pubkey);
                if (!own && (wallet && (!offer.status || offer.owner.toString() === wallet.toString()))) continue;
                const userResp = await connection.getProgramAccounts(programId,
                    {
                        dataSlice: {
                            length: 0, 
                            offset: 0
                        },
                        filters: [
                            {
                                dataSize: USERINFO_SIZE
                            },
                            {
                                memcmp: {
                                    offset: 8,
                                    bytes: offer.owner.toString()
                                }
                            },
                            {
                                memcmp: {
                                    offset: 40,
                                    bytes: pool.toBase58()
                                }
                            }
                        ]
                    }
                );
                let userInfo = await program.account.userInfo.fetch(userResp[0].pubkey);
                const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                const date = new Date(offer.createdTime.toNumber() * 1000);
                allOffers.push({
                    ...offer, 
                    main: offer.sol,
                    tokenAmount: Number.parseInt(offer.tokenAmount.toString()) / LAMPORTS_PER_SOL, 
                    tokenName: offer.sol ? "SOL" : tokenName[0].title,
                    offer: offerAccount.pubkey, 
                    thumbsUp: userInfo.thumbsUp, 
                    minLimit: offer.minLimit.toNumber() / LAMPORTS_PER_SOL,
                    maxLimit: offer.maxLimit.toNumber() / LAMPORTS_PER_SOL,
                    thumbsDown: userInfo.thumbsDown,
                    bought: offer.bought.toNumber() / LAMPORTS_PER_SOL,
                    unixTime: offer.createdTime.toNumber(),
                    createdAt: date.toDateString() + " " + date.toLocaleTimeString(),
                    verified: userInfo.verified,
                });
            }
        } catch (e) {
            console.log(e);
        }
        return allOffers;
    }

    const getMyOffers = async () => {
        if (!walletAddress) {
          Toast.show({
            type: "error",
            text1: "Connect wallet first, please.",
          });
          return;
        }

        setIsLoading(true);
        const wallet = new PublicKey(walletAddress);
        const useMyOffers = await getOffers(wallet, true);
        setMyOffers(useMyOffers);
        await updateBalance(wallet);

        setIsLoading(false);

        return useMyOffers;
    }

    const getOfferData = async (offerAccount) => {
        setIsLoading(true);
        const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
        const program = new anchor.Program(idl, programId, provider);
        let offer = await program.account.offerData.fetch(offerAccount);
        console.log(offer)
        const userResp = await connection.getProgramAccounts(programId,
            {
                dataSlice: {
                    length: 0, 
                    offset: 0
                },
                filters: [
                    {
                        dataSize: USERINFO_SIZE
                    },
                    {
                        memcmp: {
                            offset: 8,
                            bytes: offer.owner.toString()
                        }
                    }
                ]
            }
        );
        let userInfo = await program.account.userInfo.fetch(userResp[0].pubkey);
        const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
        setIsLoading(false);
        return {
            ...offer,
            tokenName: offer.sol ? "SOL" : tokenName[0].title,
            thumbsUp: userInfo.thumbsUp.toNumber(),
            thumbsDown: userInfo.thumbsDown.toNumber(),
            minLimit: offer.minLimit.toNumber() / LAMPORTS_PER_SOL,
            maxLimit: offer.maxLimit.toNumber() / LAMPORTS_PER_SOL,
            timeLimit: offer.timeLimit.toNumber(),
            offer: offerAccount.pubkey, 
            buyer: offer.owner.toString(),
            fee: 1,
            rate: offer.rate * 1,
        }
    }

    useEffect(() => {
        (async () => {
            if (
                !chainID || !walletAddress
            ) {
                setIsLoading(false);
                return;
            }
            const wallet = new PublicKey(walletAddress);
            const data = await AsyncStorage.getItem(`${walletAddress}-offers`);
            console.log("Data", data)
            if (data) {
                setMyOffers(JSON.parse(data));
            } 
            if (!data || refresh) {
                console.log("loading")
                setIsLoading(true);
            }
            const newMyOffers = await getOffers(wallet, true);
            await AsyncStorage.setItem(`${walletAddress}-offers`, JSON.stringify(newMyOffers));
            setMyOffers(newMyOffers);
            setIsLoading(false);
            console.log("here")
            setRefresh(false);
        })();
    }, [chainID, walletAddress, refresh]);

    return { isLoading, myOffers, refresh, setRefresh, getMyOffers, getOfferData, setIsLoading };
}


export default useMyOffer;