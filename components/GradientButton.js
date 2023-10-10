import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames"
import TextComponent from "./TextComponent";

const GradientButton = ({action, title, disabled}) => {
    return(
        <TouchableOpacity onPress={action}>
            <LinearGradient
                style={[tw`px-8 py-2 rounded-lg`]}
                colors={['#BEEE62', '#68CEC7']}
                start={{x: 1, y: 0}}
                end={{x: 0, y: 1}}
            >
                <TextComponent size="lg" style="text-center">{title}</TextComponent>
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default GradientButton;