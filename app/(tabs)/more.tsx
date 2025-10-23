import tw from '@/assets/lib/tailwind'; // <-- Your import path
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar, // <-- Added StatusBar back
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Type and Data Definitions (Unchanged) ---
type OptionDataItem = {
    title: string;
    subtitle: string;
    icon: React.ReactElement;
    screenName: string;
};
interface GridItemCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactElement;
    onPress: () => void;
}
interface SectionTitleProps {
    title: string;
}
const mainFeatures: OptionDataItem[] = [
    { title: 'নামাজের সময়সূচী', subtitle: 'আপনার বর্তমান অবস্থানের উপর ভিত্তি করে দৈনিক পাঁচ ওয়াক্ত নামাজের সঠিক সময়সূচী দেখুন। সূর্যোদয়, সূর্যাস্ত এবং ইশরাকের সময়ও অন্তর্ভুক্ত।', icon: <FontAwesome5 name="mosque" size={24} color="#94a3b8" />, screenName: '/prayer' },
    { title: 'দু\'আ লাইব্রেরি', subtitle: 'কুরআন ও সহীহ হাদিস থেকে সংকলিত বিভিন্ন পরিস্থিতি, প্রয়োজন ও আমলের জন্য মাসনুন দু\'আ সমূহ খুঁজুন ও পড়ুন। উচ্চারণ ও অর্থসহ।', icon: <MaterialCommunityIcons name="book-open-variant" size={24} color="#94a3b8" />, screenName: '/dua' },
    { title: 'কিবলা কম্পাস', subtitle: 'যেকোনো স্থান থেকে কাবা শরীফের সঠিক দিক নির্ণয় করার জন্য একটি নির্ভরযোগ্য কম্পাস। ইন্টারনেট সংযোগ ছাড়াও কাজ করে।', icon: <MaterialCommunityIcons name="compass-outline" size={24} color="#94a3b8" />, screenName: '/qibla' },
    { title: 'ডিজিটাল তাসবীহ', subtitle: 'আপনার দৈনন্দিন যিকির ও তাসবীহ গণনা করুন। প্রতিটি যিকিরের জন্য আলাদা কাউন্টার এবং পূর্বের গণনার ইতিহাস সেভ রাখার সুবিধা।', icon: <MaterialCommunityIcons name="counter" size={24} color="#94a3b8" />, screenName: '/tasbeeh' },
];
const calendarEvents: OptionDataItem[] = [
    { title: 'ইসলামিক ক্যালেন্ডার ও ইভেন্ট', subtitle: 'হিজরি ক্যালেন্ডার অনুযায়ী মাস ও তারিখ দেখুন। আসন্ন গুরুত্বপূর্ণ ইসলামিক দিবস, রোজা ও অন্যান্য ঘটনাবলী সম্পর্কে জানুন।', icon: <MaterialCommunityIcons name="calendar-star" size={24} color="#94a3b8" />, screenName: '/screen/islamic_calender' },
    { title: 'যাকাত ক্যাল্কুলেটর', subtitle: 'আপনার স্বর্ণ, রূপা, নগদ অর্থ, ব্যবসায়িক পণ্য ইত্যাদি সম্পদের উপর ভিত্তি করে প্রদেয় যাকাতের সঠিক পরিমাণ সহজেই হিসাব করুন।', icon: <FontAwesome5 name="hand-holding-usd" size={24} color="#94a3b8" />, screenName: '/zakat' },
];
const educationalContent: OptionDataItem[] = [
    { title: 'হাদিস সংকলন', subtitle: 'নবী মুহাম্মাদ (ﷺ) এর মূল্যবান বাণী ও শিক্ষা (হাদিস) থেকে জ্ঞান অর্জন করুন। বিভিন্ন বিষয়ভিত্তিক হাদিস সংকলন।', icon: <FontAwesome5 name="quran" size={24} color="#94a3b8" />, screenName: '/screen/HadithQuran' },
    { title: 'রমজান ট্র্যাকার', subtitle: 'রমজান মাসের প্রতিদিনের রোজা, তারাবীহ, কুরআন তিলাওয়াত ও অন্যান্য আমলের হিসাব রাখুন এবং আপনার অগ্রগতি পর্যবেক্ষণ করুন।', icon: <FontAwesome5 name="calendar-alt" size={24} color="#94a3b8" />, screenName: '/screen/RamadanTracker' },
    { title: 'নামাজ শিক্ষা', subtitle: 'চিত্র এবং স্পষ্ট বিবরণ সহ ধাপে ধাপে পাঁচ ওয়াক্ত নামাজের ফরজ, সুন্নাত ও নফল নামাজের সঠিক নিয়মাবলী শিখুন।', icon: <MaterialCommunityIcons name="human-handsup" size={24} color="#94a3b8" />, screenName: '/namaz' },
];
const settingsSupport: OptionDataItem[] = [
    { title: 'ইসলামিক শিশুর নাম', subtitle: 'ছেলে ও মেয়ে শিশুদের জন্য অর্থসহ হাজারো সুন্দর এবং শ্রুতিমধুর ইসলামিক নামের তালিকা থেকে পছন্দের নাম নির্বাচন করুন।', icon: <MaterialCommunityIcons name="baby-face-outline" size={24} color="#94a3b8" />, screenName: '/screen/BabyNames' },
    { title: 'হজ্জ ও উমরাহ গাইড', subtitle: 'হজ্জ ও উমরাহ পালনের প্রতিটি ধাপ, নিয়মাবলী, প্রয়োজনীয় দু\'আ এবং টিপস সহ একটি পূর্ণাঙ্গ নির্দেশিকা।', icon: <FontAwesome5 name="kaaba" size={24} color="#94a3b8" />, screenName: '/screen/HajjUmrahGuide' },
    { title: 'আমাদের সম্পর্কে', subtitle: 'এই অ্যাপটি তৈরির উদ্দেশ্য, ডেভেলপারদের তথ্য এবং যোগাযোগের ঠিকানা জানুন। আপনার মতামত প্রদান করুন।', icon: <Ionicons name="information-circle-outline" size={24} color="#94a3b8" />, screenName: '/screen/AboutUs' },
];

// --- Components (Refactored with hardcoded colors) ---

// Section Title Component
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
    <Text style={tw`text-[#94a3b8] text-sm font-bold mt-6 mb-3 uppercase`}>
        {title}
    </Text>
);

// NEW Grid Item Card Component
const GridItemCard: React.FC<GridItemCardProps> = ({
    title,
    subtitle,
    icon,
    onPress,
}) => (
    <TouchableOpacity
        onPress={onPress}
        // Hardcoded bg-card and border-border-dark
        style={tw`bg-[#1e293b] rounded-xl border border-[#334155] p-4 mb-3 shadow-md w-[48.5%] items-center`}
        activeOpacity={0.7}
    >
        {/* Icon Container */}
        <View style={tw`h-10 w-10 mb-3 items-center justify-center`}>
            {/* Hardcoded accent color '#66D2E8' */}
            {React.cloneElement(icon, { size: 28, color: '#66D2E8' })}
        </View>
        {/* Text Container */}
        <View style={tw`items-center`}>
            {/* Title: 1 line (Hardcoded text-light) */}
            <Text
                style={tw`text-[#f1f5f9] text-sm font-semibold text-center mb-1`}
                numberOfLines={1}
            >
                {title}
            </Text>
            {/* Subtitle: 2 lines (Hardcoded text-muted) */}
            <Text
                style={tw`text-[#94a3b8] text-xs text-center leading-4`}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {subtitle}
            </Text>
        </View>
    </TouchableOpacity>
);

// --- Main Screen Component (Refactored with hardcoded colors) ---
const MoreOptionsScreen: React.FC = () => {

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<OptionDataItem | null>(null);

    const handleItemPress = (item: OptionDataItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedItem(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setTimeout(() => setSelectedItem(null), 300);
    };

    const navigateFromModal = () => {
        console.log('push', selectedItem?.screenName);
        if (selectedItem?.screenName) {
            router.push(selectedItem.screenName as any);
            closeModal();
        }
    };

    // Helper to render a section
    const renderSection = (title: string, data: OptionDataItem[]) => (
        <>
            <SectionTitle title={title} />
            {/* Grid container (Hardcoded primary bg) */}
            <View style={tw`flex-row flex-wrap bg-[#0F172A] justify-between`}>
                {data.map((item, index) => (
                    <GridItemCard
                        key={item.screenName + index}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        onPress={() => handleItemPress(item)}
                    />
                ))}
                {/* Ghost item hack */}
                {data.length % 2 !== 0 && <View style={tw`w-[48.5%]`} />}
            </View>
        </>
    );

    return (
        // Hardcoded primary bg
        <SafeAreaView style={tw`flex-1 bg-[#0F172A]`}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header (Hardcoded bg-card, border-border-dark) */}
            <View
                style={tw`flex-row justify-between items-center py-3 px-4 bg-[#1e293b] border-b border-[#334155]`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={tw`p-2 min-w-[40px] items-center`}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={tw`text-white text-xl font-bold`}>সকল-অপশন</Text>
                <View style={tw`p-2 min-w-[40px]`} /> {/* Placeholder */}
            </View>

            <ScrollView contentContainerStyle={tw`px-4 pt-2.5 pb-6`}>
                {/* Render Sections */}
                {renderSection('প্রধান বৈশিষ্ট্য', mainFeatures)}
                {renderSection('ক্যালেন্ডার ও ইভেন্টস', calendarEvents)}
                {renderSection('শিক্ষামূলক বিষয়বস্তু', educationalContent)}
                {renderSection('অন্যান্য ও সেটিংস', settingsSupport)}
            </ScrollView>

            {/* --- Details Modal (Hardcoded colors) --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={tw`flex-1 justify-end bg-black/75`}
                    activeOpacity={1}
                    onPressOut={closeModal}
                >
                    <View
                        // Hardcoded bg-card
                        style={tw`bg-[#1e293b] rounded-t-2xl pt-4 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-8'
                            } max-h-[80%] shadow-lg`}
                        onStartShouldSetResponder={() => true}
                    >
                        <View
                            // Hardcoded border-border-dark
                            style={tw`flex-row justify-center items-center px-5 pb-4 border-b border-[#334155] mb-5 relative`}
                        >
                            {selectedItem?.icon &&
                                // Hardcoded accent color
                                React.cloneElement(selectedItem.icon, {
                                    size: 36,
                                    color: '#66D2E8',
                                })}
                            <TouchableOpacity
                                onPress={closeModal}
                                style={tw`p-1 absolute top-0 right-4`}
                            >
                                {/* Hardcoded muted color */}
                                <Ionicons name="close-circle" size={30} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={tw`px-6`}>
                            {/* Hardcoded text-light */}
                            <Text style={tw`text-[#f1f5f9] text-2xl font-bold text-center mb-4`}>
                                {selectedItem?.title}
                            </Text>
                            {/* Hardcoded text-muted */}
                            <Text
                                style={tw`text-[#94a3b8] text-base leading-6 text-center mb-6`}
                            >
                                {selectedItem?.subtitle}
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            // Hardcoded bg-accent
                            style={tw`bg-[#66D2E8] flex-row items-center justify-center py-3.5 rounded-xl mx-6 mt-4 shadow-md shadow-black/20`}
                            onPress={navigateFromModal}
                        >
                            {/* Hardcoded text-inverse */}
                            <Text style={tw`text-[#0A191E] text-base font-bold`}>
                                এগিয়ে যান
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                // Hardcoded text-inverse
                                color="#0A191E"
                                style={tw`ml-2`}
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* --- Modal End --- */}
        </SafeAreaView>
    );
};

export default MoreOptionsScreen;