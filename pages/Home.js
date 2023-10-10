import { useEffect } from 'react';
import { ScrollView } from "react-native";
import tw from "tailwind-react-native-classnames";
import AsyncStorage from '@react-native-async-storage/async-storage';
import JSEncrypt from 'jsencrypt';
import { 
    MainContainer, 
    InfoContainer, 
    CashContainer,
    FeatureContainer,
    GuideContainer,
    FaqContainer
} from "../containers/Home";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home = ({navigation}) => {
    useEffect(() => {
        (
          async () => {
            const checkKey = await AsyncStorage.getItem("publicKey");
            if (!checkKey) {
              const crypt = new JSEncrypt({default_key_size: 400});
              const privateKey = crypt.getPrivateKey();
              const publicKey = crypt.getPublicKey();
              await AsyncStorage.setItem("publicKey", publicKey);
              await AsyncStorage.setItem("privateKey", privateKey);
            }
          }
        )();
      }, [])

    return (
        <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]} >
            <Header />
            <MainContainer navigation={navigation} />
            <InfoContainer />
            <CashContainer navigation={navigation} />
            <FeatureContainer />
            <GuideContainer />
            <FaqContainer />
            <Footer />
        </ScrollView>
    );
}

export default Home;