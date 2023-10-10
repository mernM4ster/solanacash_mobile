import { View, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import LockImg from "../assets/images/lock.png";
import TextComponent from "./TextComponent";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const TransferNotifyModal = (props) => {
  const { isShown, setShown, handleModal } = props;

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]}>
        <View style={tw`flex flex-col items-center`}>
          <Image source={LockImg} style={tw`my-4`} />
          <TextComponent color="green" size="3xl" style="text-center mb-2">Transfer Crypto to Trading Wallet</TextComponent>
          <TextComponent color="gray" style="text-center mb-2">Your crypto would be transferred to a secured wallet in our smart contract for this trade</TextComponent>
          <TextComponent color="gray" style="text-center mb-2">Note: Your crypto will not be released to the buyer until you release the fund after getting your payment</TextComponent>
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)} />
          <GreenButton title="Transfer" size="lg" onPress={handleModal} active />
        </View>
      </View>
    </Modal>
  )
}

export default TransferNotifyModal;