import { View, Text } from "react-native";
import tw from "tailwind-react-native-classnames";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TextComponent from "./TextComponent";
import GradientButton from "./GradientButton";

const OrderTable = (props) => {
  const { datas, navigation } = props;
  return (
    <View style={[tw`mb-4 border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
      {
        datas.length === 0
          ? <View style={tw`p-4 flex items-center`}><TextComponent>There is no data.</TextComponent></View>
          : datas.map((data, index) => 
            <View key={index} style={[tw`flex flex-col p-2 text-left ${datas.length - 1 !== index ? "border-b-2" : ""}`, {borderColor: "#6f6f6f"}]}>
              <View style={tw`flex flex-row justify-between mb-2`}>
                <View style={tw`flex flex-row items-center`}>
                  <View style={[tw`px-2 py-1 mr-2 rounded-lg`, {backgroundColor: "#060e0c"}]}>
                    <TextComponent color="green" size="xs" >{data.type}</TextComponent>
                  </View>
                  <TextComponent  style="mr-2">{data.name.slice(0, 4) + "..." + data.name.substring(data.name.length - 4)}</TextComponent>
                  {
                    data.verified && <MaterialCommunityIcons name="check-decagram" size={24} color="#68CEC7" />
                  }
                </View>
                <View style={tw`flex flex-row items-center`}>
                  {
                    data.status * 1 === 1
                      ? <>
                        <View style={[tw`w-2 h-2 mr-2 rounded-lg`, {backgroundColor: "#68CEC7"}]} />
                        <TextComponent>Completed</TextComponent>
                      </>
                      : data.status * 1 === 0
                        ? <>
                          <View style={[tw`w-2 h-2 mr-2 rounded-lg`, {backgroundColor: "#b8b8b8"}]} />
                          <TextComponent>Pending</TextComponent>
                        </>
                        : <>
                          <View style={[tw`w-2 h-2 mr-2 rounded-lg`, {backgroundColor: "red"}]} />
                          <TextComponent>Cancelled</TextComponent>
                        </>
                  }
                </View>
              </View>
              <View style={tw`flex flex-row justify-between flex-wrap mb-2`}>
                <View style={tw`mr-2`}>
                  <TextComponent color="gray" size="sm" style="mb-2">Rate</TextComponent>
                  <Text style={tw`text-base text-white`}>{data.fiatAmount.toLocaleString("en-US")} {data.fiat.toUpperCase()}</Text>
                </View>
                <View style={tw`mr-2`}>
                  <TextComponent color="gray" size="sm" style="mb-2">Fiat Amount</TextComponent>
                  <Text style={tw`text-base text-white`}>{data.rate.toLocaleString("en-US")} {data.fiat.toUpperCase()}</Text>
                </View>
                <View style={tw`mr-2`}>
                  <TextComponent color="gray" size="sm" style="mb-2">Crypto Amount</TextComponent>
                  <Text style={tw`text-base text-white`}>{data.cryptoAmount.toLocaleString("en-US")} {data.tokenName.toUpperCase()}</Text>
                </View>
              </View>
              <View style={tw`flex flex-col mb-2`}>
                <Text style={tw`text-base text-white`}>ID: {data.id}</Text>
                <Text style={[tw`text-base`, {color: "#b8b8b8"}]}>{data.createdAt}</Text>
              </View>
              <GradientButton action={() => navigation.navigate("Order", {orderType: data.type.toLowerCase(), orderAccount: data.id})} title="View" />
            </View>
          )
      }
    </View>
  );
}

export default OrderTable;