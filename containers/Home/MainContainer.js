import { View, Text, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import MainImg from "../../assets/images/main-image.png"
import TextComponent from "../../components/TextComponent";
import GradientButton from "../../components/GradientButton";
import GradientText from "../../components/GradientText";

const MainContainer = ({navigation}) => {
    return (
        <View style={tw`px-2`}>
            <View style={tw`mt-8 px-8`}>
                <TextComponent color="white" size="2xl" bold="extrabold" fontFamily="InterBold" style="text-center">Buy And Sell Crypto With Cash In a Decentralized</TextComponent>
                <View style={tw`flex flex-row items-center flex-wrap justify-center`}>
                    <GradientText style={{fontSize: 24, fontWeight: "bold", fontFamily: "InterBoldFont", paddingBottom: 2}}>Multi-Chain</GradientText>
                    <TextComponent color="white" size="2xl" bold="extrabold" fontFamily="InterBold" style="text-center ml-2">P2P Marketplace</TextComponent>
                </View>
            </View>
            <View style={tw`w-full m-auto my-8`}>
                <TextComponent size="base" color="gray" style="text-center px-8">A fully decentralized P2P platform where you can buy and sell crypto with cash using your preffered payment methods.</TextComponent>
            </View>
            <View style={tw`flex flex-row justify-center`}>
                <GradientButton title="Start Trading" action={() => navigation.navigate("Offers")} />
            </View>
            <Image style={{width: "100%", marginTop: -80, height: undefined, aspectRatio: 1, resizeMode: "contain", zIndex: -10}} source={MainImg} />
        </View>
    );
};

export default MainContainer;