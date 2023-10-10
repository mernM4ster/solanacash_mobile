import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { AppContext } from "../AppContext";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import { CONTRACT_ADDRESS } from "../../constants/env";
import ABI from "../../constants/abi.json";
import supportedChains from "../../constants/chains";
import TOKEN_ABI from "../../constants/token_abi.json";

const useMyOffers = () => {
  const { evmConnector, chainID, walletAddress } = useContext(AppContext);
  const [myEthOffers, setMyEthOffers] = useState([]);
  const [ethIsLoading, setEthIsLoading] = useState(false);
  const [ethRefresh, setEthRefresh] = useState(false);

  const discontinueEthOffer = async (offerIndex) => {
    if (!chainID || !evmConnector.connected) {
      return;
    }
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const txData = await contract.methods.cancelOffer(offerIndex).encodeABI();
    await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
    const newMyOffers = await getMyEthOffers();

    return newMyOffers;
  }

  const getMyEthOffers = async () => {
    let allMyOffers = [];
    const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
    const offerIndexes = await contract.methods.getOfferIndexesOfUser(walletAddress).call();
    console.log("get my offer")
    for (let offerIndex of offerIndexes) {
      const offer = await contract.methods.getOfferByIndex(offerIndex).call();
      console.log(offer)
      let decimal = 18;
      if (!offer.eth) {
        const contract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
        decimal = await contract.methods.decimals().call();
      }
      const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value.toLowerCase() === offer.token_address.toLowerCase());
      const date = new Date(offer.created_at * 1000);
      const tokenAmount = Number.parseInt(offer.token_amount) / 10 ** decimal;
      const maxLimit = offer.max_limit / 10 ** decimal;
      const minLimit = offer.min_limit / 10 ** decimal;
      allMyOffers.push({
        ...offer,
        main: offer.eth,
        token: offer.token_address,
        paymentOptions: offer.payment_options,
        tokenAmount,
        tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
        offer: offer.offer_index, 
        bought: offer.bought / 10 ** decimal,
        maxLimit: tokenAmount < maxLimit ? tokenAmount : maxLimit,
        minLimit: tokenAmount < minLimit ? tokenAmount : minLimit,
        timeLimit: offer.time_limit * 1,
        unixTime: offer.created_at,
        createdAt: date.toDateString() + " " + date.toLocaleTimeString(),
      });
    }

    return allMyOffers;
  }

  useEffect(() => {
    if (!evmConnector.connected) {
      return;
    }
    (
      async () => {
        setEthIsLoading(true);
        console.log("here")
        const newMyOffers = await getMyEthOffers();
        setMyEthOffers(newMyOffers);
        setEthIsLoading(false);
        setEthRefresh(false);
      }
    )();
  }, [evmConnector, ethRefresh])

  return {ethIsLoading, myEthOffers, ethRefresh, setEthRefresh, getMyEthOffers, discontinueEthOffer}
}

export default useMyOffers;