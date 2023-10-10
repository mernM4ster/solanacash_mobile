import { useContext } from "react";
import { View, Text } from "react-native";
import tw from "tailwind-react-native-classnames";
import GradientButton from "./GradientButton";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { AppContext } from "../utils/AppContext";
import TextComponent from "./TextComponent";
import { PAYMENT_OFFER_VALUES } from "../constants/offers";

const OfferTable = (props) => {
  const { walletAddress } = useContext(AppContext)
  const { datas, isLoading, navigation, chainID } = props;

  return (
    <View style={[tw`mb-4 border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
      {
        isLoading
          ? <View style={tw`p-4 flex items-center`}><TextComponent>Loading</TextComponent></View>
          : datas.length === 0
            ? <View style={tw`p-4 flex items-center`}><TextComponent>There is no data.</TextComponent></View>
            : datas.map((data, index) =>
              <View key={index} style={[tw`flex flex-col p-2 text-left ${datas.length - 1 !== index ? "border-b-2" : ""}`, {borderColor: "#6f6f6f"}]}>
                <View style={tw`flex flex-row justify-between mb-2`}>
                  <View style={tw`flex flex-row items-center`}>
                    <Text style={tw`text-white text-base mr-2`}>
                      {data.owner.toString().slice(0, 4) + "..." + data.owner.toString().substring(data.owner.toString().length - 4)}
                    </Text>
                    {
                      data.verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#68CEC7" />
                    }
                  </View>
                  <View style={tw`flex flex-col`}>
                    <View style={tw`flex flex-row`}>
                      <View style={tw`flex flex-row items-center mr-4`}>
                        <MaterialIcons style={tw`mr-4`} name="thumb-up-off-alt" size={16}  color="#68CEC7" />
                          <Text style={tw`text-white text-base`}>
                            {data.thumbsUp}
                          </Text>
                        </View>
                      <View style={tw`flex flex-row items-center mr-4`}>
                        <MaterialIcons style={tw`mr-4`} name="thumb-down-off-alt" size={16} color="#E03B3B" />
                          <Text style={tw`text-white text-base`}>
                            {data.thumbsDown}
                          </Text>
                        </View>
                    </View>
                  </View>
                </View>
                <View style={tw`flex flex-col mb-2`}>
                  <TextComponent color="gray" size="sm" style="mb-1">Rate</TextComponent>
                  <Text style={tw`text-white text-base`}>{data.rate.toLocaleString("en-US")} {data.fiat.toString().toUpperCase()}</Text>
                </View>
                <View style={tw`flex flex-row justify-between mb-2`}>
                  <View style={tw`flex flex-row`}>
                    <View style={tw`flex flex-col mr-2`}>
                      <TextComponent>Buying</TextComponent>
                      <TextComponent>Limit</TextComponent>
                    </View>
                    <View style={tw`flex flex-col`}>
                      <Text style={tw`text-white text-base`}>{data.tokenName.toUpperCase()} {data.tokenAmount.toLocaleString("en-US")}</Text>
                      <Text style={tw`text-white text-base`}>{data.minLimit.toLocaleString("en-US")} - {data.maxLimit.toLocaleString("en-US")}</Text>
                    </View>
                  </View>
                  <View>
                  {
                    walletAddress && walletAddress.toLowerCase() !== data.owner.toString().toLowerCase()
                      ? <GradientButton action={() => navigation.navigate("Create Order", {Id: !chainID ? data.offer.toString() : data.offer_index})} title={`Sell ${data.tokenName.toUpperCase()}`} />
                      : <View style={tw`flex flex-row px-8 py-2 rounded-lg bg-gray-500 opacity-40 text-center`}>
                        <TextComponent size="lg" style="mr-2">
                          Sell
                        </TextComponent>
                        <Text style={[tw`text-white text-lg`, {fontFamily: "InterRegularFont"}]}>{data.tokenName.toUpperCase()}</Text>
                      </View>
                  }
                  </View>
                </View>
                <View style={tw`flex flex-row flex-wrap mb-4`}>
                  {
                    data.paymentOptions.toString().split(",").map((item, index) =>
                      item * 1 >= 0 &&
                        <View key={index} style={[tw`rounded-lg p-2 mr-2`, {backgroundColor: "#060e0c"}]}>
                          <TextComponent color="green" size="xs">{PAYMENT_OFFER_VALUES[item * 1].title}</TextComponent>
                        </View>
                    )
                  }
                </View>
                <View style={tw`flex flex-row items-center`}>
                  <View style={[tw`w-2 h-2 rounded-lg mr-2`, {backgroundColor: data.onlineStatus ? "#68CEC7" : "#E03B3B"}]} />
                  <Text style={tw`text-sm text-white`}>Seen {data.lastSeen} ago</Text>
                </View>
              </View>
            )
      }
    </View>
  );
}

export default OfferTable;