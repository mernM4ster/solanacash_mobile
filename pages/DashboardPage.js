import { View, Image, Dimensions } from "react-native";
import tw from "tailwind-react-native-classnames";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import GradientButton from "../components/GradientButton";
import SecureImg from "../assets/images/security.png";
import DecentralizeImg from "../assets/images/decentralized.png";
import NotificationImg from "../assets/images/notification.png";
import TextComponent from "../components/TextComponent";

const { width } = Dimensions.get("window");

const DashboardPage = ({navigation}) => {
  return (
    <View style={[tw`flex-1 flex flex-col justify-center`, {backgroundColor: "#091512"}]}>
      <View style={tw`pb-16 mb-16`}>
        <SwiperFlatList 
          autoplay 
          autoplayDelay={2} 
          autoplayLoop 
          index={2} 
          showPagination
          paginationActiveColor="#68CEC7"
          paginationStyleItem={{width: 10, height: 10}}
        >
          <View style={[tw`flex flex-col items-center`, {width: width}]}>
            <Image source={SecureImg} style={tw`mb-20`} />
            <TextComponent size="4xl" bold="bold" style="text-center mb-8">Secured Transactions</TextComponent>
            <TextComponent color="gray" size="base" style="text-center px-8">Secured transactions between both buyers and sellers</TextComponent>
          </View>
          <View style={[tw`flex flex-col items-center`, {width: width}]}>
            <Image source={DecentralizeImg} style={tw`mb-20`} />
            <TextComponent size="4xl" bold="bold" style="text-center mb-8">Fully Decentralized</TextComponent>
            <TextComponent color="gray" size="base" style="text-center px-8">We don’t ask for your personal details while using mansatrade</TextComponent>
          </View>
          <View style={[tw`flex flex-col items-center`, {width: width}]}>
            <Image source={NotificationImg} style={tw`mb-20`}/>
            <TextComponent size="4xl" bold="bold" style="text-center mb-8">Real-time Notifications</TextComponent>
            <TextComponent color="gray" size="base" style="text-center px-8">Enjoy real-time notifications for your activity on the Dapp</TextComponent>
          </View>
        </SwiperFlatList>
      </View>
      <View style={tw`px-10`}>
        <GradientButton title="Get Started" action={() => navigation.navigate("Home")} />
      </View>
    </View>
  )
}

export default DashboardPage;