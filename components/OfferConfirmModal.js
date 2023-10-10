import { useState } from "react";
import { View, Text } from "react-native";
import Checkbox from "expo-checkbox";
import Modal from "react-native-modal";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";
import { FIAT_VALUES, TIME_VALUES, PAYMENT_OFFER_VALUES } from "../constants/offers";

const OfferConfirmModal = (props) => {
  const { isShown, setShown, cryptoType, fiatType, amount, minLimit, maxLimit, payments, time, createOffer, isLoading, rate, cryptoValues } = props;
  const [activeButton, setActiveButton] = useState(false);
  const [checkValue, setCheckValue] = useState(false);

  const handleCheck = (value) => {
    setCheckValue(value)
    setActiveButton(value);
  }

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`px-4 pt-5 pb-4 rounded-lg`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="mb-8 text-center">Offer Confirmation</TextComponent>
        <TextComponent color="gray" style="mb-8 text-center">Check the offer terms before proceeding to submit this offer</TextComponent>
        <View style={[tw`p-4 rounded-lg mb-8`, {backgroundColor: "#091512"}]}>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Rate</TextComponent>
            <Text style={tw`text-white text-base`}>{rate.toFixed(3)} {FIAT_VALUES[fiatType].title.toUpperCase()}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Total Trading Amount</TextComponent>
            <Text style={tw`text-white text-base`}>{amount} {cryptoValues[cryptoType].title.toUpperCase()}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Limit</TextComponent>
            <Text style={tw`text-white text-base`}>{minLimit} - {maxLimit}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Payment Method</TextComponent>
            <View>
              {
                payments.map((item, index) =>
                  item * 1 >= 0 && <Text key={index} style={tw`text-white text-base`}>{PAYMENT_OFFER_VALUES[item * 1].title}</Text>
                )
              }
            </View>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Crypto to Buy</TextComponent>
            <Text style={tw`text-white text-base`}>{cryptoValues[cryptoType].title.toUpperCase()}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Fiat to Send</TextComponent>
            <Text style={tw`text-white text-base`}>{FIAT_VALUES[fiatType].title.toUpperCase()}</Text>
          </View>
          <View style={tw`flex flex-row justify-between`}>
            <TextComponent color="gray">Trade Time Limit</TextComponent>
            <Text style={tw`text-white text-base`}>{TIME_VALUES[time].title}</Text>
          </View>
        </View>
        <View style={tw`flex flex-row items-center mb-4 `}>
          <Checkbox value={checkValue} onValueChange={handleCheck} style={tw`mr-2`} />
          <TextComponent color="gray">I have read through the offer terms, and want to proceed to create this offer</TextComponent>
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)} />
          <GreenButton title="Submit Offer" size="lg" active={activeButton} onPress={createOffer} />
        </View>
        {
            isLoading &&
              <View style={tw`w-full h-full absolute top-5 left-4 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
                <TextComponent style="text-center">Loading</TextComponent>
              </View>
          }
      </View>
    </Modal>
  );
}

export default OfferConfirmModal;