import { useState, useEffect } from "react";
import { TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import Modal from "react-native-modal";
import { Feather } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";
import { PAYMENT_OFFER_VALUES } from "../constants/offers";

const SelectPaymentModal = (props) => {
  const { isShown, setShown, handleModal, method, paymentIndexes, goBack } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    if (searchKey) {
        const newFilterItems = PAYMENT_OFFER_VALUES.filter(item => item.title.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
        setFilterItems(newFilterItems);
    } else {
        setFilterItems(PAYMENT_OFFER_VALUES)
    }
  }, [searchKey])

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]}>
        <View style={tw`flex flex-row justify-between items-center mb-4`}>
          <Feather onPress={goBack} name="arrow-left" size={24} color="white" />
          <TextComponent color="green" size="3xl">
            {
              method === "all"
                ? "All Payment"
                : method === "bank"
                  ? "Bank Transfer"
                  : "Online Wallet"
            }
          </TextComponent>
          <View />
        </View>
        <ScrollView style={tw`flex flex-col`}>
          <TextInput style={[tw`m-2 p-1 bg-transparent border-2 rounded-lg`, {borderColor: "#6b7280"}]} value={searchKey} onChangeText={text => setSearchKey(text)} />
          {
            method === "all" &&
              filterItems.map((item, index) =>
                paymentIndexes.indexOf(item.value) > -1
                  ? <TextComponent color="gray" key={index} style="p-2 rounded-lg">{item.title}</TextComponent>
                  : <TextComponent color="gray" key={index} style="p-2 rounded-lg" action={() => handleModal(item.value)}>{item.title}</TextComponent>
              )
          }
          {
            method === "bank" &&
              filterItems.filter((item) => item.value === 5).map((item, index) => 
                paymentIndexes.indexOf(item.value) > -1
                  ? <TextComponent color="gray" key={index} style="p-2 rounded-lg">{item.title}</TextComponent>
                  : <TextComponent color="gray" key={index} style="p-2 rounded-lg" action={() => handleModal(item.value)}>{item.title}</TextComponent>
              )
          }
          {
            method === "wallet" &&
              filterItems.filter((item) => item !== 5).map((item, index) => 
                paymentIndexes.indexOf(item.value) > -1
                  ? <TextComponent color="gray" key={index} style="p-2 rounded-lg">{item.title}</TextComponent>
                  : <TextComponent color="gray" key={index} style="p-2 rounded-lg" action={() => handleModal(item.value)}>{item.title}</TextComponent>
              )
          }
        </ScrollView>
      </View>
    </Modal>
  );
}

export default SelectPaymentModal;