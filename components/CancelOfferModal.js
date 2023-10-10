import Modal from "react-native-modal";
import tw from "tailwind-react-native-classnames";
import { View } from "react-native";
import TextComponent from "./TextComponent";
import GreenButton from "./GreenButton";
import GrayButton from "./GrayButton";

const CancelOfferModal = (props) => {
  const { isShown, setShown, handleModal, isLoading } = props;

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`px-4 pt-5 pb-6 relative rounded-lg`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="text-center mb-4">Are you sure you want to discontinue this offer?</TextComponent> 
        <TextComponent color="gray" style="text-center mb-4">Any funds left in this offer, will be returned to your wallet</TextComponent>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)} />
          <GreenButton title="Yes, Discontinue" size="lg" active onPress={handleModal} />
        </View>
      </View>
      {
        isLoading &&
          <View style={tw`w-full h-full z-10 absolute top-0 left-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
            <TextComponent style="text-center">Loading</TextComponent>
          </View>
      }
    </Modal>
  );
}

export default CancelOfferModal;