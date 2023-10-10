import { useState } from 'react';
import "./global";
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { withWalletConnect, useWalletConnect } from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import nacl from "tweetnacl";
import { useFonts } from "expo-font";
import { AppContext } from './utils/AppContext';
import DashboardPage from "./pages/DashboardPage";
import Home from './pages/Home';
import Offers from './pages/Offers';
import Notifications from './pages/Notifications';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Stats from './pages/Stats';
import CreateOffer from './pages/CreateOffer';
import EditOffer from './pages/EditOffer';
import MyOfferList from './pages/MyOfferList';
import OfferSeller from './pages/OfferSeller';
import OrderPage from './pages/OrderPage';
import AccountPage from './pages/AccountPage';
import InterBold from "./assets/fonts/Inter-Bold.ttf";
import InterRegular from "./assets/fonts/Inter-Regular.ttf";
import Knewave from "./assets/fonts/knewave.ttf";

const Stack = createNativeStackNavigator();

function App() {
  // nacl.setPRNG(function(x, n) {
  //   // ... copy n random bytes into x ...
  // });
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [walletAddress, setWalletAddress] = useState(null); 
  const [chainID, setChainID] = useState(null);
  const [session, setSession] = useState();
  const [sharedSecret, setSharedSecret] = useState();
  const [txHash, setTxHash] = useState();
  const [key, setKey] = useState();
  const evmConnector = useWalletConnect();

  const [loaded] = useFonts({
    InterRegularFont: InterRegular,
    InterBoldFont: InterBold,
    KnewaveFont: Knewave
  })

  if (!loaded) {
    return ;
  }
  
  return (
    <SafeAreaView style={{flex: 1}}>
      <AppContext.Provider value={{walletAddress, setWalletAddress, chainID, setChainID, evmConnector, session, setSession, dappKeyPair, sharedSecret, setSharedSecret, txHash, setTxHash, key, setKey}}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Dashboard" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Dashboard" component={DashboardPage} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Create Offer" component={CreateOffer} />
            <Stack.Screen name="Edit Offer" component={EditOffer} />
            <Stack.Screen name="My Offers" component={MyOfferList} />
            <Stack.Screen name="Offers" component={Offers} />
            <Stack.Screen name="Create Order" component={OfferSeller} />
            <Stack.Screen name="Order" component={OrderPage} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Orders" component={Orders} />
            <Stack.Screen name="Wallet" component={Wallet} />
            <Stack.Screen name="Account" component={AccountPage} />
            <Stack.Screen name="Stats" component={Stats} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    </SafeAreaView>
  );
}

export default withWalletConnect (App, {
  clientMeta: {
    description: "Connect with WalletConnect",
  },
  redirectUrl:
    Platform.OS === "web" ? window.location.origin : "yourappscheme://",
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
})
