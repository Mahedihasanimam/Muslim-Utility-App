import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import tw from 'twrnc';

// JSON ফাইল ইম্পোর্ট করুন
import quranicDuasData from '../../assets/dua.json';

// LayoutAnimation for expand/collapse animations
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// আপনার কালার প্যালেট
const PRIMARY_DARK_COLOR = '#0F172A';
const ACCENT_COLOR = '#69D2B7';
const TEXT_LIGHT = '#F8FAFC';
const TEXT_MUTED = '#CBD5E1';
const CARD_BG_COLOR = '#1E293B';
const BORDER_COLOR = '#334155';

interface DuaItem {
    id: string;
    arabic: string;
    banglaPronunciation: string;
    banglaMeaning: string;
    source: string;
}

interface DuaCategory {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    duas: DuaItem[];
} // আপনার JSON ফাইলের সঠিক পাথ দিন

// ডেটা টাইপ নিশ্চিত করার জন্য
const quranicDuas: DuaCategory[] = quranicDuasData as DuaCategory[];


const DuaScreen = () => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const toggleCategory = (title: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCategory(expandedCategory === title ? null : title);
    };

    const renderDuaItem = (dua: DuaItem) => (
        <View key={dua.id} style={tw`mb-5 p-4 rounded-lg bg-[${PRIMARY_DARK_COLOR}] border border-[${BORDER_COLOR}]`}>
            <Text style={tw`text-right text-2xl font-arabic text-[${TEXT_LIGHT}] mb-3`}>
                {dua.arabic}
            </Text>
            <Text style={tw`text-base text-[${TEXT_MUTED}] mb-2`}>
                <Text style={tw`font-semibold text-[${ACCENT_COLOR}]`}>উচ্চারণ:</Text> {dua.banglaPronunciation}
            </Text>
            <Text style={tw`text-base text-[${TEXT_MUTED}] mb-3`}>
                <Text style={tw`font-semibold text-[${ACCENT_COLOR}]`}>অর্থ:</Text> {dua.banglaMeaning}
            </Text>
            <Text style={tw`text-sm italic text-[${TEXT_MUTED}] text-right`}>
                সূত্র: {dua.source}
            </Text>
            {/* কপি বাটন এখানে যোগ করা যাবে */}
        </View>
    );

    return (
        <View style={tw`flex-1 bg-[${PRIMARY_DARK_COLOR}]`}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DARK_COLOR} />

            {/* Header Section */}
            <View style={tw`pt-16 pb-6 px-6 bg-[${CARD_BG_COLOR}] rounded-b-3xl shadow-lg`}>
                <Text style={tw`text-3xl font-bold text-center text-[${TEXT_LIGHT}]`}>
                    কুরআনের দুআ
                </Text>
                <Text style={tw`text-center text-[${TEXT_MUTED}] text-base mt-2`}>
                    আল্লাহর কালাম থেকে গুরুত্বপূর্ণ প্রার্থনা
                </Text>
            </View>

            <ScrollView contentContainerStyle={tw`py-6 px-5`} showsVerticalScrollIndicator={false}>
                {quranicDuas.map((category) => (
                    <View key={category.title} style={tw`mb-5 bg-[${CARD_BG_COLOR}] rounded-xl shadow-md border border-[${BORDER_COLOR}] overflow-hidden`}>
                        <TouchableOpacity
                            style={tw`flex-row items-center justify-between p-4`}
                            onPress={() => toggleCategory(category.title)}
                            activeOpacity={0.7}
                        >
                            <View style={tw`flex-row items-center`}>
                                <MaterialCommunityIcons name={category.icon} size={26} color={ACCENT_COLOR} style={tw`mr-3`} />
                                <Text style={tw`text-xl font-bold text-[${TEXT_LIGHT}]`}>
                                    {category.title}
                                </Text>
                            </View>
                            <AntDesign
                                name={expandedCategory === category.title ? "up" : "down"}
                                size={20}
                                color={TEXT_MUTED}
                            />
                        </TouchableOpacity>

                        {expandedCategory === category.title && (
                            <View style={tw`p-4 border-t border-[${BORDER_COLOR}]`}>
                                {category.duas.map((dua) => renderDuaItem(dua))}
                            </View>
                        )}
                    </View>
                ))}
                <View style={tw`h-10`}></View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // ভবিষ্যতে যদি কোনো কাস্টম স্টাইল লাগে, এখানে যোগ করা যাবে
});

export default DuaScreen;