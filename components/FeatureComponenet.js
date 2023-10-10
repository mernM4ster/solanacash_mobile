import { View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const FeatureComponent = (props) => {
    const { image, title, text } = props;
    return (
        <View style={[tw`p-4 flex flex-col items-center rounded-lg mb-8`, {backgroundColor: "#060e0c"}]}>
            <LinearGradient
                style={[tw`w-28 h-28 rounded-full flex items-center justify-center`]}
                colors={['#BEEE62', '#68CEC7']}
                start={{x: 1, y: 0}}
                end={{x: 0, y: 1}}
            >
                <Image source={image} alt="img" />
            </LinearGradient>
            <TextComponent style="my-4" notl>{title}</TextComponent>
            <TextComponent color="gray" style="text-center" notl>{text}</TextComponent>
        </View>
    );
}

export default FeatureComponent;