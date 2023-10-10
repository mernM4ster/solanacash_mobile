import { useContext, useState } from "react";
import { View, TouchableOpacity, Pressable, Text } from "react-native";
import { Ionicons, AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";
import { AppContext } from "../utils/AppContext";
import useOrder from "../utils/orders";
import useEthOrder from "../utils/eth/orders";
import useNotification from "../utils/notifications";
import useEthNotification from "../utils/eth/notifications";

const NavbarWrapper = ({navigation}) => {
    const { chainID, walletAddress } = useContext(AppContext);
    const { allNotification, isLoading, unReadNum } = useNotification();
    const { allEthNotification, isEthLoading, unReadEthNum } = useEthNotification();
    const { ordersCount } = useOrder();
    const { ethOrdersCount } = useEthOrder();

    return (
        <Navbar 
            navigation={navigation}
            chainID={chainID}
            walletAddress={walletAddress}
            allNotification={!chainID ? allNotification : allEthNotification}
            isLoading={!chainID ? isLoading : isEthLoading}
            unReadNum={!chainID ? unReadNum : unReadEthNum}
            ordersCount={!chainID ? ordersCount : ethOrdersCount} />
    )
}

const Navbar = ({navigation, chainID, walletAddress, allNotification, isLoading, unReadNum, ordersCount}) => {
    const [showStatus, setShowStatus] = useState(false);
    const [showChild, setShowChild] = useState(false);
    const [badge, setBadge] = useState(false);
    const [showNotify, setShowNotify] = useState(false);

    const handleMark = async () => {
        if (!chainID) {
            await AsyncStorage.setItem(`${walletAddress}_notify_date`, allNotification[0].createdTime);
        } else {
            await AsyncStorage.setItem(`${walletAddress}_${chainID}_notify_date`, allNotification[0].createdTime);
        }
        setBadge(true);
    }

    const handleNavigate = (page) => {
        setShowStatus(false);
        navigation.navigate(page);
    }

    return (
        <View style={[tw`px-2 flex flex-row justify-between z-20`, {backgroundColor: "#060e0c"}]}>
            <View style={tw`relative`}>
                <TouchableOpacity 
                    style={tw`text-white py-1 pl-2 flex flex-col items-center`} 
                    onPress={() => setShowStatus(!showStatus)}
                    onPressOut={() => setShowStatus(false)}
                >
                    <Ionicons name="reorder-three-sharp" size={32} color="white" />
                </TouchableOpacity>
                <View style={[tw`absolute ${showStatus ? "flex" : "hidden"} flex-col mt-12 p-2 w-40 rounded-lg`, {backgroundColor: "#060e0c",}]}>
                    <TextComponent style="p-2" action={() => handleNavigate("Offers")}>Offers</TextComponent>
                    <View style={tw`p-2 flex flex-row items-center`}>
                        <TextComponent style="mr-2" action={() => handleNavigate("Orders")}>My Orders</TextComponent>
                        {
                            ordersCount > 0 &&
                                <View style={tw`w-6 h-6 flex items-center justify-center rounded-full bg-gray-500`}>
                                    <Text style={tw`text-white`}>{ordersCount}</Text>
                                </View>
                        }
                    </View>
                    <TextComponent style="p-2" action={() => handleNavigate("Wallet")}>Trading Wallet</TextComponent>
                    <TextComponent style="p-2" action={() => handleNavigate("Account")}>Account</TextComponent>
                    <TextComponent style="p-2" action={() => handleNavigate("Stats")}>Stats</TextComponent>
                </View>
            </View>
            <View style={tw`flex flex-row items-center justify-center`}>
                {
                    walletAddress &&   
                        <View style={tw`relative mr-4`}>
                            <TouchableOpacity style={tw`relative items-center`} onPress={() => setShowNotify(!showNotify)}>
                                <MaterialCommunityIcons name="bell" size={24} color="white" />
                                {
                                    unReadNum > 0 && !badge &&
                                        <View style={[tw`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full`, {backgroundColor: "red"}]}>
                                            <Text style={tw`text-white text-xs font-bold`}>
                                                {unReadNum}
                                            </Text>
                                        </View>
                                }
                            </TouchableOpacity>
                            <View style={[tw`mt-10 -right-32 w-64 absolute p-2 z-10 ${showNotify ? "flex" : "hidden"} rounded-lg`, {backgroundColor: "#060e0c"}]}>
                            {
                                isLoading
                                    ? <View><TextComponent style="text-center">Loading</TextComponent></View>
                                    : allNotification.length === 0
                                        ? <View><TextComponent style="text-center">No notifications</TextComponent></View>
                                        : <View style={tw`flex flex-col`}>
                                            <View style={tw`flex flex-row justify-between items-end`}>
                                                <TextComponent size="base">Notification</TextComponent>
                                                <Pressable onPress={handleMark}>
                                                    <TextComponent color="green" size="sm">Mark all as read</TextComponent>
                                                </Pressable>
                                            </View>
                                            <View>
                                            {
                                                allNotification.filter((_, index) => index < 5).map((item, index) =>
                                                    <View key={index} style={tw`flex flex-row items-center pb-2`}>
                                                        <View style={[tw`w-2 h-2 rounded-full mr-4`, {backgroundColor: "#68CEC7"}]} />
                                                        <View style={tw`flex-1`}>
                                                            <View style={tw`flex flex-row items-center flex-wrap`}>
                                                                {
                                                                    item.type === "create" && 
                                                                        <TextComponent>New order created for</TextComponent>
                                                                }
                                                                {
                                                                    item.type === "buyer_confirm" && 
                                                                        <TextComponent>Buyer confirmed payment for</TextComponent>
                                                                }
                                                                {
                                                                    item.type === "seller_confirm" && 
                                                                        <TextComponent>Order completed for</TextComponent>
                                                                }
                                                                {
                                                                    item.type === "cancel" && 
                                                                        <TextComponent>Order cancelled for</TextComponent>
                                                                }
                                                                <Text style={tw`text-white ml-1`}>{item.amount}</Text>
                                                                <Text style={tw`text-white ml-1`}>{item.tokenName.toUpperCase()}</Text>
                                                            </View>
                                                            <View>
                                                                {
                                                                    item.type === "create" && 
                                                                        <TextComponent size="sm">This order is created by</TextComponent>
                                                                }
                                                                {
                                                                    item.type === "buyer_confirm" && 
                                                                        <TextComponent size="sm">This order is confirmed by</TextComponent>
                                                                }
                                                                {
                                                                    item.type === "seller_confirm" && 
                                                                        <TextComponent size="sm">This order is completed by</TextComponent>
                                                                }
                                                                {
                                                                    item.type === "cancel" && 
                                                                        <TextComponent size="sm">This order is cancelled by</TextComponent>
                                                                }
                                                                <Text style={tw`text-sm text-white ml-1`}>{item.user.slice(0, 6)}...${item.user.substring(item.user.length - 7)}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )
                                            }
                                            </View>
                                        </View>
                            }
                            <Pressable 
                                onPress={() => navigation.navigate("Notifications")}
                                style={tw`flex flex-row items-center justify-center bg-opacity-20 bg-gray-500 rounded-lg p-2 mt-4`}>
                                <TextComponent size="sm" style="mr-2">View all notifications</TextComponent>
                                <AntDesign name="arrowright" size={20} color="#68CEC7" />
                            </Pressable>
                            </View>
                        </View>
                }
                {
                    walletAddress && 
                        <View style={tw`relative`}>
                            <TouchableOpacity onPress={() => setShowChild(!showChild)} style={tw`flex flex-row items-center`}>
                                <AntDesign name="plussquareo" size={16} color="#68CEC7" />
                                <TextComponent style="mx-2">Create New Offer</TextComponent>
                                <AntDesign name="down" size={16} color="white" />
                            </TouchableOpacity>
                            <View style={[tw`absolute mt-10 right-0 rounded-lg flex-col z-50 ${showChild ? "flex" : "hidden"}`, {backgroundColor: "#060e0c"}]}>
                                <TouchableOpacity onPress={() => navigation.navigate("Create Offer")} style={tw`flex flex-row p-4 items-center w-52`}>
                                    <AntDesign name="tag" size={16} color="#68CEC7" />
                                    <TextComponent style="ml-2" size="sm">Buy Crypto for Cash</TextComponent>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate("My Offers")} style={tw`flex flex-row p-4 items-center w-52`}>
                                    <FontAwesome name="dollar" size={16} color="#68CEC7" />
                                    <TextComponent style="ml-2" size="sm">View my Offers</TextComponent>
                                </TouchableOpacity>
                            </View>
                        </View>
                }
            </View>
        </View>
    );
}

export default NavbarWrapper;