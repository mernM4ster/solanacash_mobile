import { View, Linking, } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const Footer = () => {
    return (
        <View style={{backgroundColor: "#060e0c"}}>
            <View style={tw`w-11/12 m-auto pt-10 pb-8 flex flex-row flex-wrap justify-between text-left`}>
                <View style={tw`mr-2 mb-4 flex flex-col`}>
                    <TextComponent size="xl" bold="bold" style="mb-4">Quick Link</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://solana.com/ecosystem/solanacash")}>Solana Ecosystem</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://www.certik.com/projects/solana-cash")}>Certick Audit</TextComponent>
                </View>
                <View style={tw`mr-2 mb-4 flex flex-col`}>
                    <TextComponent size="xl" bold="bold" style="mb-4">Explorer</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://solscan.io/token/EKSM2sjtptnvkqq79kwfAaSfVudNAtFYZSBdPe5jeRSt")}>Solscan</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://polygonscan.com/address/0x97de33d03e5ebab173c4eb5a7114303d6c5a3b66")}>Polygonscan</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://etherscan.io/address/0x4946DB03b7E7bDA0383612AfbC4119A4E8464642")}>Etherscan</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://bscscan.com/address/0x7c8acc8803c5a9637f31713adab5b4cca5525037")}>Bscscan</TextComponent>
                </View>
                <View style={tw`mr-2 mb-4 flex flex-col`}>
                    <TextComponent size="xl" bold="bold" style="mb-4">Legal</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("/terms-conditions")}>Terms & Conditions</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("/risk-disclosure-policy")}>Disclosure</TextComponent>
                </View>
                <View style={tw`mr-2 mb-4 flex flex-col`}>
                    <TextComponent size="xl" bold="bold" style="mb-4">Product</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://mansa-trade.com/")}>P2P Desktop DAPP</TextComponent>
                    <TextComponent style="mb-4" action={() => Linking.openURL("https://staking.solanacash.io/")}>Staking Platform</TextComponent>
                </View>
                <View style={tw`flex flex-col`}>
                    <TextComponent size="xl" bold="bold" style="mb-4">Product</TextComponent>
                    <TextComponent style="mb-4 flex items-center" action={() => Linking.openURL("https://twitter.com/mansa_Trade")}>Twitter</TextComponent>
                    <TextComponent style="mb-4 flex items-center" action={() => Linking.openURL("https://www.linkedin.com/company/solanacash-io/")}>LinkedIn</TextComponent>
                    <TextComponent style="mb-4 flex items-center" action={() => Linking.openURL("https://instagram.com/solanacash_io")}>Instagram</TextComponent>
                    <TextComponent style="mb-4 flex items-center" action={() => Linking.openURL("https://medium.com/@solanacashapp")}>Medium</TextComponent>
                    <TextComponent style="mb-4 flex items-center" action={() => Linking.openURL("https://web.facebook.com/Solana-Cash-104634308709386")}>Facebook</TextComponent>
                    <TextComponent style="mb-4 flex items-center" action={() => Linking.openURL("https://t.me/solanacashappchat")}>Telegram</TextComponent>
                </View>
            </View>
            <View style={tw`border-t-2 border-gray-600 py-8`}>
                <TextComponent style="text-center" >@ 2023 MansaTrade. All Rights Reserved</TextComponent>
            </View>
        </View>
    );
}

export default Footer;