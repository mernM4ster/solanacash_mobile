import { Linking } from "react-native";
import { BaseToast, ErrorToast } from "react-native-toast-message";
import { COLORS } from "../constants/config";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      text1Style={{
        color: "black",
        fontSize: 17,
        fontWeight: "400",
      }}
      text2Style={{
        fontSize: 12,
      }}
      text2NumberOfLines={10}
      style={{
        borderLeftColor: COLORS.GREEN,
        paddingTop: 20,
        paddingBottom: 20,
        height: "100%",
        zIndex: 9999,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
        fontWeight: "400",
      }}
      text2Style={{
        fontSize: 12,
      }}
      text2NumberOfLines={10}
      style={{
        borderLeftColor: COLORS.RED,
        paddingTop: 20,
        paddingBottom: 20,
        height: "100%",
        zIndex: 9999,
      }}
    />
  ),
};
