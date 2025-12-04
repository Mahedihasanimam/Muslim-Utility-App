import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import tw from 'twrnc';

// ==========================================
// 1. CONFIGURATION
// ==========================================

const API_KEY = "AIzaSyCgDXShItpvWRaYKySQNzbBWUgNIGUhvnY"; // Your Key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Theme (Consistent with Zakat App)
const THEME = {
    bg: '#0F172A',
    card: '#1E293B',
    primary: '#FBBF24',      // Gold
    secondary: '#22D3EE',    // Cyan
    textMain: '#F8FAFC',
    textSub: '#94A3B8',
    border: '#334155',
    activeTab: '#334155',
};

// Mock Data (Initial List)
const INITIAL_NAMES = [
    { id: '1', name: 'Aayan', nameBn: 'আয়ানের', meaning: 'God\'s Gift', gender: 'boy', arabic: 'عيان', isFav: false },
    { id: '2', name: 'Inaya', nameBn: 'ইনায়া', meaning: 'Help, Care', gender: 'girl', arabic: 'عناية', isFav: true },
    { id: '3', name: 'Zayn', nameBn: 'জায়ন', meaning: 'Beauty, Grace', gender: 'boy', arabic: 'زين', isFav: false },
    { id: '4', name: 'Amara', nameBn: 'আমারা', meaning: 'Eternal life', gender: 'girl', arabic: 'أمارا', isFav: false },
    { id: '5', name: 'Rayyan', nameBn: 'রায়ান', meaning: 'Gate of Paradise', gender: 'boy', arabic: 'ريان', isFav: true },
];

// ==========================================
// 2. AI FUNCTION
// ==========================================
const generateNamesWithAI = async (preference: string, gender: string) => {
    try {
        const prompt = `
            Suggest 5 unique Islamic baby ${gender} names based on this preference: "${preference}".
            Return a JSON array ONLY. 
            Format: [{"name": "Name", "nameBn": "BanglaSpelling", "meaning": "Meaning in Bengali", "arabic": "ArabicSpelling"}]
            No markdown, just raw JSON.
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error(error);
        return null;
    }
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const BabyNames = () => {
    const router = useRouter();

    // State
    const [names, setNames] = useState(INITIAL_NAMES);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'boy' | 'girl' | 'fav'>('all');

    // AI Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGender, setAiGender] = useState<'boy' | 'girl'>('boy');
    const [loading, setLoading] = useState(false);

    // Filter Logic
    const filteredNames = names.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.meaning.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'fav') return matchesSearch && item.isFav;
        return matchesSearch && item.gender === activeTab;
    });

    // Toggle Favorite
    const toggleFav = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setNames(names.map(n => n.id === id ? { ...n, isFav: !n.isFav } : n));
    };

    // Handle AI Generation
    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setLoading(true);
        const newNames = await generateNamesWithAI(aiPrompt, aiGender);

        if (newNames) {
            const formattedNames = newNames.map((n: any, i: number) => ({
                id: Date.now().toString() + i,
                name: n.name,
                nameBn: n.nameBn,
                meaning: n.meaning,
                gender: aiGender,
                arabic: n.arabic,
                isFav: false
            }));
            setNames(prev => [...formattedNames, ...prev]); // Add to top
            setModalVisible(false);
            setAiPrompt('');
            Alert.alert("সফল", "AI ৫টি নতুন নাম যুক্ত করেছে!");
        } else {
            Alert.alert("ত্রুটি", "নাম জেনারেট করা সম্ভব হয়নি।");
        }
        setLoading(false);
    };

    // Render Item
    const renderItem = ({ item }: { item: typeof INITIAL_NAMES[0] }) => (
        <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl mb-3 border border-[${THEME.border}] flex-row justify-between items-center`}>
            <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-1`}>
                    <Text style={tw`text-[${THEME.textMain}] text-lg font-bold mr-2`}>{item.name}</Text>
                    <Ionicons
                        name={item.gender === 'boy' ? "male" : "female"}
                        size={14}
                        color={item.gender === 'boy' ? THEME.secondary : '#F472B6'}
                    />
                </View>
                <Text style={tw`text-[${THEME.textSub}] text-xs`}>{item.nameBn} • {item.meaning}</Text>
            </View>

            <View style={tw`items-end`}>
                <Text style={tw`text-[${THEME.primary}] text-lg font-bold mb-2 font-serif`}>{item.arabic}</Text>
                <TouchableOpacity onPress={() => toggleFav(item.id)}>
                    <Ionicons
                        name={item.isFav ? "heart" : "heart-outline"}
                        size={22}
                        color={item.isFav ? THEME.danger : THEME.textSub}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {/* --- HEADER --- */}
            <View style={tw`px-5 py-4 flex-row items-center justify-between border-b border-[${THEME.border}]`}>
                <View style={tw`flex-row items-center`}>
                    <TouchableOpacity onPress={() => router.back()} style={tw`p-2 bg-[${THEME.card}] rounded-full mr-3`}>
                        <Ionicons name="arrow-back" size={20} color={THEME.textMain} />
                    </TouchableOpacity>
                    <View>
                        <Text style={tw`text-[${THEME.textMain}] text-lg font-bold`}>শিশুর নাম</Text>
                        <Text style={tw`text-[${THEME.textSub}] text-[10px]`}>সুন্দর ও অর্থবহ নাম খুঁজুন</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={tw`flex-row items-center bg-[${THEME.secondary}]/20 px-3 py-2 rounded-full border border-[${THEME.secondary}]/50`}
                >
                    <MaterialCommunityIcons name="robot" size={16} color={THEME.secondary} style={tw`mr-1`} />
                    <Text style={tw`text-[${THEME.secondary}] text-xs font-bold`}>AI জেনারেটর</Text>
                </TouchableOpacity>
            </View>

            <View style={tw`flex-1 p-5`}>
                {/* --- SEARCH BAR --- */}
                <View style={tw`bg-[${THEME.card}] rounded-xl flex-row items-center px-4 py-3 mb-5 border border-[${THEME.border}]`}>
                    <Ionicons name="search" size={20} color={THEME.textSub} />
                    <TextInput
                        placeholder="নাম বা অর্থ দিয়ে খুঁজুন..."
                        placeholderTextColor={THEME.textSub}
                        style={tw`flex-1 ml-3 text-[${THEME.textMain}] font-medium`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* --- TABS --- */}
                <View style={tw`flex-row justify-between mb-5`}>
                    {[
                        { key: 'all', label: 'সব', icon: 'list' },
                        { key: 'boy', label: 'ছেলে', icon: 'male' },
                        { key: 'girl', label: 'মেয়ে', icon: 'female' },
                        { key: 'fav', label: 'প্রিয়', icon: 'heart' }
                    ].map((tab: any) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setActiveTab(tab.key);
                            }}
                            style={tw`flex-1 items-center py-2 mx-1 rounded-lg border ${activeTab === tab.key
                                    ? `bg-[${THEME.primary}] border-[${THEME.primary}]`
                                    : `bg-[${THEME.card}] border-[${THEME.border}]`
                                }`}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={16}
                                color={activeTab === tab.key ? '#0F172A' : THEME.textSub}
                            />
                            <Text style={tw`text-[10px] font-bold mt-1 ${activeTab === tab.key ? 'text-[#0F172A]' : `text-[${THEME.textSub}]`
                                }`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- LIST --- */}
                <FlatList
                    data={filteredNames}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tw`pb-20`}
                    ListEmptyComponent={
                        <View style={tw`items-center justify-center mt-20 opacity-50`}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={50} color={THEME.textSub} />
                            <Text style={tw`text-[${THEME.textSub}] mt-3`}>কোনো নাম পাওয়া যায়নি</Text>
                        </View>
                    }
                />
            </View>

            {/* --- AI GENERATOR MODAL --- */}
            <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={tw`flex-1 bg-black/80 justify-center items-center p-5`}>
                    <View style={tw`bg-[${THEME.card}] w-full rounded-2xl border border-[${THEME.primary}] p-5`}>
                        <View style={tw`flex-row justify-between items-center mb-5`}>
                            <Text style={tw`text-[${THEME.primary}] text-lg font-bold flex-row items-center`}>
                                <MaterialCommunityIcons name="sparkles" size={18} /> AI নাম জেনারেটর
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={THEME.textSub} />
                            </TouchableOpacity>
                        </View>

                        <Text style={tw`text-[${THEME.textSub}] text-xs mb-3`}>লিঙ্গ নির্বাচন করুন:</Text>
                        <View style={tw`flex-row gap-3 mb-5`}>
                            <TouchableOpacity
                                onPress={() => setAiGender('boy')}
                                style={tw`flex-1 py-3 rounded-xl border items-center flex-row justify-center gap-2 ${aiGender === 'boy' ? `bg-[${THEME.secondary}]/20 border-[${THEME.secondary}]` : `bg-[${THEME.bg}] border-[${THEME.border}]`
                                    }`}
                            >
                                <Ionicons name="male" size={16} color={aiGender === 'boy' ? THEME.secondary : THEME.textSub} />
                                <Text style={{ color: aiGender === 'boy' ? THEME.secondary : THEME.textSub }}>ছেলে</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setAiGender('girl')}
                                style={tw`flex-1 py-3 rounded-xl border items-center flex-row justify-center gap-2 ${aiGender === 'girl' ? `bg-[#F472B6]/20 border-[#F472B6]` : `bg-[${THEME.bg}] border-[${THEME.border}]`
                                    }`}
                            >
                                <Ionicons name="female" size={16} color={aiGender === 'girl' ? '#F472B6' : THEME.textSub} />
                                <Text style={{ color: aiGender === 'girl' ? '#F472B6' : THEME.textSub }}>মেয়ে</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={tw`text-[${THEME.textSub}] text-xs mb-3`}>আপনার পছন্দ লিখুন (যেমন: "M দিয়ে আধুনিক নাম"):</Text>
                        <TextInput
                            style={tw`bg-[${THEME.bg}] text-[${THEME.textMain}] p-4 rounded-xl border border-[${THEME.border}] mb-5`}
                            placeholder="এখানে লিখুন..."
                            placeholderTextColor={THEME.textSub}
                            value={aiPrompt}
                            onChangeText={setAiPrompt}
                        />

                        <TouchableOpacity
                            onPress={handleAiGenerate}
                            disabled={loading}
                            style={tw`bg-[${THEME.primary}] py-4 rounded-xl items-center`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#0F172A" />
                            ) : (
                                <Text style={tw`text-[#0F172A] font-bold`}>নাম খুঁজুন ✨</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default BabyNames;