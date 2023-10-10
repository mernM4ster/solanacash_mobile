import { useState, useEffect, useContext } from "react";
import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { Fontisto } from "@expo/vector-icons";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import SelectComponent from "../components/SelectComponent";
import TextComponent from "../components/TextComponent";
import { DURATION_VALUES } from "../constants/stats";
import useStats from "../utils/stats";
import useEthStats from "../utils/eth/stats";
import { AppContext } from "../utils/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getStatsInfo = (statsData, duration) => {
  const date = new Date();
  const prevDate = date.setDate(date.getDate() - duration);
  const minDate = date.setDate(date.getDate() - duration * 2);
  const prevUnixTime = Math.floor(new Date(prevDate) / 1000);
  const minUnixTime = Math.floor(new Date(minDate) / 1000);
  let newWallets = [];
  let newTransactions = 0;
  let newVolume = 0;
  const newStatsData = statsData.filter(item => item.createdAt > prevUnixTime);
  newStatsData.forEach(item => {
    if (newWallets.indexOf(item.seller) < 0) {
        newWallets.push(item.seller);
    }
    
    if (newWallets.indexOf(item.buyer) < 0) {
        newWallets.push(item.buyer);
    }

    newVolume += item.price * item.fiatAmount
  });
  newTransactions = newStatsData.length;
  let oldWallets = [];
  let oldTransactions = 0;
  let oldVolume = 0;
  const oldStatsData = statsData.filter(item => item.createdAt < prevUnixTime && item.createdAt > minUnixTime);
  oldStatsData.forEach(item => {
    if (oldWallets.indexOf(item.seller) < 0) {
        oldWallets.push(item.seller);
    }

    if (oldWallets.indexOf(item.buyer) < 0) {
        oldWallets.push(item.buyer);
    }

    oldVolume += item.price * item.fiatAmount
  });
  oldTransactions = oldStatsData.length;

  const volumeChange = oldVolume === 0 ? 100 :  Math.abs(newVolume - oldVolume) * 100 / oldVolume;
  const volumePlus = newVolume < oldVolume ? false : true
  const transactionsChange = oldTransactions === 0 ? 100 :  Math.abs(newTransactions - oldTransactions) * 100 / oldTransactions;
  const transactionsPlus = newTransactions < oldTransactions ? false : true
  const walletsChange = oldWallets.length === 0 ? 100 :  Math.abs(newWallets.length - oldWallets.length) * 100 / oldWallets.length;
  const walletsPlus = newWallets.length < oldWallets.length ? false : true
  
  return [
    [newVolume, volumeChange, volumePlus],
    [newTransactions, transactionsChange, transactionsPlus],
    [newWallets.length, walletsChange, walletsPlus]
  ]
}

const StatsWrapper = ({navigation}) => {
  const { chainID } = useContext(AppContext);
  const { isLoading, statsData, refresh, setRefresh } = useStats();
  const { isEthLoading, ethStatsData, ethRefresh, setEthRefresh } = useEthStats();

  return (
    <Stats
      navigation={navigation}
      isLoading={!chainID ? isLoading : isEthLoading}
      statsData={!chainID ? statsData : ethStatsData}
      refresh={!chainID ? refresh : ethRefresh}
      setRefresh={!chainID ? setRefresh : setEthRefresh} />
  );
}

const Stats = ({navigation, isLoading, statsData, refresh, setRefresh}) => {
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [volume, setVolume] = useState([0, 0, true]);
  const [transactions, setTransactions] = useState([0, 0, true]);
  const [wallets, setWallets] = useState([0, 0, true]);

  useEffect(() => {
    const newStats = getStatsInfo(statsData, 1);
    setVolume(newStats[0]);
    setTransactions(newStats[1]);
    setWallets(newStats[2]);
  }, [statsData])

  useEffect(() => {
    const newStats = getStatsInfo(statsData, DURATION_VALUES[selectedDurationIndex].value);
    setVolume(newStats[0]);
    setTransactions(newStats[1]);
    setWallets(newStats[2]);
  }, [selectedDurationIndex, statsData])

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 flex flex-col items-start`}>
        <TextComponent size="2xl" bold="bold" style="mt-6 mb-2">Stats</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-10" >View live market statistics</TextComponent>
        <View style={tw`w-full flex flex-row justify-between`}>
          <SelectComponent cssClass="mb-10" title="Duration" values={DURATION_VALUES} value={selectedDurationIndex} onChange={setSelectedDurationIndex} />
          <View style={tw`flex flex-col`}>
            <TextComponent color="gray" size="sm" style="mb-2" >Refresh</TextComponent>
            <TouchableOpacity 
              style={[tw`px-4 py-1 border-2 rounded-lg flex items-center justify-center`, {borderColor: "#6f6f6f"}]}
              onPress={() => !isLoading && setRefresh(true)}
            >
              <Fontisto name="spinner-refresh" size={20} color={isLoading ? "gray" : "#b8b8b8"} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[tw`w-full px-8 py-4 border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
          {
            isLoading
              ? <View><TextComponent style="text-center">Loading</TextComponent></View>
              : <View style={tw`flex flex-col`}>
                <View style={tw`flex flex-col flex-1 mr-4 mb-4`}>
                  <TextComponent color="gray" size="sm" style="mb-4">Total Volume</TextComponent>
                  <View style={[tw`w-full flex flex-row justify-between items-center px-2 py-1 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                    <TextComponent>{volume[0].toLocaleString("en-US")}</TextComponent>
                    <View style={tw`flex flex-row items-center`}>
                      {
                        volume[2]
                          ? <AntDesign name="caretup" size={16} color="#68CEC7" />
                          : <AntDesign name="caretdown" size={16} color="red" />
                      }
                      <Text style={[tw`text-base ml-2`, {color: volume[2] ? "#68CEC7" : "red"}]}>{volume[1].toFixed(2)}%</Text>
                    </View>
                  </View>
                </View>
                <View style={tw`flex flex-col flex-1 mr-4 mb-4`}>
                  <TextComponent color="gray" size="sm" style="mb-4">Transactions</TextComponent>
                  <View style={[tw`w-full flex flex-row justify-between items-center px-2 py-1 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                    <TextComponent>{transactions[0].toLocaleString("en-US")}</TextComponent>
                    <View style={tw`flex flex-row items-center`}>
                      {
                        transactions[2]
                          ? <AntDesign name="caretup" size={16} color="#68CEC7" />
                          : <AntDesign name="caretdown" size={16} color="red" />
                      }
                      <Text style={[tw`text-base ml-2`, {color: transactions[2] ? "#68CEC7" : "red"}]}>{transactions[1].toFixed(2)}%</Text>
                    </View>
                  </View>
                </View>
                <View style={tw`flex flex-col flex-1 mr-4 mb-4`}>
                  <TextComponent color="gray" size="sm" style="mb-4">Active Wallets</TextComponent>
                  <View style={[tw`w-full flex flex-row justify-between items-center px-2 py-1 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                    <TextComponent>{wallets[0].toLocaleString("en-US")}</TextComponent>
                    <View style={tw`flex flex-row items-center`}>
                      {
                        wallets[2]
                          ? <AntDesign name="caretup" size={16} color="#68CEC7" />
                          : <AntDesign name="caretdown" size={16} color="red" />
                      }
                      <Text style={[tw`text-base ml-2`, {color: wallets[2] ? "#68CEC7" : "red"}]}>{wallets[1].toFixed(2)}%</Text>
                    </View>
                  </View>
                </View>
              </View>
          }
        </View>
      </View>
    </ScrollView>
  );
}

export default StatsWrapper;