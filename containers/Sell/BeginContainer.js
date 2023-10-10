import { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { View, Pressable, Text } from "react-native";
import * as anchor from "@project-serum/anchor";
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from "tailwind-react-native-classnames";
import { Feather } from "@expo/vector-icons";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import useOrder from "../../utils/orders";
import useEthOrder from "../../utils/eth/orders";
import TextComponent from "../../components/TextComponent";
import InputComponent from "../../components/InputComponent";
import { PAYMENT_OFFER_VALUES } from "../../constants/offers";
import { NEXT_PUBLIC_SOLANA_RPC_HOST } from "../../constants/env";
import { AppContext } from "../../utils/AppContext";
import OfferDetailInfo from "../../components/OfferDetailInfo";
import OfferTerm from "../../components/OfferTerm";
import GrayButton from "../../components/GrayButton";
import GreenButton from "../../components/GreenButton";
import PaymentModal from "../../components/PaymentModal";
import TransferNotifyModal from "../../components/TransferNotifyModal";
import ConfirmTransferModal from "../../components/ConfirmTransferModal";
import supportedChains from "../../constants/chains";

const BeginContainer = (props) => {
  const { offerData, offerAccount, tokenBalance, navigation, chainID } = props;
  const { txHash, setTxHash, key, setKey } = useContext(AppContext);
  const [sellAmount, setSellAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [changedOption, setChangedOption] = useState();
  const [paymentIndex, setPaymentIndex] = useState(-1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [check, setCheck] = useState(false);
  const [clockId, setClockId] = useState();
  const [finishClock, setFinishClock] = useState(false);
  const { isLoading, createOrder, setIsLoading } = useOrder();
  const { isEthLoading, createEthOrder, setIsEthLoading } = useEthOrder();

  const handleNotifyModal = () => {
    setShowNotifyModal(false);
    setShowConfirmModal(true)
  }

  const handleConfirmModal = async () => {
    if (!chainID) {
      const result = await createOrder({...offerData, paymentOption: paymentIndex, sellAmount, receiveAmount, offerAccount, accountName, emailAddress});
    } else {
      const result = await createEthOrder({...offerData, paymentOption: paymentIndex, sellAmount, receiveAmount, offerAccount, accountName, emailAddress});
      if (result.success) navigation.navigate("Order", {orderType: "sell", orderAccount: result.index})
    }
  }

  const handleSellAmount = value => {
    if (value > offerData.maxLimit) {
      setSellAmount(offerData.maxLimit.toString());
    } else if (value * 1 < offerData.minLimit) {
      setSellAmount(offerData.minLimit.toString())
    } else {
      setSellAmount(value)
    }
    setChangedOption("sell");
  }

  const handleReceiveAmount = value => {
    setReceiveAmount(value);
    setChangedOption("receive");
  }

  const handlePayment = async (item) => {
    setPaymentIndex(item);
    const paymentMethod = PAYMENT_OFFER_VALUES[item].title;
    const remember = await AsyncStorage.getItem(`${paymentMethod}-remember`);
    if (remember !== "false") {
      setAccountName( await AsyncStorage.getItem(`${paymentMethod}-name`));
      setEmailAddress( await AsyncStorage.getItem(`${paymentMethod}-email`));
      setCheck(await AsyncStorage.getItem(`${paymentMethod}-remember`));
    } else {
      setAccountName("");
      setEmailAddress("");
      setCheck(false);
    }
    setShowPaymentModal(true);
  }

  const handleFocusForSell = (props) => {
    const value = props.nativeEvent.text;
    console.log("focus out", props.nativeEvent.text, tokenBalance)
    if (value >= offerData.tokenAmount) {
      setSellAmount(offerData.tokenAmount.toString());
    } else {
      if (value > tokenBalance) {
       setSellAmount(tokenBalance.toString());
      }
    }
  }

  const handleFocusForAmount = (props) => {
    const value = props.nativeEvent.text;
    if (value / offerData.rate / (1 - offerData.fee) < offerData.minLimit || value / offerData.rate / (1 - offerData.fee) > tokenBalance) {
      offerData.minLimit > tokenBalance ? setSellAmount("0") : setSellAmount(offerData.minLimit.toString());
      setChangedOption("sell");
    }
  }

  const setAmountByBalance = (value) => {
    const amount = (tokenBalance * value).toFixed(2);
    console.log(amount)
    if (amount < offerData.minLimit) {
      setSellAmount(offerData.minLimit.toString());
    } else if (amount > offerData.maxLimit.toString()) {
      setSellAmount(offerData.maxLimit.toString());
    } else {
      setSellAmount(amount.toString());
    }
    setChangedOption("sell");
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
              setIsLoading(false);
              return
            }
            Toast.show({
              type: "success",
              text1: "Transaction succeed.",
            });
            const newKey = key;
            setTxHash();
            setKey();
            setIsLoading(false);
            setShowConfirmModal(false);
            navigation.navigate("Order", {orderType: "sell", orderAccount: newKey})
          } else {
            const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
            const web3 = new Web3(new Web3.providers.HttpProvider(url));
            console.log("txHash", txHash)
            const newClockId = setInterval(async () => {
              const data = await web3.eth.getTransactionReceipt(txHash);
              console.log("signed", data);
              if (!!data) {
                setKey(parseInt(data.logs[0].data, 16))
                console.log("topic", data.logs[0].topics)
                console.log("data", data.logs[0].data)
                setFinishClock(true)
              }
            }, 1000);
            console.log("clockID", newClockId);
            setClockId(newClockId)
          }
        }
      }
    )();
  }, [txHash, chainID])

  useEffect(() => {
    if (finishClock) {
      const newKey = key;
      setKey();
      setTxHash();
      setIsEthLoading(false);
      clearInterval(clockId);
      setShowConfirmModal(false);
      navigation.navigate("Order", {orderType: "sell", orderAccount: newKey})
    }
  }, [finishClock])

  useEffect(() => {
    changedOption === "sell" && setReceiveAmount(parseFloat((sellAmount * (1 - offerData.fee / 100) * offerData.rate).toFixed(2)).toString())
  }, [sellAmount, offerData])

  useEffect(() => {
    changedOption === "receive" && setSellAmount(parseFloat((receiveAmount / offerData.rate / (1 - offerData.fee / 100)).toFixed(2)).toString());
  }, [receiveAmount, offerData])

  return (
    <>
      <View style={tw`flex items-start`}>
        <Pressable onPress={() => navigation.navigate("Offers")}>
          <View style={tw`flex flex-row items-center mb-10`}>
            <Feather name="arrow-left" size={24} color="white" />
            <TextComponent size="2xl" style="ml-2">View Offer</TextComponent>
          </View>
        </Pressable>
      </View>
      <View style={tw`flex flex-row justify-between mb-4`}>
        <View style={tw`flex flex-col w-5/12`}>
          <InputComponent
            title="Amount to sell" 
            placeHolder="Enter amount here" 
            onChange={handleSellAmount} 
            suffix={offerData.tokenName.toUpperCase()}
            value={sellAmount}
            handleFocus={handleFocusForSell} />
          <View style={tw`flex flex-col justify-between`}>
            <View style={tw`flex-1 flex flex-row justify-between mb-2`}>
              <TextComponent color="green" size="sm" style="px-2 py-1 bg-gray-700 rounded-lg" action={() => setAmountByBalance(0.25)}>25%</TextComponent>
              <TextComponent color="green" size="sm" style="px-2 py-1 bg-gray-700 rounded-lg" action={() => setAmountByBalance(0.5)}>50%</TextComponent>
              <TextComponent color="green" size="sm" style="px-2 py-1 bg-gray-700 rounded-lg" action={() => setAmountByBalance(0.75)}>75%</TextComponent>
              <TextComponent color="green" size="sm" style="px-2 py-1 bg-gray-700 rounded-lg" action={() => setAmountByBalance(1)}>100%</TextComponent>
            </View>
            <View style={tw`flex flex-row`}>
              <TextComponent color="green" size="sm" style="mr-2">Balance: </TextComponent>
              <TextComponent color="green" size="sm">{tokenBalance.toFixed(2)}</TextComponent>
            </View>
          </View>
        </View>
        <InputComponent 
          style="w-5/12"
          title="Amount to receive"
          placeHolder="" 
          onChange={handleReceiveAmount} 
          suffix={offerData.fiat.toUpperCase()}
          value={receiveAmount}
          handleFocus={handleFocusForAmount} />
      </View>
      <View style={tw`flex flex-col items-start mb-4`}>
        <TextComponent color="gray" size="sm" style="mb-2">Payment option</TextComponent>
        <View style={tw`flex flex-row flex-wrap`}>
        {
          offerData.paymentOptions.toString().split(",").map((item, index) => 
            item * 1 >= 0 &&
              <Text 
                key={index} 
                onPress={() => handlePayment(item)}
                style={[tw`flex items-center justify-center rounded-lg px-4 py-2 mr-2 border-2`, {backgroundColor: "#060e0c", color: "#68CEC7", borderColor: paymentIndex === item ? "#" : " border-transparent"}]}
              >
                {PAYMENT_OFFER_VALUES[item * 1].title}
              </Text>
          )
        }
        </View>
      </View>
      <OfferDetailInfo offerData={offerData} />
      <OfferTerm data={offerData.offerTerms.toString()} />
      <View style={tw`flex flex-row items-start justify-between mb-4`}>
        <GrayButton title="Cancel" onPress={() => navigation.navigate("Offers")} />
        <GreenButton 
          title="Begin Trade" 
          size="lg"
          active={sellAmount && receiveAmount && paymentIndex !== -1 && sellAmount >= offerData.minLimit && sellAmount <= offerData.maxLimit && accountName && emailAddress}
          onPress={() => setShowNotifyModal(true)} />
      </View>
      <PaymentModal
        isShown={showPaymentModal} 
        setShown={setShowPaymentModal}
        setAccountName={setAccountName}
        setEmailAddress={setEmailAddress}
        setCheck={setCheck}
        accountName={accountName}
        emailAddress={emailAddress}
        check={check}
        paymentMethod={paymentIndex > -1 ? PAYMENT_OFFER_VALUES[paymentIndex].title : "" } />
      <TransferNotifyModal
        isShown={showNotifyModal} 
        setShown={setShowNotifyModal} 
        handleModal={handleNotifyModal} />
      <ConfirmTransferModal
        isLoading={!chainID ? isLoading : isEthLoading}
        isShown={showConfirmModal} 
        setShown={setShowConfirmModal} 
        handleModal={handleConfirmModal} 
        sellAmount={sellAmount}
        tokenName={offerData.tokenName} />
    </>
  )
}

export default BeginContainer;