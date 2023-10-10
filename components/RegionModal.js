import Modal from "react-native-modal";
import { View, Text, Pressable, ScrollView } from "react-native";
import { FontAwesome } from '@expo/vector-icons'; 
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";
import { REGIONS } from "../constants/account";
import GrayButton from "./GrayButton";
import GreenButton from "./GreenButton";

const RegionModal = (props) => {
  const { isShown, setShown, handleModal, region, setRegion, isLoading} = props;

  const handleCheck = (index) => {
    setRegion(index + 1);
  }

  return (
    <Modal style={tw`z-50`} isVisible={isShown}>
      <View style={[tw`rounded-lg p-4`, {backgroundColor: "#060e0c"}]}>
        <TextComponent color="green" size="3xl" style="mb-2 text-center">Change Region</TextComponent>
        <TextComponent color="gray" style="mb-4 text-center">Select your prefered region from the list</TextComponent>
        <ScrollView style={[tw`h-96 rounded-lg p-4 mb-4`, {backgroundColor: "#091512"}]}>
          {
            REGIONS.map((item, index) =>
              <Pressable 
                key={index} 
                onPress={() => handleCheck(index)}
                style={[tw`flex flex-row items-center justify-between p-2 border-b-2`, {borderColor: "#6f6f6f"}]}
              >
                <Text style={tw`text-white text-base`}>{item}</Text>
                {
                  region === index + 1
                    ? <FontAwesome name="check-circle" size={20} color="#68CEC7" />
                    : <></>
                }
              </Pressable>
            )
          }
        </ScrollView>
        <View style={tw`flex flex-row justify-between`}>
          <GrayButton title="Cancel" onPress={() => setShown(false)} />
          <GreenButton title="Change Region" size="lg" active={region > 0} onPress={handleModal} />
        </View>
        {
          isLoading &&
            <View style={tw`w-full h-full absolute top-4 left-4 flex items-center justify-center bg-black bg-opacity-75 rounded-lg`}>
              <TextComponent style="text-center">Loading</TextComponent>
            </View>
        }
      </View>
    </Modal>
  );
}

export default RegionModal;