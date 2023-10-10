import { useState, useEffect, useContext } from "react";
import { ScrollView, View } from "react-native";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import tw from "tailwind-react-native-classnames";
import useOffer from "../utils/offers";
import useEthOffer from "../utils/eth/offers";
import { AppContext } from "../utils/AppContext";
import TextComponent from "../components/TextComponent";
import BeginContainer from "../containers/Sell/BeginContainer";
import ChatContainer from "../containers/ChatContainer";

const OfferSellerWrapper = ({route, navigation}) => {
  const defaultOfferData = {
    buyer: "XXXXXXXX",
    thumbsUp: 0,
    thumbsDown: 0,
    minLimit: 0,
    maxLimit: 0,
    rate: 1,
    timeLimit: 0,
    fiat: "",
    tokenName: "usd",
    offerTerms: "",
    fee: 1,
    paymentOptions: ""
  }
  const { Id } = route.params;
  const { walletAddress, chainID } = useContext(AppContext);
  const { isLoading, getOfferData, getTokenBalance } = useOffer();
  const { ethIsLoading, getEthOfferData, getEthTokenBalance } = useEthOffer();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [offerData, setOfferData] = useState(defaultOfferData);

  useEffect(() => {
    (async () => {
      let newOfferData
      if (!chainID) {
        newOfferData = await getOfferData(Id);
      } else {
        newOfferData = await getEthOfferData(Id);
      }
      console.log(newOfferData);
      setOfferData(newOfferData);
    })()
  }, [chainID]);

  useEffect(() => {
    (
      async () => {
        if (walletAddress && offerData.maxLimit) {
          let newTokenBalance = 0;
          if (!chainID) {
            newTokenBalance = await getTokenBalance(offerData.main ? "sol" : offerData.token);
          } else {
            newTokenBalance = await getEthTokenBalance(offerData.main ? "eth" : offerData.token_address);
          }
          setTokenBalance(newTokenBalance);
        }
      }
    )();
  }, [walletAddress, offerData, chainID])

  return (
    <OfferSeller
      navigation={navigation}
      chainID={chainID}
      isLoading={!chainID ? isLoading : ethIsLoading}
      walletAddress={walletAddress}
      offerData={offerData}
      Id={Id}
      tokenBalance={tokenBalance} />
  )
}

const OfferSeller = ({navigation, chainID, isLoading, walletAddress, offerData, Id, tokenBalance}) => {
  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 flex flex-col mt-6`}>
        {
          walletAddress
            ? <>
              <View style={tw`flex-1 relative`}>
                {
                  isLoading &&
                    <View style={tw`absolute w-full h-full -top-4 flex z-50 items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
                      <TextComponent>Loading</TextComponent>
                    </View>
                }
                <BeginContainer chainID={chainID} offerData={offerData} offerAccount={Id} tokenBalance={tokenBalance} navigation={navigation} />
              </View>
              <ChatContainer data={offerData} />
            </>
            :<View><TextComponent style="text-center">Please connect your wallet.</TextComponent></View>
        }
      </View>
    </ScrollView>
  )
}

export default OfferSellerWrapper;