import { View, Text } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const OfferTerm = (props) => {
  const { data } = props;

  return (
    <View style={tw`mb-8`}>
      <TextComponent size="lg">Offer Terms</TextComponent>
      <Text style={[tw`p-4 border-2 rounded-lg text-gray-300`, {borderColor: "#6f6f6f"}]}>{data}</Text>
    </View>
  )
}

export default OfferTerm;