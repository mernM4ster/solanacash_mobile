import { useState } from "react";
import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import Checkbox from "expo-checkbox";
import TextComponent from "./TextComponent";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const ConfirmTransferModal = (props) => {
  const { isShown, setShown, handleModal, sellAmount, isLoading, tokenName } = props;
  const [active, setActiveButton] = useState(false);

  const handleCheck = (value) => {
    setActiveButton(value);
  }

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="text-center mb-4">Confirm to Transfer Crypto</TextComponent>
        <TextComponent color="gray" style="text-center mb-4">You are transferring crypto to a secured wallet for the period of this trade</TextComponent>
        <View style={[tw`p-4 rounded-lg mb-4 flex flex-row justify-between`, {backgroundColor: "#091512"}]}>
          <TextComponent color="gray">Amount</TextComponent>
          <TextComponent notl>{sellAmount} {tokenName.toUpperCase()}</TextComponent>
        </View>
        <View style={tw`flex flex-row items-center mb-8`}>
          <Checkbox value={active} onValueChange={handleCheck} style={tw`mr-2`} />
          <TextComponent color="gray ml-2">I understand that this fund will be locked until the trade is completed</TextComponent>
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)}/>
          <GreenButton title="Pay" size="lg" onPress={handleModal} active={active} />
        </View>
        {
          isLoading &&
            <View style={tw`w-full h-full absolute top-4 left-4 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
              <TextComponent style="text-center">Loading</TextComponent>
            </View>
        }
      </View>
    </Modal>
  );
}

export default ConfirmTransferModal;