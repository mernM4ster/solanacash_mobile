import { useState, useEffect } from "react";
import tw from "tailwind-react-native-classnames";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { Entypo } from '@expo/vector-icons';
import useOffer from "../utils/offers";
import useMyOffer from "../utils/myoffer";
import TextComponent from "./TextComponent";
import { PAYMENT_OFFER_VALUES } from "../constants/offers";
import CancelOfferModal from "./CancelOfferModal";

const MyOfferTable = (props) => {
  const { datas, navigation, handleCancelOffer } = props;
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedAccount, setSelectedAccount] = useState();

  const handleCollapse = (index) => {
    if (index === selectedIndex) {
        setSelectedIndex(-1)
    } else {
        setSelectedIndex(index)
    }
  }

  const handleCancel = (offerAccount) => {
    setSelectedAccount(offerAccount);
    console.log(offerAccount)
    setShowModal(true);
  }

  const cancelOffer = () => {
    handleCancelOffer(selectedAccount);
  }

  return (
    <View style={[tw`mb-4 border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
    {
      datas.length === 0
        ? <TextComponent style="text-center">There is no data.</TextComponent>
        : datas.map((data, index) => 
          <View key={index} style={[tw`flex flex-col p-2 text-left ${datas.length - 1 !== index ? "border-b-2" : ""}`, {borderColor: "#6f6f6f"}]}>
            <View style={tw`flex flex-row justify-between mb-2`}>
              <View style={tw`flex flex-row`}>
                <View style={[tw`px-2 py-1 mr-2 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                  <TextComponent color="green" size="xs" style="">Sell</TextComponent>
                </View>
                <Text style={tw`text-white text-base`}>{data.tokenName.toUpperCase()} {data.bought.toString()}</Text>
              </View>
              {
                data.status &&
                  <View style={tw`relative`}>
                    <Entypo name="dots-three-vertical" size={20} color="white" onPress={() => handleCollapse(index)} />
                    <View style={[tw`absolute mt-6 right-0 rounded-lg flex-col w-48 z-50 ${selectedIndex === index ? "flex" : "hidden"}`, {backgroundColor: "#060e0c"}]}>
                      <Pressable style={tw`px-4 py-2`} onPress={() => navigation.navigate("Edit Offer", {offerAccount: data.offer})}>
                        <TextComponent>Edit Offer</TextComponent>
                      </Pressable>
                      <Pressable style={tw`px-4 py-2`} onPress={() => handleCancel(data.offer)}>
                        <TextComponent>Discontinued Offer</TextComponent>
                      </Pressable>
                    </View>
                  </View>
              }
            </View>
            <View style={tw`flex flex-row justify-between mb-2`}>
              <View style={tw`flex flex-col mb-2`}>
                <TextComponent color="gray" size="sm" style="mb-1">Rate</TextComponent>
                <Text style={tw`text-white text-base`}>{data.rate} {data.fiat.toString().toUpperCase()}</Text>
              </View>
              <View style={tw`flex flex-row`}>
                <View style={tw`flex flex-col mr-2`}>
                  <TextComponent>Buying</TextComponent>
                  <TextComponent>Limit</TextComponent>
                </View>
                <View style={tw`flex flex-col mb-2`}>
                  <Text style={tw`text-white text-base`}>{data.tokenName.toUpperCase()} {data.tokenAmount}</Text>
                  <Text style={tw`text-white text-base`}>{data.minLimit.toLocaleString("en-US")} - {data.maxLimit.toLocaleString("en-US")}</Text>
                </View>
              </View>
            </View>
            <View style={tw`flex flex-row flex-wrap mb-2`}>
            {
              data.paymentOptions.toString().split(",").map((item, index) => 
                item * 1 >= 0 && 
                  <View key={index} style={[tw`rounded-lg p-2 mr-2`, {backgroundColor: "#060e0c"}]}>
                    <Text style={[tw`text-xs`, {color: "#68CEC7"}]}>{PAYMENT_OFFER_VALUES[item * 1].title}</Text>
                  </View>
              )
            }
            </View>
            <Text style={tw`text-white text-sm`}>{data.createdAt}</Text>
          </View>
        )
    }
      <CancelOfferModal isShown={showModal} setShown={setShowModal} handleModal={cancelOffer} />
    </View>
  )
}

export default MyOfferTable;