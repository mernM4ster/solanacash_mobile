import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import GreenButton from "./GreenButton";
import TextComponent from "./TextComponent";

const DisputeConfirmModal = (props) => {
  const { isShown, setShown, handleModal} = props;

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg px-4 pt-5 pb-4 relative`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="2xl" style="text-center mb-4">Please send a E-Mail to Dispute@mansa-trade.com to settle this Dispute</TextComponent>
        <View style={tw`flex flex-row justify-center`}>
          <GreenButton title="Ok" size="lg" onPress={handleModal} active />
        </View>
      </View>
    </Modal>
  );
}

export default DisputeConfirmModal;