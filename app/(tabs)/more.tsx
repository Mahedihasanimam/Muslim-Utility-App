import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';


// --- Type Definitions ---

// Type for the data structure of each option item
type OptionDataItem = {
    title: string;
    subtitle: string;
    icon: React.ReactElement;
    screenName: string;
};

// Type for the props of OptionCard component
interface OptionCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactElement;
    onPress: () => void;
}

// Type for the props of SectionTitle component
interface SectionTitleProps {
    title: string;
}

// --- Data Arrays (with types) ---

const mainFeatures: OptionDataItem[] = [
    { title: 'নামাজের সময়সূচী', subtitle: 'সম্পূর্ণ সময়সূচী', icon: <FontAwesome5 name="mosque" size={24} color="#e2e8f0" />, screenName: 'FullPrayerTimes' },
    { title: 'দু\'আ লাইব্রেরি', subtitle: 'গুরুত্বপূর্ণ দু\'আ', icon: <MaterialCommunityIcons name="book-open-variant" size={24} color="#e2e8f0" />, screenName: 'DuaLibrary' },
    { title: 'উন্নত কিবলা', subtitle: 'কিবলা কম্পাস', icon: <MaterialCommunityIcons name="compass-outline" size={24} color="#e2e8f0" />, screenName: 'AdvancedQibla' },
    { title: 'তাসবীহ হিস্ট্রি', subtitle: 'গণনার ইতিহাস', icon: <MaterialCommunityIcons name="history" size={24} color="#e2e8f0" />, screenName: 'TasbeehHistory' },
];

const calendarEvents: OptionDataItem[] = [
    { title: 'আসন্ন ইভেন্ট', subtitle: 'ইসলামিক ঘটনাবলী', icon: <MaterialCommunityIcons name="calendar-star" size={24} color="#e2e8f0" />, screenName: 'UpcomingEvents' },
    { title: 'যাকাত ক্যালকুলেটর', subtitle: 'যাকাত আদায়', icon: <FontAwesome5 name="hand-holding-usd" size={24} color="#e2e8f0" />, screenName: 'ZakatCollection' },
];

const educationalContent: OptionDataItem[] = [
    { title: 'হাদিস ও কুরআন', subtitle: 'ইসলামিক জ্ঞান', icon: <FontAwesome5 name="quran" size={24} color="#e2e8f0" />, screenName: 'HadithQuran' },
    { title: 'রমজান ট্র্যাকার', subtitle: 'রমজানের প্রস্তুতি', icon: <FontAwesome5 name="calendar-alt" size={24} color="#e2e8f0" />, screenName: 'RamadanTracker' },
];

const settingsSupport: OptionDataItem[] = [
    { title: 'শিশুদের নাম', subtitle: 'ইসলামিক নাম', icon: <MaterialCommunityIcons name="baby-face-outline" size={24} color="#e2e8f0" />, screenName: 'BabyNames' },
    { title: 'হজ্জ ও উমরাহ গাইড', subtitle: 'সম্পূর্ণ নির্দেশিকা', icon: <FontAwesome5 name="kaaba" size={24} color="#e2e8f0" />, screenName: 'HajjUmrahGuide' },
    { title: 'অ্যাপ সেটিংস', subtitle: 'সেটিংস', icon: <Ionicons name="star-outline" size={24} color="#e2e8f0" />, screenName: 'AppSettings' },
    { title: 'আমাদের সম্পর্কে', subtitle: 'পরিচয়', icon: <Feather name="settings" size={24} color="#e2e8f0" />, screenName: 'AboutUs' },
];

// --- Components (with types) ---

// অপশন কার্ড কম্পোনেন্ট
const OptionCard: React.FC<OptionCardProps> = ({ title, subtitle, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} style={tw`bg-slate-200/10 w-[48%] p-4 rounded-xl mb-3 items-start`}>
        {icon}
        <Text style={tw`text-white font-semibold mt-3 text-base`}>{title}</Text>
        <Text style={tw`text-slate-400 text-xs`}>{subtitle}</Text>
    </TouchableOpacity>
);

// সেকশন টাইটেল কম্পোনেন্ট
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
    <Text style={tw`text-white text-lg font-bold my-3`}>{title}</Text>
);

// --- Main Screen Component ---

const MoreOptionsScreen: React.FC = () => {
    // Typed navigation hook
    const navigation = useNavigation<NavigationProp<string>>();

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-900`}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={tw`px-4`}>
                {/* হেডার */}
                <View style={tw`flex-row justify-between items-center py-4`}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={tw`text-white text-xl font-bold`}>আরও বিকল্প</Text>
                    <TouchableOpacity>
                        <Ionicons name="menu" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {/* প্রধান বৈশিষ্ট্য */}
                <SectionTitle title="প্রধান বৈশিষ্ট্য" />
                <View style={tw`flex-row flex-wrap justify-between`}>
                    {mainFeatures.map((item) => (
                        <OptionCard key={item.title} {...item} onPress={() => navigation.navigate(item.screenName as any)} />
                    ))}
                </View>

                {/* ক্যালেন্ডার ও ইভেন্টস */}
                <SectionTitle title="ক্যালেন্ডার ও ইভেন্টস" />
                <View style={tw`flex-row flex-wrap justify-between`}>
                    {calendarEvents.map((item) => (
                        <OptionCard key={item.title} {...item} onPress={() => navigation.navigate(item.screenName as any)} />
                    ))}
                </View>

                {/* শিক্ষামূলক বিষয়বস্তু */}
                <SectionTitle title="শিক্ষামূলক বিষয়বস্তু" />
                <View style={tw`flex-row flex-wrap justify-between`}>
                    {educationalContent.map((item) => (
                        <OptionCard key={item.title} {...item} onPress={() => navigation.navigate(item.screenName as any)} />
                    ))}
                </View>

                {/* সেটিংস ও সাপোর্ট */}
                <SectionTitle title="সেটিংস ও সাপোর্ট" />
                <View style={tw`flex-row flex-wrap justify-between`}>
                    {settingsSupport.map((item) => (
                        <OptionCard key={item.title} {...item} onPress={() => navigation.navigate(item.screenName as any)} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MoreOptionsScreen;
