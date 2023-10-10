import { useState, useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import {
    PublicKey,
} from "@solana/web3.js";
import { ORDERDATA_SIZE, CONTRACT_IDL } from '../constants/contract';
import { NEXT_PUBLIC_SOLANA_RPC_HOST, NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_POOL_ID } from '../constants/env';
import { FIAT_VALUES } from "../constants/offers";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const useStats = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statsData, setStatsData] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const getStatsData = async () => {
        const provider = new anchor.Provider(connection, anchor.Provider.defaultOptions());
        const program = new anchor.Program(idl, programId, provider);
        const orders = [];

        try {
            const filter =  [
                {
                    dataSize: ORDERDATA_SIZE
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
                const offer = await program.account.offerData.fetch(order.offer);
                const priceInfo = FIAT_VALUES.filter(item => item.value === offer.fiat.toString());
                orders.push({
                    buyer: order.buyer.toString(),
                    seller: order.owner.toString(),
                    fiatAmount: order.receiveAmount * 1,
                    createdAt: order.createdTime.toNumber(),
                    status: order.status,
                    fiat: offer.fiat.toString(),
                    price: priceInfo[0].price.toFixed(2),
                });
            }
        } catch (error) {
            console.log(error);
        }

        return orders;
    }

    useEffect(() => {
        (async () => {
            const data = await AsyncStorage.getItem("stats");
            if (data) {
                setStatsData(JSON.parse(data));
            } 
            if (!data || refresh) {
                setIsLoading(true);
            }
            const newStatsData = await getStatsData();
            await AsyncStorage.setItem("stats", JSON.stringify(newStatsData));
            setStatsData(newStatsData);
            setIsLoading(false);
            setRefresh(false);
        })();
    }, [refresh]);

    return { isLoading, statsData, refresh, setRefresh, setIsLoading };

}

export default useStats;