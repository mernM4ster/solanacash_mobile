import React from "react";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
import { useState, useEffect, useContext, useRef } from "react";
import { View, Image, Pressable, Text, TouchableOpacity } from "react-native";
import { Ionicons, Fontisto  } from '@expo/vector-icons';
import tw from "tailwind-react-native-classnames";
import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";
import Toast from "react-native-toast-message";
import { AppContext } from "../utils/AppContext";
import i18n from "../translation/i18n";
import { decryptPayload } from "../utils/decryptPayload";
import { encryptPayload } from "../utils/encryptPayload";
import { buildUrl } from "../utils/buildUrl";
import { toastConfig } from "./ToastConfig";
import GradientButton from "./GradientButton";
import LogoImg from "../assets/images/logo-mobile.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SelectChainModal from "./SelectChainModal";
import TextComponent from "./TextComponent";
import useNotification from "../utils/notifications";
import useEthNotification from "../utils/eth/notifications";
import { BSC_CHAIN_ID, ETH_CHAIN_ID, AVAX_CHAIN_ID, MATIC_CHAIN_ID } from "../constants/env";

const onConnectRedirectLink = Linking.createURL("onConnect");
const onDisconnectRedirectLink = Linking.createURL("onDisconnect");
const BACKGROUND_FETCH_TASK = 'background-fetch';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
  })
});

const Header = ({navigation}) => {
  const {walletAddress, setWalletAddress, chainID, setChainID, evmConnector, session, setSession, sharedSecret, setSharedSecret, dappKeyPair, setTxHash} = useContext(AppContext);
  
  const [deeplink, setDeepLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showChild, setShowChild] = useState(false);
  const actionSheetRef = useRef(null);
  const { getNotifications } = useNotification();
  const { getEthNotifications } = useEthNotification();
  const notificationListener = useRef();
  const responseListener = useRef();
  

  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    setInterval(async () => {
        const address = await AsyncStorage.getItem("wallet");
        const chain_id = await AsyncStorage.getItem("chainid");
        if (address) {
          const newUnReadNum = chain_id === "null" ? (await getNotifications(new PublicKey(address))).newUnReadNum : (await getEthNotifications(address)).newUnReadEthNum;
          console.log("check notify:", newUnReadNum);
          if (newUnReadNum > 0) {
            console.log("notify")
            await schedulePushNotification({title: "MansaTrade", body: "You have new notifications"})
          }
        } 
      }, 300000);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  });

  async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 1 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  }

  const handleChain = async (chainId) => {
    setChainID(chainId);
    if (chainId !== chainID && evmConnector.connected) {
      await evmConnector.killSession();
      setWalletAddress(null)
    }
    setShowChild(false)
  }

  const connectEvmWallet = async () => {
    const connectStatus = await evmConnector.connect({chainID});
    setWalletAddress(connectStatus.accounts[0])
    await AsyncStorage.setItem("wallet", connectStatus.accounts[0]);
  }

  useEffect(() => {
    (
      async () => {
        i18n.changeLanguage(await AsyncStorage.getItem("language"));
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        console.log("---------status---------", BackgroundFetch.BackgroundFetchStatus[status])
        console.log("---------isRegistered---------", isRegistered)
        !isRegistered && await registerBackgroundFetchAsync();
        const address = await AsyncStorage.getItem("wallet");
        const chain_id = await AsyncStorage.getItem("chainid");
        if (address) {
          const newUnReadNum = chain_id === "null" ? (await getNotifications(new PublicKey(address))).newUnReadNum : (await getEthNotifications(address)).newUnReadEthNum;
          newUnReadNum > 0 && await schedulePushNotification({title: "MansaTrade", body: "You have new notifications"})
        }
      }
    )();
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
          setDeepLink(initialUrl);
      }
    };
    initializeDeeplinks();
    const listener = Linking.addEventListener("url", handleDeepLink);

    registerForPushNotificationsAsync().then(token => console.log(token));
    
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
        listener.remove();
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleDeepLink = ({ url }) => setDeepLink(url);

  useEffect(() => {
    if (!deeplink) return;

    const url = new URL(deeplink);
    const params = url.searchParams;

    // Handle an error response from Phantom
    if (params.get("errorCode")) {
      const error = Object.fromEntries([...params]);
      const message =
        error?.errorMessage ??
        JSON.stringify(Object.fromEntries([...params]), null, 2);
      Toast.show({
        type: "error",
        tex1: message,
      });
      console.log("error: ", message);
      return;
    }
    console.log("url", typeof url)
  
    // Handle a `connect` response from Phantom
    if (url.toString().indexOf("onConnect") > -1) {
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(params.get("phantom_encryption_public_key")),
        dappKeyPair.secretKey
      );
      const connectData = decryptPayload(
        params.get("data"),
        params.get("nonce"),
        sharedSecretDapp
      );
      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      console.log(connectData)
      setWalletAddress(connectData.public_key);
      setShowModal(false);
      (
        async () => {
          await AsyncStorage.setItem("wallet", connectData.public_key.toString());
        }
      )();
      console.log(`connected to ${connectData.public_key.toString()}`);
    }
  
    // Handle a `disconnect` response from Phantom
    if (url.toString().indexOf("onDisconnect") > -1) {
      setWalletAddress(null);
      console.log("disconnected");
    }
  
  //     // Handle a `signAndSendTransaction` response from Phantom
    if (url.toString().indexOf("onSignAndSendTransaction") > -1) {
      actionSheetRef.current?.hide();
      const signAndSendTransactionData = decryptPayload(
        params.get("data"),
        params.get("nonce"),
        sharedSecret
      );
      console.log("signAndSendTrasaction: ", signAndSendTransactionData);
      setTxHash(signAndSendTransactionData.signature)
    }
  }, [deeplink]);

  const connectSolWallet = async () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "devnet",
      app_url: "https://mansa-trade.com/",
      redirect_link: onConnectRedirectLink,
    });
    const url = buildUrl("connect", params);
    Linking.openURL(url);
  };

  const connectWallet = async () => {
    if (!chainID) {
      await connectSolWallet();
    } else {
      await connectEvmWallet();
    }
    await AsyncStorage.setItem("chainid", chainID.toString());
  }

  const disconnect = async () => {
    const payload = {
      session,
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });
    const url = buildUrl("disconnect", params);
    Linking.openURL(url);
  };

  return (
      <View style={tw`flex flex-row justify-between items-center py-8 px-2`}>
        <Pressable onPress={() => navigation.navigate("Home")}>
          <Image style={tw`w-10 h-12 ml-4`} source={LogoImg} />
        </Pressable>
        <View style={tw`flex flex-row`}>
          <View style={tw`relative`}>
            <TouchableOpacity 
              onPress={() => {setShowChild(!showChild)}}
              style={tw`p-2 mx-4 border-2 border-gray-500 rounded-lg`}
            >
              <Ionicons name="reorder-three" size={24} color="white" />
            </TouchableOpacity>
            <View style={tw`absolute ${showChild ? "flex" : "hidden"} w-52 mt-14 z-50 bg-black border-2 border-gray-500 rounded-lg p-1`}>
              <Pressable>
                <TextComponent action={() => handleChain(null)}>Solana</TextComponent>
              </Pressable>
              <Pressable>
                <TextComponent action={() => handleChain(ETH_CHAIN_ID)}>Ethereum</TextComponent>
              </Pressable>
              <Pressable>
                <TextComponent action={() => handleChain(BSC_CHAIN_ID)}>Binance Smart Chain</TextComponent>
              </Pressable>
              <Pressable>
                <TextComponent action={() => handleChain(AVAX_CHAIN_ID)}>Avalanche</TextComponent>
              </Pressable>
              <Pressable>
                <TextComponent action={() => handleChain(MATIC_CHAIN_ID)}>Polygon</TextComponent>
              </Pressable>
            </View>
          </View>
        {
          walletAddress
            ? <Pressable onPress={disconnect} style={tw`flex flex-row items-center border-2 rounded-lg border-gray-500 px-4 py-1`}>
              <Text style={tw`text-white text-lg mr-2`}>
                {walletAddress.slice(0, 5) + "..." + walletAddress.substring(walletAddress.toString().length - 6)}
              </Text>
              <Ionicons name="wallet-outline" size={24} color="white" />
            </Pressable> 
            : <GradientButton title="Connect Wallet" action={connectWallet} />
        }
        </View>
        <SelectChainModal isShown={showModal} connectSolana={connectWallet} />
        <Toast config={toastConfig} />
      </View>
  );
}

async function schedulePushNotification({title, body, data}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export default Header;