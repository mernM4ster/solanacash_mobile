import { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { ScrollView, View } from "react-native";
import * as anchor from "@project-serum/anchor";
import tw from "tailwind-react-native-classnames";
import { AppContext } from "../utils/AppContext";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import ChatContainer from "../containers/ChatContainer";
import PaymentContainer from "../containers/Order/Sell/PaymentContainer";
import ReleaseContainer from "../containers/Order/Sell/ReleaseContainer";
import CompleteContainer from "../containers/Order/Sell/CompleteContainer";
import CancelContainer from "../containers/Order/Sell/CancelContainer";
import TransferContainer from "../containers/Order/Buy/TransferContainer";
import PendingContainer from "../containers/Order/Buy/PendingContainer";
import BuyCompleteContainer from "../containers/Order/Buy/BuyCompleteContainer";
import BuyCancelContainer from "../containers/Order/Buy/BuyCancelContainer";
import useOrder from "../utils/orders";
import useEthOrder from "../utils/eth/orders";
import { NEXT_PUBLIC_SOLANA_RPC_HOST } from "../constants/env";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import supportedChains from "../constants/chains";

const OrderPageWrapper = ({route, navigation}) => {
  const { orderType, orderAccount } = route.params;
  const { chainID } = useContext(AppContext);
  const { isLoading, getOrderInfo, confirmPayment, createDispute, thumbUser, cancelOrder, buyerConfirm, setIsLoading } = useOrder();
  const { isEthLoading, getEthOrderInfo, confirmEthPayment, createEthDispute, ethThumbUser, cancelEthOrder, buyerEthConfirm, setIsEthLoading } = useEthOrder();

  return (
    <OrderPage 
      navigation={navigation}
      orderType={orderType}
      orderAccount={orderAccount}
      isLoading={!chainID ? isLoading : isEthLoading}
      getOrderInfo={!chainID ? getOrderInfo : getEthOrderInfo}
      confirmPayment={!chainID ? confirmPayment : confirmEthPayment}
      createDispute={!chainID ? createDispute : createEthDispute}
      thumbUser={!chainID ? thumbUser : ethThumbUser}
      cancelOrder={!chainID ? cancelOrder : cancelEthOrder}
      buyerConfirm={!chainID ? buyerConfirm : buyerEthConfirm}
      setIsLoading={!chainID ? setIsLoading : setIsEthLoading} />
  );
}

const OrderPage = ({navigation, orderType, orderAccount, isLoading, getOrderInfo, confirmPayment, createDispute, thumbUser, cancelOrder, buyerConfirm, setIsLoading}) => {
  const defaultOrderdata = {
    buyer: "XXXXXXXX",
    thumbsUp: 0,
    thumbsDown: 0,
    rate: 0,
    timeLimit: 0,
    sellAmount: 0,
    fiatAmount: 0,
    fiat: "",
    tokenName: "",
    fee: 1,
    status: 0,
    paymentOption: 0
  }
  console.log("orderInfo", orderType, orderAccount)
  const { walletAddress, setKey, txHash, setTxHash, key, chainID } = useContext(AppContext);
  const [orderData, setOrderData] = useState(defaultOrderdata);
  const [releaseResult, setReleaseResult] = useState(false);
  const [step, nextStep] = useState(false);
  const [clockId, setClockId] = useState();
  const [checkId, setCheckId] = useState();
  const [period, setPeriod] = useState([0, 0, 0, 0]);
  const [remainTime, setRemainTime] = useState(10000);
  const [timerId, setTimerId] = useState();
  const [finishTimer, setFinishTimer] = useState(false);

  useEffect(() => {
    (async() => {
      setIsLoading(true);
      const newOrderData = await getOrderInfo(orderAccount, orderType);
      setIsLoading(false);
      setOrderData(newOrderData);
      const now = Math.floor(new Date() / 1000);
      let newRemainTime = newOrderData.timeLimit * 60 - (now - newOrderData.createdAt);
      setRemainTime(newRemainTime)
      if (newRemainTime < 0) {
        setPeriod([0, 0, 0, 0]);
      }
      if (newOrderData.status === 0 && newRemainTime > 0 && newRemainTime < newOrderData.timeLimit * 60 && !newOrderData.buyerConfirm) {
        const newClockId = setInterval(() => {
          if (newRemainTime >= 0) {
            const newPeriod = getRemainTime(newRemainTime);
            setPeriod(newPeriod);
            newRemainTime--;
          } else {
            clearInterval(clockId);
          }
        }, 1000);
        console.log("clockId", newClockId)
        setClockId(newClockId)
      }
    })();
  }, [])

  const getRemainTime = (remainTime) => {
    const mins = Math.floor(remainTime / 60);
    const seconds = remainTime % 60;

    return [Math.floor(mins / 10), mins % 10, Math.floor(seconds / 10), seconds % 10];
  }

  const releaseToken = async (orderAccount) => {
    await confirmPayment(orderAccount);
  }

  const handleThumb = async (thumbUp) => {
    await thumbUser(thumbUp, orderAccount, orderData.userAccount);
  }

  const handleDispute = (reason, explain) => {
    createDispute(reason, explain, orderAccount);
  }

  const handleCancelOrder = async () => {
    await cancelOrder(orderAccount);
  }

  const handleBuyerConfirm = async () => {
    await buyerConfirm(orderAccount);
  };

  useEffect(() => {
    if (orderData.status === 0 && !checkId) {
      const newCheckId = setInterval(async () => {
        console.log("check info", newCheckId);
        const newOrderData = await getOrderInfo(orderAccount, orderType);
        setOrderData(newOrderData);
      }, 30000); 
      setCheckId(newCheckId)
    }
    if (orderData.buyerConfirm) {
      console.log("cancel clockId", clockId)
      clearInterval(clockId);
    }
    if (orderData.status > 0) {
      console.log("cancel check info", checkId)
      clearInterval(clockId);
      clearInterval(checkId);
    }
}, [orderData]);

  useEffect(() => {
    (
        async () => {
            if (txHash) {
              if (!chainID) {
                try {
                  const connection = new anchor.web3.Connection(NEXT_PUBLIC_SOLANA_RPC_HOST);
                  await connection.confirmTransaction(txHash);
                } catch (error) {
                  console.log(error);
                  return
                }
                Toast.show({
                  type: "success",
                  text1: "Transaction succeed.",
                });
                setTxHash();
                const newOrderData = await getOrderInfo(orderAccount, orderType);
                setOrderData(newOrderData);
                key === "release" && setReleaseResult(true);
                setKey();
                setIsLoading(false);
              } else {
                const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
                const web3 = new Web3(new Web3.providers.HttpProvider(url));
                console.log("txHash", txHash)
                const newTimerId = setInterval(async () => {
                  const data = await web3.eth.getTransactionReceipt(txHash);
                  console.log("signed", data);
                  if (!!data) {
                    setFinishTimer(true)
                  }
                }, 1000);
                console.log("timerId", newTimerId);
                setTimerId(newTimerId)
              }
            }
        }
    )();
  }, [txHash]);

  useEffect(() => {
    (
      async () => {
        if (finishTimer) {
          console.log("cancel clockID", timerId);
          clearInterval(timerId);
          const newOrderData = await getOrderInfo(orderAccount, orderType);
          setOrderData(newOrderData);
          key === "release" && setReleaseResult(true);
          setKey();
          setTxHash();
          setIsLoading(false);
        }
      }
    )();
  }, [finishTimer])

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header navigation={navigation} />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 flex flex-col my-6`}>
        <View style={tw`relative w-full flex flex-col`}>
          {
            isLoading && 
              <View style={tw`w-full h-full flex z-10 items-center justify-center absolute bg-black bg-opacity-75 rounded-lg`}>
                <TextComponent>Loading</TextComponent>
              </View>
          }
          {
            walletAddress
              ? <>
                <View style={tw`flex-1`}>
                {
                  orderType === "sell" && (
                    orderData.status === 0
                      ? !step
                        ? <PaymentContainer 
                            isLoading={isLoading}
                            navigation={navigation}
                            orderData={orderData} 
                            nextStep={nextStep} 
                            period={period}
                            remainTime={remainTime}
                            handleCancelOrder={handleCancelOrder} />
                        : <ReleaseContainer 
                            isLoading={isLoading} 
                            navigation={navigation}
                            orderAccount={orderAccount}
                            orderData={orderData} 
                            releaseToken={releaseToken}
                            releaseResult={releaseResult}
                            handleDispute={handleDispute} />
                      : orderData.status === 1
                        ? <CompleteContainer orderData={orderData} handleThumb={handleThumb} navigation={navigation} />
                        : <CancelContainer orderData={orderData} navigation={navigation} />
                  )
                }
                {
                  orderType === "buy" && (
                    orderData.status === 0
                      ? !orderData.buyerConfirm 
                        ? <TransferContainer 
                            orderData={orderData} 
                            navigation={navigation}
                            handleBuyerConfirm={handleBuyerConfirm} 
                            period={period}
                            handleCancelOrder={handleCancelOrder} />
                        : <PendingContainer 
                            isLoading={isLoading}   
                            navigation={navigation}
                            orderData={orderData} 
                            period={[0, 0, 0, 0]}
                            handleDispute={handleDispute} />
                      : orderData.status === 1
                        ? <BuyCompleteContainer orderData={orderData} navigation={navigation} />
                        : <BuyCancelContainer orderData={orderData} navigation={navigation} />
                  )
                }
                </View>
                <ChatContainer data={orderData} />
              </>
              : <View style={tw`h-52`}>
                <TextComponent style="text-center">Please connect your wallet.</TextComponent>
              </View>
          }
        </View>
      </View>
    </ScrollView>
  );
}

export default OrderPageWrapper;