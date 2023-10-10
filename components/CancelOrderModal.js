import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import TextComponent from "./TextComponent";
import GreenButton from "./GreenButton";

const CancelOrderModal = (props) => {
  const { isShown, setShown, handleModal, isLoading } = props;

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`px-4 pt-5 pb-6 relative rounded-lg`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="text-center mb-4">Order is cancelled</TextComponent> 
        <TextComponent color="gray" style="text-center mb-4">Wait time expired, sell order was cancelled. Your Crypto will be returned to your Wallet</TextComponent>
        <View style={tw`flex flex-row justify-center`}>
          <GreenButton title="Yes, Withdraw" size="lg" onPress={handleModal} active/>
        </View>
      </View>
      {
        isLoading &&
          <View style={tw`w-full h-full flex z-10 items-center justify-center absolute bg-black bg-opacity-75 rounded-lg`}>
            <TextComponent>Loading</TextComponent>
          </View>
      }
    </Modal>
  );
}

export default CancelOrderModal;