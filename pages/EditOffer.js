import { useState, useEffect, useContext } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { AppContext } from "../utils/AppContext";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import OptionContainer from "../containers/CreateOffer/OptionContainer";
import TermContainer from "../containers/CreateOffer/TermContainer";
import { FIAT_VALUES, TIME_VALUES, CRYPTO_VALUES } from "../constants/offers";
import { ETH_CRYPTO_VALUES } from "../constants/eth/offers";
import useOffer from "../utils/offers";
import useEthOffer from "../utils/eth/offers";

const EditOfferWrapper = ({route, navigation}) => {
  const { chainID, walletAddress } = useContext(AppContext);
  const { isLoading, getOfferData } = useOffer();
  const { isEthLoading, getEthOfferData } = useEthOffer();

  return (
    <EditOffer 
      route={route}
      navigation={navigation}
      walletAddress={walletAddress}
      cryptoValues={!chainID ? CRYPTO_VALUES : ETH_CRYPTO_VALUES[chainID]}
      isLoading={!chainID ? isLoading : isEthLoading}
      getOfferData={!chainID ? getOfferData : getEthOfferData} />
  )
}

const EditOffer = ({route, navigation, walletAddress, cryptoValues, isLoading, getOfferData}) => {
  const { offerAccount } = route.params;
  const [status, setStatus] = useState(0);
  const [cryptoValue, setCryptoValue] = useState(0);
  const [fiatValue, setFiatValue] = useState(0);
  const [amount, setAmount] = useState(0);
  const [minLimit, setMinLimit] = useState(0);
  const [maxLimit, setMaxLimit] = useState(0);
  const [payments, setPayments] = useState([]);
  const [terms, setTerms] = useState();
  const [rate, setRate] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    (async () => {
        const offerData = await getOfferData(offerAccount);
        console.log(offerData)
        setAmount(offerData.tokenAmount.toString());
        setMinLimit(offerData.minLimit.toString());
        setMaxLimit(offerData.maxLimit.toString());
        setRate(offerData.rate);
        setPayments(offerData.paymentOptions.split(",").map(e => e * 1));
        setTime(TIME_VALUES.map(item => item.value).indexOf(offerData.timeLimit));
        setTerms(offerData.offerTerms);
        setCryptoValue(offerData.main ? 0 : cryptoValues.map(item => item.value).indexOf(offerData.token.toString()));
        setFiatValue(FIAT_VALUES.map(item => item.value).indexOf(offerData.fiat));
    })()
  }, []);

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 flex flex-col my-8`}>
        <TextComponent size="2xl" bold="bold" style="mb-2">Create A Buy Offer</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-4" >Specify your sell order requirements</TextComponent>
        {
          walletAddress
            ? <>
              <View style={[tw`flex flex-row items-center mb-8 rounded-tl-lg rounded-tr-lg`, {backgroundColor: "#060e0c"}]}>
                <TouchableOpacity style={[tw`flex-1 border-b-2 py-2`, {borderColor: status === 0 ? "#060e0c" : "#060e0c"}]} onPress={() => setStatus(0)}>
                  <TextComponent color="gray" style="text-center">Offer Options</TextComponent>
                </TouchableOpacity>
                <Entypo name="chevron-thin-right" size={24} color="#b8b8b8" />
                <View style={[tw`flex-1 border-b-2 py-2`, {borderColor: status === 1 ? "#060e0c" : "#060e0c"}]}>
                  <TextComponent color="gray" style="text-center">Offer Terms</TextComponent>
                </View>
              </View>
              {
                status === 0 && 
                  <OptionContainer 
                    changeStatus={setStatus}
                    setCryptoValue={setCryptoValue}
                    setFiatValue={setFiatValue}
                    setAmount={setAmount}
                    setMinLimit={setMinLimit}
                    setMaxLimit={setMaxLimit}
                    setPayments={setPayments}
                    setTime={setTime}
                    setRate={setRate}
                    amount={amount}
                    minLimit={minLimit}
                    maxLimit={maxLimit}
                    payments={payments}
                    rate={rate}
                    time={time}
                    isLoading={isLoading}
                    cryptoValue={cryptoValue}
                    fiatValue={fiatValue}
                    isUpdate />
              }
              {
                status === 1 &&
                  <TermContainer 
                    changeStatus={setStatus}
                    cryptoType={cryptoValue}
                    fiatType={fiatValue}
                    amount={amount}
                    minLimit={minLimit}
                    maxLimit={maxLimit}
                    payments={payments}
                    oldTerms={terms}
                    time={time}
                    navigation={navigation}
                    offerAccount={offerAccount}
                    rate={rate}
                    isUpdate />
              }
            </>
            : <View style={[tw`py-16 border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
              <TextComponent size="2xl" style="text-center">Please connect your wallet.</TextComponent>
            </View>
        }
      </View>
    </ScrollView>
  );
}

export default EditOfferWrapper;