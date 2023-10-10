import { useEffect, useState, useContext } from 'react';
import * as anchor from "@project-serum/anchor";
import { encryptPayload } from './encryptPayload';
import { decryptPayload } from './decryptPayload';
import Toast from "react-native-toast-message";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as Linking from "expo-linking";
import axios from 'axios';
import { buildUrl } from './buildUrl';
import {
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
    SYSVAR_CLOCK_PUBKEY,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { OFFERDATA_SIZE, CONTRACT_IDL, USERINFO_SIZE } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';
import { CRYPTO_VALUES } from '../constants/offers';
import { API_URL } from './api';
import { AppContext } from './AppContext';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
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

const onSignAndSendTransactionRedirectLink = Linking.createURL(
    "onSignAndSendTransaction"
);

const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress,
    payer,
    walletAddress,
    splTokenMintAddress
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

async function getLastTx(publicKey) {
    return await connection.getSignaturesForAddress(publicKey, {limit: 1});
}

const signAndSendTransaction = async (transaction, wallet, conn, signers, session, dappKeyPair, sharedSecret) => {
    if (!wallet) return;
    try {
        
        transaction.feePayer = wallet;
        transaction.recentBlockhash = (
            await conn.getLatestBlockhash()
        ).blockhash;
        transaction.setSigners(wallet, ...signers.map(s => s.publicKey));
        if(signers.length > 0) {await transaction.partialSign(...signers);}
        const serializedTransaction = await transaction.serialize({
            requireAllSignatures: false,
        });
        const payload = {
            session,
            transaction: bs58.encode(serializedTransaction),
        };
        console.log(transaction)
        const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
        const params = new URLSearchParams({
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          nonce: bs58.encode(nonce),
          redirect_link: onSignAndSendTransactionRedirectLink,
          payload: bs58.encode(encryptedPayload),
        });
        const url = buildUrl("signAndSendTransaction", params);
        Linking.openURL(url);
        return {result: true}
    } catch (error) {
        console.log(error)
        Toast.show({
            type: "error",
            text1: "Transaction failed.",
          });
        return {result: false}
    }
};

const getTokenWallet = async (wallet, mint) => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
};

const getPoolData = async (wallet) => {
    let provider = new anchor.Provider(connection , wallet, confirmOption);
    const program = new anchor.Program(idl, programId, provider);
    let fetchData = await program.account.pool.fetch(pool);
    return fetchData;
}

const _discontinueOffer = async (offerAccount, wallet, session, dappKeyPair, sharedSecret) => {
    let transaction = new Transaction();
    let signers = [];

    const cancelUrl = `${API_URL}/offer/cancel`;
    const cancelRes = await axios.post(cancelUrl, {wallet, offerAccount});
    const cancelInsData = cancelRes.data.data;
    const cancelInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        }, {
            pubkey: new PublicKey(offerAccount),
            isSigner: false,
            isWritable: true,
        }, {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        }, {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        }],
        data: Buffer.from(cancelInsData),
        programId
    });

    transaction.add(cancelInstruction);

    await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret)
}

const _createOffer = async (props, wallet, session, dappKeyPair, sharedSecret) => {
    const {token, fiat, amount, minLimit, maxLimit, payments, time, terms, rate} = props;
    let transaction = new Transaction();
    let signers = [];

    let resp = await connection.getProgramAccounts(programId,
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
                        bytes: wallet
                    }
                },
            ]
        }
    );

    if (resp.length < 1) {
        const userInfo = Keypair.generate();   
        signers.push(userInfo);
        const userUrl = `${API_URL}/wallet/create`;
        const userRes = await axios.post(userUrl, {wallet, userInfo: userInfo.publicKey.toBase58()});
        const userInsData = userRes.data.data;
        const userInstruction = new anchor.web3.TransactionInstruction({
            keys: [
                {
                    pubkey: wallet,
                    isSigner: true,
                    isWritable: true,
                }, 
                {
                    pubkey: pool,
                    isSigner: false,
                    isWritable: true,
                }, 
                {
                    pubkey: userInfo.publicKey,
                    isSigner: true,
                    isWritable: true,
                }, 
                {
                    pubkey: wallet,
                    isSigner: false,
                    isWritable: false,
                }, 
                {
                    pubkey: anchor.web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                }, 
            ], 
            data: Buffer.from(userInsData),
            programId
        })
        transaction.add(userInstruction);
    }

    const poolData = await getPoolData(wallet);
    const firDiv = new PublicKey(poolData.firDiv);
    const secDiv = new PublicKey(poolData.secDiv);
    const thrDiv = new PublicKey(poolData.thrDiv);
    const offerData = Keypair.generate();
    let mint;
    if (token !== "sol") {
        mint = new PublicKey(token);
    } else {
        mint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    }
    const firFeeAccount = await getTokenWallet(firDiv, mint);
    if((await connection.getAccountInfo(firFeeAccount)) == null){
        transaction.add(createAssociatedTokenAccountInstruction(firFeeAccount, wallet.publicKey, firDiv, mint))
    }
    const secFeeAccount = await getTokenWallet(secDiv, mint);
    if((await connection.getAccountInfo(secFeeAccount)) == null){
        transaction.add(createAssociatedTokenAccountInstruction(secFeeAccount, wallet.publicKey, secDiv, mint))
    }
    const thrFeeAccount = await getTokenWallet(thrDiv, mint);
    if((await connection.getAccountInfo(thrFeeAccount)) == null){
        transaction.add(createAssociatedTokenAccountInstruction(thrFeeAccount, wallet.publicKey, thrDiv, mint))
    }
    const poolAccount = await getTokenWallet(pool, mint);
    if((await connection.getAccountInfo(poolAccount)) == null){
        transaction.add(createAssociatedTokenAccountInstruction(poolAccount, wallet, pool, mint))
    }
    const buyerAccount = await getTokenWallet(wallet, mint);
    if((await connection.getAccountInfo(buyerAccount)) == null){
        transaction.add(createAssociatedTokenAccountInstruction(buyerAccount, wallet, wallet, mint))
    }

    signers.push(offerData);
    const publicKey = await AsyncStorage.getItem("publicKey");

    const offerUrl = `${API_URL}/offer/create`;
    const offerRes = await axios.post(offerUrl, {wallet: wallet.toString(), mint, offerData: offerData.publicKey.toBase58(), token, terms, time, maxLimit, minLimit, rate, amount, fiat, payments, publicKey});
    const offerInsData = offerRes.data.data;
    const offerInstruction = new anchor.web3.TransactionInstruction({
        keys: [
            {
                pubkey: wallet,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: pool,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: firFeeAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: secFeeAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: thrFeeAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: poolAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: buyerAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: mint,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: offerData.publicKey,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: TOKEN_PROGRAM_ID,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: anchor.web3.SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: SYSVAR_CLOCK_PUBKEY,
                isSigner: false,
                isWritable: false,
            },
        ], 
        data: Buffer.from(offerInsData),
        programId
    })
    transaction.add(offerInstruction);

    const res = await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret)

    return res.result;
}

const _updateOffer = async (props, wallet, session, dappKeyPair, sharedSecret) => {
    const { offerAccount, fiat, amount, minLimit, maxLimit, payments, time, terms} = props;
    let transaction = new Transaction();
    let signers = [];

    const updateUrl = `${API_URL}/offer/update`;
    const updateRes = await axios.post(updateUrl, {wallet: wallet.toString(), offerAccount, fiat, amount, minLimit, maxLimit, payments, time, terms});
    const updateInsData = updateRes.data.data;
    const updateInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        }, {
            pubkey: new PublicKey(offerAccount),
            isSigner: false,
            isWritable: true,
        }, {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        }, {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        }],
        data: Buffer.from(updateInsData),
        programId
    });

    transaction.add(updateInstruction);

    const res = await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret)

    return res.result;
}

const useOffer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [anchorWallet, setAnchorWallet] = useState(false);
    const [allOffers, setAllOffers] = useState([]);
    // const [balance, setBalance] = useWalletBalance();
    const [refresh, setRefresh] = useState(false);
    const { walletAddress, session, dappKeyPair, sharedSecret, chainID } = useContext(AppContext)
    // const anchorWallet = useAnchorWallet();

    const updateBalance = async (wallet) => {
        const balance = await connection.getBalance(wallet);
        // setBalance(balance / LAMPORTS_PER_SOL);
    }

    const getOffers = async (wallet, own) => {
        let provider = wallet 
            ? new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions())
            : new anchor.Provider(connection, anchor.Provider.defaultOptions())
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
                if (!offer.status || Number.parseInt(offer.tokenAmount.toString())  === 0) continue;
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
                const TXs = await connection.getConfirmedSignaturesForAddress2(userResp[0].pubkey);
                const txDetails = await connection.getParsedTransactions([TXs[0].signature]);
                const now = Math.floor(new Date() / 1000);
                const during = now - txDetails[0].blockTime;
                let lastSeen = "";
                let onlineStatus = false;
                if (Math.floor(during / 60) < 60) {
                    lastSeen = Math.floor(during / 60) <= 1 ? "a minute" : Math.floor(during / 60) + " minutes";
                    onlineStatus = Math.floor(during / 60) < 45 ? true : false;
                }
                if (Math.floor(during / 3600) >= 1 && Math.floor(during / 3600) < 24) {
                    lastSeen = Math.floor(during / 3600) === 1 ? "an hour" : Math.floor(during / 3600) + " hours";
                    onlineStatus = false;
                } 
                if (Math.floor(during / 86400) >= 1) {
                    lastSeen = Math.floor(during / 86400) === 1 ? "a day" : Math.floor(during / 86400) + " days";
                    onlineStatus = false;
                }

                const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
                const date = new Date(offer.createdTime.toNumber() * 1000);
                const tokenAmount = Number.parseInt(offer.tokenAmount.toString()) / LAMPORTS_PER_SOL;
                const maxLimit = offer.maxLimit.toNumber() / LAMPORTS_PER_SOL;
                const minLimit = offer.minLimit.toNumber() / LAMPORTS_PER_SOL;
                allOffers.push({
                    ...offer, 
                    tokenAmount, 
                    main: offer.sol,
                    tokenName: offer.sol ? "SOL" : tokenName[0].title,
                    offer: offerAccount.pubkey, 
                    thumbsUp: userInfo.thumbsUp.toNumber(), 
                    thumbsDown: userInfo.thumbsDown.toNumber(),
                    maxLimit: tokenAmount < maxLimit ? tokenAmount : maxLimit,
                    minLimit: tokenAmount < minLimit ? tokenAmount : minLimit,
                    region: userInfo.region,
                    bought: offer.bought.toNumber() / LAMPORTS_PER_SOL,
                    unixTime: offer.createdTime.toNumber(),
                    createdAt: date.toDateString() + " " + date.toLocaleTimeString(),
                    lastSeen,
                    onlineStatus,
                    verified: userInfo.verified,
                });
            }
        } catch (e) {
            console.log(e);
        }
        return allOffers.sort((a, b) => b.createdTime.toNumber() - a.createdTime.toNumber());
    }

    const createOffer = async (props) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
              });
            return;
        }

        setIsLoading(true);
        const result = await _createOffer(props, anchorWallet, session, dappKeyPair, sharedSecret);
        await updateBalance(anchorWallet);


        return result;
    }

    const updateOffer = async (props) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
              });
            return;
        }

        setIsLoading(true);
        const result = await _updateOffer(props, anchorWallet, session, dappKeyPair, sharedSecret);
        await updateBalance(anchorWallet);


        return result;
    }

    const discontinueOffer = async (offerAccount) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
              });
            return;
        }

        setIsLoading(true);

        await _discontinueOffer(offerAccount, anchorWallet, session, dappKeyPair, sharedSecret);
        const newMyOffers = await getOffers(anchorWallet, true);


        return newMyOffers;
    }

    const getTokenBalance = async (token) => {
        if (!anchorWallet) {
            // toast.error('Connect wallet first, please.');
            return;
        }

        if (token === "sol") {
            const balance = await connection.getBalance(anchorWallet);
            return balance / LAMPORTS_PER_SOL - 0.01;
        } else {
            const balance = await connection.getParsedTokenAccountsByOwner(
                anchorWallet, { mint: token }
            );
            const tokenBalance = balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount;

            return tokenBalance - 0.01;
        }

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
        const poolData = await getPoolData(anchorWallet);
        console.log(poolData)
        let userInfo = await program.account.userInfo.fetch(userResp[0].pubkey);
        const now = Math.floor(new Date() / 1000);
        const lastTx = await getLastTx(offer.owner)
        const during = now - lastTx;
        let onlineStatus = false;
        if (Math.floor(during / 60) < 60) {
            onlineStatus = Math.floor(during / 60) < 3 ? true : false;
        }
        const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
        const tokenAmount = Number.parseInt(offer.tokenAmount.toString()) / LAMPORTS_PER_SOL;
        const maxLimit = offer.maxLimit.toNumber() / LAMPORTS_PER_SOL;
        const minLimit = offer.minLimit.toNumber() / LAMPORTS_PER_SOL;
        setIsLoading(false);
        return {
            ...offer,
            tokenAmount,
            tokenName: offer.sol ? "SOL" : tokenName[0].title,
            thumbsUp: userInfo.thumbsUp.toNumber(),
            thumbsDown: userInfo.thumbsDown.toNumber(),
            maxLimit: tokenAmount < maxLimit ? tokenAmount : maxLimit,
            minLimit: tokenAmount < minLimit ? tokenAmount : minLimit,
            timeLimit: offer.timeLimit.toNumber(),
            offer: offerAccount.pubkey, 
            online: onlineStatus,
            buyer: offer.owner.toString(),
            fee: poolData.fee / 200,
            rate: offer.rate * 1,
        }
    }

    useEffect(() => {
        !chainID && walletAddress && setAnchorWallet(new PublicKey(walletAddress))
    }, [walletAddress, chainID])

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const newAllOffers = await getOffers(false, false);
            setAllOffers(newAllOffers);
            setIsLoading(false);
            setRefresh(false);
        })();
    }, [refresh]);

    return { isLoading, allOffers, refresh, setRefresh, createOffer, getOfferData, discontinueOffer, updateOffer, getTokenBalance, setIsLoading };
}


export default useOffer;