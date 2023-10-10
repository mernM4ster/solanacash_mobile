import { useState, useEffect, useContext } from "react";
import * as anchor from "@project-serum/anchor";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import {
    Keypair,
    PublicKey,
    Transaction,
} from "@solana/web3.js";
import Toast from "react-native-toast-message";
import * as Linking from "expo-linking";
import axios from 'axios';
import { AppContext } from "./AppContext";
import { API_URL } from './api';
import { buildUrl } from './buildUrl';
import { encryptPayload } from "./encryptPayload";
import { USERINFO_SIZE, CONTRACT_IDL } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';

const rpcHost = NEXT_PUBLIC_SOLANA_RPC_HOST;
const connection = new anchor.web3.Connection(rpcHost);
const programId = new PublicKey(NEXT_PUBLIC_CONTRACT_ID);
const pool = new PublicKey(NEXT_PUBLIC_POOL_ID);
const idl = CONTRACT_IDL;

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
      return {result: true, number: 0, kind: 0}
  } catch (error) {
    console.log(error)
      Toast.show({
          type: "error",
          text1: "Transaction failed.",
        });
      return {result: false}
  }
};

const _updateProfile = async (props, wallet, session, dappKeyPair, sharedSecret) => {
    const {account, nickname, language, region } = props;
    console.log(props)
    let transaction = new Transaction();
    let signers = [];

    const updateUrl = `${API_URL}/wallet/update`;
    const updateRes = await axios.post(updateUrl, {wallet, account: account.toString(), nickname, language, region});
    const updateInsData = updateRes.data.data;

    const updateInstruction = new anchor.web3.TransactionInstruction({
        keys: [{
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        }, {
            pubkey: pool,
            isSigner: false,
            isWritable: true,
        }, {
            pubkey: new PublicKey(account),
            isSigner: false,
            isWritable: true,
        }, {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        }],
        data: Buffer.from(updateInsData),
        programId
    })

    transaction.add(updateInstruction);

    await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret)
}

const _createUser = async (wallet, session, dappKeyPair, sharedSecret) => {
    let transaction = new Transaction();
    let signers = [];
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

    await signAndSendTransaction(transaction, wallet, connection, signers, session, dappKeyPair, sharedSecret);

    return userInfo.publicKey;
}

const useAccount = () => {
  const { walletAddress, session, dappKeyPair, sharedSecret, txHash, setTxHash, chainID } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorWallet, setAnchorWallet] = useState(false);
  const [userData, setUserData] = useState({});

  const createUser = async () => {
    if (!anchorWallet) {
      Toast.show({
        type: "error",
        text1: "Please connect wallet.",
      });
      return;
    }

    setIsLoading(true);
    const result = await _createUser(anchorWallet, session, dappKeyPair, sharedSecret);

    setIsLoading(false);
    return result;
  }

  const updateProfile = async (props) => {
    if (!anchorWallet) {
      Toast.show({
        type: "error",
        text1: "Please connect wallet.",
      });
      return;
    }

    setIsLoading(true);
    const result = await _updateProfile(props, anchorWallet, session, dappKeyPair, sharedSecret);

    setIsLoading(false);
    return result;
  }

  const getUser = async (wallet) => {
    console.log("sol")
      const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
      const program = new anchor.Program(idl, programId, provider);
      let user = {};
  
      try {
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
                              bytes: wallet
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
          const userInfo = await program.account.userInfo.fetch(userResp[0].pubkey);
          
          user = {
              account: userResp[0].pubkey,
              nickname: userInfo.nickname,
              language: userInfo.language,
              region: userInfo.region
          }
      } catch (error) {
          console.log(error);
      }
  
      return user;
    }

    useEffect(() => {
        !chainID && walletAddress && setAnchorWallet(new PublicKey(walletAddress))
    }, [walletAddress, chainID])

    useEffect(() => {
        (
            async () => {
                if (txHash && !chainID) {
                    setIsLoading(true);
                    try {
                        console.log("txHash", txHash)
                        await connection.confirmTransaction(txHash);
                    } catch (error) {
                        console.log(error);
                        return {result: false}  
                    }
                    Toast.show({
                        type: "success",
                        text1: "Transaction succeed.",
                    });
                    setIsLoading(false);
                    setTxHash();
                }
            }
        )();
    }, [txHash, chainID])

  useEffect(() => {
      (async () => {
          if (
              chainID || !walletAddress
          ) {
              setIsLoading(false);
              return;
          }

          setIsLoading(true);
          const newUserData = await getUser(walletAddress);
          setUserData(newUserData);
          setIsLoading(false);
      })();
  }, [walletAddress, chainID]);

  return { isLoading, userData, updateProfile, createUser, getUser };
}

export default useAccount;