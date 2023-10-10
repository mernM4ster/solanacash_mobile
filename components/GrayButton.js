import { TouchableOpacity, Text } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";


const GrayButton = (props) => {
    const { title, style, onPress, size } = props;

    return (
        <TouchableOpacity onPress={onPress} style={[tw`${style} ${size === "sm" ? "px-6 py-1" : "px-8 py-4"} rounded-lg border-2`, {borderColor: "#6b7280"}]}>
            <TextComponent size={size === "sm" ? null : "lg"}>{title}</TextComponent>
        </TouchableOpacity>
    )
}

export default GrayButton;