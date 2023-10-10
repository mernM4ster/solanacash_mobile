import { useState, useContext, useEffect } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import * as anchor from "@project-serum/anchor";
import tw from "tailwind-react-native-classnames";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import SelectComponent from "../components/SelectComponent";
import TextComponent from "../components/TextComponent";
import useMyOffer from "../utils/myoffer";
import useEthMyOffer from "../utils/eth/myoffers";
import useOffer from "../utils/offers";
import { CRYPTO_FILTER_VALUES, STATUS_VALUES } from "../constants/offers";
import { ETH_CRYPTO_FILTER_VALUES } from "../constants/eth/offers";
import { NEXT_PUBLIC_SOLANA_RPC_HOST } from "../constants/env";
import { AppContext } from "../utils/AppContext";
import MyOfferTable from "../components/MyOfferTable";
import Pagination from "../components/Pagination";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const MyOfferListWrapper = ({navigation}) => {
  const { chainID } = useContext(AppContext);
  const { discontinueOffer } = useOffer();
  const { isLoading, myOffers, refresh, setRefresh, setIsLoading } = useMyOffer();
  const { ethIsLoading, myEthOffers, ethRefresh, setEthRefresh, discontinueEthOffer, setEthIsLoading} = useEthMyOffer();

  return (
    <MyOfferList 
      navigation={navigation}
      cryptoFilterValues={!chainID ? CRYPTO_FILTER_VALUES : ETH_CRYPTO_FILTER_VALUES[chainID]}
      discontinueOffer={!chainID ? discontinueOffer : discontinueEthOffer}
      isLoading={!chainID ? isLoading : ethIsLoading}
      myOffers={!chainID ? myOffers : myEthOffers}
      refresh={!chainID ? refresh : ethRefresh}
      setIsLoading={!chainID ? setIsLoading : setEthIsLoading}
      setRefresh={!chainID ? setRefresh : setEthRefresh} />
  )
};

const MyOfferList = ({navigation, cryptoFilterValues, isLoading, myOffers, refresh, setRefresh, setIsLoading}) => {
  const date = new Date();
  const yesterday = date.setDate(date.getDate() - 30);
  const [selectedCryptoIndex, setSelectedCryptoIndex] = useState(0);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(0);
  const [selectedCalendar, setSelectedCalendar] = useState();
  const [showDate, setShowDate] = useState(false);
  const [myOfferList, setOfferList] = useState([]);
  const [pageRange, setPageRage] = useState(0);
  const [startDate, setStartDate] = useState(new Date(yesterday));
  const [endDate, setEndDate] = useState(new Date());
  const [pageNum, setPageNum] = useState(0);
  const { walletAddress, txHash, setTxHash, chainID } = useContext(AppContext);

  console.log("isLoading", isLoading)

  const handleRefresh = () => {
    setRefresh(true);
  }

  const onChange = (event, selectedDate) => {
    console.log("-------------event--------", selectedDate);
    console.log("-------------event--------", event.nativeEvent);
    if (selectedCalendar === "start") {
      setStartDate(selectedDate);
    }
    if (selectedCalendar === "end") {
      setEndDate(selectedDate);
    }
    setSelectedCalendar();
    setShowDate(false)
  };

  const handleCalendar = (flag) => {
    setSelectedCalendar(flag);
    setShowDate(true);
  }

  const handleCancelOffer = async (offerAccount) => {
    setIsLoading(true)
    const newMyOfferList = await discontinueOffer(offerAccount);
  }

  useEffect(() => {
    setOfferList(myOffers);
    const newPageRange = Math.floor(myOffers.length / 10) + 1;
    setPageRage(newPageRange);
  }, [myOffers]);

  useEffect(() => {
    let filterOffers = [...myOffers];
    if (selectedCryptoIndex !== 0) {
        if (selectedCryptoIndex === 1) {
            filterOffers = filterOffers.filter(item => item.main);
        } else {
            filterOffers = filterOffers.filter(item => (item.token.toString() === cryptoFilterValues[selectedCryptoIndex].value) && !item.main);
        }
    }
    if (selectedStatusIndex !== 0) {
        filterOffers = filterOffers.filter(item => item.status === STATUS_VALUES[selectedStatusIndex].value);
    }
    const startUnixDate = Math.floor(new Date(startDate) / 1000);
    const endUnixDate = Math.floor(new Date(endDate) / 1000);
    filterOffers = filterOffers.filter(item => item.unixTime > startUnixDate);
    filterOffers = filterOffers.filter(item => item.unixTime < endUnixDate);
    filterOffers = filterOffers.filter((_, index) => index >= 10 * pageNum && index < (pageNum + 1) * 10);
    setOfferList(filterOffers);
  }, [selectedCryptoIndex, selectedStatusIndex, myOffers, pageNum, startDate, endDate])

  useEffect(() => {
    (
      async () => {
        if (txHash && !chainID) {
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
          await getMyOffers();
          setIsLoading(false);
        }
      }
    )();
  }, [txHash, chainID])


  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation}/>
      <View style={tw`px-2 flex-1`}>
        <TextComponent size="2xl" bold="bold" style="mt-8 mb-2">My Offers</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-6">My created offers</TextComponent>
        <View style={tw`flex flex-row justify-between mb-8 flex-wrap`}>
          <View style={tw`flex flex-row flex-wrap`}>
            <SelectComponent title="Filter by Crypto" values={cryptoFilterValues} value={selectedCryptoIndex} onChange={setSelectedCryptoIndex} search />
            <SelectComponent title="Status" values={STATUS_VALUES} value={selectedStatusIndex} onChange={setSelectedStatusIndex} />
            <View style={tw`mr-8`}>
              <TextComponent color="gray" size="sm" style="mb-2">Date Range</TextComponent>
              <View style={[tw`flex flex-row px-4 py-1.5 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                <TouchableOpacity style={tw`flex flex-row items-center`} onPress={() => handleCalendar("start")}>
                  <Ionicons name="ios-calendar-sharp" size={18} color="#b8b8b8" />
                  <TextComponent style="ml-1">{startDate.toLocaleDateString()}</TextComponent>
                </TouchableOpacity>
                <TextComponent style="mx-2">-</TextComponent>
                <TouchableOpacity style={tw`flex flex-row items-center`} onPress={() => handleCalendar("end")}>
                  <Ionicons name="ios-calendar-sharp" size={18} color="#b8b8b8" />
                  <TextComponent style="ml-1">{endDate.toLocaleDateString()}</TextComponent>
                </TouchableOpacity>
              </View>
            </View>
            {
              showDate && 
                <RNDateTimePicker
                  value={selectedCalendar === "start" ? startDate : selectedCalendar === "end" ? endDate : date}
                  display="calendar"
                  mode="date"
                  onChange={onChange}
                />
            }
            <View style={tw`flex flex-col`}>
              <TextComponent color="gray" size="sm" style="mb-2 text-left">Refresh</TextComponent>
              <TouchableOpacity 
                style={[tw`px-4 py-1 border-2 rounded-lg flex items-center justify-center`, {borderColor: "#6f6f6f"}]} 
                onPress={() => !isLoading && setRefresh(true)}
              >
                <Fontisto name="spinner-refresh" size={24} color={isLoading ? "gray" : "#b8b8b8"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {
          isLoading
            ? <View><TextComponent style="text-center">Loading</TextComponent></View>
            : walletAddress
              ? <MyOfferTable datas={myOfferList} isLoading={isLoading} setOfferList={setOfferList} navigation={navigation} handleCancelOffer={handleCancelOffer} />
              : <View><TextComponent style="text-center">Please connect your wallet</TextComponent></View>
        }
        <Pagination pageRange={pageRange} setPageNum={setPageNum} pageNum={pageNum} />
      </View>
    </ScrollView>
  )
}

export default MyOfferListWrapper;