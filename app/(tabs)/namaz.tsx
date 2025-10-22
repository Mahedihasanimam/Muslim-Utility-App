import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- ডেটা স্ট্রাকচার (Interfaces) ---
export interface SalahStep {
    step: number;
    posture: string;
    action_bn: string;
    recite_ar?: string[];
    recite_pronun_bn?: string[]; // <-- বাংলা উচ্চারণ
    recite_translit?: string[]; // (ঐচ্ছিক) Banglish উচ্চারণ
    recite_bn?: string[];
    icon?: string;
}

export interface PrayerInfo {
    key: string;
    name_bn: string;
    rakats: {
        sunnah_muakkadah?: number;
        fardh: number;
        sunnah_ghair_muakkadah?: number;
        nafl?: number;
        witr?: number;
    };
    notes_bn?: string;
}

// --- নতুন: বিশেষ নামাজের ডেটা ---
export interface SpecialPrayer {
    key: string;
    name_bn: string;
    time_bn: string; // পড়ার সময়
    rakats_bn: string; // রাকাত সংখ্যা
    method_bn: string[]; // পড়ার নিয়ম (ধাপে ধাপে)
    importance_bn?: string; // গুরুত্ব/ফযিলত (ঐচ্ছিক)
}


// --- ডেটা (Data) ---

// --- নামাজের রাকাত সংখ্যা (অপরিবর্তিত) ---
export const prayersInfo: PrayerInfo[] = [
    { key: 'fajr', name_bn: 'ফজর', rakats: { sunnah_muakkadah: 2, fardh: 2 }, notes_bn: 'ফরজের আগে ২ রাকাত সুন্নাত পড়তে হয়।' },
    { key: 'dhuhr', name_bn: 'যোহর', rakats: { sunnah_muakkadah: 4, fardh: 4, sunnah_ghair_muakkadah: 2, nafl: 2 }, notes_bn: 'ফরজের আগে ৪ ও পরে ২ রাকাত সুন্নাত (মুয়াক্কাদা)। শেষে ২ রাকাত নফল পড়তে পারেন।' },
    { key: 'asr', name_bn: 'আসর', rakats: { sunnah_ghair_muakkadah: 4, fardh: 4 }, notes_bn: 'ফরজের আগে ৪ রাকাত সুন্নাত (গায়রে মুয়াক্কাদা)।' },
    { key: 'maghrib', name_bn: 'মাগরিব', rakats: { fardh: 3, sunnah_muakkadah: 2, nafl: 2 }, notes_bn: 'ফরজের পরে ২ রাকাত সুন্নাত (মুয়াক্কাদা)। শেষে ২ রাকাত نفل পড়তে পারেন।' },
    { key: 'isha', name_bn: 'ইশা', rakats: { sunnah_ghair_muakkadah: 4, fardh: 4, sunnah_muakkadah: 2, nafl: 2, witr: 3 }, notes_bn: 'ফরজের আগে ৪ রাকাত সুন্নাত (গায়রে মুয়াক্কাদা), পরে ২ রাকাত সুন্নাত (মুয়াক্কাদা)। শেষে ৩ রাকাত বিতর ওয়াজিব।' },
];

// --- এক রাকাতের সাধারণ ধাপসমূহ (!!!বাংলা উচ্চারণ ও দোয়া যাচাই করুন!!!) ---
export const salahSteps: SalahStep[] = [
    { step: 1, posture: 'তাকবির', action_bn: 'আল্লাহু আকবার বলে হাত বাঁধা', recite_ar: ['اللَّهُ أَكْبَرُ'], recite_pronun_bn: ['আল্লাহু আকবার'], icon: 'human-handsup' },
    {
        step: 2, posture: 'কিয়াম', action_bn: 'সানা পড়া',
        recite_ar: ['سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ', 'وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ', 'وَلَا إِلَهَ غَيْرُكَ'],
        recite_pronun_bn: ['সুবহা-নাকাল্লা-হুম্মা ওয়া বিহামদিকা', 'ওয়া তাবা-রা কাসমুকা ওয়া তা‘আ-লা জাদ্দুকা', 'ওয়া লা-ইলা-হা গাইরুক'],
        recite_bn: ['হে আল্লাহ! আপনার পবিত্রতা বর্ণনা করছি। আপনার প্রশংসার সাথে আপনার নাম বরকতময়, আপনার মহত্ত্ব সুউচ্চ এবং আপনি ব্যতীত অন্য কোনো উপাস্য নেই।'],
        icon: 'human-male'
    },
    {
        step: 3, posture: 'কিয়াম', action_bn: 'সুরা ফাতিহা পড়া',
        recite_ar: ['بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...', '(সম্পূর্ণ ফাতিহা)'],
        recite_pronun_bn: ['বিসমিল্লা-হির রাহমা-নির রাহী-ম', 'আলহামদু লিল্লা-হি রাব্বিল ‘আ-লামী-ন...', '(সম্পূর্ণ)'],
        recite_bn: ['পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।', 'সমস্ত প্রশংসা আল্লাহর জন্য যিনি জগৎসমূহের প্রতিপালক...'],
        icon: 'human-male'
    },
    {
        step: 4, posture: 'কিয়াম', action_bn: 'অন্য একটি সুরা বা কমপক্ষে তিন আয়াত মেলানো',
        recite_ar: ['(উদাহরণ: সুরা ইখলাস)', 'قُلْ هُوَ اللَّهُ أَحَدٌ...'],
        recite_pronun_bn: ['(উদাহরণ)', 'ক্বুল হুওয়াল্ল-হু আহাদ...'],
        recite_bn: ['(আপনার পছন্দমত একটি সুরা)'],
        icon: 'human-male'
    },
    {
        step: 5, posture: 'রুকু', action_bn: 'আল্লাহু আকবার বলে রুকুতে যাওয়া',
        recite_ar: ['سُبْحَانَ رَبِّيَ الْعَظِيمِ'],
        recite_pronun_bn: ['সুবহা-না রাব্বিয়াল ‘আযী-ম (৩ বার)'],
        recite_bn: ['আমার মহান প্রতিপালকের পবিত্রতা বর্ণনা করছি (৩ বার)।'],
        icon: 'human-handsdown' // Needs better icon
    },
    {
        step: 6, posture: 'কওমা', action_bn: 'সামিআল্লাহু লিমান হামিদাহ বলে সোজা দাঁড়ানো',
        recite_ar: ['سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ', 'رَبَّنَا لَكَ الْحَمْدُ'],
        recite_pronun_bn: ['সামি‘আল্ল-হু লিমান হামিদাহ', 'রাব্বানা- লাকাল হামদ'],
        recite_bn: ['আল্লাহ তার প্রশংসা শোনেন যে তাঁর প্রশংসা করে।', 'হে আমাদের প্রতিপালক! আপনার জন্যই সকল প্রশংসা।'],
        icon: 'human-male'
    },
    {
        step: 7, posture: 'সিজদাহ ১', action_bn: 'আল্লাহু আকবার বলে প্রথম সিজদায় যাওয়া',
        recite_ar: ['سُبْحَانَ رَبِّيَ الْأَعْلَى'],
        recite_pronun_bn: ['সুবহা-না রাব্বিয়াল আ‘লা (৩ বার)'],
        recite_bn: ['আমার সর্বোচ্চ প্রতিপালকের পবিত্রতা বর্ণনা করছি (৩ বার)।'],
        icon: 'human-handsdown' // Needs proper icon
    },
    {
        step: 8, posture: 'জলসা', action_bn: 'আল্লাহু আকবার বলে দুই সিজদার মাঝে বসা',
        recite_ar: ['(ঐচ্ছিক: رَبِّ اغْفِرْ لِي، وَارْحَمْنِي...)'],
        recite_pronun_bn: ['(ঐচ্ছিক: আল্লা-হুম্মাগফিরলী ওয়ারহামনী...)'], // <-- যাচাই করুন
        recite_bn: ['(ঐচ্ছিক: হে আল্লাহ, আমাকে ক্ষমা করুন, আমার প্রতি দয়া করুন...)'],
        icon: 'human-male-female' // Needs proper sitting icon
    },
    {
        step: 9, posture: 'সিজদাহ ২', action_bn: 'আল্লাহু আকবার বলে দ্বিতীয় সিজদায় যাওয়া',
        recite_ar: ['سُبْحَانَ رَبِّيَ الْأَعْلَى'],
        recite_pronun_bn: ['সুবহা-না রাব্বিয়াল আ‘লা (৩ বার)'],
        recite_bn: ['আমার সর্বোচ্চ প্রতিপালকের পবিত্রতা বর্ণনা করছি (৩ বার)।'],
        icon: 'human-handsdown' // Needs proper icon
    },
    {
        step: 10, posture: 'দাঁড়ানো/বসা', action_bn: 'আল্লাহু আকবার বলে দাঁড়ানো (পরের রাকাতের জন্য) অথবা বসা (তাশাহহুদের জন্য)',
        recite_ar: ['اللَّهُ أَكْبَرُ'],
        recite_pronun_bn: ['আল্লাহু আকবার'],
        icon: 'human-male'
    },
    // !!! তাশাহহুদ, দরুদ, দোয়া মাসুরা, সালামের ধাপ এখানে যোগ করতে হবে, বাংলা উচ্চারণ সহ !!!
];

// --- বিশেষ নামাজের ডেটা (উদাহরণ: তাহাজ্জুদ) ---
export const specialPrayers: SpecialPrayer[] = [
    {
        key: 'tahajjud',
        name_bn: 'তাহাজ্জুদ নামাজ',
        time_bn: 'ইশার নামাজের পর থেকে সুবহে সাদিকের পূর্ব পর্যন্ত, রাতের শেষ তৃতীয়াংশ উত্তম সময়।',
        rakats_bn: 'কমপক্ষে ২ রাকাত, সাধারণত ৮ রাকাত পড়া হয়, তবে ১২ রাকাত পর্যন্ত পড়ার वर्णन পাওয়া যায়। ২ রাকাত করে পড়া উত্তম।',
        method_bn: [
            '১. অন্যান্য নফল নামাজের মতোই নিয়ত করে শুরু করুন।',
            '২. প্রত্যেক রাকাতে সুরা ফাতিহার সাথে অন্য যে কোনো সুরা (লম্বা সুরা পড়া উত্তম) মিলিয়ে পড়ুন।',
            '৩. প্রতি দুই রাকাত পর সালাম ফেরান।',
            '৪. আপনি যত রাকাত পড়তে চান (২, ৪, ৬, ৮...), তা পড়ার পর সম্ভব হলে বিতর নামাজ পড়ুন (যদি ইশার সাথে না পড়ে থাকেন)।',
        ],
        importance_bn: 'ফরজ নামাজের পর সবচেয়ে শ্রেষ্ঠ নামাজ হলো তাহাজ্জুদ। এটি আল্লাহর নৈকট্য লাভের অন্যতম সেরা উপায়।'
    },
    // {
    //     key: 'ishraq',
    //     name_bn: 'ইশরাক নামাজ',
    //     time_bn: 'সূর্যোদয়ের প্রায় ১৫-২০ মিনিট পর থেকে।',
    //     rakats_bn: '২ বা ৪ রাকাত।',
    //     method_bn: ['...'],
    // },
    // {
    //     key: 'chasht',
    //     name_bn: 'চাশত (দুহা) নামাজ',
    //     time_bn: 'সূর্য আকাশে কিছুটা উপরে উঠার পর থেকে দ্বিপ্রহরের পূর্ব পর্যন্ত।',
    //     rakats_bn: 'কমপক্ষে ২ রাকাত, সর্বোচ্চ ১২ রাকাত পর্যন্ত পড়া যায়।',
    //     method_bn: ['...'],
    // },
    // ... আরও বিশেষ নামাজ যোগ করুন (আওয়াবিন, সালাতুত তাসবিহ, ঈদ, জানাযা ইত্যাদি) ...
];


// --- কালার (Color Palette - অপরিবর্তিত) ---
const BG_COLOR = '#0F172A';
const CARD_COLOR_PRIMARY = '#1E293B';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#CBD5E1';
const ACCENT_COLOR = '#047857';
const STEP_BG = '#111827';

// --- স্টাইল (Styles) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    header: { padding: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: TEXT_PRIMARY, marginBottom: 10 },
    prayerTabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
    activeTab: { backgroundColor: ACCENT_COLOR },
    tabText: { color: TEXT_SECONDARY, fontWeight: 'bold' },
    activeTabText: { color: TEXT_PRIMARY },
    prayerDetailsCard: { backgroundColor: CARD_COLOR_PRIMARY, padding: 15, marginHorizontal: 15, borderRadius: 10, marginBottom: 20 },
    prayerName: { fontSize: 20, fontWeight: 'bold', color: TEXT_PRIMARY, marginBottom: 5 },
    rakatInfo: { color: TEXT_SECONDARY, marginBottom: 5 },
    notes: { color: TEXT_SECONDARY, fontStyle: 'italic', fontSize: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_PRIMARY, marginHorizontal: 15, marginTop: 20, marginBottom: 10 },
    stepCard: { backgroundColor: STEP_BG, marginHorizontal: 15, marginBottom: 10, borderRadius: 8, padding: 15, flexDirection: 'row', alignItems: 'flex-start' },
    stepIconContainer: { marginRight: 15, alignItems: 'center', width: 50 },
    stepNumber: { color: ACCENT_COLOR, fontWeight: 'bold', marginBottom: 5 },
    stepIcon: { marginBottom: 5 },
    stepPosture: { color: TEXT_SECONDARY, fontSize: 10, textAlign: 'center' },
    stepContent: { flex: 1 },
    stepAction: { color: TEXT_PRIMARY, fontWeight: 'bold', marginBottom: 8 },
    stepReciteArabic: { color: TEXT_PRIMARY, fontSize: 18, textAlign: 'right', marginBottom: 5, fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }, // Choose appropriate font
    stepRecitePronunBn: { color: '#A5F3FC', fontSize: 14, marginBottom: 5, fontStyle: 'italic' }, // <-- বাংলা উচ্চারণের স্টাইল
    stepReciteTranslit: { color: '#94A3B8', fontSize: 12, marginBottom: 5, fontStyle: 'italic' }, // Fallback Banglish style
    stepReciteBn: { color: TEXT_SECONDARY },
    // বিশেষ নামাজের স্টাইল
    specialPrayerCard: { backgroundColor: CARD_COLOR_PRIMARY, padding: 15, marginHorizontal: 15, borderRadius: 10, marginBottom: 15 },
    specialPrayerName: { fontSize: 18, fontWeight: 'bold', color: ACCENT_COLOR, marginBottom: 8 },
    specialPrayerLabel: { color: TEXT_SECONDARY, fontWeight: 'bold' },
    specialPrayerText: { color: TEXT_SECONDARY, marginBottom: 5 },
    specialPrayerMethodStep: { color: TEXT_SECONDARY, marginBottom: 3, marginLeft: 5 },
});

// --- নামাজ ধাপ দেখানোর কম্পোনেন্ট (বাংলা উচ্চারণ সহ) ---
const StepItem: React.FC<{ step: SalahStep }> = ({ step }) => (
    <View style={styles.stepCard}>
        <View style={styles.stepIconContainer}>
            <Text style={styles.stepNumber}>{step.step}</Text>
            {step.icon && (
                <MaterialCommunityIcons name={step.icon as any} size={24} color={TEXT_SECONDARY} style={styles.stepIcon} />
            )}
            <Text style={styles.stepPosture}>{step.posture}</Text>
        </View>
        <View style={styles.stepContent}>
            <Text style={styles.stepAction}>{step.action_bn}</Text>
            {step.recite_ar && step.recite_ar.map((line, index) => (
                <Text key={`ar-${index}`} style={styles.stepReciteArabic}>{line}</Text>
            ))}
            {/* বাংলা উচ্চারণ দেখাচ্ছি */}
            {step.recite_pronun_bn && step.recite_pronun_bn.map((line, index) => (
                <Text key={`pbn-${index}`} style={styles.stepRecitePronunBn}>{line}</Text>
            ))}
            {/* যদি বাংলা উচ্চারণ না থাকে, তাহলে Banglish দেখাবে (ঐচ্ছিক) */}
            {/* {!step.recite_pronun_bn && step.recite_translit && step.recite_translit.map((line, index) => (
        <Text key={`tl-${index}`} style={styles.stepReciteTranslit}>{line}</Text>
      ))} */}
            {step.recite_bn && step.recite_bn.map((line, index) => (
                <Text key={`bn-${index}`} style={styles.stepReciteBn}>{line}</Text>
            ))}
        </View>
    </View>
);

// --- বিশেষ নামাজ দেখানোর কম্পোনেন্ট ---
const SpecialPrayerItem: React.FC<{ prayer: SpecialPrayer }> = ({ prayer }) => (
    <View style={styles.specialPrayerCard}>
        <Text style={styles.specialPrayerName}>{prayer.name_bn}</Text>
        <Text style={styles.specialPrayerLabel}>সময়:</Text>
        <Text style={styles.specialPrayerText}>{prayer.time_bn}</Text>
        <Text style={styles.specialPrayerLabel}>রাকাত:</Text>
        <Text style={styles.specialPrayerText}>{prayer.rakats_bn}</Text>
        <Text style={styles.specialPrayerLabel}>পড়ার নিয়ম:</Text>
        {prayer.method_bn.map((step, index) => (
            <Text key={`${prayer.key}-step-${index}`} style={styles.specialPrayerMethodStep}>{step}</Text>
        ))}
        {prayer.importance_bn && (
            <>
                <Text style={[styles.specialPrayerLabel, { marginTop: 5 }]}>গুরুত্ব:</Text>
                <Text style={styles.specialPrayerText}>{prayer.importance_bn}</Text>
            </>
        )}
    </View>
);

// --- মূল স্ক্রিন কম্পোনেন্ট ---
const NamazGuideScreen = () => {
    const [selectedPrayer, setSelectedPrayer] = useState<PrayerInfo>(prayersInfo[0]);

    const getRakatString = (rakats: PrayerInfo['rakats']) => {
        let parts: string[] = [];
        // Logic remains same, only presentation might change based on design
        if (rakats.sunnah_ghair_muakkadah) parts.push(`${rakats.sunnah_ghair_muakkadah} সুন্নাত (গাইরে মু.)`);
        if (rakats.sunnah_muakkadah && ['fajr', 'dhuhr'].includes(selectedPrayer.key)) parts.push(`${rakats.sunnah_muakkadah} সুন্নাত (মু.)`); // Before Fardh
        if (rakats.fardh) parts.push(`${rakats.fardh} ফরজ`);
        if (rakats.sunnah_muakkadah && ['dhuhr', 'maghrib', 'isha'].includes(selectedPrayer.key)) parts.push(`${rakats.sunnah_muakkadah} সুন্নাত (মু.)`); // After Fardh
        if (rakats.nafl) parts.push(`${rakats.nafl} নফল`);
        if (rakats.witr) parts.push(`${rakats.witr} বিতর (ওয়াজিব)`);
        return parts.join(' + ');
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>নামাজের নিয়ম</Text>
                <View style={styles.prayerTabs}>
                    {prayersInfo.map(prayer => (
                        <TouchableOpacity
                            key={prayer.key}
                            style={[styles.tabButton, selectedPrayer.key === prayer.key && styles.activeTab]}
                            onPress={() => setSelectedPrayer(prayer)}
                        >
                            <Text style={[styles.tabText, selectedPrayer.key === prayer.key && styles.activeTabText]}>
                                {prayer.name_bn}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView>
                {/* --- ৫ ওয়াক্ত নামাজের বিবরণ --- */}
                <View style={styles.prayerDetailsCard}>
                    <Text style={styles.prayerName}>{selectedPrayer.name_bn}</Text>
                    <Text style={styles.rakatInfo}>মোট রাকাত: {getRakatString(selectedPrayer.rakats)}</Text>
                    {selectedPrayer.notes_bn && <Text style={styles.notes}>{selectedPrayer.notes_bn}</Text>}
                </View>

                <Text style={styles.sectionTitle}>কিভাবে পড়বেন (প্রথম রাকাত):</Text>
                {salahSteps.map(step => (
                    <StepItem key={`r1-${step.step}`} step={step} />
                ))}

                <Text style={styles.sectionTitle}>দ্বিতীয় রাকাত ও বৈঠক:</Text>
                <View style={[styles.stepCard, { backgroundColor: CARD_COLOR_PRIMARY, flexDirection: 'column' }]}>
                    <Text style={[styles.stepAction, { marginBottom: 8 }]}>দ্বিতীয় রাকাত:</Text>
                    <Text style={styles.stepReciteBn}>
                        - দ্বিতীয় রাকাত প্রথম রাকাতের মতোই শুরু করুন, তবে শুরুতে সানা পড়তে হবে না। {"\n"}
                        - সুরা ফাতিহার পর অন্য একটি সুরা বা কিছু আয়াত মেলান।{"\n"}
                        - রুকু ও সিজদাহ্ স্বাভাবিক নিয়মে করুন।{"\n"}
                        - দ্বিতীয় সিজদার পর বসুন।
                    </Text>
                    <Text style={[styles.stepAction, { marginTop: 15, marginBottom: 8 }]}>বৈঠক (ক্বadah):</Text>
                    <Text style={styles.stepReciteBn}>
                        - <Text style={{ fontWeight: 'bold' }}>২ রাকাত বিশিষ্ট নামাজে (ফজর, সুন্নাত, নফল):</Text> দ্বিতীয় রাকাতের শেষ সিজদার পর বসে তাশাহহুদ (আত্তাহিয়্যাতু), দরুদ শরিফ ও দোয়া মাসুরা পড়ে ডানে ও বামে সালাম ফেরাতে হবে।{"\n"}
                        - <Text style={{ fontWeight: 'bold' }}>৩ বা ৪ রাকাত বিশিষ্ট নামাজে (যোহর, আসর, মাগরিব, ইশা):</Text> দ্বিতীয় রাকাতের সিজদার পর বসে শুধু তাশাহহুদ (আত্তাহিয়্যাতু) পড়ে আল্লাহু আকবার বলে তৃতীয় রাকাতের জন্য দাঁড়াতে হবে।
                    </Text>
                </View>

                {(selectedPrayer.rakats.fardh > 2 || selectedPrayer.rakats.sunnah_muakkadah === 4 || selectedPrayer.rakats.sunnah_ghair_muakkadah === 4 || selectedPrayer.rakats.witr === 3) && (
                    <>
                        <Text style={styles.sectionTitle}>তৃতীয় ও চতুর্থ রাকাত:</Text>
                        <View style={[styles.stepCard, { backgroundColor: CARD_COLOR_PRIMARY, flexDirection: 'column' }]}>
                            <Text style={[styles.stepAction, { marginBottom: 8 }]}>তৃতীয় রাকাত:</Text>
                            <Text style={styles.stepReciteBn}>
                                - সুরা ফাতিহা পড়ুন।{"\n"}
                                - <Text style={{ fontWeight: 'bold' }}>ফরজ নামাজে:</Text> সুরা ফাতিহার পর অন্য সুরা মেলানো হয় না।{"\n"}
                                - <Text style={{ fontWeight: 'bold' }}>সুন্নাত/নফল/বিতর নামাজে:</Text> সুরা ফাতিহার পর অন্য সুরা বা আয়াত মেলান।{"\n"}
                                - রুকু ও সিজদাহ্ স্বাভাবিক নিয়মে করুন।{"\n"}
                                - <Text style={{ fontWeight: 'bold' }}>৩ রাকাত বিশিষ্ট নামাজে (মাগরিব ফরজ, বিতর):</Text> তৃতীয় রাকাতের শেষ সিজদার পর বসে পড়ুন (শেষ বৈঠক)।{"\n"}
                                - <Text style={{ fontWeight: 'bold' }}>৪ রাকাত বিশিষ্ট নামাজে:</Text> তৃতীয় রাকাতের শেষ সিজদার পর আল্লাহু আকবার বলে চতুর্থ রাকাতের জন্য দাঁড়ান।
                            </Text>
                            <Text style={[styles.stepAction, { marginTop: 15, marginBottom: 8 }]}>চতুর্থ রাকাত (যদি থাকে):</Text>
                            <Text style={styles.stepReciteBn}>
                                - তৃতীয় রাকাতের মতোই পড়ুন (ফরজ হলে ফাতিহার পর সুরা মেলানো ছাড়া)।{"\n"}
                                - শেষ সিজদার পর বসুন (শেষ বৈঠক)।
                            </Text>
                        </View>
                    </>
                )}

                <Text style={styles.sectionTitle}>শেষ বৈঠক ও সালাম:</Text>
                <View style={[styles.stepCard, { backgroundColor: CARD_COLOR_PRIMARY, flexDirection: 'column' }]}>
                    <Text style={styles.stepReciteBn}>
                        - শেষ বৈঠকে তাশাহহুদ (আত্তাহিয়্যাতু), দরুদ শরিফ (আল্লাহুম্মা সাল্লি আলা... বারিক আলা...) এবং দোয়া মাসুরা (আল্লাহুম্মা ইন্নি যালামতু নাফসি...) পড়ুন।{"\n"}
                        - প্রথমে ডান দিকে, তারপর বাম দিকে মুখ ফিরিয়ে বলুন "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ"।
                    </Text>
                    {/* !!! এখানে তাশাহহুদ, দরুদ, দোয়া মাসুরা, সালামের টেক্সট, উচ্চারণ ও অর্থ যোগ করতে হবে !!! */}
                    <View style={{ marginTop: 15 }}>
                        <Text style={[styles.stepAction, { color: ACCENT_COLOR }]}> (এখানে আত্তাহিয়্যাতু, দরুদ ইত্যাদি দেখান)</Text>
                    </View>
                </View>

                {selectedPrayer.key === 'isha' && (
                    <>
                        <Text style={styles.sectionTitle}>বিতর নামাজের নিয়ম (দোয়া কুনুত):</Text>
                        <View style={[styles.stepCard, { backgroundColor: CARD_COLOR_PRIMARY, flexDirection: 'column' }]}>
                            <Text style={styles.stepReciteBn}>
                                - ইশার ৩ রাকাত বিতর নামাজের তৃতীয় রাকাতে সুরা ফাতিহা ও অন্য সুরা মেলানোর পর, রুকুতে যাওয়ার আগে "আল্লাহু আকবার" বলে হাত কান পর্যন্ত উঠিয়ে আবার নাভির নিচে বাঁধতে হবে।{"\n"}
                                - এরপর দোয়া কুনুত পড়ুন।{"\n"}
                                - তারপর আল্লাহু আকবার বলে রুকুতে যান এবং বাকি নামাজ স্বাভাবিক নিয়মে শেষ করুন।
                            </Text>
                            {/* !!! এখানে দোয়া কুনুতের টেক্সট, উচ্চারণ ও অর্থ যোগ করতে হবে !!! */}
                            <View style={{ marginTop: 15 }}>
                                <Text style={[styles.stepAction, { color: ACCENT_COLOR }]}> (এখানে দোয়া কুনুত দেখান)</Text>
                            </View>
                        </View>
                    </>
                )}

                {/* --- অন্যান্য গুরুত্বপূর্ণ নামাজ সেকশন --- */}
                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>অন্যান্য গুরুত্বপূর্ণ নামাজ:</Text>
                {specialPrayers.map(prayer => (
                    <SpecialPrayerItem key={prayer.key} prayer={prayer} />
                ))}

            </ScrollView>
        </SafeAreaView>
    );
};

export default NamazGuideScreen;