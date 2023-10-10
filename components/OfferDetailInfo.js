import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const OfferDetailInfo = (props) => {
  const { offerData } = props;
  return (
    <View style={[tw`flex flex-row flex-wrap justify-between py-4 border-t-2`, {borderColor: "#6f6f6f"}]}>
      <View style={tw`mb-2 mr-2`}>
        <TextComponent color="gray" size="sm">Trade limit</TextComponent>
        <View style={tw`flex flex-row items-end`}>
          <TextComponent color="gray" size="sm" style="mr-1">Min</TextComponent>
          <TextComponent color="white" size="base" style="mr-1" notl>{offerData.minLimit}</TextComponent>
          <TextComponent color="gray" size="sm" style="mr-1">-</TextComponent>
          <TextComponent color="gray" size="sm" style="mr-1">Max</TextComponent>
          <TextComponent color="white" size="base" style="mr-1" notl>{offerData.maxLimit}</TextComponent>
        </View>
      </View>
      <View style={tw`mb-2 mr-2`}>
        <TextComponent color="gray" size="sm">Buyer rate</TextComponent>
        <TextComponent color="white" size="base" notl>{offerData.rate} {offerData.fiat.toUpperCase()}</TextComponent>
      </View>
      <View style={tw`mb-2 mr-2`}>
        <TextComponent color="gray" size="sm">Trade time limit</TextComponent>
        <TextComponent color="white" size="base" notl>{offerData.timeLimit} min</TextComponent>
      </View>
      <View style={tw`mb-2 mr-2`}>
        <TextComponent color="gray" size="sm">Transaction fee</TextComponent>
        <TextComponent color="white" size="base" notl>{offerData.fee} %</TextComponent>
      </View>
    </View>
  )
}

export default OfferDetailInfo;