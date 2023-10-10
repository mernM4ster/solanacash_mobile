import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, View } from "react-native";
import Checkbox from "expo-checkbox";
import tw from "tailwind-react-native-classnames";
import Modal from "react-native-modal";
import TextComponent from "./TextComponent";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const PaymentModal = (props) => {
  const { isShown, setShown, setAccountName, setEmailAddress, setCheck, accountName, check, emailAddress, paymentMethod } = props;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checkStatus, setCheckStatus] = useState(false);

  const handleAdd = async () => {
    setAccountName(name);
    setEmailAddress(email);
    setCheck(checkStatus);
    await AsyncStorage.setItem(`${paymentMethod}-name`, name);
    await AsyncStorage.setItem(`${paymentMethod}-email`, email);
    await AsyncStorage.setItem(`${paymentMethod}-remember`, checkStatus ? "true" : "false");
    setShown(false);
  };

  useEffect(() => {
    setName(accountName);
    setEmail(emailAddress);
    setCheckStatus(check);
  }, [accountName, emailAddress, check]);

  return (
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="mb-2 text-center">Add Payment Modal</TextComponent>
        <TextComponent color="gray" style="mb-4 text-center" notl>Add {paymentMethod} Account Details</TextComponent>
        <View style={tw`mb-4`}>
          <TextComponent color="gray" size="sm" style="mb-2">Account Name</TextComponent>
          <TextInput
            value={name}
            style={tw`w-full p-4 bg-black rounded-lg text-white`}
            placeholder="Enter your full name"
            onChangeText={setName} />
        </View>
        <View style={tw`mb-4`}>
          <TextComponent color="gray" size="sm" style="mb-2">Email Address</TextComponent>
          <TextInput
            value={email}
            style={tw`w-full p-4 bg-black rounded-lg text-white`}
            placeholder="Enter your email address"
            onChangeText={setEmail} />
        </View>
        <TextComponent color="gray" size="sm" style="mb-4">I confirm the above payment details is correct. I agree this information will be visible to the buyer during the transaction for fiat payment.</TextComponent>
        <View style={tw`flex flex-row items-center mb-8`}>
          <Checkbox value={checkStatus} onValueChange={setCheckStatus} style={tw`mr-2`} />
          <TextComponent color="gray ml-2">Remember me</TextComponent>
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" size="lg" onPress={() => setShown(false)} />
          <GreenButton title="Add" size="lg" onPress={handleAdd} active={name && email} />
        </View>
      </View>
    </Modal>
  )
}

export default PaymentModal;