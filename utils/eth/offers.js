import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { AppContext } from "../AppContext";
import supportedChains from "../../constants/chains";
import { getTxOfAddress } from "./ethereum_api";
import { CONTRACT_ADDRESS } from "../../constants/env";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import ABI from "../../constants/abi.json";
import TOKEN_ABI from "../../constants/token_abi.json";
import AsyncStorage from '@react-native-async-storage/async-storage';

const useOffer = () => {
  const [allEthOffers, setAllEthOffers] = useState([]);
  const [ethIsLoading, setEthIsLoading] = useState(false);
  const [ethRefresh, setEthRefresh] = useState(false);
  const { evmConnector, chainID, walletAddress, setTxHash } = useContext(AppContext);

  const getOffers = async () => {
    let allOffers = [];
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const offers = await contract.methods.getOffers().call();
    for (let offer of offers) {
      let decimal = 18;
      if (!offer.eth) {
        const contract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
        decimal = await contract.methods.decimals().call();
      }
      if (!offer.status || !Number.parseInt(offer.token_amount)) continue;
      const userInfo = await contract.methods.getUser(offer.owner).call();
      const txs = await getTxOfAddress(offer.owner, chainID);
      const now = Math.floor(new Date() / 1000);
      const during = now - txs[0].timeStamp;
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

      const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value.toLowerCase() === offer.token_address.toLowerCase());
      const date = new Date(offer.created_at * 1000);
      const tokenAmount = Number.parseInt(offer.token_amount) / 10 ** decimal;
      const maxLimit = offer.max_limit / 10 ** decimal;
      const minLimit = offer.min_limit / 10 ** decimal;
      allOffers.push({
        ...offer,
        main: offer.eth,
        token: offer.token_address,
        paymentOptions: offer.payment_options,
        tokenAmount,
        tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
        offer: offer.owner, 
        thumbsUp: userInfo.thumbs_up, 
        thumbsDown: userInfo.thumbs_down,
        region: userInfo.region,
        bought: offer.bought / 10 ** decimal,
        maxLimit: tokenAmount < maxLimit ? tokenAmount : maxLimit,
        minLimit: tokenAmount < minLimit ? tokenAmount : minLimit,
        unixTime: offer.created_at,
        createdAt: date.toDateString() + " " + date.toLocaleTimeString(),
        lastSeen,
        onlineStatus,
        verified: userInfo.verified,
      });
    }
    return allOffers;
  }

  const createEthOffer = async props => {
    if (!chainID || !evmConnector.connected) {
      return;
    }
    setEthIsLoading(true);
    const { token, fiat, amount, minLimit, maxLimit, payments, time, terms, rate } = props;
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    
    try { 
      let decimal = 18;
      const publicKey = await AsyncStorage.getItem("publicKey");
      const tokenAddress = token === "eth" ? ETH_CRYPTO_VALUES[chainID][1].value : token;
      const isEth = token === "eth" ? true : false;
      if (!isEth) {
        const contract = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
        decimal = await contract.methods.decimals().call();
      }
      
      const txData = contract.methods.createOffer(
        tokenAddress, 
        fiat, 
        rate.toFixed(3).toString(), 
        payments.toString(), 
        publicKey, 
        terms, 
        time * 1, 
        isEth, 
        (amount * 10 ** decimal).toString(), 
        (minLimit * 10 ** decimal).toString(), 
        (maxLimit * 10 ** decimal).toString()
      ).encodeABI();
      const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
      setTxHash(txHash);
      return true;
    } catch (error) {
      console.log(error)
      setEthIsLoading(false);
      return false;
    }
  };

  const updateEthOffer = async (props) => {
    if (!chainID || !evmConnector.connected) {
      return;
    }

    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
    setEthIsLoading(true);
    try {
      let decimal = 18;
      const { offerAccount, fiat, amount, minLimit, maxLimit, payments, time, terms} = props;
      const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
      const offerData = await contract.methods.getOfferByIndex(offerAccount).call();
      if (!offerData.eth) {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, offerData.token_address);
        decimal = await tokenContract.methods.decimals().call();
      }
      const txData = contract.methods.updateOffer(
        fiat,
        payments.toString(),
        terms,
        time * 1,
        offerAccount,
        (amount * 10 ** decimal).toString(), 
        (minLimit * 10 ** decimal).toString(), 
        (maxLimit * 10 ** decimal).toString()
      ).encodeABI();
      const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
      setTxHash(txHash);
      return true;
    } catch (error) {
      console.log(error);
      setEthIsLoading(false);
      return false;
    }
  }

  const getEthOfferData = async (offerIndex) => {
    setEthIsLoading(true);
    let decimal = 18;
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const offer = await contract.methods.getOfferByIndex(offerIndex).call();
    if (!offer.eth) {
      const tokenContract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
      decimal = await tokenContract.methods.decimals().call();
    }
    const userInfo = await contract.methods.getUser(offer.owner).call();
    const fee = await contract.methods.fee().call();
    const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value.toLowerCase() === offer.token_address.toLowerCase());
    const tokenAmount = Number.parseInt(offer.token_amount) / 10 ** decimal;
    const maxLimit = offer.max_limit / 10 ** decimal;
    const minLimit = offer.min_limit / 10 ** decimal;
    const txs = await getTxOfAddress(offer.owner, chainID);
    const now = Math.floor(new Date() / 1000);
    const during = now - txs[0].timeStamp;
      let onlineStatus = false;
      if (Math.floor(during / 60) < 60) {
          onlineStatus = Math.floor(during / 60) < 3 ? true : false;
      }
    setEthIsLoading(false);
    return {
      ...offer,
      tokenAmount,
      token: offer.token_address,
      main: offer.eth ? true : false,
      tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
      paymentOptions: offer.payment_options,
      offerTerms: offer.offer_terms,
      thumbsUp: userInfo.thumbs_up,
      thumbsDown: userInfo.thumbs_down,
      maxLimit: tokenAmount < maxLimit ? tokenAmount : maxLimit,
      minLimit: tokenAmount < minLimit ? tokenAmount : minLimit,
      timeLimit: offer.time_limit * 1,
      offer: offer.offer_index, 
      online: onlineStatus,
      buyer: offer.owner,
      fee: fee / 200,
      rate: offer.rate * 1,
    };
  }

  const getEthTokenBalance = async (token) => {
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));

    if (token === "eth") {
      const balance = await web3.eth.getBalance(walletAddress);
      return balance < 0.01 ? 0 : balance / 10 ** 18 - 0.01;
    } else {
      const contract = new web3.eth.Contract(TOKEN_ABI, token);
      const balance = await contract.methods.balanceOf(walletAddress).call();
      const decimal = await contract.methods.decimals().call();
      return balance / 10 ** decimal;
    }

  }

  useEffect(() => {
    if (!chainID) {
      return;
    }
    (
      async () => {
        setEthIsLoading(true);
        const newOffers = await getOffers();
        setAllEthOffers(newOffers);
        setEthIsLoading(false);
        setEthRefresh(false);
      }
    )();
  }, [evmConnector, chainID, ethRefresh]);

  return { allEthOffers, ethIsLoading, ethRefresh, setEthRefresh, createEthOffer, updateEthOffer, getEthOfferData, getEthTokenBalance, setEthIsLoading };
}

export default useOffer;