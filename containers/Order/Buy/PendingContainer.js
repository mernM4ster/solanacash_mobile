import { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import TextComponent from "../../../components/TextComponent";
import { PAYMENT_OFFER_VALUES } from "../../../constants/offers";
import GrayButton from "../../../components/GrayButton";
import DisputeConfirmModal from "../../../components/DisputeConfirmModal";

const PendingContainer = (props) => {
  const { orderData, period, navigation } = props;
  const [showDisputeConfirm, setShowDisputeConfirm] = useState(false);

  const handleDisputeConfirm = () => {
    setShowDisputeConfirm(false);
}

  return (
    <>
      <View style={tw`flex flex-col mb-5`}>
        <View style={tw`flex flex-row justify-between`}>
          <Pressable style={tw`flex flex-row items-center`} onPress={() => navigation.navigate("Orders")}>
            <Feather name="arrow-left" size={24} color="white" />
            <View style={tw`flex flex-row`}>
              <TextComponent size="2xl" style="ml-2">Buy</TextComponent>
              <TextComponent size="2xl" style="ml-2">{orderData.tokenName.toUpperCase()}</TextComponent>
            </View>
          </Pressable>
          <View style={tw`flex flex-row items-center mb-2`}>
            <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg mr-1`, {backgroundColor: "#060e0c"}]}>{period[0]}</Text>
            <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg mr-2`, {backgroundColor: "#060e0c"}]}>{period[1]}</Text>
            <Text style={tw`text-white text-xl mr-2`}>:</Text>
            <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg mr-1`, {backgroundColor: "#060e0c"}]}>{period[2]}</Text>
            <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg`, {backgroundColor: "#060e0c"}]}>{period[3]}</Text>
          </View>
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <TextComponent color="gray" size="sm">Proceed to make payment</TextComponent>
          <TextComponent color="gray" size="sm" style="w-64 text-right">Please complete the trade within this timeline</TextComponent>
        </View>
      </View>
      <View style={[tw`flex flex-row items-center mb-4 rounded-tr-lg rounded-tl-lg`, {backgroundColor: "#060e0c"}]}>
        <View style={tw`flex-1 border-b-2 border-gray-500 h-24 py-2 flex justify-center `}>
          <TextComponent color="gray" style="text-center p-1">Transfer payment to seller</TextComponent>
        </View>
        <Entypo name="chevron-thin-right" size={24} color="#b8b8b8" />
        <View style={[tw`flex-1 border-b-2 h-24 py-2  justify-center`, {borderColor: "#68CEC7"}]}>
          <TextComponent style="text-center p-1">Transaction Pending</TextComponent>
        </View>
        <Entypo name="chevron-thin-right" size={24} color="#b8b8b8" />
        <View style={tw`flex-1 border-b-2 border-gray-500 py-2 h-24 flex justify-center`}>
          <TextComponent color="gray" style="text-center p-1">Completed</TextComponent>
        </View>
      </View>
      <View style={tw`mb-4`}>
        <TextComponent>Trade Information</TextComponent>
        <View style={[tw`flex flex-row flex-wrap justify-between py-4 border-t-2 border-b-2 mb-4`, {borderColor: "#6f6f6f"}]}>
          <View style={tw`mr-2`}>
            <TextComponent color="gray" size="sm">Amount to send</TextComponent>
            <TextComponent notl>{orderData.sign} {orderData.fiatAmount.toLocaleString("en-US")}</TextComponent>
          </View>
          <View style={tw`mr-2`}>
            <TextComponent color="gray" size="sm">Rate</TextComponent>
            <TextComponent notl>{orderData.rate.toLocaleString("en-US")} {orderData.fiat.toUpperCase()}</TextComponent>
          </View>
          <View style={tw`mr-2`}>
            <TextComponent color="gray" size="sm">Transaction fee %</TextComponent>
            <TextComponent notl>{orderData.fee}%</TextComponent>
          </View>
          <View style={tw`mr-2`}>
            <TextComponent color="gray" size="sm">Transaction fee amount</TextComponent>
            <TextComponent notl>{orderData.moneyFee} {orderData.tokenName.toUpperCase()}</TextComponent>
          </View>
          <View style={tw`mr-2`}>
            <TextComponent color="gray" size="sm">Crypto to receive after fees</TextComponent>
            <TextComponent notl>{orderData.sellAmount.toLocaleString("en-US")} {orderData.tokenName.toUpperCase()}</TextComponent>
          </View>
        </View>
      </View>
      <View style={tw`mb-4`}>
        <TextComponent style="mb-2">Your Payment Information</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-4">This is your selected payment method</TextComponent>
        <View style={[tw`p-4 rounded-lg flex flex-row flex-wrap mb-4`, {backgroundColor: "#060e0c"}]}>
          <View style={tw`w-1/2 py-2`}>
            <TextComponent color="gray" size="sm" style="mb-2" notl>Seller's {PAYMENT_OFFER_VALUES[orderData.paymentOption].title} Email</TextComponent>
            <TextComponent size="sm">{orderData.emailAddress}</TextComponent>
          </View>
          <View style={tw`w-1/2 py-2`}>
            <TextComponent color="gray" size="sm" style="mb-2">Account Name</TextComponent>
            <TextComponent size="sm">{orderData.accountName}</TextComponent>
          </View>
          <View style={tw`w-1/2 py-2`}>
            <TextComponent color="gray" size="sm" style="mb-2">Reference Message</TextComponent>
            <TextComponent size="sm">{orderData.fullId}</TextComponent>
          </View>
        </View>
        <TextComponent color="gray" size="sm">Waiting for seller's confirmation</TextComponent>
      </View>
      <View style={tw`flex items-start mb-8`}>
        <GrayButton title="Create a Dispute" onPress={() => setShowDisputeConfirm(true)} />
      </View>
      <DisputeConfirmModal
        isShown={showDisputeConfirm} 
        setShown={setShowDisputeConfirm} 
        handleModal={handleDisputeConfirm} />
    </>
  )
}

export default PendingContainer;