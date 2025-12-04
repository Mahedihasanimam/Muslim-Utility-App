import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import tw from 'twrnc';

// --- থিম কনফিগারেশন (Islamic Tech Vibe) ---
const THEME = {
    bg: '#0F172A',           // Deep Navy
    card: '#1E293B',         // Slate 800
    primary: '#FBBF24',      // Amber/Gold (Islamic)
    secondary: '#22D3EE',    // Cyan (Tech/AI)
    textMain: '#F8FAFC',     // Slate 50
    textSub: '#94A3B8',      // Slate 400
    border: '#334155',       // Slate 700
    borderHighlight: 'rgba(34, 211, 238, 0.3)', // Cyan glow
};

// --- ডেটা টাইপ ---
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

// --- ডেটা ---
const mainFeatures: OptionDataItem[] = [
    { title: 'নামাজের সময়সূচী', subtitle: 'আপনার বর্তমান অবস্থানের উপর ভিত্তি করে সঠিক সময়সূচী।', icon: <FontAwesome5 name="mosque" size={24} />, screenName: '/prayer' },
    { title: 'দু\'আ লাইব্রেরি', subtitle: 'কুরআন ও হাদিস থেকে সংকলিত মাসনুন দু\'আ সমূহ।', icon: <MaterialCommunityIcons name="book-open-variant" size={24} />, screenName: '/dua' },
    { title: 'কিবলা কম্পাস', subtitle: 'কাবা শরীফের সঠিক দিক নির্ণয় করার কম্পাস।', icon: <MaterialCommunityIcons name="compass-outline" size={24} />, screenName: '/qibla' },
    { title: 'ডিজিটাল তাসবীহ', subtitle: 'আপনার দৈনন্দিন যিকির ও তাসবীহ গণনা করুন।', icon: <MaterialCommunityIcons name="counter" size={24} />, screenName: '/tasbeeh' },
];
const calendarEvents: OptionDataItem[] = [
    { title: 'ইসলামিক ক্যালেন্ডার', subtitle: 'হিজরি ক্যালেন্ডার ও গুরুত্বপূর্ণ দিবস।', icon: <MaterialCommunityIcons name="calendar-star" size={24} />, screenName: '/screen/islamic_calender' },
    { title: 'যাকাত ক্যাল্কুলেটর', subtitle: 'সম্পদের উপর ভিত্তি করে যাকাতের সঠিক হিসাব।', icon: <FontAwesome5 name="hand-holding-usd" size={24} />, screenName: '/zakat' },
];
const educationalContent: OptionDataItem[] = [
    { title: 'হাদিস সংকলন', subtitle: 'নবী (ﷺ) এর মূল্যবান বাণী ও শিক্ষা।', icon: <FontAwesome5 name="quran" size={24} />, screenName: '/screen/HadithQuran' },
    { title: 'রমজান ট্র্যাকার', subtitle: 'রোজা, তারাবীহ ও আমলের হিসাব রাখুন।', icon: <FontAwesome5 name="calendar-alt" size={24} />, screenName: '/screen/RamadanTracker' },
    { title: 'নামাজ শিক্ষা', subtitle: 'চিত্রসহ পাঁচ ওয়াক্ত নামাজের সঠিক নিয়মাবলী।', icon: <MaterialCommunityIcons name="human-handsup" size={24} />, screenName: '/namaz' },
];
const settingsSupport: OptionDataItem[] = [
    { title: 'শিশুর নাম', subtitle: 'অর্থসহ সুন্দর ইসলামিক নামের তালিকা।', icon: <MaterialCommunityIcons name="baby-face-outline" size={24} />, screenName: '/screen/BabyNames' },
    { title: 'হজ্জ ও উমরাহ', subtitle: 'হজ্জ ও উমরাহ পালনের পূর্ণাঙ্গ গাইড।', icon: <FontAwesome5 name="kaaba" size={24} />, screenName: '/screen/HajjUmrahGuide' },
    { title: 'আমাদের সম্পর্কে', subtitle: 'ডেভেলপার তথ্য এবং যোগাযোগ।', icon: <Ionicons name="information-circle-outline" size={24} />, screenName: '/screen/AboutUs' },
];

// --- কম্পোনেন্টস ---

// সেকশন টাইটেল (Gold Color for Islamic feel)
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
    <View style={tw`flex-row items-center mt-6 mb-3`}>
        <View style={tw`w-1 h-4 bg-[${THEME.primary}] rounded-full mr-2`} />
        <Text style={tw`text-[${THEME.textSub}] text-xs font-bold uppercase tracking-wider`}>
            {title}
        </Text>
    </View>
);

// গ্রিড কার্ড (Dark Tech Theme)
const GridItemCard: React.FC<GridItemCardProps> = ({
    title,
    subtitle,
    icon,
    onPress,
}) => (
    <TouchableOpacity
        onPress={onPress}
        style={tw`bg-[${THEME.card}] rounded-2xl border border-[${THEME.border}] p-4 mb-3 w-[48.5%] items-center shadow-sm relative overflow-hidden`}
        activeOpacity={0.7}
    >
        {/* Top Highlight decoration */}
        <View style={tw`absolute top-0 left-0 right-0 h-1 bg-[${THEME.border}] opacity-20`} />

        {/* Icon Container with subtle glow */}
        <View style={tw`h-12 w-12 mb-3 items-center justify-center bg-[${THEME.bg}] rounded-full border border-[${THEME.borderHighlight}] shadow-sm`}>
            {React.cloneElement(icon, { size: 22, color: THEME.secondary })}
        </View>

        {/* Text Container */}
        <View style={tw`items-center`}>
            <Text
                style={tw`text-[${THEME.textMain}] text-xs font-bold text-center mb-1.5`}
                numberOfLines={1}
            >
                {title}
            </Text>
            <Text
                style={tw`text-[${THEME.textSub}] text-[10px] text-center leading-4`}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {subtitle}
            </Text>
        </View>
    </TouchableOpacity>
);

// --- মেইন স্ক্রিন ---
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
        if (selectedItem?.screenName) {
            router.push(selectedItem.screenName as any);
            closeModal();
        }
    };

    const renderSection = (title: string, data: OptionDataItem[]) => (
        <>
            <SectionTitle title={title} />
            <View style={tw`flex-row flex-wrap justify-between`}>
                {data.map((item, index) => (
                    <GridItemCard
                        key={item.screenName + index}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        onPress={() => handleItemPress(item)}
                    />
                ))}
                {data.length % 2 !== 0 && <View style={tw`w-[48.5%]`} />}
            </View>
        </>
    );

    return (
        <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {/* Header */}
            <View style={tw`flex-row justify-between items-center py-4 px-5 bg-[${THEME.card}] border-b border-[${THEME.border}]`}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}]`}
                >
                    <Ionicons name="arrow-back" size={20} color={THEME.textMain} />
                </TouchableOpacity>
                <Text style={tw`text-[${THEME.textMain}] text-lg font-bold tracking-wide`}>সকল অপশন</Text>
                <View style={tw`w-10`} />
            </View>

            <ScrollView contentContainerStyle={tw`px-5 pt-2 pb-10`}>
                {renderSection('প্রধান বৈশিষ্ট্য', mainFeatures)}
                {renderSection('ক্যালেন্ডার ও ইভেন্টস', calendarEvents)}
                {renderSection('শিক্ষামূলক', educationalContent)}
                {renderSection('অন্যান্য', settingsSupport)}
            </ScrollView>

            {/* --- Details Modal --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={tw`flex-1 justify-center items-center bg-black/80`}
                    activeOpacity={1}
                    onPressOut={closeModal}
                >
                    <View
                        style={tw`w-10/12 bg-[${THEME.card}] rounded-3xl p-6 border border-[${THEME.borderHighlight}] shadow-2xl relative`}
                        onStartShouldSetResponder={() => true}
                    >
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={closeModal}
                            style={tw`absolute top-4 right-4 p-1 z-10 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}]`}
                        >
                            <Ionicons name="close" size={20} color={THEME.textSub} />
                        </TouchableOpacity>

                        {/* Icon Header */}
                        <View style={tw`items-center mt-2 mb-4`}>
                            <View style={tw`h-20 w-20 bg-[${THEME.bg}] rounded-full items-center justify-center border-2 border-[${THEME.secondary}] shadow-lg mb-4`}>
                                {selectedItem?.icon &&
                                    React.cloneElement(selectedItem.icon, {
                                        size: 40,
                                        color: THEME.secondary,
                                    })}
                            </View>
                            <Text style={tw`text-[${THEME.primary}] text-xl font-bold text-center mb-2`}>
                                {selectedItem?.title}
                            </Text>
                        </View>

                        {/* Content */}
                        <ScrollView style={tw`max-h-40 mb-6`}>
                            <Text style={tw`text-[${THEME.textSub}] text-sm leading-6 text-center`}>
                                {selectedItem?.subtitle}
                            </Text>
                        </ScrollView>

                        {/* Action Button */}
                        <TouchableOpacity
                            style={tw`bg-[${THEME.secondary}] flex-row items-center justify-center py-3.5 rounded-xl w-full shadow-lg shadow-cyan-500/20`}
                            onPress={navigateFromModal}
                        >
                            <Text style={tw`text-[#0F172A] text-sm font-bold uppercase tracking-wide`}>
                                ওপেন করুন
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={18}
                                color="#0F172A"
                                style={tw`ml-2`}
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

export default MoreOptionsScreen;