import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import tw from 'twrnc';

// ==========================================
// 1. THEME CONFIGURATION
// ==========================================
const THEME = {
    bg: '#0F172A',           // Deep Navy
    card: '#1E293B',         // Slate 800
    primary: '#FBBF24',      // Gold
    secondary: '#22D3EE',    // Cyan
    textMain: '#F8FAFC',     // White/Slate 50
    textSub: '#94A3B8',      // Gray/Slate 400
    border: '#334155',       // Slate 700
};

// App Info
const APP_INFO = {
    name: "IslamicLifeAI",
    version: "1.0.0",
    slogan: "আপনার দ্বীনী জীবনের ডিজিটাল সঙ্গী",
    description: "IslamicLifeAI হলো একটি অত্যাধুনিক ইসলামিক অ্যাপ যা আর্টিফিশিয়াল ইন্টেলিজেন্স ব্যবহার করে আপনার দৈনন্দিন ইবাদত, যাকাত হিসাব এবং হজ্জ-ওমরাহ পালনে সহায়তা করে।"
};

// ==========================================
// 2. COMPONENT
// ==========================================

const AboutUs = () => {
    const router = useRouter();

    const handleLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {/* --- HEADER --- */}
            <View style={tw`px-5 py-4 flex-row items-center border-b border-[${THEME.border}] bg-[${THEME.card}]`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}] mr-3`}>
                    <Ionicons name="arrow-back" size={20} color={THEME.textMain} />
                </TouchableOpacity>
                <Text style={tw`text-[${THEME.textMain}] text-lg font-bold`}>আমাদের সম্পর্কে</Text>
            </View>

            <ScrollView contentContainerStyle={tw`p-5 pb-20`} showsVerticalScrollIndicator={false}>

                {/* --- HERO SECTION (Logo & Name) --- */}
                <View style={tw`items-center py-8 mb-6`}>
                    <View style={tw`w-24 h-24 bg-[${THEME.card}] rounded-3xl border-2 border-[${THEME.primary}] items-center justify-center mb-4 shadow-lg shadow-amber-500/20`}>
                        <MaterialCommunityIcons name="mosque" size={48} color={THEME.primary} />
                    </View>
                    <Text style={tw`text-[${THEME.primary}] text-2xl font-bold tracking-wider`}>{APP_INFO.name}</Text>
                    <Text style={tw`text-[${THEME.textSub}] text-xs mt-1 tracking-widest uppercase`}>Version {APP_INFO.version}</Text>
                    <View style={tw`bg-[${THEME.secondary}]/10 px-3 py-1 rounded-full mt-3 border border-[${THEME.secondary}]/30`}>
                        <Text style={tw`text-[${THEME.secondary}] text-xs font-bold`}>{APP_INFO.slogan}</Text>
                    </View>
                </View>

                {/* --- DESCRIPTION CARD --- */}
                <View style={tw`bg-[${THEME.card}] p-5 rounded-2xl border border-[${THEME.border}] mb-6`}>
                    <View style={tw`flex-row items-center mb-3`}>
                        <Ionicons name="sparkles" size={18} color={THEME.secondary} style={tw`mr-2`} />
                        <Text style={tw`text-[${THEME.textMain}] font-bold text-base`}>লক্ষ্য ও উদ্দেশ্য</Text>
                    </View>
                    <Text style={tw`text-[${THEME.textSub}] leading-6 text-sm text-justify`}>
                        {APP_INFO.description}
                    </Text>
                </View>

                {/* --- FEATURES GRID --- */}
                <Text style={tw`text-[${THEME.textMain}] font-bold mb-4 ml-1`}>মূল ফিচারসমূহ</Text>
                <View style={tw`flex-row flex-wrap justify-between mb-6`}>
                    {[
                        { label: 'AI যাকাত', icon: 'calculator-variant', },
                        { label: 'হজ গাইড', icon: 'kaaba' },
                        { label: 'নামকয়ণ', icon: 'baby-face-outline' },
                        { label: 'AI চ্যাট', icon: 'robot-happy-outline' },
                    ].map((item, index) => (
                        <View key={index} style={tw`w-[48%] bg-[${THEME.card}] p-4 rounded-xl border border-[${THEME.border}] mb-3 flex-row items-center`}>
                            <MaterialCommunityIcons name={item.icon as any} size={20} color={THEME.primary} />
                            <Text style={tw`text-[${THEME.textMain}] ml-3 font-medium text-sm`}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* --- CONTACT & SOCIALS --- */}
                <View style={tw`bg-[${THEME.card}] rounded-2xl border border-[${THEME.border}] overflow-hidden mb-6`}>
                    <TouchableOpacity
                        onPress={() => handleLink('https://github.com/Mahedihasanimam')}
                        style={tw`p-4 flex-row items-center border-b border-[${THEME.border}]`}
                    >
                        <View style={tw`w-8 h-8 rounded-full bg-[#0F172A] items-center justify-center mr-3`}>
                            <Ionicons name="logo-github" size={18} color={THEME.textMain} />
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-[${THEME.textMain}] font-bold`}>Github</Text>
                            <Text style={tw`text-[${THEME.textSub}] text-xs`}>সোর্স কোড দেখুন</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={THEME.textSub} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleLink('mailto:mdmehedihasen678@gmail.com')}
                        style={tw`p-4 flex-row items-center border-b border-[${THEME.border}]`}
                    >
                        <View style={tw`w-8 h-8 rounded-full bg-[#0F172A] items-center justify-center mr-3`}>
                            <Ionicons name="mail" size={18} color={THEME.secondary} />
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-[${THEME.textMain}] font-bold`}>ইমেইল করুন</Text>
                            <Text style={tw`text-[${THEME.textSub}] text-xs`}>মতামত বা অভিযোগ জানান</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={THEME.textSub} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleLink('https://islamiclife.ai')}
                        style={tw`p-4 flex-row items-center`}
                    >
                        <View style={tw`w-8 h-8 rounded-full bg-[#0F172A] items-center justify-center mr-3`}>
                            <Ionicons name="globe" size={18} color={THEME.primary} />
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-[${THEME.textMain}] font-bold`}>ওয়েবসাইট</Text>
                            <Text style={tw`text-[${THEME.textSub}] text-xs`}>আমাদের সম্পর্কে আরো জানুন</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={THEME.textSub} />
                    </TouchableOpacity>
                </View>

                {/* --- DUA SECTION (Footer) --- */}
                <View style={tw`items-center mt-4`}>
                    <Text style={tw`text-[${THEME.textSub}] text-center text-xs mb-1`}>
                        "হে আমাদের রব! আমাদের জ্ঞান বৃদ্ধি করে দিন।"
                    </Text>
                    <Text style={tw`text-[${THEME.border}] text-[10px]`}>
                        Developed with ❤️ & ☕ by YourName
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default AboutUs;