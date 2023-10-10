import { useState, useEffect, useContext } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, Fontisto, Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import tw from "tailwind-react-native-classnames";
import XLSX from "xlsx";
import * as FileSystem from 'expo-file-system';
import useOrder from "../utils/orders";
import useEthOrder from "../utils/eth/orders";
import Header from "../components/Header";
import SelectComponent from "../components/SelectComponent";
import { CRYPTO_VALUES, TYPE_VALUES, STATUS_VALUES } from "../constants/orders";
import { ETH_CRYPTO_FILTER_VALUES } from "../constants/eth/offers";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import OrderTable from "../components/OrderTable";
import { AppContext } from "../utils/AppContext";
import Pagination from "../components/Pagination";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const OrdersList = ({navigation}) => {
  const { chainID, walletAddress } = useContext(AppContext);
  const { isLoading, allOrders, refresh, setRefresh } = useOrder();
  const { isEthLoading, allEthOthers, ethRefresh, setEthRefresh } = useEthOrder();

  return (
    <Orders
      navigation={navigation}
      walletAddress={walletAddress}
      cryptoValues={!chainID ? CRYPTO_VALUES : ETH_CRYPTO_FILTER_VALUES[chainID]}
      isLoading={!chainID ? isLoading : isEthLoading}
      allOrders={!chainID ? allOrders : allEthOthers}
      refresh={!chainID ? refresh : ethRefresh}
      setRefresh={!chainID ? setRefresh : setEthRefresh} />
  )
}

const Orders = ({navigation, walletAddress, cryptoValues, isLoading, allOrders, refresh, setRefresh}) => {
  const date = new Date();
  const yesterday = date.setDate(date.getDate() - 30);
  const [orderList, setOrderList] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState();
  const [showDate, setShowDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date(yesterday));
  const [endDate, setEndDate] = useState(new Date());
  const [pageRange, setPageRage] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const [selectedCryptoIndex, setSelectedCryptoIndex] = useState(0);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(0);

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

  const handleDownLoad = async () => {
    try {
      const ws = XLSX.utils.json_to_sheet(orderList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "orders");
      const wbout = XLSX.write(wb, { type: "binary", bookType: "xlsx"});
      await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "/orders.xlsx", wbout);
      Toast.show({
        type: "success",
        text1: "Saved successfully",
      })
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed",
      })
    }
  }

  useEffect(() => {
    setOrderList(allOrders);
    const newPageRange = Math.floor(allOrders.length / 10) + (allOrders.length % 10 > 0 ? 1 : 0);
    setPageRage(newPageRange);
  }, [allOrders]);

  useEffect(() => {
    let filterOrders = [...allOrders];
    if (selectedCryptoIndex !== 0) {
        if (selectedCryptoIndex === 1) {
            filterOrders = filterOrders.filter(item => item.main);
        } else {
            filterOrders = filterOrders.filter(item => (item.token.toString() === CRYPTO_VALUES[selectedCryptoIndex].value) && !item.main);
        }
    }
    if (selectedStatusIndex !== 0) {
        filterOrders = filterOrders.filter(item => item.status === STATUS_VALUES[selectedStatusIndex].value);
    }
    if (selectedTypeIndex !== 0) {
        filterOrders = filterOrders.filter(item => item.type === TYPE_VALUES[selectedTypeIndex].value);
    }
    const startUnixDate = Math.floor(new Date(startDate) / 1000);
    const endUnixDate = Math.floor(new Date(endDate) / 1000);
    filterOrders = filterOrders.filter(item => item.unixTime > startUnixDate);
    filterOrders = filterOrders.filter(item => item.unixTime < endUnixDate);
    filterOrders = filterOrders.filter((item, index) => index >= 10 * pageNum && index < (pageNum + 1) * 10);
    setOrderList(filterOrders);
  }, [selectedCryptoIndex, selectedStatusIndex, selectedTypeIndex, allOrders, pageNum, startDate, endDate])

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 mt-12`}>
        <View style={tw`flex justify-between flex-wrap mb-8`}>
          <View style={tw`flex flex-row flex-wrap mb-2`}>
            <SelectComponent title="Filter by Crypto" values={cryptoValues} value={selectedCryptoIndex} onChange={setSelectedCryptoIndex}/>
            <SelectComponent title="Order Type" values={TYPE_VALUES} value={selectedTypeIndex} onChange={setSelectedTypeIndex}/>
            <SelectComponent title="Status" values={STATUS_VALUES} value={selectedStatusIndex} onChange={setSelectedStatusIndex}/>
            <View>
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
          </View>
          <View style={tw`w-full flex flex-row flex-wrap justify-end mb-2`}>
            <View style={tw`flex flex-col mr-4`}>
              <TextComponent color="gray" size="sm" style="mb-2 text-left">Download</TextComponent>
              <TouchableOpacity 
                onPress={handleDownLoad}
                style={[tw`px-4 py-2 border-2 rounded-lg flex items-center justify-center`, {borderColor: "#6f6f6f"}]}>
                <MaterialIcons name="file-download" size={24} color={isLoading ? "gray" : "#b8b8b8"} />
              </TouchableOpacity>
            </View>
            <View style={tw`flex flex-col`}>
              <TextComponent color="gray" size="sm" style="mb-2 text-left">Refresh</TextComponent>
              <TouchableOpacity 
                onPress={() => !isLoading && setRefresh(true)}
                style={[tw`px-4 py-2 border-2 rounded-lg flex items-center justify-center`, {borderColor: "#6f6f6f"}]}
              >
                <Fontisto name="spinner-refresh" size={24} color={isLoading ? "gray" : "#b8b8b8"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {
          !walletAddress
            ? <View style={tw`p-4 flex items-center`}><TextComponent>Please connect wallet.</TextComponent></View>
            : isLoading
              ? <View style={tw`p-4 flex items-center`}><TextComponent>Loading</TextComponent></View>
              : <OrderTable datas={orderList} navigation={navigation} />
        }
        <Pagination pageRange={pageRange} setPageNum={setPageNum} pageNum={pageNum} />
      </View>
    </ScrollView>
  );
};

export default OrdersList;