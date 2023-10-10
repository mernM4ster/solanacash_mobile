import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import TextComponent from "./TextComponent";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const BuyerPaymentModal = (props) => {
  const { isShown, setShown, handleModal, isLoading } = props;

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`px-4 pt-5 pb-6 relative rounded-lg`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="text-center mb-4">Payment is done</TextComponent>
        <TextComponent color="gray" style="text-center mb-4">Are you Sure you want to confirm the payment?</TextComponent>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)}/>
          <GreenButton title="Confirmed" size="lg" onPress={handleModal} active/>
        </View>
      </View>
      {
        isLoading &&
          <View style={tw`w-full h-full z-50 absolute top-0 left-0 flex items-center justify-center bg-opacity-40 bg-gray-400`}>
            <TextComponent style="text-center">Loading</TextComponent>
          </View>
      }
    </Modal>
  );
}

export default BuyerPaymentModal;