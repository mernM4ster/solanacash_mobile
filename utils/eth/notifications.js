import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Web3 from "web3";
import { CONTRACT_ADDRESS } from "../../constants/env";
import { AppContext } from "../AppContext";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import { getAllTxOfAddress } from "./ethereum_api";
import ABI from "../../constants/abi.json";
import TOKEN_ABI from "../../constants/token_abi.json";
import supportedChains from "../../constants/chains";

const useNotification = () => {
    const {chainID, walletAddress} = useContext(AppContext)
    const [isEthLoading, setIsEthLoading] = useState(false);
    const [allEthNotification, setAllEthNotification] = useState([]);
    const [unReadEthNum, setUnReadEthNum] = useState(0);

    const getOrderInfo = async orderIndex => {
        const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
        const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
        const orderInfo = await contract.methods.getOrderByIndex(orderIndex).call();
        let decimal = 18;
        const offer = await contract.methods.getOfferByIndex(orderInfo.offer_index).call();
        if (!offer.eth) {
            const contract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
            decimal = await contract.methods.decimals().call();
        }
        const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value.toLowerCase() === offer.token_address.toLowerCase());

        return {
            tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
            amount: orderInfo.sell_amount / (10 ** decimal),
            seller: orderInfo.seller,
            buyer: offer.owner,
        }
    }

    const getEthNotifications = async (address) => {
        let newUnReadEthNum = 0;
        let notifications = [];
        let newEthNotifications = [];
        const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
        const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
        const orderIndexes = await contract.methods.getOrderIndexesOfUser(address).call();
        
        const txs = await getAllTxOfAddress(CONTRACT_ADDRESS[chainID], chainID);
        if (typeof txs === "object") {
            for (const tx of txs) {
                if (tx.input.indexOf("0x888487cd") > -1) { // buyer confirm
                    const orderIndex = parseInt(tx.input.slice(10), 16);
                    const {tokenName, amount, seller, buyer} = await getOrderInfo(orderIndex);
                    if (address.toLowerCase() === seller.toLowerCase() || address.toLowerCase() === buyer.toLowerCase()) {
                        notifications.push({
                            user: tx.from,
                            type: "buyer_confirm",
                            createdTime: tx.timeStamp * 1,
                            amount,
                            tokenName,
                            orderType: address.toLowerCase() === seller.toLowerCase() ? "sell" : "buy",
                            orderIndex
                        })
                    }
                }
                if (tx.input.indexOf("0x8ac7d79c") > -1) { // confirm order
                    const orderIndex = parseInt(tx.input.slice(10), 16);
                    const {tokenName, amount, seller, buyer} = await getOrderInfo(orderIndex);
                    if (address.toLowerCase() === seller.toLowerCase() || address.toLowerCase() === buyer.toLowerCase()) {
                        notifications.push({
                            tx: tx.hash,
                            user: tx.from,
                            type: "seller_confirm",
                            createdTime: tx.timeStamp * 1,
                            amount,
                            tokenName,
                            orderType: address.toLowerCase() === seller.toLowerCase() ? "sell" : "buy",
                            orderIndex
                        })
                    }
                }
                if (tx.input.indexOf("0x514fcac7") > -1) { // cancel order
                    const orderIndex = parseInt(tx.input.slice(10), 16);
                    const {tokenName, amount, seller, buyer} = await getOrderInfo(orderIndex);
                    if (address.toLowerCase() === seller.toLowerCase() || address.toLowerCase() === buyer.toLowerCase()) {
                        notifications.push({
                            user: tx.from,
                            type: "cancel",
                            createdTime: tx.timeStamp * 1,
                            amount,
                            tokenName,
                            orderType: address.toLowerCase() === seller.toLowerCase() ? "sell" : "buy",
                            orderIndex
                        })
                    }
                }
            }
        }

        for (const orderIndex of orderIndexes) {
            const orderInfo = await contract.methods.getOrderByIndex(orderIndex).call();
            let decimal = 18;
            const offer = await contract.methods.getOfferByIndex(orderInfo.offer_index).call();
            if (!offer.eth) {
                const contract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
                decimal = await contract.methods.decimals().call();
            }
            const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value === offer.token_address.toString());
            notifications.push({
                user: orderInfo.seller,
                type: "create",
                createdTime: orderInfo.created_at,
                amount: orderInfo.sell_amount / (10 ** decimal),
                tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
                orderType: address.toLowerCase() === orderInfo.seller.toLowerCase() ? "sell" : "buy",
                orderIndex
            })
        }

        const lastTx = await AsyncStorage.getItem(`${address}_${chainID}_notify_date`);
        notifications.forEach(item => {
            if (item.createdTime > lastTx) newUnReadEthNum++;
        })

        notifications.sort((a, b) => b.createdTime - a.createdTime);
        newEthNotifications = notifications.map(item => {
            const date = new Date(item.createdTime * 1000);
            return {...item, createdAt: date.toDateString() + " " + date.toLocaleTimeString(),}
        })

        return {newUnReadEthNum, newEthNotifications}
    }

    useEffect(() => {
        if (!chainID || !walletAddress) {
            return;
        }
        (
            async () => {
                setIsEthLoading(true);
                const {newUnReadEthNum, newEthNotifications} = await getEthNotifications(walletAddress);
                setAllEthNotification(newEthNotifications);
                setUnReadEthNum(newUnReadEthNum);
                setIsEthLoading(false);
            }
        )();
    }, [chainID, walletAddress])

    return { isEthLoading, allEthNotification, unReadEthNum, getEthNotifications };
}

export default useNotification;