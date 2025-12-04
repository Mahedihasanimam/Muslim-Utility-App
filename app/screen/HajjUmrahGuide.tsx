import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import tw from 'twrnc';

// ==========================================
// 1. CONFIGURATION & DATA
// ==========================================

const API_KEY = "AIzaSyCgDXShItpvWRaYKySQNzbBWUgNIGUhvnY"; // Your Key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Theme
const THEME = {
    bg: '#0F172A',
    card: '#1E293B',
    primary: '#FBBF24',      // Gold (Hajj vibe)
    secondary: '#22D3EE',    // Cyan (AI vibe)
    textMain: '#F8FAFC',
    textSub: '#94A3B8',
    border: '#334155',
};

// Static Data for Guides
const GUIDES = {
    umrah: [
        {
            id: '1', title: 'ইহরাম (Ihram)', subtitle: 'প্রস্তুতি ও নিয়ত', icon: 'tshirt',
            details: 'মিকাত অতিক্রম করার পূর্বে গোসল করে সেলাইবিহীন ২ টুকরো সাদা কাপড় পরিধান করুন।',
            dua: 'লাব্বাইক আল্লাহুম্মা ওমরাহ',
            type: 'ফরজ'
        },
        {
            id: '2', title: 'তাওয়াফ (Tawaf)', subtitle: 'কাবা ঘর প্রদক্ষিণ', icon: 'sync',
            details: 'হাজরে আসওয়াদ থেকে শুরু করে ৭ বার কাবা শরীফ প্রদক্ষিণ করুন।',
            dua: 'বিসমিল্লাহি আল্লাহু আকবার',
            type: 'ফরজ'
        },
        {
            id: '3', title: 'সাঈ (Sa\'i)', subtitle: 'সাফা-মারওয়া দৌড়ানো', icon: 'walking',
            details: 'সাফা ও মারওয়া পাহাড়ের মাঝে ৭ বার আসা-যাওয়া করুন।',
            dua: 'ইন্নাস সাফা ওয়াল মারওয়াতা...',
            type: 'ওয়াজিব'
        },
        {
            id: '4', title: 'হলক/কছর (Halq)', subtitle: 'চুল মুন্ডানো', icon: 'cut',
            details: 'পুরুষরা মাথা মুন্ডাবেন বা চুল ছোট করবেন। মহিলারা আঙুলের কর পরিমাণ চুল কাটবেন।',
            dua: null,
            type: 'ওয়াজিব'
        },
    ],
    hajj: [
        { id: '1', title: 'ইহরাম', subtitle: '৮ জিলহজ', icon: 'tshirt', type: 'ফরজ' },
        { id: '2', title: 'মিনা গমন', subtitle: '৮ জিলহজ (যোহর-ফজর)', icon: 'campground', type: 'সুন্নাত' },
        { id: '3', title: 'আরাফাতের ময়দান', subtitle: '৯ জিলহজ (মূল হজ)', icon: 'users', type: 'ফরজ' },
        { id: '4', title: 'মুজদালিফা', subtitle: '৯ জিলহজ রাত', icon: 'moon', type: 'ওয়াজিব' },
        { id: '5', title: 'জামারায় পাথর নিক্ষেপ', subtitle: '১০ জিলহজ', icon: 'cubes', type: 'ওয়াজিব' },
        { id: '6', title: 'কোরবানি', subtitle: '১০ জিলহজ', icon: 'paw', type: 'ওয়াজিব' },
        { id: '7', title: 'তাওয়াফ আল-ইফাদাহ', subtitle: '১০-১২ জিলহজ', icon: 'kaaba', type: 'ফরজ' },
    ]
};

// ==========================================
// 2. AI HELPER
// ==========================================
const askHajjGuide = async (question: string) => {
    try {
        const prompt = `
            Act as an expert Islamic Scholar/Guide for Hajj & Umrah.
            Answer this question in simple Bengali: "${question}".
            Keep the answer concise (max 3-4 sentences).
            If it's about a penalty (Dam), specify clearly.
        `;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return "দুঃখিত, বর্তমানে সংযোগ নেই।";
    }
};

// ==========================================
// 3. COMPONENT
// ==========================================

const HajjUmrahGuide = () => {
    const router = useRouter();

    // State
    const [mode, setMode] = useState<'umrah' | 'hajj'>('umrah');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // AI Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [question, setQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const toggleExpand = (id: string) => {
        Haptics.selectionAsync();
        setExpandedId(expandedId === id ? null : id);
    };

    const handleAskAi = async () => {
        if (!question.trim()) return;
        setLoading(true);
        setAiAnswer(null);
        const answer = await askHajjGuide(question);
        setAiAnswer(answer);
        setLoading(false);
    };

    const renderStep = ({ item, index }: { item: any, index: number }) => {
        const isLast = index === GUIDES[mode].length - 1;
        const isExpanded = expandedId === item.id;

        return (
            <View style={tw`flex-row`}>
                {/* Timeline Line & Dot */}
                <View style={tw`items-center mr-4 w-8`}>
                    <View style={tw`w-8 h-8 rounded-full bg-[${THEME.card}] border-2 border-[${THEME.primary}] items-center justify-center z-10`}>
                        <FontAwesome5 name={item.icon} size={12} color={THEME.primary} />
                    </View>
                    {!isLast && <View style={tw`w-[2px] flex-1 bg-[${THEME.border}] my-1`} />}
                </View>

                {/* Content Card */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => toggleExpand(item.id)}
                    style={tw`flex-1 mb-6 bg-[${THEME.card}] rounded-xl border border-[${THEME.border}] overflow-hidden`}
                >
                    <View style={tw`p-4 flex-row justify-between items-center`}>
                        <View>
                            <View style={tw`flex-row items-center gap-2 mb-1`}>
                                <Text style={tw`text-[${THEME.textMain}] font-bold text-base`}>{item.title}</Text>
                                <View style={tw`bg-[${THEME.primary}]/10 px-2 py-0.5 rounded text-[10px]`}>
                                    <Text style={tw`text-[${THEME.primary}] text-[10px] font-bold`}>{item.type}</Text>
                                </View>
                            </View>
                            <Text style={tw`text-[${THEME.textSub}] text-xs`}>{item.subtitle}</Text>
                        </View>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={THEME.textSub}
                        />
                    </View>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <View style={tw`px-4 pb-4 pt-0`}>
                            <View style={tw`h-[1px] bg-[${THEME.border}] mb-3`} />

                            {item.details && (
                                <Text style={tw`text-[${THEME.textMain}] text-sm leading-5 mb-3`}>
                                    {item.details}
                                </Text>
                            )}

                            {item.dua && (
                                <View style={tw`bg-[${THEME.bg}] p-3 rounded-lg border border-[${THEME.border}] border-dashed`}>
                                    <Text style={tw`text-[${THEME.secondary}] text-xs font-bold mb-1`}>🤲 দোয়া:</Text>
                                    <Text style={tw`text-[${THEME.textMain}] text-sm italic`}>"{item.dua}"</Text>
                                </View>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {/* --- HEADER --- */}
            <View style={tw`px-5 py-4 flex-row items-center justify-between border-b border-[${THEME.border}] bg-[${THEME.card}]`}>
                <View style={tw`flex-row items-center`}>
                    <TouchableOpacity onPress={() => router.back()} style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}] mr-3`}>
                        <Ionicons name="arrow-back" size={20} color={THEME.textMain} />
                    </TouchableOpacity>
                    <View>
                        <Text style={tw`text-[${THEME.primary}] text-lg font-bold`}>হজ ও ওমরাহ গাইড</Text>
                        <Text style={tw`text-[${THEME.textSub}] text-[10px]`}>ধাপে ধাপে সম্পন্ন করুন</Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="qrcode" size={28} color={THEME.primary} />
            </View>

            {/* --- TOGGLE TABS --- */}
            <View style={tw`p-5`}>
                <View style={tw`flex-row bg-[${THEME.card}] p-1 rounded-xl border border-[${THEME.border}]`}>
                    <TouchableOpacity
                        onPress={() => { setMode('umrah'); Haptics.selectionAsync(); }}
                        style={tw`flex-1 py-2 items-center rounded-lg ${mode === 'umrah' ? `bg-[${THEME.secondary}]` : 'bg-transparent'}`}
                    >
                        <Text style={tw`font-bold ${mode === 'umrah' ? 'text-[#0F172A]' : `text-[${THEME.textSub}]`}`}>ওমরাহ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setMode('hajj'); Haptics.selectionAsync(); }}
                        style={tw`flex-1 py-2 items-center rounded-lg ${mode === 'hajj' ? `bg-[${THEME.primary}]` : 'bg-transparent'}`}
                    >
                        <Text style={tw`font-bold ${mode === 'hajj' ? 'text-[#0F172A]' : `text-[${THEME.textSub}]`}`}>হজ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- TIMELINE LIST --- */}
            <FlatList
                data={GUIDES[mode]}
                keyExtractor={item => item.id}
                renderItem={renderStep}
                contentContainerStyle={tw`px-5 pb-24`}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={tw`mb-4 flex-row items-center`}>
                        <Ionicons name="flag" size={16} color={THEME.textSub} style={tw`mr-2`} />
                        <Text style={tw`text-[${THEME.textSub}] text-xs uppercase tracking-widest`}>
                            {mode === 'hajj' ? 'হজের কার্যক্রম শুরু' : 'ওমরাহ কার্যক্রম শুরু'}
                        </Text>
                    </View>
                }
            />

            {/* --- AI FLOATING BUTTON --- */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={tw`absolute bottom-6 right-5 bg-[${THEME.card}] border border-[${THEME.secondary}] p-4 rounded-full shadow-lg flex-row items-center gap-2`}
            >
                <MaterialCommunityIcons name="robot-confused" size={24} color={THEME.secondary} />
                <Text style={tw`text-[${THEME.secondary}] font-bold mr-1`}>মাসআলা জিজ্ঞাসা করুন</Text>
            </TouchableOpacity>

            {/* --- AI MODAL --- */}
            <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={tw`flex-1 bg-black/80 justify-end`}>
                    <View style={tw`bg-[${THEME.card}] rounded-t-3xl border-t border-[${THEME.border}] p-5 h-[60%]`}>

                        <View style={tw`flex-row justify-between items-center mb-5`}>
                            <Text style={tw`text-[${THEME.textMain}] text-lg font-bold`}>AI মুয়াল্লিম (সহায়িকা)</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color={THEME.danger} />
                            </TouchableOpacity>
                        </View>

                        <Text style={tw`text-[${THEME.textSub}] text-xs mb-3`}>
                            হজ বা ওমরাহ সম্পর্কিত যেকোনো প্রশ্ন, ভুল-ত্রুটি বা দম (Dam) সম্পর্কে জিজ্ঞাসা করুন:
                        </Text>

                        <View style={tw`flex-row gap-2 mb-4`}>
                            <TextInput
                                style={tw`flex-1 bg-[${THEME.bg}] text-[${THEME.textMain}] p-3 rounded-xl border border-[${THEME.border}]`}
                                placeholder="যেমন: ইহরাম অবস্থায় সুগন্ধি লাগালে কি হবে?"
                                placeholderTextColor={THEME.textSub}
                                value={question}
                                onChangeText={setQuestion}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={handleAskAi}
                                disabled={loading}
                                style={tw`bg-[${THEME.secondary}] w-12 rounded-xl items-center justify-center`}
                            >
                                {loading ? <ActivityIndicator color="#000" /> : <Ionicons name="send" size={20} color="#000" />}
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={tw`bg-[${THEME.bg}] flex-1 rounded-xl p-4 border border-[${THEME.border}]`}>
                            {aiAnswer ? (
                                <View>
                                    <View style={tw`flex-row items-center mb-2`}>
                                        <MaterialCommunityIcons name="robot" size={18} color={THEME.secondary} style={tw`mr-2`} />
                                        <Text style={tw`text-[${THEME.secondary}] font-bold`}>উত্তর:</Text>
                                    </View>
                                    <Text style={tw`text-[${THEME.textMain}] leading-6`}>{aiAnswer}</Text>
                                </View>
                            ) : (
                                <View style={tw`flex-1 items-center justify-center mt-10 opacity-30`}>
                                    <MaterialCommunityIcons name="chat-question" size={40} color={THEME.textSub} />
                                    <Text style={tw`text-[${THEME.textSub}] mt-2`}>প্রশ্ন করুন এবং উত্তর পান</Text>
                                </View>
                            )}
                        </ScrollView>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default HajjUmrahGuide;