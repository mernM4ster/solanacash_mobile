import { useState, useEffect } from "react";
import tw from "tailwind-react-native-classnames";
import { Feather, FontAwesome, Entypo } from "@expo/vector-icons";
import { View, Pressable, Text } from "react-native";
import TextComponent from "../../../components/TextComponent";
import { PAYMENT_OFFER_VALUES } from "../../../constants/offers";
import GreenButton from "../../../components/GreenButton";
import CancelOrderModal from "../../../components/CancelOrderModal";

const PaymentContainer = (props) => {
  const { orderData, nextStep, period, isLoading, handleCancelOrder, remainTime, navigation } = props;
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (remainTime < 0 && !orderData.buyerConfirm) {
      setShowCancelModal(true);
    }
  }, [remainTime, orderData])

  return (
    <>
      <View style={tw`flex flex-col`}>
        <View style={tw`flex flex-row justify-between`}>
          <Pressable style={tw`flex flex-row items-center`} onPress={() => navigation.navigate("Orders")}>
            <Feather name="arrow-left" size={24} color="white" />
            <View style={tw`flex flex-row`}>
              <TextComponent size="2xl" style="ml-2">Sell</TextComponent>
              <TextComponent size="2xl" style="ml-2">{orderData.tokenName.toUpperCase()}</TextComponent>
            </View>
          </Pressable>
          {
            orderData.buyerConfirm
              ? <View style={[tw`p-2 rounded-lg flex flex-row justify-center`, {backgroundColor: "#060e0c"}]}>
                <FontAwesome name="check-circle" size={20} color="#68CEC7" />
                <TextComponent color="green" style="ml-2">Paid</TextComponent>
              </View>
              : <View style={tw`flex flex-row items-center mb-2`}>
                <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg mr-1`, {backgroundColor: "#060e0c"}]}>{period[0]}</Text>
                <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg mr-2`, {backgroundColor: "#060e0c"}]}>{period[1]}</Text>
                <Text style={tw`text-white text-xl mr-2`}>:</Text>
                <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg mr-1`, {backgroundColor: "#060e0c"}]}>{period[2]}</Text>
                <Text style={[tw`px-2 py-1 text-xl text-white rounded-lg`, {backgroundColor: "#060e0c"}]}>{period[3]}</Text>
              </View>
          }
        </View>
        <View style={tw`flex flex-row justify-between mb-4`}>
          <TextComponent color="gray" size="sm">Wait for buyer confirmation</TextComponent>
          {
            orderData.buyerConfirm
            ? <></>
            : <TextComponent color="gray" size="sm" style="">Payment wait time</TextComponent>
          }
        </View>
        <View style={[tw`flex flex-row items-center mb-4 rounded-tr-lg rounded-tl-lg`, {backgroundColor: "#060e0c"}]}>
          <View style={[tw`flex-1 border-b-2 py-2 h-20 flex justify-center`, {borderColor: "#68CEC7"}]}>
            <TextComponent style="text-center p-1">Waiting for payment</TextComponent>
          </View>
          <Entypo name="chevron-thin-right" size={24} color="#b8b8b8" />
          <View style={tw`flex-1 border-b-2 border-gray-500 py-2 h-20 justify-center`}>
            <TextComponent color="gray" style="text-center p-1">Release crypto</TextComponent>
          </View>
          <Entypo name="chevron-thin-right" size={24} color="#b8b8b8" />
          <View style={tw`flex-1 border-b-2 border-gray-500 py-2 h-20 flex justify-center`}>
            <TextComponent color="gray" style="text-center p-1">Completed</TextComponent>
          </View>
        </View>
        <View style={tw`mb-4`}>
          <TextComponent>Trade Information</TextComponent>
          <View style={[tw`flex flex-row flex-wrap justify-between py-4 border-t-2 border-b-2 mb-4`, {borderColor: "#6f6f6f"}]}>
            <View style={tw`mr-2`}>
              <TextComponent color="gray" size="sm">Amount to receive</TextComponent>
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
              <TextComponent color="gray" size="sm">Crypto to send</TextComponent>
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
          {
            orderData.buyerConfirm
              ? <TextComponent color="gray" size="sm">Payment has been completed by the buyer. Please confirm you have received funds before releasing crypto to the buyer.</TextComponent>
              : <TextComponent color="gray" size="sm">You will be notified once buyer have sent the payment. Release Crypto button will be activated once buyer confirms payments</TextComponent>
          }
        </View>
        <View style={tw`flex flex-row mb-8`}>
          <GreenButton title="Release Crypto" active={orderData.buyerConfirm} onPress={() => nextStep(true)}/>
        </View>
      </View>
      <CancelOrderModal
        isShown={showCancelModal}
        setShown={setShowCancelModal}
        handleModal={handleCancelOrder}
        isLoading={isLoading} />
    </>
  )
}

export default PaymentContainer;