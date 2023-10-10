import { useState, useEffect, useContext } from "react";
import { View, TouchableOpacity, TextInput, Text } from "react-native";
import axios from "axios";
import tw from "tailwind-react-native-classnames";
import { AntDesign, Feather, Octicons } from "@expo/vector-icons";
import InputComponent from "../../components/InputComponent";
import SelectComponent from "../../components/SelectComponent";
import TextComponent from "../../components/TextComponent";
import GreenButton from "../../components/GreenButton";
import { CRYPTO_VALUES, FIAT_VALUES, TIME_VALUES, PAYMENT_OFFER_VALUES } from "../../constants/offers";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import { SOLANA_API_URL } from "../../constants/wallet";
import AddPaymentModal from "../../components/AddPaymentModal";
import SelectPaymentModal from "../../components/SelectPaymentModal";
import { AppContext } from "../../utils/AppContext";

const OptionContainer = (props) => {
  const { 
    changeStatus, 
    setCryptoValue, 
    setFiatValue, 
    setAmount, 
    setMinLimit, 
    setMaxLimit, 
    setPayments, 
    setTime, 
    setRate,
    amount, 
    minLimit, 
    maxLimit, 
    payments,
    rate, 
    time,
    isUpdate,
    cryptoValue,
    fiatValue,
    isLoading } = props;
  const { chainID } = useContext(AppContext);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [method, setMethod] = useState();
  const [cryptoValues, setCryptoValues] = useState(CRYPTO_VALUES);
  
  const handleMinLimit = (e) => {
    const value = e.nativeEvent.text;
    if (value > maxLimit) {
      setMaxLimit(value)
    }
  }
  
  const handleMaxLimit = (e) => {
    const value = e.nativeEvent.text;
    console.log("calue", value)
    if (value > 1000) {
      setAmount("1000")
    }
  }

  const handleAddPayment = () => {
    setShowModal(true);
  }

  const selectGroup = (data) => {
    setShowModal(false);
    setMethod(data);
    setShowSelectModal(true);
  }

  const goBack = () => {
    setShowModal(true);
    setShowSelectModal(false);
  }

  const removePayment = (value) => {
    console.log(value)
    console.log(payments)
    const newPayments = payments.filter((item, index) => item !== value);
    setPayments(newPayments);
  }

  const handleSelect = (value) => {
    if (payments.length < 3) {
        let newPayments = [...payments];
        newPayments.push(value);
        setPayments(newPayments);
    }
    setShowSelectModal(false);
  }

  useEffect(() => {
    if (!chainID) {
      setCryptoValues(CRYPTO_VALUES)
    } else {
      setCryptoValues(ETH_CRYPTO_VALUES[chainID])
    }
  }, [chainID]);

  useEffect(() => {
    (
      async () => {
          const cryptoTitle = cryptoValues[cryptoValue].title === "MATIC" ? "MATICpo" : cryptoValues[cryptoValue].title;
          const res = await axios(`${SOLANA_API_URL}${cryptoTitle}`);
          const tokenPrice = res.data.data.priceUsdt * FIAT_VALUES[fiatValue].price;
          setRate(tokenPrice * 0.99);
          setTokenPrice(tokenPrice * 0.99);
      }
    )();
  }, [cryptoValue, setRate, fiatValue, cryptoValues])

  return (
    <View style={tw`relative`}>
      {
        isLoading &&
          <View style={tw`w-full h-full z-50 absolute top-0 left-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
            <TextComponent style="text-center">Loading</TextComponent>
          </View>
      }
      <View style={tw`flex flex-row justify-between mb-4`}>
        <SelectComponent 
          search
          title="Select Crypto to Buy"
          values={cryptoValues}
          placeHolder="Select crypto here"
          onChange={setCryptoValue}
          value={cryptoValue}
          disabled={isUpdate}  />
        <SelectComponent 
          search
          title="Select Fiat to Accept"
          values={FIAT_VALUES} 
          placeHolder="Select fiat currency here" 
          onChange={setFiatValue} 
          value={fiatValue} />
      </View>
      <View style={[tw`flex flex-col pb-4 border-b-2 mb-5`, {borderColor: "#6f6f6f"}]}>
        <InputComponent style="w-full" title="Total Trading Amount" suffix={cryptoValues[cryptoValue].title.toUpperCase()} onChange={setAmount} value={amount} handleFocus={handleMaxLimit} />
        <View style={tw`flex flex-col`}>
          <TextComponent color="gray" size="sm" style="mb-2">Order Limit</TextComponent>
          <View style={tw`flex flex-row items-center justify-between`}>
            <InputComponent style="w-5/12" suffix={cryptoValues[cryptoValue].title.toUpperCase()} onChange={setMinLimit} min={0} value={minLimit} handleFocus={handleMinLimit} />
            <Feather name="arrow-right" size={24} color="white" />
            <InputComponent style="w-5/12" suffix={cryptoValues[cryptoValue].title.toUpperCase()} onChange={setMaxLimit} value={maxLimit} />
          </View>
        </View>
      </View>
      <View style={[tw`flex flex-col pb-4 border-b-2 mb-5`, {borderColor: "#6f6f6f"}]}>
        <TextComponent style="mb-2">Offer Price</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-4">Choose crypto rate you want to use</TextComponent>
        <View style={tw`flex flex-col`}>
          <View>
            <View style={[tw`p-4 border-2 rounded-lg mb-4`, {borderColor: "#6f6f6f"}]}>
              <View style={tw`flex flex-row items-center mb-2`}>
                <View style={[tw`w-8 h-8 rounded-3xl border-8 mr-4`, {borderColor: "#68CEC7"}]} />
                <TextComponent>Fixed Price</TextComponent>
              </View>
              <TextComponent color="gray" size="sm">Offer’s selling price is locked once created, and does not fluctuate with the market price.</TextComponent>
            </View>
            <TextComponent color="gray" size="sm" style="mb-2">Offer Rate</TextComponent>
            <View style={[tw`flex flex-row justify-between items-center p-2 mb-2 rounded-lg`, {backgroundColor: "#060e0c"}]}>
              <TouchableOpacity onPress={() => rate > 0 && setRate(rate - 1)}><AntDesign name="minussquareo" size={24} color="white" /></TouchableOpacity>
              <TextInput keyboardType="numeric" style={{color: "white"}} value={parseFloat(rate).toFixed(3)} onChange={(e) => setRate(e.target.value)} />
              <TouchableOpacity onPress={() => setRate(rate + 1)}><AntDesign name="plussquareo" size={24} color="white" /></TouchableOpacity>
            </View>
            <View style={tw`flex flex-row items-center mb-4`}>
              <View style={tw`flex flex-row mr-2`}>
                <TextComponent color="gray" size="sm">Current </TextComponent>
                <Text style={[tw`text-sm`, {color: "#b8b8b8", fontFamily: "InterRegularFont"}]}>{cryptoValues[cryptoValue].title.toUpperCase()}</Text>
                <TextComponent color="gray" size="sm"> marketplace price:</TextComponent>
              </View>
              <Text style={[tw`text-sm text-white`, {fontFamily: "InterRegularFont"}]} >{tokenPrice.toFixed(3).toLocaleString("en-US")} {FIAT_VALUES[fiatValue].title.toUpperCase()}</Text>
            </View>
          </View>
          <View style={tw`opacity-50`}>
            <View style={[tw`p-4 border-2 rounded-lg mb-4`, {borderColor: "#6f6f6f"}]}>
              <View style={tw`flex flex-row items-center mb-2`}>
                <View style={[tw`w-8 h-8 rounded-3xl border-8 mr-4`, {borderColor: "#6f6f6f"}]} />
                <TextComponent>Floating Price (Coming Soon)</TextComponent>
              </View>
              <TextComponent color="gray" size="sm">Offer’s selling price will fluctuate with the market price of the crypto.</TextComponent>
            </View>
            <TextComponent color="gray" size="sm" style="mb-4">Your Rate</TextComponent>
            <View style={[tw`p-4 border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
              <TextComponent bold="bold">$20,000.00</TextComponent>
            </View>
          </View>
        </View>
      </View>
      <View style={tw`flex flex-col mb-4`}>
        <TextComponent style="mb-2">Payment Options</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-2">Select your payment option (up to 3)</TextComponent>
        <View style={tw`flex flex-row flex-wrap`}>
          {
            payments.length > 0 && payments.map((item, index) => 
              item * 1 >= 0 &&
                <View key={index} style={[tw`px-4 py-2 rounded-lg flex flex-row items-center mr-2 mb-2`, {backgroundColor: "#060e0c"}]}>
                  <TextComponent style="mr-4">{PAYMENT_OFFER_VALUES[item * 1].title}</TextComponent>
                  <Feather onPress={() => removePayment(item)} name="x" size={24} color="#6b7280" />
                </View>
            )
          }
          <TouchableOpacity 
            style={[tw`${payments && payments.length === 3 ? "hidden" : "flex"} px-4 py-2 rounded-lg flex-row items-center mb-2`, {backgroundColor: "#060e0c"}]}
            onPress={() => setShowModal(true)}
          >
            <Octicons name="plus" size={24} color="#68CEC7" />
            <TextComponent color="green" style="ml-4">Add New</TextComponent>
          </TouchableOpacity>
        </View>
      </View>
      <View style={tw`flex flex-row justify-between items-end`}>
        <SelectComponent 
          title="Trade Time Limit"
          position="top"
          values={TIME_VALUES} 
          onChange={setTime} 
          value={time} />
        <GreenButton
          style="px-8" 
          title="Next Step"
          onPress={() => changeStatus(1)} 
          active={amount && minLimit >= 0 && maxLimit && payments.length > 0 && minLimit * 1 <= maxLimit * 1} />
      </View>
      <AddPaymentModal isShown={showModal} setShown={setShowModal} handleModal={selectGroup} />
      <SelectPaymentModal
        isShown={showSelectModal} 
        setShown={setShowSelectModal} 
        method={method}
        paymentIndexes={payments}
        goBack={goBack}
        handleModal={handleSelect} />
    </View>
  );
}

export default OptionContainer;