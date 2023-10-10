import { View, Text, Linking, Pressable } from "react-native";
import tw from "tailwind-react-native-classnames";
import { AntDesign, Octicons } from "@expo/vector-icons";
import TextComponent from "./TextComponent";

const NotifyList = ({datas, isLoading, navigation}) => {
  const openLink = async (url) => {
    await Linking.openURL(url);
  }

  const goToOrder = (orderType, orderAccount) => {
    navigation.navigate("Order", {orderType, orderAccount});
  }

  return (
    <View style={tw`w-full mb-4`}>
      {
        isLoading
          ? <View style={tw`h-40`}><TextComponent style="text-center">Loading</TextComponent></View>
          : datas.length > 0
            ? <View style={[tw`flex flex-col border-2 rounded-lg`, {borderColor: "#6f6f6f"}]}>
              {
                datas.map((item, index) => 
                  <View key={index} style={[tw`flex flex-col p-2 text-left ${datas.length - 1 !== index ? "border-b-2" : ""}`, {borderColor: "#6f6f6f"}]}>
                    <View style={tw`flex-1`}>
                      <View style={tw`mb-2 flex flex-row items-center`}>
                        
                        {
                          item.type === "create" && 
                            <TextComponent>New order is created for</TextComponent>
                        }
                        {
                          item.type === "buyer_confirm" && 
                            <TextComponent>Buyer confirm payment for</TextComponent>
                        }
                        {
                          item.type === "seller_confirm" && 
                            <TextComponent>Order is completed for</TextComponent>
                        }
                        {
                          item.type === "cancel" && 
                            <TextComponent>Order is cancelled for</TextComponent>
                        }
                        <TextComponent notl style={`text-white ml-1`}>
                          {item.amount} {item.tokenName.toUpperCase()}
                          {
                            item.type === "seller_confirm" && 
                              <Pressable style={tw`ml-2`} onPress={() => openLink(`https://solscan.io/tx/${item.tx}`)}>
                                <Octicons name="link" size={14} color="white" />
                              </Pressable>
                          }
                        </TextComponent>
                      </View>
                      <View style={tw`mb-2 flex flex-row items-center`}>
                        <View style={tw`flex flex-row items-center`}>
                          {
                            item.type === "create" && 
                              <TextComponent color="gray" size="sm">This order is created by</TextComponent>
                          }
                          {
                            item.type === "buyer_confirm" && 
                              <TextComponent color="gray" size="sm">This order is confirmed by</TextComponent>
                          }
                          {
                            item.type === "seller_confirm" && 
                              <TextComponent color="gray" size="sm">This order is completed by</TextComponent>
                          }
                          {
                            item.type === "cancel" && 
                              <TextComponent color="gray" size="sm">This order is cancelled by</TextComponent>
                          }
                          <TextComponent color="gray" size="sm" notl style="ml-1">
                            {item.user.slice(0, 6)}...${item.user.substring(item.user.length - 7)}
                          </TextComponent>
                        </View>
                        <Pressable style={tw`flex flex-row items-center ml-2 mb-1`} onPress={() => goToOrder(item.orderType, item.orderIndex)}>
                          <TextComponent style="mr-1">View</TextComponent>
                          <AntDesign name="arrowright" size={20} color="#68CEC7" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )
              }
            </View>
            : <View style={tw`p-4 flex items-center`}><TextComponent>You currently have no notifications</TextComponent></View>
      }
    </View>
  );
}

export default NotifyList;