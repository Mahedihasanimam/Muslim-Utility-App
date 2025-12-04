import { startIslamicChat } from '@/components/utils/GeminiService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import tw from 'twrnc';

// চ্যাট মেসেজের টাইপ
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

const ChatScreen = () => {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    // প্রাথমিক ওয়েলকাম মেসেজ
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'আসসালামু আলাইকুম! আমি আপনার দ্বীনী বন্ধু (AI)। ইসলাম সম্পর্কে আপনার কোনো প্রশ্ন থাকলে করতে পারেন।',
            sender: 'ai'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Gemini তে পাঠানোর জন্য হিস্ট্রি কনভার্ট করা
    const getHistoryForGemini = () => {
        return messages.slice(1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsgText = inputText.trim();
        setInputText(''); // ইনপুট খালি করা

        // ১. ইউজারের মেসেজ UI তে যোগ করা
        const newUserMsg: Message = { id: Date.now().toString(), text: userMsgText, sender: 'user' };

        setMessages(prev => [...prev, newUserMsg]);

        setIsLoading(true);

        try {
            // ২. AI কল করা (আগের হিস্ট্রি সহ)
            const history = getHistoryForGemini();
            const aiResponseText = await startIslamicChat(history, userMsgText);
            // ৩. AI এর উত্তর UI তে যোগ করা
            const newAiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, newAiMsg]);

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[#0F172A]`}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* --- Decorative Background Elements (Islamic Pattern Simulation) --- */}
            {/* আপনি চাইলে এখানে ImageBackground ব্যবহার করে ইসলামিক প্যাটার্ন ইমেজ দিতে পারেন opacity কমিয়ে */}
            <View style={tw`absolute top-10 right-[-20] opacity-10`}>
                <MaterialCommunityIcons name="star-four-points-outline" size={150} color="#FBBF24" />
            </View>
            <View style={tw`absolute bottom-20 left-[-30] opacity-5`}>
                <MaterialCommunityIcons name="moon-waning-crescent" size={200} color="#22D3EE" />
            </View>

            {/* --- কাস্টম হেডার --- */}
            <View style={tw`flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#0F172A] border-b border-slate-800 shadow-lg z-10`}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={tw`p-2 rounded-full bg-slate-800/50 border border-slate-700`}
                >
                    <Ionicons name="arrow-back" size={24} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={tw`items-center`}>
                    <View style={tw`flex-row items-center`}>
                        <MaterialCommunityIcons name="moon-waning-crescent" size={18} color="#FBBF24" style={tw`mr-1`} />
                        <Text style={tw`text-[#FBBF24] text-xl font-bold tracking-wider`}>MUSLIM AI</Text>
                    </View>
                    <Text style={tw`text-cyan-400 text-[10px] tracking-[3px] uppercase`}>Companion</Text>
                </View>

                <View style={tw`w-10 items-end`}>
                    {/* ডান পাশে আইকন বা ফাঁকা রাখা */}
                    <MaterialCommunityIcons name="robot-outline" size={24} color="#22D3EE" style={tw`opacity-80`} />
                </View>
            </View>

            {/* --- চ্যাট লিস্ট --- */}
            <ScrollView
                ref={scrollViewRef}
                style={tw`flex-1 px-4 py-4`}
                contentContainerStyle={tw`pb-4`}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <View key={msg.id} style={tw`mb-5`}>
                        {msg.sender === 'user' ? (
                            // --- USER BUBBLE (Cyan/Tech Theme) ---
                            <View style={tw`flex-row justify-end items-end`}>
                                <View style={tw`max-w-[80%] bg-[#1E293B]/90 border border-cyan-500/30 p-4 rounded-2xl rounded-br-none shadow-sm`}>
                                    <Text style={tw`text-cyan-50 text-base leading-6`}>{msg.text}</Text>
                                </View>
                                <View style={tw`ml-2 w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-500/30 items-center justify-center`}>
                                    <Ionicons name="person" size={14} color="#22D3EE" />
                                </View>
                            </View>
                        ) : (
                            // --- AI BUBBLE (Gold/Islamic Theme) ---
                            <View style={tw`flex-row justify-start items-end`}>
                                <View style={tw`mr-2 w-8 h-8 rounded-full bg-amber-900/30 border border-amber-500/30 items-center justify-center`}>
                                    <MaterialCommunityIcons name="mosque" size={16} color="#FBBF24" />
                                </View>
                                <View style={tw`max-w-[85%] bg-[#1E293B] border border-amber-500/30 p-4 rounded-2xl rounded-bl-none shadow-sm`}>
                                    <Text style={tw`text-amber-50 text-base leading-6`}>{msg.text}</Text>
                                    {/* AI Footer Decoration */}
                                    <View style={tw`mt-2 flex-row items-center opacity-50`}>
                                        <MaterialCommunityIcons name="star-four-points" size={10} color="#FBBF24" />
                                        <Text style={tw`text-[#FBBF24] text-[10px] ml-1`}>AI GUIDANCE</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                ))}

                {isLoading && (
                    <View style={tw`flex-row justify-start items-center mb-4 ml-10`}>
                        <View style={tw`bg-[#1E293B] p-3 rounded-2xl border border-amber-500/20`}>
                            <ActivityIndicator size="small" color="#FBBF24" />
                        </View>
                        <Text style={tw`text-slate-500 text-xs ml-2 italic`}>লিখছে...</Text>
                    </View>
                )}

                <View style={tw`h-6`} />
            </ScrollView>

            {/* --- ইনপুট এরিয়া --- */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={tw`p-4 bg-[#0F172A]/95 border-t border-slate-800`}>
                    <View style={tw`flex-row items-center bg-[#1E293B] rounded-full border border-slate-700 p-1 pl-4 shadow-lg`}>
                        <TextInput
                            style={tw`flex-1 text-white text-base py-3 mr-2 h-12`}
                            placeholder="আপনার প্রশ্ন লিখুন..."
                            placeholderTextColor="#64748B"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={isLoading || !inputText.trim()}
                            style={[
                                tw`w-10 h-10 rounded-full items-center justify-center shadow-lg`,
                                inputText.trim()
                                    ? tw`bg-gradient-to-r bg-emerald-600 border border-emerald-400`
                                    : tw`bg-slate-700`
                            ]}
                        >
                            {inputText.trim() ? (
                                <Ionicons name="send" size={20} color="white" style={tw`ml-1`} />
                            ) : (
                                <MaterialCommunityIcons name="microphone" size={20} color="#94A3B8" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

export default ChatScreen;