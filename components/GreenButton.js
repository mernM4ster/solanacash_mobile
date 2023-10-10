import { TouchableOpacity, Text } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import TextComponent from './TextComponent';

const GreenButton = (props) => {
  const { title, size, style, onPress, active } = props;

  return (
    <TouchableOpacity 
      onPress={active ? onPress : () => {}}
      style={[tw`${style} ${size === "lg" ? "px-8 py-4" : "px-6 py-2"} border-2 rounded-lg`, {backgroundColor: active ? "#68CEC7" : "#6b7280"}]} 
    >
      <TextComponent color="black" size="lg" bold="bold">{title}</TextComponent>
    </TouchableOpacity>
  )
}

export default GreenButton;