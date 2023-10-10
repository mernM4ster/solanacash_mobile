import { View, TextInput } from "react-native";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const InputComponent = (props) => {
    const { style, border, placeHolder, value, onChange, handleFocus, type, suffix, title } = props;

    const changeValue = (value) => {
        if (!type) {
            if (value >= 0) {
                onChange(value)
            }
        } else {
            onChange(value)
        }
    }

    return (
        <View style={tw`mb-2 ${style}`}>
            {
                title && 
                <TextComponent color="gray" size="sm" style="mb-2 text-left">{title}</TextComponent>
            }
            <View style={tw`relative`}>
                <TextInput
                    placeholderTextColor="#c0c0c0"
                    style={[tw`w-full rounded-lg py-1 text-base text-white ${border ? "border-2 border-white" : ""} ${title ? "pr-12 pl-4" : "pr-4 pl-4"}`, {backgroundColor: "#060e0c"}]}
                    placeholder={placeHolder}
                    onEndEditing={handleFocus}
                    value={value}
                    onChangeText={changeValue}
                />
                <TextComponent size="sm" style="absolute right-4 bottom-1.5 text-gray-300">{suffix}</TextComponent>
            </View>
        </View>
    );
}

export default InputComponent;