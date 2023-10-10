import { useState, useEffect, useContext } from "react";
import { View, ScrollView } from "react-native";
import tw from "tailwind-react-native-classnames";
import { AppContext } from "../utils/AppContext";
import useNotification from "../utils/notifications";
import useEthNotification from "../utils/eth/notifications";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import TextComponent from "../components/TextComponent";
import Pagination from "../components/Pagination";
import NotifyList from "../components/NotifyList";

const NotificationsWrapper = ({navigation}) => {
  const { chainID } = useContext(AppContext);
  const { isLoading, allNotification } = useNotification();
  const { isEthLoading, allEthNotification } = useEthNotification();

  return (
    <Notifications 
      navigation={navigation}
      isLoading={!chainID ? isLoading : isEthLoading}
      allNotification={!chainID ? allNotification : allEthNotification} />
  );
}

const Notifications = ({navigation, isLoading, allNotification}) => { 
  const [notifications, setNotifications] = useState([]);
  const [pageRange, setPageRage] = useState(0);
  const [pageNum, setPageNum] = useState(0);

  useEffect(() => {
    const newNotifications = allNotification.filter((item, index) => index >= 10 * pageNum && index < (pageNum + 1) * 10);
    setNotifications(newNotifications);
    const newPageRange = Math.floor(allNotification.length / 10) + 1;
    setPageRage(newPageRange);
  }, [allNotification, pageNum])

  return (
    <ScrollView style={[tw`flex flex-col`, {backgroundColor: "#091512"}]}>
      <Header />
      <Navbar navigation={navigation} />
      <View style={tw`px-2 flex-1 h-full`}>
        <TextComponent size="2xl" bold="bold" style="mt-8 mb-2">Notifications</TextComponent>
        <TextComponent color="gray" size="sm" style="mb-6">All access to your notifications</TextComponent>
        <NotifyList datas={notifications} isLoading={isLoading} navigation={navigation} />
        {
          notifications.length > 0  &&
            <Pagination pageRange={pageRange} setPageNum={setPageNum} pageNum={pageNum} />
        }
      </View>
    </ScrollView>
  );
};

export default NotificationsWrapper;