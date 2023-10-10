import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Web3 from "web3";
import { AppContext } from "../AppContext";
import { JSEncrypt } from "jsencrypt";
import ABI from "../../constants/abi.json";
import supportedChains from "../../constants/chains";
import { getTxOfAddress } from "./ethereum_api";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import { PAYMENT_OFFER_VALUES, FIAT_VALUES } from "../../constants/offers";
import { CONTRACT_ADDRESS } from "../../constants/env";
import TOKEN_ABI from "../../constants/token_abi.json";

const useOrder = () => {
  const [isEthLoading, setIsEthLoading] = useState(false);
  const [allEthOthers, setAllEthOthers] = useState([]);
  const [ethOrdersCount, setEthOrdersCount] = useState(0);
  const [ethRefresh, setEthRefresh] = useState(false);
  const { chainID, evmConnector, walletAddress, setTxHash, setKey } = useContext(AppContext)

  const createEthOrder = async (props) => {
    console.log(props);
    const {sellAmount, receiveAmount, offerAccount, token, paymentOption, accountName, emailAddress} = props;
    if (!chainID || !evmConnector.connected) {
      return;
    }

    setIsEthLoading(true);
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);

    try {
      let decimal = 18;
      const offerData = await contract.methods.getOfferByIndex(offerAccount * 1).call();
      console.log("offerData", offerData.eth)
      if (!offerData.eth) {
        console.log("check token")
        const contract = new web3.eth.Contract(TOKEN_ABI, offerData.token_address);
        decimal = await contract.methods.decimals().call();
        const allowance = await contract.methods.allowance(walletAddress, CONTRACT_ADDRESS[chainID]).call();
        console.log(allowance)
        if (allowance < sellAmount * decimal) {
          const approveAmount = '0x' + Math.round(sellAmount * 10 ** decimal).toString(16);
          const approveTxData = contract.methods.approve(CONTRACT_ADDRESS[chainID], approveAmount).encodeABI();
          await evmConnector.sendTransaction({from: walletAddress, to: offerData.token_address, data: approveTxData});
        }
      }

      const crypt = new JSEncrypt({default_key_size: 400});
      crypt.setKey(offerData.public_key);
      const encryptedName = crypt.encrypt(accountName);
      const encryptedEmail = crypt.encrypt(emailAddress);

      const txData = contract.methods.createOrder(
        paymentOption,
        encryptedName,
        encryptedEmail,
        receiveAmount.toString(),
        offerAccount,
        (sellAmount * 10 ** decimal).toString()
      ).encodeABI();
      console.log("txData", txData)
      const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592, value: (sellAmount * 10 ** decimal).toString()});
      setTxHash(txHash);
    } catch (error) {
      console.log(error)
      setIsEthLoading(false);
      return {success: false};
    }
  }

  const getEthOrders = async () => {
    const orders = [];
    let newEthOrdersCount = 0;
    if (!chainID || !evmConnector.connected) {
      return;
    }

    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const orderIndexes = await contract.methods.getOrderIndexesOfUser(walletAddress).call();

    for (const orderIndex of orderIndexes) {
      let decimal = 18;
      const order = await contract.methods.getOrderByIndex(orderIndex).call();
      if (order.status * 1 === 0) newEthOrdersCount++;
      const offer = await contract.methods.getOfferByIndex(order.offer_index).call();
      if (!offer.eth) {
        const contract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
        decimal = await contract.methods.decimals().call();
      }
      const otherAddress = walletAddress === order.seller ? offer.owner : order.seller;
      const userInfo = await contract.methods.getUser(otherAddress).call();
      const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value === offer.token_address.toString());
      const date = new Date(order.created_at * 1000);

      orders.push({
        main: offer.eth,
        type: offer.owner.toLowerCase() === walletAddress.toLowerCase() ? "Buy" : "Sell",
        name: order.seller === walletAddress ? offer.owner : order.seller,
        fiatAmount: order.receive_amount * 1,
        rate: offer.rate * 1,
        cryptoAmount: order.sell_amount / (10 ** decimal),
        status: order.status,
        fiat: offer.fiat.toString(),
        tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
        unixTime: order.created_at,
        createdTime: order.created_at,
        createdAt: date.toDateString() + " " + date.toLocaleTimeString(),
        verified: userInfo.verified,
        token: offer.token_address,
        id: orderIndex.toString()
      })
    }
    setEthOrdersCount(newEthOrdersCount);

    return orders;
  }

  const getEthOrderInfo = async (orderIndex, orderType) => {
    setIsEthLoading(true);
    if (!chainID || !evmConnector.connected) {
      return;
    }
    console.log("getting order data")
    let decimal = 18;
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const orderData = await contract.methods.getOrderByIndex(orderIndex).call();
    const offerData = await contract.methods.getOfferByIndex(orderData.offer_index).call();
    if (!offerData.eth) {
      const contract = new web3.eth.Contract(TOKEN_ABI, offerData.token_address);
      decimal = await contract.methods.decimals().call();
    }
    const userAddress = orderType === "buy" ? orderData.seller : offerData.owner;
    const userInfo = await contract.methods.getUser(userAddress).call();
    const fee = await contract.methods.fee().call();
    const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value === offerData.token_address.toString());
    const crypt = new JSEncrypt({default_key_size: 400});
    crypt.setKey(await AsyncStorage.getItem("privateKey"));
    const emailAddress = orderType === "buy" 
      ? crypt.decrypt(orderData.account_mail) 
      : await AsyncStorage.getItem(`${PAYMENT_OFFER_VALUES[orderData.payment_option].title}-email`);
    const accountName = orderType === "buy" 
      ? crypt.decrypt(orderData.account_name) 
      : await AsyncStorage.getItem(`${PAYMENT_OFFER_VALUES[orderData.payment_option].title}-name`);
    const date = new Date(orderData.created_at * 1000);
    const now = Math.floor(new Date() / 1000);
    const txs = await getTxOfAddress(userAddress, chainID);
    const during = now - txs[0].timeStamp;
    console.log(during)
    let onlineStatus = false;
    onlineStatus = during < 180 ? true : false;
    setIsEthLoading(false);

    return {
      userAccount: userAddress,
      thumbsUp: userInfo.thumbs_up,
      thumbsDown: userInfo.thumbs_down,
      verified: userInfo.verified,
      timeLimit: offerData.time_limit,
      buyer: orderType === "buy" ? orderData.seller : offerData.owner, 
      sellAmount: orderData.sell_amount * (1 - fee / 10000 ) / (10 ** decimal),
      fiatAmount: orderData.receive_amount * 1,
      fee: fee / 200,
      moneyFee: orderData.sell_amount * fee / (10 ** decimal) / 20000,
      fiat: offerData.fiat.toString(),
      sign: FIAT_VALUES.filter(e => e.value === offerData.fiat)[0].sign,
      tokenName: offerData.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
      rate: offerData.rate * 1,
      feedback: orderData.feedback,
      createdAt: orderData.created_at,
      createdAtFormat: date.toDateString() + " " + date.toLocaleTimeString(),
      status: orderData.status * 1,
      accountName,
      emailAddress,
      online: onlineStatus,
      paymentOption: orderData.payment_option,
      buyerConfirm: orderData.buyer_confirm,
      fullId: userAddress,
      id: orderIndex
    }
  }
  
  const confirmEthPayment = async (orderIndex) => {
    if (!chainID || !evmConnector.connected) {
      return;
    }

    setIsEthLoading(true);
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const txData = contract.methods.confirmOrder(orderIndex).encodeABI();
    const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
    setKey("release");
    setTxHash(txHash);
  }
  
  const ethThumbUser = async (thumbUp, orderIndex, userAddress) => {
    if (!chainID || !evmConnector.connected) {
      return;
    }
    try {
      setIsEthLoading(true);
      const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
      const web3 = new Web3(new Web3.providers.HttpProvider(url));
      const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
      const txData = contract.methods.thumbUser(thumbUp, userAddress, orderIndex).encodeABI();
      const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
      setTxHash(txHash);
    } catch (error) {
      setIsEthLoading(false);
    }
  }
  
  const cancelEthOrder = async (orderIndex) => {
    if (!chainID || !evmConnector.connected) {
      return;
    }
    setIsEthLoading(true);
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const txData = contract.methods.cancelOrder(orderIndex).encodeABI();
    const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
    setTxHash(txHash);
  }
  
  const buyerEthConfirm = async (orderIndex) => {
    if (!chainID || !evmConnector.connected) {
      return;
    }
    setIsEthLoading(true);
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const txData = contract.methods.buyerConfirm(orderIndex).encodeABI();
    const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
    setTxHash(txHash);
  }

  const createEthDispute = async () => {}

  useEffect(() => {
    if (!chainID || !evmConnector.connected) {
      return;
    }
    (
      async () => {
        setIsEthLoading(true);
        const newOrders = await getEthOrders();
        console.log("orders", newOrders)
        setAllEthOthers(newOrders);
        setIsEthLoading(false);
      }
    )();
  }, [chainID, ethRefresh])

  return { isEthLoading, allEthOthers, ethRefresh, setEthRefresh, createEthOrder, getEthOrderInfo, confirmEthPayment, ethThumbUser, cancelEthOrder, buyerEthConfirm, createEthDispute, setIsEthLoading, ethOrdersCount }
}

export default useOrder;