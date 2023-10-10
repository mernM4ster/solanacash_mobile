import Modal from "react-native-modal";
import { View, Text, Pressable } from "react-native";
import { FontAwesome } from '@expo/vector-icons'; 
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";
import { LANGUAGES } from "../constants/account";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const LanguageModal = (props) => {
  const { isShown, setShown, handleModal, language, setLanguage, isLoading} = props;
  const handleCheck = (index) => {
    setLanguage(LANGUAGES[index].value);
  }

  return(
    <Modal isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="mb-2 text-center">Change Language</TextComponent>
        <TextComponent color="gray" style="mb-4 text-center">Select your prefered language from the list</TextComponent>
        <View style={tw`mb-4`}>
          {
            LANGUAGES.map((item, index) => 
              <Pressable 
                key={index} 
                onPress={() => handleCheck(index)}
                style={[tw`flex flex-row items-center justify-between p-2 border-b-2`, {borderColor: "#6f6f6f"}]}
              >
                <Text style={tw`text-white text-base`}>{item.title}</Text>
                {
                  language === item.value
                    ? <FontAwesome name="check-circle" size={20} color="#68CEC7" />
                    : <></>
                }
              </Pressable>
            )
          }
        </View>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" onPress={() => setShown(false)} />
          <GreenButton title="Change Language" size="lg" active={language} onPress={handleModal} />
        </View>
        {
          isLoading &&
            <View style={tw`w-full h-full absolute top-4 left-4 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
              <TextComponent style="text-center">Loading</TextComponent>
            </View>
        }
      </View>
    </Modal>
  )
}

export default LanguageModal;