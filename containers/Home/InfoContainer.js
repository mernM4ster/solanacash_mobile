import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../utils/AppContext";
import { View, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import useStats from "../../utils/stats";
import useEthStats from "../../utils/eth/stats";
import { CountUp } from "use-count-up";
import TextComponent from "../../components/TextComponent";
import MoneyImg from "../../assets/images/money.png";
import WalletImg from "../../assets/images/wallet.png";
import ClockImg from "../../assets/images/clock.png";

const InfoContainer = () => {
    const { chainID } = useContext(AppContext);
    const { statsData } = useStats();
    const { ethStatsData } = useEthStats();
    const [startVolume, setStartVolume] = useState(0);
    const [endVolume, setEndVolume] = useState(0);
    const [startTransactions, setStartTransactions] = useState(0);
    const [endTransactions, setEndTransactions] = useState(0);
    const [startWallets, setStartWallets] = useState(0);
    const [endWallets, setEndWallets] = useState(0);

    useEffect(() => {
        let newVolume = 0;
        let newWallets = [];
        const newStatsData = !chainID ? statsData : ethStatsData;

        newStatsData.forEach(item => {
            newVolume += item.fiatAmount * item.price;
            if (newWallets.indexOf(item.seller) < 0) {
                newWallets.push(item.seller);
            }
            
            if (newWallets.indexOf(item.buyer) < 0) {
                newWallets.push(item.buyer);
            }
        })

        setStartVolume(endVolume);
        setEndVolume(newVolume);
        setStartTransactions(endTransactions);
        setEndTransactions(newStatsData.length)
        setStartWallets(endWallets);
        setEndWallets(newWallets.length);
    }, [chainID, statsData, ethStatsData]);

    return (
        <View style={tw`my-8 flex flex-col justify-between px-2`}>
            <View style={[tw`mb-2 p-8 flex flex-row items-center rounded-xl`, { backgroundColor: "#060e0c"}]}>
                <Image style={tw`mr-6`} source={MoneyImg} alt="money" />
                <View style={tw`flex flex-col text-left`}>
                    <CountUp start={startVolume} end={endVolume} duration={5} isCounting>
                        {({value}) => (
                            <TextComponent size="xl" bold="bold" style="mb-4">{parseFloat(value).toFixed(2).toLocaleString("en-US")}</TextComponent>
                        )}
                    </CountUp>
                    <TextComponent color="gray">Total Volume</TextComponent>
                </View>
            </View>
            <View style={[tw`mb-2 p-8 flex flex-row items-center rounded-xl`, { backgroundColor: "#060e0c"}]}>
                <Image style={tw`mr-6`} source={ClockImg} alt="clock" />
                <View style={tw`flex flex-col text-left`}>
                    <CountUp start={startTransactions} end={endTransactions} duration={5} isCounting>
                        {({value}) => (
                            <TextComponent size="xl" bold="bold" style="mb-4">{value.toLocaleString("en-US")}</TextComponent>
                        )}
                    </CountUp>
                    <TextComponent color="gray">Transactions</TextComponent>
                </View>
            </View>
            <View style={[tw`mb-2 p-8 flex flex-row items-center rounded-xl`, { backgroundColor: "#060e0c"}]}>
                <Image style={tw`mr-6`} source={WalletImg} alt="wallet" />
                <View style={tw`flex flex-col text-left`}>
                    <CountUp start={startWallets} end={endWallets} duration={5} isCounting>
                        {({value}) => (
                            <TextComponent size="xl" bold="bold" style="mb-4">{value.toLocaleString("en-US")}</TextComponent>
                        )}
                    </CountUp>
                    <TextComponent color="gray">Active Wallets</TextComponent>
                </View>
            </View>
        </View>
    )
}

export default InfoContainer;