import { View, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "../../components/TextComponent";
import GrayButton from "../../components/GrayButton";
import CashImg from "../../assets/images/cash.png"

const CashContainer = ({navigation}) => {
    return (
        <View style={tw`flex flex-col my-8 px-2`}>
            <View style={tw`flex-1 pb-8 flex flex-col justify-center items-start pr-0`}>
                <TextComponent size="xl" bold="bold" style="text-left mb-8 capitalize">
                looking for ways to trade your cryptocurrency into cash?
                </TextComponent>
                <TextComponent color="gray" style="text-left mb-8">
                    Get paid in your fiat account in minutes with our list of payment option to choose from
                </TextComponent>
                <GrayButton title="Start Trading" onPress={() => navigation.navigate("Offers")} />
            </View>
            <View style={[tw`rounded-xl`, {backgroundColor: "#060e0c"}]}>
                <Image style={{width: "100%", height: undefined, aspectRatio: 1, resizeMode: "center"}} source={CashImg} alt="image" />
            </View>
        </View>
    );
}

export default CashContainer;