import { useState, useEffect, useContext } from "react";
import * as anchor from "@project-serum/anchor";
import Web3 from "web3";
import { TextInput, View } from "react-native";
import tw from "tailwind-react-native-classnames";
import GrayButton from "../../components/GrayButton";
import GreenButton from "../../components/GreenButton";
import TextComponent from "../../components/TextComponent";
import useOffer from "../../utils/offers";
import useEthOffer from "../../utils/eth/offers";
import { CRYPTO_VALUES, FIAT_VALUES, TIME_VALUES} from "../../constants/offers";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import { NEXT_PUBLIC_SOLANA_RPC_HOST } from "../../constants/env";
import OfferConfirmModal from "../../components/OfferConfirmModal";
import { AppContext } from "../../utils/AppContext";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import supportedChains from "../../constants/chains";

const TermContainer = (props) => {
  const {cryptoType, fiatType, amount, minLimit, maxLimit, payments, time, rate, oldTerms, isUpdate, offerAccount, changeStatus, navigation } = props;
  const { txHash, setTxHash, chainID } = useContext(AppContext);
  const [terms, setTerms] = useState(oldTerms);
  const [isConfirmModalShown, setConfirmModalShown] = useState(false);
  const [clockId, setClockId] = useState();
  const [finishClock, setFinishClock] = useState(false);
  const { isLoading, createOffer, updateOffer, setIsLoading } = useOffer();
  const { ethIsLoading, createEthOffer, updateEthOffer, setEthIsLoading } = useEthOffer();

  const handleTerms = (value) => {
    setTerms(value);
  }

  const create = async () => {
    let result = false;
    const offerData = {
      token: !chainID ? CRYPTO_VALUES[cryptoType].value : ETH_CRYPTO_VALUES[chainID][cryptoType].value, 
      fiat: FIAT_VALUES[fiatType].value, 
      amount, 
      minLimit, 
      maxLimit, 
      payments: payments.toString(), 
      time: TIME_VALUES[time].value,
      rate,
      terms: terms ? terms : ""
    }

    if (!chainID) {
      result = await createOffer(offerData);
    } else {
      console.log("eth")
      result = await createEthOffer(offerData)
    }
  }

  const update = async () => {
    let result = false;
    const offerData = {
        fiat: FIAT_VALUES[fiatType].value, 
        offerAccount,
        amount, 
        minLimit, 
        maxLimit, 
        payments, 
        time: TIME_VALUES[time].value,
        rate,
        terms
    }
    if (!chainID) {
      result = await updateOffer(offerData);
    } else {
      result = await updateEthOffer(offerData);
    }

  }

  useEffect(() => {
    (
      async () => {
        if (txHash) {
          if (!chainID) {
            try {
              const connection = new anchor.web3.Connection(NEXT_PUBLIC_SOLANA_RPC_HOST);
              console.log("txHash", txHash)
              await connection.confirmTransaction(txHash);
            } catch (error) {
              console.log(error);
              return
            }
            Toast.show({
              type: "success",
              text1: "Transaction succeed.",
            });
            setTxHash();
            setIsLoading(false);
            setConfirmModalShown(false);
            navigation.navigate("My Offers");
          } else {
            const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
            const web3 = new Web3(new Web3.providers.HttpProvider(url));
            console.log("txHash", txHash)
            const newClockId = setInterval(async () => {
              const data = await web3.eth.getTransactionReceipt(txHash);
              console.log("signed", data);
              if (!!data) {
                setFinishClock(true)
              }
            }, 1000);
            console.log("clockID", newClockId);
            setClockId(newClockId)
          }
        }
      }
    )();
  }, [txHash]);

  useEffect(() => {
    if (finishClock) {
      setTxHash();
      setEthIsLoading(false);
      clearInterval(clockId);
      setConfirmModalShown(false);
      navigation.navigate("My Offers");
    }
  }, [finishClock])

  return (
    <View style={tw`mt-6 flex flex-col`}>
      <TextComponent color="gray" size="sm" style="mb-2">Offer Terms</TextComponent>
      <TextInput 
        style={[tw`px-2 rounded-lg mb-8 text-white`, {backgroundColor: "#060e0c"}]}
        multiline 
        placeholder="Enter full term of the trade here"
        placeholderTextColor="#6b7280"
        numberOfLines={5} 
        onChangeText={handleTerms}
        value={terms} />
      <View style={tw`flex flex-row justify-between`}>
        <GrayButton title="Cancel" onPress={() => changeStatus(0)} />
        <GreenButton title="Post" size="lg" onPress={() => setConfirmModalShown(true)} active />
      </View>
      <OfferConfirmModal 
        {...props}
        cryptoValues={!chainID ? CRYPTO_VALUES : ETH_CRYPTO_VALUES[chainID]}
        isShown={isConfirmModalShown} 
        setShown={setConfirmModalShown} 
        createOffer={isUpdate ? update : create} 
        isLoading={!chainID ? isLoading : ethIsLoading} />
    </View>
  );
}

export default TermContainer;