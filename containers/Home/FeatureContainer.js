import { View } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "../../components/TextComponent";
import FeatureComponent from "../../components/FeatureComponenet";
import IDImg from "../../assets/images/id.png";
import BlockchainImg from "../../assets/images/blockchain.png";
import ChatImg from "../../assets/images/chat.png";
import CurrencyImg from "../../assets/images/currency.png";
import LockImg from "../../assets/images/lock-shield.png";
import PaymentImg from "../../assets/images/payment.png";

const FeatureContainer = () => {
    return (
        <View style={tw`flex flex-col text-center mb-16 px-2`}>
            <TextComponent size="4xl" bold="bold" style="mb-4 text-center">Our Features</TextComponent>
            <TextComponent color="gray" style="mb-8 text-center">Here is what makes us different from others</TextComponent>
            <FeatureComponent 
                image={IDImg} 
                title="No Verification Needed" 
                text="Get started in minutes. Connect your wallet, no need for personal information." />
            <FeatureComponent 
                image={BlockchainImg} 
                title="Fully Decentralized" 
                text="Trading takes place among a global P2P network of annonymous users using MansaTrade." />
            <FeatureComponent 
                image={LockImg} 
                title="Safe" 
                text="We don’t have access to your funds. Transfers held in-between trades are stored in a smart contract to protect both buyers and sellers" />
            <FeatureComponent 
                image={PaymentImg} 
                title="Flexible Payment Methods" 
                text="We have a wide range of payment method available for you to receive cash" />
            <FeatureComponent 
                image={ChatImg} 
                title="Wallet to Wallet Chat" 
                text="Buyers and Sellers can communicate via our smart wallet-to-wallet chat during trade" />
            <FeatureComponent 
                image={CurrencyImg} 
                title="Easy to Use" 
                text="Getting started on your first trade is just a few clicks away." />
        </View>
    );
}

export default FeatureContainer;