import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Pressable } from "react-native";
import tw from "tailwind-react-native-classnames";
import { Fontisto, FontAwesome5  } from '@expo/vector-icons'; 
import * as FileSystem from 'expo-file-system';
import i18n from "../translation/i18n";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import useAccount from "../utils/account";
import useEthAccount from "../utils/eth/accounts";
import { AppContext } from "../utils/AppContext";
import GrayButton from "../components/GrayButton";
import LanguageModal from "../components/LanguageModal";
import RegionModal from "../components/RegionModal";

const AccountWrapper = ({navigation}) => {
  const { chainID, walletAddress} = useContext(AppContext);
  const { isLoading, userData, updateProfile, createUser, getUser } = useAccount();
  const { isEthLoading, ethUserData, updateEthProfile, createEthUser, getEthUser } = useEthAccount();

  return (
    <AccountPage 
      navigation={navigation}
      walletAddress={walletAddress}
      isLoading={!chainID ? isLoading : isEthLoading}
      userData={!chainID ? userData : ethUserData}
      updateProfile={!chainID ? updateProfile : updateEthProfile}
      createUser={!chainID ? createUser : createEthUser}
      getUser={!chainID ? getUser : getEthUser} />
  );
}

const AccountPage = ({navigation, walletAddress, isLoading, userData, updateProfile, createUser, getUser}) => {
  const [created, setCreated] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState(0);

  const handleProfile = () => {
    updateProfile({account: userData.account, nickname: "user", language, region});
  }

  const handleCreate = async () => {
    await createUser();
    const newUserData = await getUser(walletAddress);
    setCreated(true);
    setLanguage(newUserData.language);
    setRegion(newUserData.region);
  }

  const handleExport = async () => {
    const publicKey = await AsyncStorage.getItem("publicKey");
    const privateKey = await AsyncStorage.getItem("privateKey");
    const solcashKey = publicKey + privateKey;
    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "/solcash.key", solcashKey);
    console.log(FileSystem.documentDirectory)
  }

  const handleImport = async () => {
    const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "/solcash.key");
    if (!info.exists) {
      Toast.show({
        type: "error",
        text1: "There is no file.",
      })
      return;
    } else {
      const solcashKey = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "/solcash.key");
      const publicStartIndex = solcashKey.indexOf("-----BEGIN PUBLIC KEY-----");
      const publicEndIndex = solcashKey.indexOf("-----END PUBLIC KEY-----");
      const publicKey = solcashKey.substring(publicStartIndex, publicEndIndex) + "-----END PUBLIC KEY-----";
      await AsyncStorage.setItem("publicKey", publicKey);
      const privateStartIndex = solcashKey.indexOf("-----BEGIN RSA PRIVATE KEY-----");
      const privateEndIndex = solcashKey.indexOf("-----END RSA PRIVATE KEY-----");
      const privateKey = solcashKey.substring(privateStartIndex, privateEndIndex) + "-----END RSA PRIVATE KEY-----";
      await AsyncStorage.setItem("privateKey", privateKey);
      Toast.show({
        type: "success",
        text1: "Import success",
      })
    }
  }

  const handleLanguage = async () => {
    await AsyncStorage.setItem("language", language);
    i18n.changeLanguage(language);
    setShowLanguageModal(false);
  }

  useEffect(() => {
    (
      async () => {
        if (userData.account) {
          setCreated(true);
          const language = await AsyncStorage.getItem("language")
          setLanguage(language);
          setRegion(userData.region);
        }
      }
    )();
  }, [userData])

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 flex flex-col`}>
        <TextComponent size="2xl" bold="bold" style="mt-6 mb-2">Account Settings</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-5" >Customize your account here</TextComponent>
        <View style={tw`relative`}>
          {
            isLoading
              ? <View style={tw`w-full h-40 flex z-10 items-center justify-center absolute bg-black bg-opacity-75 rounded-lg`}>
                  <TextComponent>Loading</TextComponent>
                </View>
              : walletAddress
                ? !created
                  ? <View>
                    <Pressable onPress={handleCreate} style={tw`px-8 py-1 rounded-lg border-2 border-gray-500`}>
                      <TextComponent>Create Account</TextComponent>
                    </Pressable>
                  </View>
                  : <>
                    <View style={[tw`w-full p-4 rounded-lg flex items-start justify-between mb-4 flex-col`, {backgroundColor: "#060e0c"}]}>
                      <View style={tw`flex flex-row items-center mb-2`}>
                        <View style={tw`p-2 bg-black rounded-full mr-4`}>
                          <Fontisto name="locked" size={24} color="#68CEC7" />
                        </View>
                        <View style={tw`flex-1 flex flex-col`}>
                          <TextComponent style="mb-2">MansaTrade keys</TextComponent>
                          <TextComponent size="sm" color="gray">Export your private and public key in case you want to clear your cookies but still want to keep your buy orders</TextComponent>
                        </View>
                      </View>
                      <View style={tw`w-full flex flex-row justify-end`}>
                        <GrayButton size="sm" title="Import" style="mr-4" onPress={handleImport} />
                        <GrayButton size="sm" title="Export" onPress={handleExport}/>
                      </View>
                    </View>
                    <View style={[tw`w-full p-4 rounded-lg flex items-start justify-between mb-4 flex-col`, {backgroundColor: "#060e0c"}]}>
                      <View style={tw`flex flex-row items-center mb-2`}>
                        <View style={tw`p-2 bg-black rounded-full mr-4`}>
                          <Fontisto name="flag" size={24} color="#68CEC7" />
                        </View>
                        <View style={tw`flex-1 flex flex-col`}>
                          <TextComponent style="mb-2">Change your language</TextComponent>
                          <TextComponent size="sm" color="gray">Change your preferred language</TextComponent>
                        </View>
                      </View>
                      <View style={tw`w-full flex flex-row justify-end`}>
                        <GrayButton size="sm" title="Change" onPress={() => setShowLanguageModal(true)} />
                      </View>
                    </View>
                    <View style={[tw`w-full p-4 rounded-lg flex items-start justify-between mb-4 flex-col`, {backgroundColor: "#060e0c"}]}>
                      <View style={tw`flex flex-row items-center mb-2`}>
                        <View style={tw`p-2 bg-black rounded-full mr-4`}>
                          <FontAwesome5  name="globe" size={24} color="#68CEC7" />
                        </View>
                        <View style={tw`flex-1 flex flex-col`}>
                          <TextComponent style="mb-2">Change your region</TextComponent>
                          <TextComponent size="sm" color="gray">Change your preferred region</TextComponent>
                        </View>
                      </View>
                      <View style={tw`w-full flex flex-row justify-end`}>
                        <GrayButton size="sm" title="Change" onPress={() => setShowRegionModal(true)} />
                      </View>
                    </View>
                  </>
                : <View style={tw`w-full h-40`}>
                  <TextComponent style="text-center mt-8">Please connect your wallet.</TextComponent>
                </View>
          }
        </View>
      </View>
      <View style={tw`h-40`}></View>
      <LanguageModal
        isLoading={isLoading}
        isShown={showLanguageModal} 
        setShown={setShowLanguageModal}
        language={language}
        setLanguage={setLanguage} 
        handleModal={handleLanguage} />
      <RegionModal 
        isLoading={isLoading}
        isShown={showRegionModal} 
        setShown={setShowRegionModal}
        region={region}
        setRegion={setRegion} 
        handleModal={handleProfile} />
    </ScrollView>
  );
}

export default AccountWrapper;