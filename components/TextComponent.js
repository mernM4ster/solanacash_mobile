import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import tw from "tailwind-react-native-classnames";

const TextComponent = (props) => {
    const { color, size, bold, fontFamily, children, style, action, notl } = props;
    const { t } = useTranslation();
    return (
        <View>
            <Text 
                style={[
                    tw`${size ? `text-${size}` : "text-base"} ${bold && `font-${bold}`} ${style ? style : ""}`,
                    {
                        fontFamily: fontFamily === "KnewaveFont" ? "Knewave" : fontFamily === "InterBold" ? "InterBoldFont" : "InterRegularFont",
                        color: color === "black" ? "black" : color === "gray" ? "#b8b8b8" : color ==="green" ? "#68CEC7" : color === "red" ? "red" : "white"
                    }
                ]}
                onPress={action}
            >
                {children && (notl ? children : t(children.toString()))}
            </Text>
        </View>
    )
}

export default TextComponent;