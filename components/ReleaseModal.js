import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import GreenButton from "./GreenButton";
import TextComponent from "./TextComponent";

const ReleaseModal = (props) => {
  const { isShown, setShown, handleModal, fiatAmount, sellAmount } = props;

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg px-4 pt-5 pb-4 relative`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="text-center mb-4">{fiatAmount} USD</TextComponent>
        <TextComponent color="gray" style="text-center mb-4">You have sold {sellAmount} SOL</TextComponent>
        <View style={tw`flex flex-row justify-center`}>
          <GreenButton title="Done" size="lg" onPress={handleModal} active />
        </View>
      </View>
    </Modal>
  )
}

export default ReleaseModal