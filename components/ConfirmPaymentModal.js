import { useState } from "react";
import { View, Text } from "react-native";
import Checkbox from "expo-checkbox";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import TextComponent from "./TextComponent";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const ConfirmPaymentModal = (props) => {
  const { isShown, setShown, handleModal, fiatAmount, isLoading, method, email, name, id } = props;
  const [active, setActiveButton] = useState(false);

  const handleCheck = (value) => {
    setActiveButton(value);
  }

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg px-4 pt-5 pb-4 relative`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="mb-2 text-center">Confirm to Release Crypto</TextComponent>
        <TextComponent color="gray" style="mb-4 text-center">Do not release crypto unless you have receive confirmation of payment</TextComponent>
        <View style={[tw`p-4 rounded-lg mb-8`, {backgroundColor: "#091512"}]}>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Seller's {method} Email</TextComponent>
            <Text style={tw`text-white text-base`}>{email}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Account Name</TextComponent>
            <Text style={tw`text-white text-base`}>{name}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Amount</TextComponent>
            <Text style={tw`text-white text-base`}>$ {fiatAmount}</Text>
          </View>
          <View style={tw`flex flex-row justify-between mb-4`}>
            <TextComponent color="gray">Reference Message</TextComponent>
            <Text style={tw`text-white text-base w-1/2`}>{id}</Text>
          </View>
        </View>
        <View style={tw`flex flex-row items-center mb-4 `}>
          <Checkbox value={active} onValueChange={handleCheck} style={tw`mr-2`} />
          <TextComponent color="gray">I confirm that I have received the exact fund from the buyer as listed above</TextComponent>
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)} />
          <GreenButton title="Confirm" size="lg" active={active} onPress={handleModal} />
        </View>
      </View>
      {
        isLoading &&
          <View style={tw`w-full h-full z-10 absolute top-0 left-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
            <TextComponent style="text-center">Loading</TextComponent>
          </View>
      }
    </Modal>
  )
}

export default ConfirmPaymentModal;