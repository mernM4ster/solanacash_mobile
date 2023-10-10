import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ScrollView, View, Text } from "react-native";
import tw from "tailwind-react-native-classnames";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import { AppContext } from "../utils/AppContext";
import useWallet from "../utils/wallets";
import useEthWallet from "../utils/eth/wallets";
import { SOLANA_API_URL } from "../constants/wallet";

const WalletWrapper = ({navigation}) => {
  const { chainID, walletAddress } = useContext(AppContext);
  const { isLoading, allTokens } = useWallet();
  const { isEthLoading, allEthTokens } = useEthWallet();

  return (
    <Wallet 
      navigation={navigation}
      walletAddress={walletAddress}
      isLoading={!chainID ? isLoading : isEthLoading}
      allTokens={!chainID ? allTokens : allEthTokens} />
);
}

const Wallet = ({navigation, walletAddress, isLoading, allTokens}) => {
  const [tokenName, setTokenName] = useState("");
  const [selectedIndex, setSelectedIndex ] = useState(0);
  const [balance, setBalance] = useState(0);
  const [price, setPrice] = useState(0);

  const changeToken = (index) => {
    setSelectedIndex(index);
  };

  useEffect(() => {
    if (allTokens.length > 0) {
        (
            async () => {
                setTokenName(allTokens[selectedIndex].tokenName);
                const res = await axios(`${SOLANA_API_URL}${allTokens[selectedIndex].tokenName}`);
                const tokenPrice = res.data.data.priceUsdt;
                setPrice(tokenPrice);
                setBalance(allTokens[selectedIndex].balance);
            }
        )();
    }
  }, [selectedIndex, allTokens])

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1`}>
        <TextComponent size="2xl" bold="bold" style="mt-4 mb-2 text-left">Trading Wallet</TextComponent>
        <TextComponent color="gray" size="sm" bold="bold" style="mb-4 text-left">This is your trade locked fund</TextComponent>
        {
          walletAddress
            ? isLoading
              ? <View style={tw`h-40`}><TextComponent style="text-center mt-8">Loading</TextComponent></View>
              : <View style={[tw`px-8 py-4 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                <View style={tw`flex flex-col justify-between mb-5`}>
                  <TextComponent style="text-left mb-2">Locked Balance</TextComponent>
                  <View style={tw`flex items-start`}>
                    <TextComponent color="gray" size="sm" style="mr-4 mb-2">Token:</TextComponent>
                    <View style={tw`flex flex-wrap`}>
                      {
                        allTokens.length > 0
                          ? allTokens.map((item, index) => 
                              <View key={index} style={[tw`px-2 py-1 mr-2 rounded-lg mb-2`, {backgroundColor: index === selectedIndex ? "" : "#6b7280"}]} >  
                                <TextComponent 
                                  color="gray"
                                  onPress={() => changeToken(index)}
                                >
                                  {item.tokenName.toUpperCase()}
                                </TextComponent>
                              </View>
                          )
                          : <TextComponent size="sm" style="mb-2">There is no locked token</TextComponent>
                      }
                    </View>
                  </View>
                </View>
                <View style={tw`flex flex-row mb-2`}>
                  <Text style={tw`text-3xl font-bold text-white`}>{balance}</Text>
                  <Text style={tw`text-3xl font-bold text-white`}>{tokenName.toUpperCase()}</Text>
                </View>
                <Text style={[tw`text-left mb-4 text-base`, {color: "#b8b8b8"}]}>${(price * balance).toFixed(3)}</Text>
                <TextComponent color="gray" size="sm" style="">This is fund from your pending orders</TextComponent>
              </View>
            : <View style={tw`h-40`}><TextComponent style="text-center mt-8">Please connect your wallet.</TextComponent></View>
        }
      </View>
    </ScrollView>
  );
}

export default WalletWrapper;