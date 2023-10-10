import { useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import * as anchor from "@project-serum/anchor";
import Toast from "react-native-toast-message";
import * as Linking from "expo-linking";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
    Keypair,
    PublicKey,
    Transaction,
    SYSVAR_CLOCK_PUBKEY,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { JSEncrypt } from "jsencrypt";
import axios from 'axios';
import { encryptPayload } from './encryptPayload';
import { decryptPayload } from './decryptPayload';
import { buildUrl } from './buildUrl';
import { ORDERDATA_SIZE, CONTRACT_IDL, USERINFO_SIZE } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';
import { CRYPTO_VALUES, FIAT_VALUES, PAYMENT_OFFER_VALUES } from '../constants/offers';
import { API_URL } from './api';
import { AppContext } from './AppContext';

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
        
        const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
        console.log(transaction)
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

async function getLastTx(publicKey) {
    return await connection.getSignaturesForAddress(publicKey, {limit: 1});
}

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

const _thumbUser = async (thumbUp, orderAccount, userInfo, wallet, session, dappKeyPair, sharedSecret) => {
    let transaction = new Transaction();
    let signers = [];

    const followUrl = `${API_URL}/wallet/follow`;
    const followRes = await axios.post(followUrl, {wallet: wallet.toString(), orderAccount, userInfo, thumbUp});
    const followInsData = followRes.data.data;
    const followInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isWritable: true,
            isSigner: true,
        }, {
            pubkey: pool,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: new PublicKey(userInfo),
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: new PublicKey(orderAccount),
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: anchor.web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        }],
        data: Buffer.from(followInsData),
        programId
    })

    transaction.add(followInstruction);

    await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret);
}

const _cancelOrder = async (orderAccount, wallet, session, dappKeyPair, sharedSecret) => {
    let provider = new anchor.Provider(connection, confirmOption);
    let program = new anchor.Program(idl, programId, provider);
    let transaction = new Transaction();
    let signers = [];

    const cancelUrl = `${API_URL}/order/cancel`;
    const cancelRes = await axios.post(cancelUrl, {wallet: wallet.toString(), orderAccount});
    const cancelInsData = cancelRes.data.data;

    const orderData = await program.account.orderData.fetch(orderAccount);
    let offerData = await program.account.offerData.fetch(orderData.offer);
    const mint = new PublicKey(offerData.token);
    const sellerAccount = await getTokenWallet(wallet, mint);
    const poolAccount = await getTokenWallet(pool, mint);
    const cancelInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isWritable: true,
            isSigner: true
        }, {
            pubkey: pool,
            isWritable: true,
            isSigner: false
        }, {
            pubkey: new PublicKey(orderAccount),
            isWritable: true,
            isSigner: false
        }, {
            pubkey: orderData.offer,
            isWritable: true,
            isSigner: false
        }, {
            pubkey: poolAccount,
            isWritable: true,
            isSigner: false
        }, {
            pubkey: sellerAccount,
            isWritable: true,
            isSigner: false
        }, {
            pubkey: orderData.owner,
            isWritable: true,
            isSigner: false
        }, {
            pubkey: TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false
        }, {
            pubkey: anchor.web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false
        }],
        data: Buffer.from(cancelInsData),
        programId
    });

    transaction.add(cancelInstruction);

    await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret);
}

const _buyerConfirm = async (orderAccount, wallet, session, dappKeyPair, sharedSecret) => {
    let transaction = new Transaction();
    let signers = [];

    const confirmUrl = `${API_URL}/order/buyer`;
    const confirmRes = await axios.post(confirmUrl, {wallet: wallet.toString(), orderAccount});
    const confirmInsData = confirmRes.data.data;
    const confirmInstruction = new anchor.web3.TransactionInstruction({
        keys:[{
            pubkey: wallet,
            isWritable: true,
            isSigner: true
        },{
            pubkey: new PublicKey(orderAccount),
            isWritable: true,
            isSigner: false
        }],
        data: Buffer.from(confirmInsData),
        programId
    })
    transaction.add(confirmInstruction);

    await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret);
}

const _createDispute = async (reason, explain, orderAccount, wallet) => {
    let provider = new anchor.Provider(connection, wallet, confirmOption);
    let program = new anchor.Program(idl, programId, provider);
    let transactionSet = [];
    let transaction = [];
    let signers = [];

    transaction.push(
        program.instruction.createDispute(
            reason,
            explain,
            "",
            {
            accounts:{
                owner : wallet.publicKey,
                orderData: orderAccount
            }
        })
    );

    let bigTx;
    for (let i = 0; i < transaction.length; i++) {
        if (i % 4 === 0) {
            bigTx = new Transaction();
            bigTx.add(transaction[i]);
            console.log(bigTx)
        } else {
            bigTx.add(transaction[i]);
        }
        if (i % 4 === 3 || i === transaction.length - 1) {
            transactionSet.push(bigTx)
        }
    }

    await sendAllTransaction(transactionSet, wallet, connection, signers);
}

const _createOrder = async (props, wallet, session, dappKeyPair, sharedSecret, setKey) => {
    const {sellAmount, receiveAmount, offerAccount, token, paymentOption, accountName, emailAddress} = props;
    const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions);
    const program = new anchor.Program(idl, programId, provider);
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

    let mint;
    if (token !== "sol") {
        mint = new PublicKey(token);
    } else {
        mint = new PublicKey("E9UURnky9iZ8HuazYZ7JXjUMxT27B1JKVxcZW2AoDCHw");
    }
    const orderData = Keypair.generate();  
    const crypt = new JSEncrypt({default_key_size: 400});
    const offerData = await program.account.offerData.fetch(offerAccount);
    const sellerAccount = await getTokenWallet(wallet, mint);
    const poolAccount = await getTokenWallet(pool, mint);
    crypt.setKey(offerData.publicKey);
    const encryptedName = crypt.encrypt(accountName);
    const encryptedEmail = crypt.encrypt(emailAddress);
    const offer = new PublicKey(offerAccount);
    const buyer = new PublicKey(offerData.owner.toString());
    
    signers.push(orderData);
    
    const orderUrl = `${API_URL}/order/create`;
    const orderRes = await axios.post(orderUrl, {wallet: wallet.toString(), sellAmount, receiveAmount, offerAccount, token, paymentOption, encryptedName, encryptedEmail, orderData: orderData.publicKey.toBase58()});
    const orderInsData = orderRes.data.data;
    const orderInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isWritable: true,
            isSigner: true
        },{
            pubkey: pool,
            isWritable: true,
            isSigner: false
        },{
            pubkey: offer,
            isWritable: true,
            isSigner: false
        },{
            pubkey: buyer,
            isWritable: true,
            isSigner: false
        },{
            pubkey: sellerAccount,
            isWritable: true,
            isSigner: false
        },{
            pubkey: poolAccount,
            isWritable: true,
            isSigner: false
        },{
            pubkey: orderData.publicKey,
            isWritable: true,
            isSigner: true
        },{
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },{
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },{
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false,
        }],
        data: Buffer.from(orderInsData),
        programId
    });

    transaction.add(orderInstruction);

    const res = await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret)

    if (res.result) {
        setKey(orderData.publicKey.toBase58());
    } else {
        return false;
    }
}

const _confirmOrder = async (orderAccount, wallet, session, dappKeyPair, sharedSecret) => {
    let provider = new anchor.Provider(connection, wallet, confirmOption);
    let program = new anchor.Program(idl, programId, provider);
    let transaction = new Transaction();
    let signers = [];

    const confirmUrl = `${API_URL}/order/seller`;
    const confirmRes = await axios.post(confirmUrl, {wallet: wallet.toString(), orderAccount});
    const confirmInsData = confirmRes.data.data;

    const orderData = await program.account.orderData.fetch(orderAccount);
    const offerData = await program.account.offerData.fetch(orderData.offer);
    const poolData = await getPoolData(wallet);
    const poolAccount = await getTokenWallet(pool, offerData.token);
    const buyerAccount = await getTokenWallet(orderData.buyer, offerData.token);
    const firFeeAccount = await getTokenWallet(poolData.firDiv, offerData.token);
    const secFeeAccount = await getTokenWallet(poolData.secDiv, offerData.token);
    const thrFeeAccount = await getTokenWallet(poolData.thrDiv, offerData.token);
    const confirmInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isWritable: true,
            isSigner: true,
        }, {
            pubkey: pool,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: orderData.offer,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: new PublicKey(orderAccount),
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: poolAccount,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: buyerAccount,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: firFeeAccount,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: secFeeAccount,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: thrFeeAccount,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: orderData.buyer,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: poolData.firDiv,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: poolData.secDiv,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: poolData.thrDiv,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: offerData.token,
            isWritable: true,
            isSigner: false,
        }, {
            pubkey: TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false,
        }, {
            pubkey: anchor.web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        }],
        data: Buffer.from(confirmInsData),
        programId
    })

    transaction.add(confirmInstruction);

    const result = await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret);
    return result;
}

const useOrder = () => {
    const { walletAddress, chainID, session, dappKeyPair, sharedSecret, setKey } = useContext(AppContext);
    const [anchorWallet, setAnchorWallet] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allOrders, setAllOrders] = useState([]);
    const [ordersCount, setOrdersCount] = useState(0);
    const [refresh, setRefresh] = useState(false);
    // const anchorWallet = useAnchorWallet();
    // const anchorWallet = new anchor.Wallet(new PublicKey(walletAddress));

    const updateBalance = async (wallet) => {
        const balance = await connection.getBalance(wallet);
        // setBalance(balance / LAMPORTS_PER_SOL);
    }

    const getOrders = async (wallet) => {
        const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
        const program = new anchor.Program(idl, programId, provider);
        const orders = [];
        let newOrdersCount = 0;

        try {
            const sellFilter =  [
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

            const buyFilter = [
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
                        bytes: wallet
                    }
                }
            ]

            const buyResp = await connection.getProgramAccounts(programId,
                {
                    dataSlice: {
                        length: 0, 
                        offset: 0
                    },
                    filters: buyFilter
                }
            );
            const sellResp = await connection.getProgramAccounts(programId,
                {
                    dataSlice: {
                        length: 0, 
                        offset: 0
                    },
                    filters: sellFilter
                }
            );
            const allResp = [...buyResp, ...sellResp];
            for(let orderAccount of allResp){
                const order = await program.account.orderData.fetch(orderAccount.pubkey);
                if (order.status === 0) newOrdersCount++;
                const offer = await program.account.offerData.fetch(order.offer);
                const date = new Date(order.createdTime.toNumber() * 1000);
                const tokenName = CRYPTO_VALUES.filter(item => item.value === offer.token.toString());
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
                                    bytes: order.owner.toString() === wallet ? order.buyer.toString() : order.owner.toString()
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
                orders.push({
                    sol: offer.sol,
                    main: offer.sol,
                    type: order.buyer.toString() === wallet ? "Buy" : "Sell",
                    name: order.owner.toString() === wallet ? order.buyer.toString() : order.owner.toString(),
                    fiatAmount: order.receiveAmount * 1,
                    rate: offer.rate * 1,
                    cryptoAmount: order.sellAmount.toNumber() / LAMPORTS_PER_SOL,
                    status: order.status,
                    fiat: offer.fiat.toString(),
                    tokenName: offer.sol ? "SOL" : tokenName[0].title,
                    unixTime: order.createdTime.toNumber(),
                    createdTime: order.createdTime.toNumber(),
                    createdAt: date.toDateString() + " " + date.toLocaleTimeString(),
                    verified: userInfo.verified,
                    token: offer.token,
                    id: orderAccount.pubkey.toString()
                });
            }

            setOrdersCount(newOrdersCount);
        } catch (error) {
            console.log(error);
        }

        return orders.sort((a, b) => b.createdTime - a.createdTime);
    }

    const createOrder = async (props) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
            });
            return;
        }

        setIsLoading(true);
        const result = await _createOrder(props, anchorWallet, session, dappKeyPair, sharedSecret, setKey);
        await updateBalance(anchorWallet);

        return result;
    }

    const getOrderInfo = async (orderAccount, orderType) => {
        console.log("orderAccount", orderAccount)
        const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
        const program = new anchor.Program(idl, programId, provider);
        let orderData = await program.account.orderData.fetch(orderAccount);
        let offerData = await program.account.offerData.fetch(orderData.offer);
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
                            bytes: orderType === "buy" ? orderData.owner.toString() : orderData.buyer.toString()
                        }
                    }
                ]
            }
        );

        const poolData = await getPoolData(anchorWallet);
        let userInfo = await program.account.userInfo.fetch(userResp[0].pubkey);
        const tokenName = CRYPTO_VALUES.filter(item => item.value === offerData.token.toString());
        const crypt = new JSEncrypt({default_key_size: 400});
        const privateKey = await AsyncStorage.getItem("privateKey");
        crypt.setKey(privateKey);
        console.log("decrypt", privateKey )
        const emailAddress = orderType === "buy" 
            ? crypt.decrypt(orderData.emailAddress) 
            : await AsyncStorage.getItem(`${PAYMENT_OFFER_VALUES[orderData.paymentOption].title}-email`);
        const accountName = orderType === "buy" 
            ? crypt.decrypt(orderData.accountName) 
            : await AsyncStorage.getItem(`${PAYMENT_OFFER_VALUES[orderData.paymentOption].title}-name`);
        console.log(orderData)
        const date = new Date(orderData.createdTime.toNumber() * 1000);
        const now = Math.floor(new Date() / 1000);
        const lastTx = await getLastTx(userResp[0].pubkey)
        const during = now - lastTx[0].blockTime;
        console.log(during)
        let onlineStatus = false;
        onlineStatus = during < 180 ? true : false;
        return {
            userAccount: userResp[0].pubkey,
            thumbsUp: userInfo.thumbsUp.toNumber(),
            thumbsDown: userInfo.thumbsDown.toNumber(),
            verified: userInfo.verified,
            timeLimit: offerData.timeLimit.toNumber(),
            buyer: orderType === "buy" ? orderData.owner.toString() : orderData.buyer.toString(), 
            sellAmount: orderData.sellAmount.toNumber() * (1 - poolData.fee / 10000 ) / LAMPORTS_PER_SOL,
            fiatAmount: orderData.receiveAmount * 1,
            fee: poolData.fee / 200,
            moneyFee: orderData.sellAmount.toNumber() * poolData.fee / LAMPORTS_PER_SOL / 20000,
            fiat: offerData.fiat.toString(),
            sign: FIAT_VALUES.filter(e => e.value === offerData.fiat)[0].sign,
            tokenName: offerData.sol ? "SOL" : tokenName[0].title,
            rate: offerData.rate * 1,
            feedback: orderData.feedback,
            createdAt: orderData.createdTime,
            createdAtFormat: date.toDateString() + " " + date.toLocaleTimeString(),
            status: orderData.status,
            accountName,
            emailAddress,
            online: onlineStatus,
            paymentOption: orderData.paymentOption,
            buyerConfirm: orderData.buyerConfirm,
            fullId: orderAccount,
            id: orderAccount.slice(0, 4)
        }
    }

    const createDispute = async (reason, explain, orderAccount) => {
        if (!anchorWallet) {
            toast.error('Connect wallet first, please.');
            return;
        }

        setIsLoading(true);
        const result = await _createDispute(reason, explain, orderAccount, anchorWallet);
        await updateBalance(anchorWallet);

        setIsLoading(false);
        return result;
    }

    const confirmPayment = async (orderAccount) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
            });
            return;
        }

        setIsLoading(true);
        const result = await _confirmOrder(orderAccount, anchorWallet, session, dappKeyPair, sharedSecret);
        setKey("release");
        await updateBalance(anchorWallet);

        return result;
    }

    const thumbUser = async (thumbUp, orderAccount, userInfo) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
            });
            return;
        }

        setIsLoading(true);
        const result = await _thumbUser(thumbUp, orderAccount, userInfo, anchorWallet, session, dappKeyPair, sharedSecret);
        await updateBalance(anchorWallet);

        return result;
    }

    const cancelOrder = async (orderAccount) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
            });
            return;
        }

        setIsLoading(true);
        const result = await _cancelOrder(orderAccount, anchorWallet, session, dappKeyPair, sharedSecret);
        await updateBalance(anchorWallet);

        return result;
    }

    const buyerConfirm = async (orderAccount) => {
        if (!anchorWallet) {
            Toast.show({
                type: "error",
                text1: "Please connect wallet.",
            });
            return;
        }

        setIsLoading(true);
        const result = await _buyerConfirm(orderAccount, anchorWallet, session, dappKeyPair, sharedSecret);
        await updateBalance(anchorWallet);

        return result;
    }

    useEffect(() => {
        !chainID && walletAddress && setAnchorWallet(new PublicKey(walletAddress))
    }, [walletAddress])

    useEffect(() => {
        (async () => {
            await new Promise(r => setTimeout(r, 3000));
            if (
                !walletAddress || chainID
            ) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            console.log(new PublicKey(walletAddress))
            const newAllOrders = await getOrders(walletAddress);
            setAllOrders(newAllOrders);
            setIsLoading(false);
            setRefresh(false);
        })();
    }, [walletAddress, refresh]);

    return { 
        isLoading,
        setIsLoading, 
        allOrders, 
        refresh, 
        setRefresh, 
        createOrder, 
        getOrderInfo, 
        confirmPayment, 
        createDispute, 
        thumbUser, 
        cancelOrder, 
        buyerConfirm, 
        ordersCount,
    };
}


export default useOrder;