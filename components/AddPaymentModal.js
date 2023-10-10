import { TouchableOpacity, View, Text } from "react-native";
import Modal from "react-native-modal";
import tw from "tailwind-react-native-classnames";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import TextComponent from "./TextComponent";

const AddPaymentModal = (props) => {
  const { isShown, setShown, handleModal } = props;
  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]} >
        <TextComponent color="green" size="3xl" style="text-center mb-8">Add payment method</TextComponent>
        <TouchableOpacity
          onPress={() => handleModal("all")}
          style={tw`flex flex-row justify-between items-center mb-2 p-2 rounded-lg`}
        >
          <View style={tw`flex flex-row items-center`}>
            <Feather name="stop-circle" size={24} color="#68CEC7" />
            <TextComponent size="lg" style="ml-2" >All Payment</TextComponent>
          </View>
          <View style={tw`flex flex-row items-center`}>
            <View style={[tw`w-8 h-8 flex items-center justify-center rounded-full mr-2`, {backgroundColor: "#68CEC7"}]}>
              <Text style={tw`text-black`} >39</Text>
            </View>
            <Feather name="arrow-right" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleModal("bank")}
          style={tw`flex flex-row justify-between items-center mb-2 p-2 rounded-lg`}
        >
          <View style={tw`flex flex-row items-center`}>
            <MaterialCommunityIcons name="bank" size={24} color="#68CEC7" />
            <TextComponent size="lg" style="ml-2" >Bank Transfer</TextComponent>
          </View>
          <View style={tw`flex flex-row items-center`}>
            <View style={[tw`w-8 h-8 flex items-center justify-center rounded-full mr-2`, {backgroundColor: "#68CEC7"}]}>
              <Text style={tw`text-black`} >1</Text>
            </View>
            <Feather name="arrow-right" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleModal("wallet")}
          style={tw`flex flex-row justify-between items-center mb-2 p-2 rounded-lg`}
        >
          <View style={tw`flex flex-row items-center`}>
            <Ionicons name="wallet-outline" size={24} color="#68CEC7" />
            <TextComponent size="lg" style="ml-2" >Online Wallet</TextComponent>
          </View>
          <View style={tw`flex flex-row items-center`}>
            <View style={[tw`w-8 h-8 flex items-center justify-center rounded-full mr-2`, {backgroundColor: "#68CEC7"}]}>
              <Text style={tw`text-black`} >38</Text>
            </View>
            <Feather name="arrow-right" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default AddPaymentModal;