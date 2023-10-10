import { useEffect, useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Image } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { AntDesign } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import TextComponent from "./TextComponent";

const SelectComponent = (props) => {
    const { title, value, values, style, onChange, search } = props;
    const [searchKey, setSearchKey] = useState();
    const [titles, setTitles] = useState([]);

    const selectChange = (title, _) => {
        const filterTitles = values.map(item => item.title);
        const index = filterTitles.indexOf(title);
        setSearchKey();
        onChange(index);
    }

    const handleChange = (value) => {
        setSearchKey(value)
    }

    useEffect(() => {
        if (searchKey) {
            const newTitles = values.map(value => value.title);
            let newFilterValues = newTitles.filter(item => item.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
            setTitles(newFilterValues);
        } else {
            const newTitles = values.map(value => value.title);
            setTitles(newTitles)
        }
    }, [searchKey, values])
    
    return (
        <View style={tw`mb-2 mr-2 ${style}`}>
            {
                title !== undefined && <TextComponent color="gray" size="sm" style="text-left mb-2 ">{title}</TextComponent>
            }
            <SelectDropdown 
                search={search}
                searchPlaceHolder="Input Search Value"
                onChangeSearchInputText={handleChange}
                searchInputStyle={{height: 48, borderBottomWidth: 0, backgroundColor: "#060e0c"}}
                searchInputTxtColor={tw`text-white`}
                defaultValueByIndex={value}
                rowStyle={{height: 40, backgroundColor: "#060e0c"}}
                rowTextStyle={tw`text-white`}
                buttonStyle={{height: 36, width: 160, borderRadius: 8, backgroundColor: "#060e0c"}}
                buttonTextStyle={tw`p-0 text-white`}
                renderCustomizedButtonChild={(selectedItem, index) => {
                    const filterTitles = values.map(item => item.title);
                    const selectedIndex = filterTitles.indexOf(selectedItem);
                    const selected = values[selectedIndex];
                    return (
                            selected
                                ? <View key={index} style={tw`flex flex-row justify-center`}>
                                    {
                                        selected && selected.img && <Image style={tw`w-6 h-6 mr-2`} source={selected.img} />
                                    }
                                    <TextComponent>{selectedItem}</TextComponent>
                                </View>
                                : <View key={index} style={tw`flex flex-row justify-center`}>
                                    {
                                        values[0].img && <Image style={tw`w-6 h-6 mr-2`} source={values[0].img} />
                                    }
                                    <TextComponent>{values[0].title}</TextComponent>
                                </View>
                    );
                }}
                data={titles} 
                renderCustomizedRowChild={(title, index) => {
                    const item = values.filter(value => value.title === title)[0];
                    return (
                        <View key={index} style={tw`flex flex-row justify-center`}>
                            {
                                item.img && <Image style={tw`w-6 h-6 mr-2`} source={item.img} />
                            }
                            <TextComponent>{title}</TextComponent>
                        </View>
                    )
                } 
                }
                onSelect={selectChange} />
        </View>
        // <View style={tw`mr-2 mb-2 z-10 ${style}`}>
        //     {
        //         title !== undefined && <TextComponent color="gray" size="sm" style="text-left mb-2 z-10">{title}</TextComponent>
        //     }
        //     <View style={tw`relative`}>
        //         <TouchableOpacity 
        //             style={[tw`px-4 py-2 rounded-lg flex flex-row items-center justify-between z-10`, {backgroundColor: color === "black" ? "black" : "#060e0c"}]}
        //             onPress={() => setShowChild(!showChild)}
        //         >
        //             <View style={tw`flex items-center mr-16`}>
        //                 {
        //                     value !== -1
        //                         ? <View style={tw`flex flex-row`}>
        //                             {
        //                                 Object.keys(values[value]).indexOf("img") > -1 &&
        //                                 <Image style={tw`w-5 h-5 mr-2`} source={values[value].img} alt="crypto" />
        //                             }
        //                             <TextComponent>{values[value].title}</TextComponent>
        //                         </View>
        //                         : placeHolder
        //                             ? <TextComponent>{placeHolder}</TextComponent>
        //                             : <View></View>
        //                 }
        //             </View>
        //             <View><AntDesign name="down" size={24} color="white" /></View>
        //         </TouchableOpacity>
        //         <ScrollView style={[tw`absolute ${position ? "bottom-full mb-11" : "mt-11"} w-full z-50 rounded-lg ${!disabled && showChild ? "flex flex-col" : "hidden"}`, {backgroundColor: color === "black" ? "black" : "#060e0c", zIndex: 1}]}>
        //             {
        //                 search && <TextInput style={tw`m-2 p-1 bg-transparent border-2 border-gray-500 rounded-lg text-white`} onChange={handleChange} />
        //             }
        //             <View style={tw`max-h-60`}>
        //                 {
        //                     filterValues.length > 0
        //                         ? filterValues.map((item, index) =>
        //                             <TouchableOpacity key={index} style={tw`flex flex-row px-4 py-2 items-center`} onPress={() => handleClick(values.indexOf(item))}>
        //                                 {
        //                                     item.img &&
        //                                     <Image style={tw`w-5 h-5 mr-2`} source={item.img} alt="crypto" />
        //                                 }
        //                                 <TextComponent>{item.title}</TextComponent>
        //                             </TouchableOpacity>
        //                             )
        //                         : <TextComponent color="gray" style="p-2">No Result</TextComponent>
        //                 }
        //             </View>
        //         </ScrollView>
        //     </View>
        // </View>
    );
}

export default SelectComponent;