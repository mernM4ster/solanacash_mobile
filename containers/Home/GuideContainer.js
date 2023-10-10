import { useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "../../components/TextComponent";
import FirstImg from "../../assets/images/first.png";
import SecondImg from "../../assets/images/second.png";
import ThirdImg from "../../assets/images/third.png";

const GuideContainer = () => {
    const [index, setIndex] = useState(0);

    const pressBuy = () => setIndex(0);
    const pressSell = () => setIndex(1);

    return (
        <View style={tw`px-2 mb-16 text-center`}>
            <TextComponent size="4xl" bold="bold" style="mb-8 text-center">HOW P2P WORKS</TextComponent>
            <TextComponent color="gray" style="mb-8 text-center">Your step by step guide to using our P2P platform</TextComponent>
            <View style={tw`flex flex-row justify-center mb-8`}>
                <TouchableOpacity
                    onPress={pressBuy}
                    style={[tw`py-2 px-4 border-b-2`, {borderColor: index === 0 ? "#68CEC7" : "#6f6f6f"}]}>
                    <TextComponent>Buy Crypto</TextComponent>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={pressSell}
                    style={[tw`py-2 px-4 border-b-2`, {borderColor: index === 1 ? "#68CEC7" : "#6f6f6f"}]}>
                    <TextComponent>Sell Crypto</TextComponent>
                </TouchableOpacity>
            </View>
            <View>
                {
                    index === 0 && 
                        <View style={tw`flex justify-between flex-col`}>
                            <View style={[tw`p-4 flex flex-col items-center border-2 rounded-lg mb-2`, {borderColor: "#6f6f6f"}]}>
                                <Image style={tw`w-10 h-10`} source={FirstImg} alt="first" />
                                <TextComponent style="mb-2">Create an Offer</TextComponent>
                                <TextComponent size="sm" color="gray" style="text-center">Create a Buy offer, then wait for users to engage with your created offer.</TextComponent>
                            </View>
                            <View style={[tw`p-4 flex flex-col items-center border-2 rounded-lg mb-2`, {borderColor: "#6f6f6f"}]}>
                                <Image style={tw`w-10 h-10`} source={SecondImg} alt="first" />
                                <TextComponent style="mb-2">Pay the seller</TextComponent>
                                <TextComponent size="sm" color="gray" style="text-center">Send money to the seller via the listed payment methods. Complete the fiat transaction and click "Payment done" to notify seller.</TextComponent>
                            </View>
                            <View style={[tw`p-4 flex flex-col items-center border-2 rounded-lg mb-2`, {borderColor: "#6f6f6f"}]}>
                                <Image style={tw`w-10 h-10`} source={ThirdImg} alt="first" />
                                <TextComponent style="mb-2">Get your Crypto</TextComponent>
                                <TextComponent size="sm" color="gray" style="text-center">Once the seller confirms receipt of money, the escrowed crypto will be released to you immediately.</TextComponent>
                            </View>
                        </View>
                }
                {
                    index === 1 && 
                        <View style={tw`flex justify-between flex-col`}>
                            <View style={[tw`p-4 flex flex-col items-center border-2 rounded-lg mb-2`, {borderColor: "#6f6f6f"}]}>
                                <Image style={tw`w-10 h-10`} source={FirstImg} alt="first" />
                                <TextComponent style="mb-2">Place an Order</TextComponent>
                                <TextComponent size="sm" color="gray" style="text-center">After you place an order from the offer list, your crypto will be escrowed by our smart contract.</TextComponent>
                            </View>
                            <View style={[tw`p-4 flex flex-col items-center border-2 rounded-lg mb-2`, {borderColor: "#6f6f6f"}]}>
                                <Image style={tw`w-10 h-10`} source={SecondImg} alt="first" />
                                <TextComponent style="mb-2">Confirm the Payment</TextComponent>
                                <TextComponent size="sm" color="gray" style="text-center">Check your receiving account for payment confirmation by the buyer. Make sure its the exact amount as stated on the trade.</TextComponent>
                            </View>
                            <View style={[tw`p-4 flex flex-col items-center border-2 rounded-lg mb-2`, {borderColor: "#6f6f6f"}]}>
                                <Image style={tw`w-10 h-10`} source={ThirdImg} alt="first" />
                                <TextComponent style="mb-2">Release Crypto</TextComponent>
                                <TextComponent size="sm" color="gray" style="text-center">Once you confirm the receipt of money, release crypto to the buyer.</TextComponent>
                            </View>
                        </View>
                }
            </View>
        </View>
    );
}

export default GuideContainer;