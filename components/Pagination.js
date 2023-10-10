import { useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import { AntDesign } from '@expo/vector-icons'; 
import tw from "tailwind-react-native-classnames";

const Pagination = ({pageNum, setPageNum, pageRange}) => {
  console.log(pageRange)
  const handlePage = (num) => {
    setPageNum(num);
  }

  const prevPage = () =>{
    pageNum > 0 && setPageNum(pageNum - 1)
  }

  const nextPage = () =>{
    pageNum < pageRange - 1 &&  setPageNum(pageNum + 1)
  }

  return (
    <View style={tw`flex flex-row items-center mb-8`}>
    {
      pageRange > 1 &&
        <>
          <Pressable onPress={pageNum === 0 ? () => {} : prevPage} style={tw`pr-2`}>
            <AntDesign name="left" size={20} color={pageNum === 0 ? "gray" : "white"} />
          </Pressable>
          {
            pageRange > 0 &&
              <Pressable onPress={() => handlePage(0)} style={tw`px-2`}>
                <Text style={tw`${pageNum === 0 ? "text-white" : "text-gray-500"} text-2xl`}>1</Text>
              </Pressable>
          }
          {
            pageRange > 1 && Array.from({length: pageRange - 2}).map((_, index) => 
              <Pressable key={index} onPress={() => handlePage(1 + index)} style={tw`px-2`}>
                <Text style={tw`${pageNum === index + 1 ? "text-white" : "text-gray-500"} text-2xl`}>{2 + index}</Text>
              </Pressable>
            )
          }
          {
            pageRange > 1 &&
              <Pressable onPress={() => handlePage(pageRange - 1)} style={tw`px-2`}>
                <Text style={tw`${pageNum === pageRange - 1 ? "text-white" : "text-gray-500"} text-2xl`}>{pageRange}</Text>
              </Pressable>
          }
          <Pressable onPress={pageNum === pageRange - 1 ? () => {} : nextPage} style={tw`pl-2`}>
            <AntDesign name="right" size={20} color={pageNum === pageRange - 1 ? "gray" : "white"} />
          </Pressable>
        </>
    }
    </View>
  );
}

export default Pagination;