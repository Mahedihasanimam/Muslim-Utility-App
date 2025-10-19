import { useRouter } from 'expo-router'; // Assuming you're using expo-router for navigation
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

const FirstOnboarding = () => {
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-white items-center justify-between  pt-safe`}>

      {/* Image Container */}
      <View style={tw`flex-4 w-full items-center justify-center`}>
        <Image
          source={require('@/assets/images/onboardimg1.png')} // Adjust path as needed
          style={tw`w-full h-full resize-contain`}
        />
      </View>

      {/* Text Content */}
      <View style={tw`flex-2 items-center text-center px-4 pt-4`}>
        <Text style={tw`text-[25px] font-extrabold text-[#224880] mb-2 pt-2 text-center`}>
          আপনার আধ্যাত্মিক যাত্রাকে আলিঙ্গন করুন
        </Text>
        <Text style={tw`text-base text-[#7684A0] text-center leading-6`}>
          আপনার দৈনন্দিন ঈমান ও আত্মউন্নতির দিকনির্দেশনা।
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/secondOnboarding')}
          style={tw`bg-[#224880] h-11 w-30 rounded-md flex flex-row justify-center items-center self-center mt-4 mb-6`}
          activeOpacity={0.8}
        >
          <Text style={tw`text-white text-lg font-bold`}>
            পরবর্তী
          </Text>
        </TouchableOpacity>
      </View>


      {/* Navigation Button */}

    </View>
  );
};

export default FirstOnboarding;