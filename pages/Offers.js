import { useState, useEffect, useContext } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";
import { FontAwesome  } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import useOffer from "../utils/offers";
import useEthOffer from "../utils/eth/offers";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import InputComponent from "../components/InputComponent";
import SelectComponent from "../components/SelectComponent";
import GuideContainer from "../containers/Home/GuideContainer";
import Footer from "../components/Footer";
import { AppContext } from "../utils/AppContext";
import { CRYPTO_FILTER_VALUES, FIAT_FILTER_VALUES, REGION_VALUES, PAYMENT_VALUES } from "../constants/offers";
import { ETH_CRYPTO_FILTER_VALUES } from "../constants/eth/offers";
import OfferTable from "../components/OfferTable";
import Pagination from "../components/Pagination";

const OffersList = ({navigation}) => {
    const { chainID } = useContext(AppContext);
    const { isLoading, allOffers, refresh, setRefresh } = useOffer();
    const { ethIsLoading, allEthOffers, ethRefresh, setEthRefresh } = useEthOffer();

    return (
        <Offers
            chainID={chainID}
            navigation={navigation}
            cryptoFilterValues = {!chainID ? CRYPTO_FILTER_VALUES : ETH_CRYPTO_FILTER_VALUES[chainID]} 
            isLoading = {!chainID ? isLoading : ethIsLoading}
            allOffers = {!chainID ? allOffers : allEthOffers}
            refresh = {!chainID ? refresh : ethRefresh}
            setRefresh = {!chainID ? setRefresh : setEthRefresh} />
        )
}

const Offers = ({navigation, cryptoFilterValues, isLoading, allOffers, refresh, setRefresh, chainID}) => {
    const [offerList, setOfferList] = useState([]);
    const [selectedCryptoIndex, setSelectedCryptoIndex] = useState(0);
    const [selectedFiatIndex, setSelectedFiatIndex] = useState(0);
    const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);
    const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
    const [searchKey, setSearchKey] = useState();
    const [checkStatus, setCheckStatus] = useState(false);
    const [checkOnline, setCheckOnline] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [pageRange, setPageRage] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [amount, setAmount] = useState();
    
    useEffect(() => {
        setOfferList(allOffers);
        const newPageRange = Math.floor(allOffers.length / 10) + (allOffers.length % 10 > 0 ? 1 : 0);
        setPageRage(newPageRange);
    }, [allOffers]);

    useEffect(() => {
        let filterOffers = [...allOffers];
        if(checkStatus) {
            filterOffers = filterOffers.filter(item => item.verified === checkStatus);
        }
        if (checkOnline) {
            filterOffers = filterOffers.filter(item => item.onlineStatus === checkOnline);
        }
        if (selectedCryptoIndex !== 0) {
            if (selectedCryptoIndex === 1) {
                filterOffers = filterOffers.filter(item => item.main);
            } else {
                filterOffers = filterOffers.filter(item => (item.token.toString().toLowerCase() === cryptoFilterValues[selectedCryptoIndex].value.toLowerCase()) && !item.main);
            }
        }
        if (selectedFiatIndex !== 0) {
            filterOffers = filterOffers.filter(item => item.fiat === FIAT_FILTER_VALUES[selectedFiatIndex].value);
        }
        if (selectedPaymentIndex !== 0) {
            filterOffers = filterOffers.filter(item => item.paymentOptions.indexOf(PAYMENT_VALUES[selectedPaymentIndex].value) > -1);
        }
        if (selectedRegionIndex !== 0) {
            filterOffers = filterOffers.filter(item => item.region === selectedRegionIndex);
        }
        if (searchKey) {
            filterOffers = filterOffers.filter(item => item.owner.toString().toLowerCase().indexOf(searchKey.toLowerCase()) > -1)
        }
        if (amount) {
            filterOffers = filterOffers.filter(item => item.tokenAmount >= amount * 1)
        }
        const newPageRange = Math.floor(filterOffers.length / 10) + 1;
        setPageRage(newPageRange);
        filterOffers = filterOffers.filter((item, index) => index >= 10 * pageNum && index < (pageNum + 1) * 10);
        setOfferList(filterOffers);
        
    }, [allOffers, selectedCryptoIndex, selectedFiatIndex, selectedPaymentIndex, selectedRegionIndex, checkStatus, pageNum, checkOnline, searchKey, amount]);

    return (
        <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
            <Header navigation={navigation} />
            <Navbar navigation={navigation} />
            <View style={tw`px-2 flex-1`}>
                <View style={tw`flex flex-row justify-between items-center`}>
                    <TextComponent size="2xl" bold="bold" style="mt-8 mb-6 text-left">Available Offers</TextComponent>
                    <View style={tw`flex ml-8`}>
                        <TouchableOpacity style={tw`flex flex-col mr-2`} onPress={() => setShowFilter(!showFilter)}>
                            <View style={[tw`px-4 py-2 border-2 rounded-lg flex items-center justify-between`, {borderColor: "#6f6f6f"}]}>
                                <FontAwesome name="filter" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={tw`flex flex-col`}>
                        <TouchableOpacity style={tw`flex flex-col mr-2 ${refresh ? "" : ""}`} onPress={setRefresh}>
                            <View style={[tw`px-4 py-2 border-2 rounded-lg flex items-center justify-center`, {borderColor: "#6f6f6f"}]}>
                                <FontAwesome name="refresh" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={tw`${showFilter ? "flex flex-row" : "hidden"} flex-wrap justify-between mb-4`}>
                    <SelectComponent title="Filter by Crypto" values={cryptoFilterValues} value={selectedCryptoIndex} onChange={setSelectedCryptoIndex} search/>
                    <SelectComponent title="Filter by Fiat" values={FIAT_FILTER_VALUES} value={selectedFiatIndex} onChange={setSelectedFiatIndex} search/>
                    <SelectComponent title="Filter by Payment Method" values={PAYMENT_VALUES} value={selectedPaymentIndex} onChange={setSelectedPaymentIndex} search/>
                    <InputComponent title="Search" placeHolder="Enter text here" value={searchKey} onChange={setSearchKey} type />
                    <InputComponent title="Enter Amount" placeHolder="Enter amount here" value={amount} onChange={setAmount} />
                    <SelectComponent title="Region" values={REGION_VALUES} value={selectedRegionIndex} onChange={setSelectedRegionIndex} search/>
                    <View style={tw`flex flex-row items-center pt-4 `}>
                        <Checkbox value={checkOnline} onValueChange={setCheckOnline} style={tw`mr-2`} />
                        <TextComponent>Online</TextComponent>
                    </View>
                    <View style={tw`flex flex-row items-center pt-4 `}>
                        <Checkbox value={checkStatus} onValueChange={setCheckStatus} style={tw`mr-2`} />
                        <TextComponent>Only verified users</TextComponent>
                    </View>
                </View>
                <OfferTable datas={offerList} isLoading={isLoading} navigation={navigation} chainID={chainID} />
                <Pagination pageRange={pageRange} setPageNum={setPageNum} pageNum={pageNum} />
            </View>
            <GuideContainer />
            <Footer />
        </ScrollView>
    );
}

export default OffersList