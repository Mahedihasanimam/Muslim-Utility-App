

// import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import * as Haptics from 'expo-haptics';
// import { useRouter } from 'expo-router';
// import * as Sharing from 'expo-sharing';
// import React, { useRef, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Modal,
//     SafeAreaView,
//     ScrollView,
//     StatusBar,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import ViewShot from 'react-native-view-shot';
// import tw from 'twrnc';

// // ==========================================
// // 1. AI CONFIGURATION & FUNCTIONS
// // ==========================================

// // ⚠️ আপনার দেওয়া API Key
// const API_KEY = "AIzaSyCgDXShItpvWRaYKySQNzbBWUgNIGUhvnY";

// const genAI = new GoogleGenerativeAI(API_KEY);

// // মডেল ইনিশিয়ালাইজেশন (gemini-2.5-flash)
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // --- ১. যাকাত টার্ম ব্যাখ্যা (Help Feature) ---
// export const getZakatTermExplanation = async (term: string) => {
//     try {
//         const prompt = `
//       Explain the term "${term}" in the context of Zakat calculation in simple Bengali.
//       Keep it short (maximum 2-3 sentences).
//       Target audience: General Muslim users who might not understand complex terms.
//     `;
//         const result = await model.generateContent(prompt);
//         return result.response.text();
//     } catch (error) {
//         console.error("Zakat Term Error:", error);
//         return "দুঃখিত, এই মুহূর্তে ব্যাখ্যাটি লোড করা যাচ্ছে না। ইন্টারনেট সংযোগ চেক করুন।";
//     }
// };

// // --- ২. যাকাত পরামর্শ ও বিশ্লেষণ (Consultation Feature) ---
// export const getZakatConsultation = async (financialData: any) => {
//     try {
//         const prompt = `
//       Act as an Islamic Scholar. Here is the user's Zakat calculation data:
//       ${JSON.stringify(financialData)}

//       Provide a short analysis in Bengali (No markdown, plain text only):
//       1. Confirm if Zakat is due or not based on Nisab.
//       2. Suggest 2 best ways to distribute this amount (based on Quranic recipients like Fakir, Miskin, Madrasah).
//       3. Give a short Dua for wealth purification.

//       Format: Clean text with bullet points.
//     `;
//         const result = await model.generateContent(prompt);
//         return result.response.text();
//     } catch (error) {
//         console.error("Zakat Consultation Error:", error);
//         return "দুঃখিত, পরামর্শ লোড করা যাচ্ছে না।";
//     }
// };

// // ==========================================
// // 2. THEME & INTERFACES
// // ==========================================

// // Fixed Hex Code Error here (#1E293 -> #1E293B)
// const THEME = {
//     bg: '#0F172A',           // Deep Navy
//     card: '#1E293B',         // Slate 800 (FIXED)
//     primary: '#FBBF24',      // Amber/Gold (Islamic)
//     secondary: '#22D3EE',    // Cyan (Tech/AI)
//     textMain: '#F8FAFC',     // Slate 50
//     textSub: '#94A3B8',      // Slate 400
//     border: '#334155',       // Slate 700
//     success: '#10B981',      // Emerald
//     danger: '#F43F5E',       // Rose
// };

// interface InputFieldProps {
//     label: string;
//     value: string;
//     setter: (value: string) => void;
//     placeholder: string;
//     icon: string;
//     onHelpPress: (term: string) => void;
// }

// interface CalculationDetails {
//     totalAssets: number;
//     totalDebts: number;
//     netWorth: number;
//     nisab: number;
// }

// interface AssetField {
//     label: string;
//     value: string;
//     setter: (value: string) => void;
//     icon: string;
// }

// // ==========================================
// // 3. COMPONENTS
// // ==========================================

// const InputField: React.FC<InputFieldProps> = ({ label, value, setter, placeholder, icon, onHelpPress }) => {
//     return (
//         <View style={tw`mb-4`}>
//             <View style={tw`flex-row items-center justify-between mb-2 ml-1`}>
//                 <Text style={tw`text-[${THEME.textSub}] text-xs font-bold`}>{label}</Text>
//                 {/* AI Help Button */}
//                 <TouchableOpacity onPress={() => onHelpPress(label)} style={tw`flex-row items-center bg-[${THEME.bg}] px-2 py-1 rounded-full border border-[${THEME.border}]`}>
//                     <Text style={tw`text-[${THEME.secondary}] text-[10px] mr-1`}>AI ব্যাখ্যা</Text>
//                     <Ionicons name="help-circle" size={12} color={THEME.secondary} />
//                 </TouchableOpacity>
//             </View>
//             <View style={tw`flex-row items-center bg-[#0F172A] border border-[${THEME.border}] rounded-xl overflow-hidden`}>
//                 <View style={tw`w-12 items-center justify-center border-r border-[${THEME.border}]`}>
//                     <FontAwesome5 name={icon as any} size={16} color={THEME.secondary} />
//                 </View>
//                 <TextInput
//                     style={[tw`flex-1 p-3 text-sm font-bold`, { color: THEME.textMain }]}
//                     placeholder={placeholder}
//                     placeholderTextColor={THEME.border}
//                     keyboardType="numeric"
//                     value={value}
//                     onChangeText={(text) => setter(text.replace(/[^0-9.]/g, ''))}
//                 />
//                 <Text style={tw`text-[${THEME.textSub}] text-xs mr-3 font-medium`}>৳</Text>
//             </View>
//         </View>
//     );
// };

// const ZakatCalculator: React.FC = () => {
//     const router = useRouter();

//     // Data State
//     const [goldValue, setGoldValue] = useState<string>('');
//     const [silverValue, setSilverValue] = useState<string>('');
//     const [cashValue, setCashValue] = useState<string>('');
//     const [investmentsValue, setInvestmentsValue] = useState<string>('');
//     const [businessValue, setBusinessValue] = useState<string>('');
//     const [debtsValue, setDebtsValue] = useState<string>('');
//     const [nisabValue, setNisabValue] = useState<string>('');

//     // Logic State
//     const [zakatAmount, setZakatAmount] = useState<number | null>(null);
//     const [calculationDetails, setCalculationDetails] = useState<CalculationDetails>({
//         totalAssets: 0,
//         totalDebts: 0,
//         netWorth: 0,
//         nisab: 0
//     });
//     const [modalVisible, setModalVisible] = useState<boolean>(false);

//     // AI State
//     const [aiLoading, setAiLoading] = useState<boolean>(false);
//     const [aiAdvice, setAiAdvice] = useState<string | null>(null);

//     const viewShotRef = useRef<ViewShot>(null);

//     const assetFields: AssetField[] = [
//         { label: "স্বর্ণের বাজার মূল্য", value: goldValue, setter: setGoldValue, icon: "coins" },
//         { label: "রূপার বাজার মূল্য", value: silverValue, setter: setSilverValue, icon: "ring" },
//         { label: "নগদ অর্থ ও ব্যাংক ব্যালেন্স", value: cashValue, setter: setCashValue, icon: "money-bill-wave" },
//         { label: "বিনিয়োগ / শেয়ার", value: investmentsValue, setter: setInvestmentsValue, icon: "chart-line" },
//         { label: "ব্যবসায়িক পণ্যের মূল্য", value: businessValue, setter: setBusinessValue, icon: "store" },
//     ];

//     // --- AI Handlers ---

//     const handleTermExplanation = async (term: string) => {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         // Show a temporary alert or loading indicator could go here
//         Alert.alert("AI ভাবছে...", "অনুগ্রহ করে অপেক্ষা করুন।");

//         const explanation = await getZakatTermExplanation(term);

//         // Show Result
//         Alert.alert(term, explanation);
//     };

//     const handleAiConsultation = async () => {
//         setAiLoading(true);
//         setAiAdvice(null); // Reset

//         const dataForAi = {
//             total_assets: calculationDetails.totalAssets,
//             total_debts: calculationDetails.totalDebts,
//             net_worth: calculationDetails.netWorth,
//             nisab_threshold: calculationDetails.nisab,
//             zakat_payable: zakatAmount
//         };

//         const advice = await getZakatConsultation(dataForAi);
//         setAiAdvice(advice);
//         setAiLoading(false);
//     };

//     const calculateZakat = (): void => {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         setAiAdvice(null); // Clear previous advice on new calc

//         const totalAssets = assetFields.reduce((sum, field) => sum + (parseFloat(field.value) || 0), 0);
//         const debts = parseFloat(debtsValue) || 0;
//         const nisab = parseFloat(nisabValue) || 0;
//         const netWorth = totalAssets - debts;

//         setCalculationDetails({ totalAssets, totalDebts: debts, netWorth, nisab });

//         if (nisab <= 0) {
//             Alert.alert("নিসাব প্রয়োজন", "অনুগ্রহ করে বর্তমান নিসাবের পরিমাণ প্রবেশ করান।");
//             setZakatAmount(null);
//             return;
//         }

//         if (netWorth < nisab) {
//             Alert.alert("যাকাত ফরজ নয়", "আপনার নিট সম্পদ নিসাব পরিমাণের চেয়ে কম।");
//             setZakatAmount(0);
//             setModalVisible(true);
//         } else {
//             setZakatAmount(netWorth * 0.025);
//             setModalVisible(true);
//         }
//     };

//     const formatNumber = (num: number | null | undefined): string => {
//         if (num === null || num === undefined) return '0.00';
//         return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     };

//     const shareResult = async () => {
//         if (!viewShotRef.current?.capture) return;
//         try {
//             const uri = await viewShotRef.current.capture();
//             if (uri && await Sharing.isAvailableAsync()) {
//                 await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'যাকাত হিসাব শেয়ার' });
//             }
//         } catch (error) {
//             Alert.alert("ত্রুটি", "শেয়ার করা সম্ভব হয়নি।");
//         }
//     };

//     return (
//         <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
//             <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

//             {/* Header */}
//             <View style={tw`flex-row items-center py-4 px-5 bg-[${THEME.card}] border-b border-[${THEME.border}]`}>
//                 <TouchableOpacity onPress={() => router.back()} style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}] mr-3`}>
//                     <Ionicons name="arrow-back" size={20} color={THEME.textMain} />
//                 </TouchableOpacity>
//                 <View>
//                     <Text style={tw`text-[${THEME.primary}] text-lg font-bold`}>যাকাত ক্যালকুলেটর</Text>
//                     <Text style={tw`text-[${THEME.textSub}] text-[10px] tracking-wide`}>AI 2.5 Flash Powered</Text>
//                 </View>
//                 <View style={tw`flex-1 items-end`}>
//                     <MaterialCommunityIcons name="robot" size={24} color={THEME.secondary} />
//                 </View>
//             </View>

//             <ScrollView contentContainerStyle={tw`p-5 pb-20`}>
//                 {/* Info Card */}
// <View style={tw`bg-[${THEME.card}] p-4 rounded-xl border border-[${THEME.primary}]/20 mb-6 flex-row items-start`}>
//     <Ionicons name="information-circle" size={24} color={THEME.primary} style={tw`mt-1`} />
//     <Text style={tw`text-[${THEME.textSub}] text-xs ml-3 flex-1 leading-5`}>
//         জটিল টার্ম বুঝতে <Text style={tw`font-bold text-[${THEME.secondary}]`}>'AI ব্যাখ্যা'</Text> বাটনে ক্লিক করুন। আমাদের AI আপনাকে সহজ বাংলায় বুঝিয়ে দেবে।
//     </Text>
// </View>

//                 {/* Nisab Section */}
//                 <View style={tw`mb-6`}>
//                     <Text style={tw`text-[${THEME.textMain}] text-sm font-bold mb-3 uppercase tracking-wider`}>১. নিসাব নির্ধারণ</Text>
//                     <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl border border-[${THEME.border}]`}>
//                         <InputField
//                             label="বর্তমান নিসাবের মূল্য"
//                             value={nisabValue}
//                             setter={setNisabValue}
//                             placeholder="যেমন: 60000"
//                             icon="balance-scale"
//                             onHelpPress={handleTermExplanation}
//                         />
//                         <Text style={tw`text-[${THEME.textSub}] text-[10px] italic opacity-70`}>
//                             * সাধারণত ৫২.৫ তোলা রূপা বা ৭.৫ তোলা স্বর্ণের বর্তমান বাজার মূল্য।
//                         </Text>
//                     </View>
//                 </View>

//                 {/* Assets Section */}
//                 <View style={tw`mb-6`}>
//                     <Text style={tw`text-[${THEME.textMain}] text-sm font-bold mb-3 uppercase tracking-wider`}>২. সম্পদ যুক্ত করুন</Text>
//                     <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl border border-[${THEME.border}]`}>
//                         {assetFields.map((field, index) => (
//                             <InputField
//                                 key={index}
//                                 {...field}
//                                 placeholder="পরিমাণ লিখুন"
//                                 onHelpPress={handleTermExplanation}
//                             />
//                         ))}
//                     </View>
//                 </View>

//                 {/* Debts Section */}
//                 <View style={tw`mb-8`}>
//                     <Text style={tw`text-[${THEME.textMain}] text-sm font-bold mb-3 uppercase tracking-wider`}>৩. দায়/দেনা বাদ দিন</Text>
//                     <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl border border-[${THEME.border}]`}>
//                         <InputField
//                             label="ঋণ বা বকেয়া"
//                             value={debtsValue}
//                             setter={setDebtsValue}
//                             placeholder="পরিমাণ লিখুন"
//                             icon="file-invoice-dollar"
//                             onHelpPress={handleTermExplanation}
//                         />
//                     </View>
//                 </View>

//                 {/* Calculate Button */}
//                 <TouchableOpacity
//                     style={tw`bg-[${THEME.primary}] rounded-xl p-4 items-center shadow-lg shadow-amber-500/20`}
//                     onPress={calculateZakat}
//                 >
//                     <Text style={tw`text-[#0F172A] text-base font-bold uppercase tracking-wide`}>হিসাব_করুন</Text>
//                 </TouchableOpacity>

//             </ScrollView>

//             {/* --- Result Modal --- */}
//             <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
//                 <View style={tw`flex-1 justify-end bg-black/80`}>
//                     <View style={tw`bg-[${THEME.card}] rounded-t-3xl border-t border-[${THEME.border}] h-[90%]`}>

//                         {/* Modal Header */}
//                         <View style={tw`flex-row justify-between items-center p-5 border-b border-[${THEME.border}]`}>
//                             <Text style={tw`text-[${THEME.textMain}] text-lg font-bold`}>হিসাবের ফলাফল</Text>
//                             <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`p-2 bg-[${THEME.bg}] rounded-full`}>
//                                 <Ionicons name="close" size={24} color={THEME.danger} />
//                             </TouchableOpacity>
//                         </View>

//                         <ScrollView contentContainerStyle={tw`p-5`}>
//                             {/* ViewShot Area for Sharing */}
//                             <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: THEME.card }}>
//                                 <View style={tw`bg-[${THEME.bg}] p-5 rounded-2xl border border-[${THEME.border}] mb-5`}>

//                                     {/* Summary Rows */}
//                                     <View style={tw`flex-row justify-between mb-3`}>
//                                         <Text style={tw`text-[${THEME.textSub}]`}>মোট সম্পদ (+)</Text>
//                                         <Text style={tw`text-[${THEME.textMain}] font-bold`}>৳ {formatNumber(calculationDetails.totalAssets)}</Text>
//                                     </View>
//                                     <View style={tw`flex-row justify-between mb-3`}>
//                                         <Text style={tw`text-[${THEME.textSub}]`}>মোট দায় (-)</Text>
//                                         <Text style={tw`text-[${THEME.danger}] font-bold`}>৳ {formatNumber(calculationDetails.totalDebts)}</Text>
//                                     </View>
//                                     <View style={tw`h-[1px] bg-[${THEME.border}] my-2`} />
//                                     <View style={tw`flex-row justify-between mb-5`}>
//                                         <Text style={tw`text-[${THEME.secondary}] font-bold`}>নিট সম্পদ</Text>
//                                         <Text style={tw`text-[${THEME.secondary}] font-bold`}>৳ {formatNumber(calculationDetails.netWorth)}</Text>
//                                     </View>

//                                     {/* Final Amount Card */}
//                                     <View style={tw`bg-[${THEME.card}] border border-[${THEME.primary}] rounded-xl p-6 items-center relative overflow-hidden`}>
//                                         <View style={tw`absolute top-0 right-0 p-2 opacity-20`}>
//                                             <MaterialCommunityIcons name="hand-coin" size={60} color={THEME.primary} />
//                                         </View>

//                                         <Text style={tw`text-[${THEME.primary}] text-sm uppercase font-bold mb-2`}>আপনার প্রদেয় যাকাত</Text>
//                                         <Text style={tw`text-white text-3xl font-bold mb-1`}>৳ {formatNumber(zakatAmount)}</Text>
//                                         <Text style={tw`text-[${THEME.textSub}] text-[10px]`}>মোট সম্পদের ২.৫%</Text>
//                                     </View>
//                                 </View>

//                                 {/* AI Advice Result Section */}
//                                 {aiAdvice && (
//                                     <View style={tw`bg-[#0F172A] border border-[${THEME.secondary}]/30 p-4 rounded-xl mb-5`}>
//                                         <View style={tw`flex-row items-center mb-2`}>
//                                             <MaterialCommunityIcons name="robot-outline" size={20} color={THEME.secondary} style={tw`mr-2`} />
//                                             <Text style={tw`text-[${THEME.secondary}] font-bold`}>AI স্কলারের পরামর্শ</Text>
//                                         </View>
//                                         <Text style={tw`text-[${THEME.textMain}] text-sm leading-6`}>{aiAdvice}</Text>
//                                     </View>
//                                 )}
//                             </ViewShot>

//                             {/* Action Buttons */}
//                             <View style={tw`flex-row justify-between gap-3 mb-10`}>
//                                 <TouchableOpacity onPress={shareResult} style={tw`flex-1 bg-[${THEME.secondary}] py-3 rounded-xl flex-row justify-center items-center`}>
//                                     <Ionicons name="share-social" size={18} color="#0F172A" style={tw`mr-2`} />
//                                     <Text style={tw`text-[#0F172A] font-bold`}>শেয়ার_করুন</Text>
//                                 </TouchableOpacity>

//                                 <TouchableOpacity
//                                     onPress={handleAiConsultation}
//                                     disabled={aiLoading}
//                                     style={tw`flex-1 bg-[${THEME.card}] border border-[${THEME.primary}] py-3 rounded-xl flex-row justify-center items-center`}
//                                 >
//                                     {aiLoading ? (
//                                         <ActivityIndicator size="small" color={THEME.primary} />
//                                     ) : (
//                                         <>
//                                             <MaterialCommunityIcons name="star-four-points" size={18} color={THEME.primary} style={tw`mr-2`} />
//                                             <Text style={tw`text-[${THEME.primary}] font-bold`}>AI পরামর্শ</Text>
//                                         </>
//                                     )}
//                                 </TouchableOpacity>
//                             </View>
//                         </ScrollView>
//                     </View>
//                 </View>
//             </Modal>

//         </SafeAreaView>
//     );
// };

// export default ZakatCalculator;

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import tw from 'twrnc';

// ==========================================
// 1. AI CONFIGURATION & FUNCTIONS
// ==========================================

// ⚠️ আপনার API Key
const API_KEY = "AIzaSyCgDXShItpvWRaYKySQNzbBWUgNIGUhvnY";

const genAI = new GoogleGenerativeAI(API_KEY);

// মডেল ইনিশিয়ালাইজেশন (gemini-2.5-flash)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- ১. অটোমেটিক নিসাব ভ্যালু বের করা (NEW FEATURE) ---
const getAutoNisabFromAI = async () => {
    try {
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const prompt = `
            Calculate the Nisab value in Bangladeshi Taka (BDT) for today: ${today}.
            
            Logic:
            1. Nisab threshold is 52.5 Tola Silver.
            2. Use the current standard market rate of Silver in Bangladesh (referencing BAJUS rates if possible).
            3. Typically 1 Tola Silver is approx 2000-2400 BDT in current market.
            
            CRITICAL: 
            - Do not give a range. Calculate a specific integer value.
            - Return ONLY the number (e.g. 110250). No text.
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // শুধুমাত্র সংখ্যা বের করার জন্য ক্লিনিং
        return text.replace(/[^0-9]/g, '');
    } catch (error) {
        console.error("Auto Nisab Error:", error);
        return null;
    }
};

// --- ২. যাকাত টার্ম ব্যাখ্যা (Help Feature) ---
export const getZakatTermExplanation = async (term: string) => {
    try {
        const prompt = `
      Explain the term "${term}" in the context of Zakat calculation in simple Bengali.
      Keep it short (maximum 2-3 sentences).
      Target audience: General Muslim users.
    `;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return "দুঃখিত, ব্যাখ্যাটি লোড করা যাচ্ছে না।";
    }
};

// --- ৩. যাকাত পরামর্শ ও বিশ্লেষণ (Consultation Feature) ---
export const getZakatConsultation = async (financialData: any) => {
    try {
        const prompt = `
      Act as an Islamic Scholar. Here is the user's Zakat calculation data:
      ${JSON.stringify(financialData)}
      
      Provide a short analysis in Bengali (No markdown, plain text only):
      1. Confirm if Zakat is due or not based on Nisab.
      2. Suggest 2 best ways to distribute this amount.
      3. Give a short Dua for wealth purification.
      
      Format: Clean text with bullet points.
    `;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return "দুঃখিত, পরামর্শ লোড করা যাচ্ছে না।";
    }
};

// ==========================================
// 2. THEME & INTERFACES
// ==========================================

const THEME = {
    bg: '#0F172A',           // Deep Navy
    card: '#1E293B',         // Slate 800
    primary: '#FBBF24',      // Amber/Gold (Islamic)
    secondary: '#22D3EE',    // Cyan (Tech/AI)
    textMain: '#F8FAFC',     // Slate 50
    textSub: '#94A3B8',      // Slate 400
    border: '#334155',       // Slate 700
    success: '#10B981',      // Emerald
    danger: '#F43F5E',       // Rose
};

interface InputFieldProps {
    label: string;
    value: string;
    setter: (value: string) => void;
    placeholder: string;
    icon: string;
    onHelpPress: (term: string) => void;
    isNisabField?: boolean; // New Prop for Auto Fill
    onAutoFill?: () => void; // New Prop for Auto Fill Action
    isLoading?: boolean; // New Prop for Loading State
}

interface CalculationDetails {
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
    nisab: number;
}

interface AssetField {
    label: string;
    value: string;
    setter: (value: string) => void;
    icon: string;
}

// ==========================================
// 3. COMPONENTS
// ==========================================

const InputField: React.FC<InputFieldProps> = ({
    label, value, setter, placeholder, icon, onHelpPress,
    isNisabField, onAutoFill, isLoading
}) => {
    return (
        <View style={tw`mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-2 ml-1`}>
                <Text style={tw`text-[${THEME.textSub}] text-xs font-bold`}>{label}</Text>

                <View style={tw`flex-row gap-2`}>
                    {/* Auto Fill Button for Nisab Only */}
                    {isNisabField && (
                        <TouchableOpacity
                            onPress={onAutoFill}
                            disabled={isLoading}
                            style={tw`flex-row items-center bg-[${THEME.primary}]/20 px-2 py-1 rounded-full border border-[${THEME.primary}]/50`}
                        >
                            {isLoading ? (
                                <ActivityIndicator size={10} color={THEME.primary} />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="magic-staff" size={12} color={THEME.primary} style={tw`mr-1`} />
                                    <Text style={tw`text-[${THEME.primary}] text-[10px] font-bold`}>অটো ফিল</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Help Button */}
                    <TouchableOpacity onPress={() => onHelpPress(label)} style={tw`flex-row items-center bg-[${THEME.bg}] px-2 py-1 rounded-full border border-[${THEME.border}]`}>
                        <Text style={tw`text-[${THEME.secondary}] text-[10px] mr-1`}>এটা কি ?</Text>
                        <Ionicons name="help-circle" size={12} color={THEME.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={tw`flex-row items-center bg-[#0F172A] border border-[${THEME.border}] rounded-xl overflow-hidden`}>
                <View style={tw`w-12 items-center justify-center border-r border-[${THEME.border}]`}>
                    <FontAwesome5 name={icon as any} size={16} color={THEME.secondary} />
                </View>
                <TextInput
                    style={[tw`flex-1 p-3 text-sm font-bold`, { color: THEME.textMain }]}
                    placeholder={placeholder}
                    placeholderTextColor={THEME.border}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={(text) => setter(text.replace(/[^0-9.]/g, ''))}
                />
                <Text style={tw`text-[${THEME.textSub}] text-xs mr-3 font-medium`}>৳</Text>
            </View>
        </View>
    );
};

const ZakatCalculator: React.FC = () => {
    const router = useRouter();

    // Data State
    const [goldValue, setGoldValue] = useState<string>('');
    const [silverValue, setSilverValue] = useState<string>('');
    const [cashValue, setCashValue] = useState<string>('');
    const [investmentsValue, setInvestmentsValue] = useState<string>('');
    const [businessValue, setBusinessValue] = useState<string>('');
    const [debtsValue, setDebtsValue] = useState<string>('');
    const [nisabValue, setNisabValue] = useState<string>('');

    // Logic State
    const [zakatAmount, setZakatAmount] = useState<number | null>(null);
    const [calculationDetails, setCalculationDetails] = useState<CalculationDetails>({
        totalAssets: 0,
        totalDebts: 0,
        netWorth: 0,
        nisab: 0
    });
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    // AI State
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [nisabLoading, setNisabLoading] = useState<boolean>(false);
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);

    const viewShotRef = useRef<ViewShot>(null);

    const assetFields: AssetField[] = [
        { label: "স্বর্ণের বাজার মূল্য", value: goldValue, setter: setGoldValue, icon: "coins" },
        { label: "রূপার বাজার মূল্য", value: silverValue, setter: setSilverValue, icon: "ring" },
        { label: "নগদ অর্থ ও ব্যাংক ব্যালেন্স", value: cashValue, setter: setCashValue, icon: "money-bill-wave" },
        { label: "বিনিয়োগ / শেয়ার", value: investmentsValue, setter: setInvestmentsValue, icon: "chart-line" },
        { label: "ব্যবসায়িক পণ্যের মূল্য", value: businessValue, setter: setBusinessValue, icon: "store" },
    ];

    // --- Actions ---

    const handleAutoNisab = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setNisabLoading(true);
        const autoValue = await getAutoNisabFromAI();

        if (autoValue) {
            setNisabValue(autoValue);
            Alert.alert("AI আপডেট", `আজকের বাজার দরে আনুমানিক নিসাব: ৳${autoValue} (Silver Basis)`);
        } else {
            Alert.alert("দুঃখিত", "AI সংযোগে সমস্যা হচ্ছে। ম্যানুয়ালি ইনপুট দিন।");
        }
        setNisabLoading(false);
    };

    const handleTermExplanation = async (term: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("অপেক্ষা করুন...", "AI উত্তর তৈরি করছে");
        const explanation = await getZakatTermExplanation(term);
        Alert.alert(term, explanation);
    };

    const handleAiConsultation = async () => {
        setAiLoading(true);
        setAiAdvice(null);

        const dataForAi = {
            total_assets: calculationDetails.totalAssets,
            total_debts: calculationDetails.totalDebts,
            net_worth: calculationDetails.netWorth,
            nisab_threshold: calculationDetails.nisab,
            zakat_payable: zakatAmount
        };

        const advice = await getZakatConsultation(dataForAi);
        setAiAdvice(advice);
        setAiLoading(false);
    };

    const calculateZakat = (): void => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAiAdvice(null);

        const totalAssets = assetFields.reduce((sum, field) => sum + (parseFloat(field.value) || 0), 0);
        const debts = parseFloat(debtsValue) || 0;
        const nisab = parseFloat(nisabValue) || 0;
        const netWorth = totalAssets - debts;

        setCalculationDetails({ totalAssets, totalDebts: debts, netWorth, nisab });

        if (nisab <= 0) {
            Alert.alert("নিসাব প্রয়োজন", "অনুগ্রহ করে বর্তমান নিসাবের পরিমাণ প্রবেশ করান অথবা 'অটো ফিল' ব্যবহার করুন।");
            setZakatAmount(null);
            return;
        }

        if (netWorth < nisab) {
            Alert.alert("যাকাত ফরজ নয়", "আপনার নিট সম্পদ নিসাব পরিমাণের চেয়ে কম।");
            setZakatAmount(0);
            setModalVisible(true);
        } else {
            setZakatAmount(netWorth * 0.025);
            setModalVisible(true);
        }
    };

    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined) return '0.00';
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const shareResult = async () => {
        if (!viewShotRef.current?.capture) return;
        try {
            const uri = await viewShotRef.current.capture();
            if (uri && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'যাকাত হিসাব শেয়ার' });
            }
        } catch (error) {
            Alert.alert("ত্রুটি", "শেয়ার করা সম্ভব হয়নি।");
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {/* Header */}
            <View style={tw`flex-row items-center py-4 px-5 bg-[${THEME.card}] border-b border-[${THEME.border}]`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}] mr-3`}>
                    <Ionicons name="arrow-back" size={20} color={THEME.textMain} />
                </TouchableOpacity>
                <View>
                    <Text style={tw`text-[${THEME.primary}] text-lg font-bold`}>যাকাত ক্যালকুলেটর</Text>
                    <Text style={tw`text-[${THEME.textSub}] text-[10px] tracking-wide`}>AI 2.5 Flash Powered</Text>
                </View>
                <View style={tw`flex-1 items-end`}>
                    <MaterialCommunityIcons name="robot" size={24} color={THEME.secondary} />
                </View>
            </View>

            <ScrollView contentContainerStyle={tw`p-5 pb-20`}>
                {/* Info Card */}
                <View style={tw`bg-[${THEME.card}] p-4 rounded-xl border border-[${THEME.primary}]/20 mb-6 flex-row items-start`}>
                    <Ionicons name="sparkles" size={24} color={THEME.primary} style={tw`mt-1`} />
                    <View>

                        <Text style={tw`text-[${THEME.textSub}] text-xs ml-3 flex-1 leading-5`}>
                            নতুন ফিচার: নিসাব ইনপুট ফিল্ডের <Text style={tw`font-bold text-[${THEME.primary}]`}>'অটো ফিল'</Text> বাটনে ক্লিক করলে AI আজকের বাজার দর অনুযায়ী নিসাব বসিয়ে দেবে।
                        </Text>


                        <Text style={tw`text-[${THEME.textSub}] text-xs ml-3 my-2 flex-1 leading-5 `}>
                            জটিল টার্ম বুঝতে <Text style={tw`font-bold text-[${THEME.secondary}]`}>'AI ব্যাখ্যা'</Text> বাটনে ক্লিক করুন। আমাদের AI আপনাকে সহজ বাংলায় বুঝিয়ে দেবে।
                        </Text>

                    </View>


                </View>

                {/* Nisab Section */}
                <View style={tw`mb-6`}>
                    <Text style={tw`text-[${THEME.textMain}] text-sm font-bold mb-3 uppercase tracking-wider`}>১. নিসাব নির্ধারণ</Text>
                    <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl border border-[${THEME.border}]`}>
                        <InputField
                            label="বর্তমান নিসাবের মূল্য"
                            value={nisabValue}
                            setter={setNisabValue}
                            placeholder="AI ব্যবহার করুন..."
                            icon="balance-scale"
                            onHelpPress={handleTermExplanation}
                            isNisabField={true}         // Enables Auto Fill UI
                            onAutoFill={handleAutoNisab} // Action
                            isLoading={nisabLoading}    // Loading State
                        />
                        <Text style={tw`text-[${THEME.textSub}] text-[10px] italic opacity-70`}>
                            * সাধারণত ৫২.৫ তোলা রূপা বা ৭.৫ তোলা স্বর্ণের বর্তমান বাজার মূল্য।
                        </Text>
                    </View>
                </View>

                {/* Assets Section */}
                <View style={tw`mb-6`}>
                    <Text style={tw`text-[${THEME.textMain}] text-sm font-bold mb-3 uppercase tracking-wider`}>২. সম্পদ যুক্ত করুন</Text>
                    <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl border border-[${THEME.border}]`}>
                        {assetFields.map((field, index) => (
                            <InputField
                                key={index}
                                {...field}
                                placeholder="পরিমাণ লিখুন"
                                onHelpPress={handleTermExplanation}
                            />
                        ))}
                    </View>
                </View>

                {/* Debts Section */}
                <View style={tw`mb-8`}>
                    <Text style={tw`text-[${THEME.textMain}] text-sm font-bold mb-3 uppercase tracking-wider`}>৩. দায়/দেনা বাদ দিন</Text>
                    <View style={tw`bg-[${THEME.card}] p-4 rounded-2xl border border-[${THEME.border}]`}>
                        <InputField
                            label="ঋণ বা বকেয়া"
                            value={debtsValue}
                            setter={setDebtsValue}
                            placeholder="পরিমাণ লিখুন"
                            icon="file-invoice-dollar"
                            onHelpPress={handleTermExplanation}
                        />
                    </View>
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    style={tw`bg-[${THEME.primary}] rounded-xl p-4 items-center shadow-lg shadow-amber-500/20`}
                    onPress={calculateZakat}
                >
                    <Text style={tw`text-[#0F172A] text-base font-bold uppercase tracking-wide`}>হিসাব_করুন</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* --- Result Modal --- */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={tw`flex-1 justify-end bg-black/80`}>
                    <View style={tw`bg-[${THEME.card}] rounded-t-3xl border-t border-[${THEME.border}] h-[90%]`}>

                        {/* Modal Header */}
                        <View style={tw`flex-row justify-between items-center p-5 border-b border-[${THEME.border}]`}>
                            <Text style={tw`text-[${THEME.textMain}] text-lg font-bold`}>হিসাবের ফলাফল</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`p-2 bg-[${THEME.bg}] rounded-full`}>
                                <Ionicons name="close" size={24} color={THEME.danger} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={tw`p-5`}>
                            {/* ViewShot Area for Sharing */}
                            <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: THEME.card }}>
                                <View style={tw`bg-[${THEME.bg}] p-5 rounded-2xl border border-[${THEME.border}] mb-5`}>

                                    {/* Summary Rows */}
                                    <View style={tw`flex-row justify-between mb-3`}>
                                        <Text style={tw`text-[${THEME.textSub}]`}>মোট সম্পদ (+)</Text>
                                        <Text style={tw`text-[${THEME.textMain}] font-bold`}>৳ {formatNumber(calculationDetails.totalAssets)}</Text>
                                    </View>
                                    <View style={tw`flex-row justify-between mb-3`}>
                                        <Text style={tw`text-[${THEME.textSub}]`}>মোট দায় (-)</Text>
                                        <Text style={tw`text-[${THEME.danger}] font-bold`}>৳ {formatNumber(calculationDetails.totalDebts)}</Text>
                                    </View>
                                    <View style={tw`h-[1px] bg-[${THEME.border}] my-2`} />
                                    <View style={tw`flex-row justify-between mb-5`}>
                                        <Text style={tw`text-[${THEME.secondary}] font-bold`}>নিট সম্পদ</Text>
                                        <Text style={tw`text-[${THEME.secondary}] font-bold`}>৳ {formatNumber(calculationDetails.netWorth)}</Text>
                                    </View>

                                    {/* Final Amount Card */}
                                    <View style={tw`bg-[${THEME.card}] border border-[${THEME.primary}] rounded-xl p-6 items-center relative overflow-hidden`}>
                                        <View style={tw`absolute top-0 right-0 p-2 opacity-20`}>
                                            <MaterialCommunityIcons name="hand-coin" size={60} color={THEME.primary} />
                                        </View>

                                        <Text style={tw`text-[${THEME.primary}] text-sm uppercase font-bold mb-2`}>আপনার প্রদেয় যাকাত</Text>
                                        <Text style={tw`text-white text-3xl font-bold mb-1`}>৳ {formatNumber(zakatAmount)}</Text>
                                        <Text style={tw`text-[${THEME.textSub}] text-[10px]`}>মোট সম্পদের ২.৫%</Text>
                                    </View>
                                </View>

                                {/* AI Advice Result Section */}
                                {aiAdvice && (
                                    <View style={tw`bg-[#0F172A] border border-[${THEME.secondary}]/30 p-4 rounded-xl mb-5`}>
                                        <View style={tw`flex-row items-center mb-2`}>
                                            <MaterialCommunityIcons name="robot-outline" size={20} color={THEME.secondary} style={tw`mr-2`} />
                                            <Text style={tw`text-[${THEME.secondary}] font-bold`}>AI স্কলারের পরামর্শ</Text>
                                        </View>
                                        <Text style={tw`text-[${THEME.textMain}] text-sm leading-6`}>{aiAdvice}</Text>
                                    </View>
                                )}
                            </ViewShot>

                            {/* Action Buttons */}
                            <View style={tw`flex-row justify-between gap-3 mb-10`}>
                                <TouchableOpacity onPress={shareResult} style={tw`flex-1 bg-[${THEME.secondary}] py-3 rounded-xl flex-row justify-center items-center`}>
                                    <Ionicons name="share-social" size={18} color="#0F172A" style={tw`mr-2`} />
                                    <Text style={tw`text-[#0F172A] font-bold`}>শেয়ার করুন</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleAiConsultation}
                                    disabled={aiLoading}
                                    style={tw`flex-1 bg-[${THEME.card}] border border-[${THEME.primary}] py-3 rounded-xl flex-row justify-center items-center`}
                                >
                                    {aiLoading ? (
                                        <ActivityIndicator size="small" color={THEME.primary} />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="star-four-points" size={18} color={THEME.primary} style={tw`mr-2`} />
                                            <Text style={tw`text-[${THEME.primary}] font-bold`}>AI পরামর্শ</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default ZakatCalculator;