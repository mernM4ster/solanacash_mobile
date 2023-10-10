import { TouchableOpacity, View, Text } from "react-native";
import Modal from "react-native-modal";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const SelectChainModal = (props) => {
  const { isShown, connectSolana } = props;
  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]} >
        <TextComponent color="green" size="3xl" style="text-center mb-8">Please select a chain</TextComponent>
        <TouchableOpacity 
          onPress={connectSolana}
          style={[tw`p-2 rounded-lg border-2 mb-2`, {borderColor: "#1e1f23"}]}
        >
          <TextComponent>Solana</TextComponent>
        </TouchableOpacity>
        <TouchableOpacity style={[tw`p-2 rounded-lg border-2 mb-2`, {borderColor: "#1e1f23"}]}>
          <TextComponent>Binance Smart Chain</TextComponent>
        </TouchableOpacity>
        <TouchableOpacity style={[tw`p-2 rounded-lg border-2 mb-2`, {borderColor: "#1e1f23"}]}>
          <TextComponent>Ethereum</TextComponent>
        </TouchableOpacity>
        <TouchableOpacity style={[tw`p-2 rounded-lg border-2 mb-2`, {borderColor: "#1e1f23"}]}>
          <TextComponent>Avalanche</TextComponent>
        </TouchableOpacity>
        <TouchableOpacity style={[tw`p-2 rounded-lg border-2 mb-2`, {borderColor: "#1e1f23"}]}>
          <TextComponent>Polygon</TextComponent>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default SelectChainModal;