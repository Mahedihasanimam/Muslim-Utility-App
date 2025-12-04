import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
    page: '#151e32',         // Slightly lighter than bg for Ayah cards
};

// --- Corrected Surah Names (Transliterated in Bangla) ---
const surahNameCorrections: { [key: number]: string } = {
    1: "আল ফাতিহা", 2: "আল বাকারা", 3: "আল ইমরান", 4: "আন নিসা", 5: "আল মায়িদাহ",
    6: "আল আনআম", 7: "আল আরাফ", 8: "আল আনফাল", 9: "আত তাওবাহ", 10: "ইউনুস",
    11: "হুদ", 12: "ইউসুফ", 13: "আর রাদ", 14: "ইবরাহিম", 15: "আল হিজর",
    16: "আন নাহল", 17: "আল ইসরা", 18: "আল কাহফ", 19: "মারইয়াম", 20: "ত্ব-হা",
    21: "আল আম্বিয়া", 22: "আল হাজ্জ", 23: "আল মুমিনুন", 24: "আন নুর", 25: "আল ফুরকান",
    26: "আশ শুআরা", 27: "আন নমল", 28: "আল কাসাস", 29: "আল আনকাবুত", 30: "আর রুম",
    31: "লুকমান", 32: "আস সাজদাহ", 33: "আল আহযাব", 34: "সাবা", 35: "ফাতির",
    36: "ইয়াসিন", 37: "আস সাফফাত", 38: "সদ", 39: "আয যুমার", 40: "গাফির",
    41: "ফুসসিলাত", 42: "আশ শূরা", 43: "আয যুখরুফ", 44: "আদ দুখান", 45: "আল জাছিয়াহ",
    46: "আল আহকাফ", 47: "মুহাম্মাদ", 48: "আল ফাতহ", 49: "আল হুজুরাত", 50: "কফ",
    51: "আয যারিয়াত", 52: "আত তুর", 53: "আন নাজম", 54: "আল কমার", 55: "আর রহমান",
    56: "আল ওয়াকিয়াহ", 57: "আল হাদিদ", 58: "আল মুজাদালাহ", 59: "আল হাশর", 60: "আল মুমতাহিনাহ",
    61: "আস সাফ", 62: "আল জুমুআহ", 63: "আল মুনাফিকুন", 64: "আত তাগাবুন", 65: "আত তালাক",
    66: "আত তাহরিম", 67: "আল মুলক", 68: "আল কলাম", 69: "আল হাক্কাহ", 70: "আল মাআরিজ",
    71: "নূহ", 72: "আল জ্বিন", 73: "আল মুযযাম্মিল", 74: "আল মুদ্দাসসির", 75: "আল কিয়ামাহ",
    76: "আল ইনসান", 77: "আল মুরসালাত", 78: "আন নাবা", 79: "আন নাযিয়াত", 80: "আবাসা",
    81: "আত তাকভির", 82: "আল ইনফিতার", 83: "আল মুতাফফিফিন", 84: "আল ইনশিকাক", 85: "আল বুরুজ",
    86: "আত তারিক", 87: "আল আলা", 88: "আল গাশিয়াহ", 89: "আল ফাজর", 90: "আল বালাদ",
    91: "আশ শামস", 92: "আল লাইল", 93: "আদ দোহা", 94: "আশ শারহ", 95: "আত তিন",
    96: "আল আলাক", 97: "আল কদর", 98: "আল বাইয়িনাহ", 99: "আয যিলযাল", 100: "আল আদিয়াত",
    101: "আল কারিআহ", 102: "আত তাকাসুর", 103: "আল আসর", 104: "আল হুমাযাহ", 105: "আল ফিল",
    106: "কুরাইশ", 107: "আল মাউন", 108: "আল কাউসার", 109: "আল কাফিরুন", 110: "আন নাসর",
    111: "আল মাসাদ", 112: "আল ইখলাস", 113: "আল ফালাক", 114: "আন নাস"
};

// --- Interfaces ---
interface Chapter {
    number: number;
    name: string;
    englishName: string;
    banglaName: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface Ayah {
    number: number;
    text: string;
    banglaText: string;
    sajda: boolean;
}

interface ChapterDetails extends Chapter {
    ayahs: Ayah[];
}

interface Hadith {
    hadith_english: string;
    hadith_bangla: string;
    chapter_name: string;
    book_name: string;
}

// --- Reusable Components ---

// স্কেলেটন এনিমেশন হুক
const usePulseAnimation = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();
    }, []);
    return opacity;
};

// ১. সুরা লিস্ট স্কেলেটন
const SurahListSkeleton = () => {
    const opacity = usePulseAnimation();
    return (
        <View>
            {[1, 2, 3, 4, 5].map((key) => (
                <View key={key} style={tw`flex-row items-center justify-between p-4 mb-3 bg-[${THEME.card}] rounded-xl border border-[${THEME.border}]`}>
                    <View style={tw`flex-row items-center flex-1`}>
                        {/* Number Box */}
                        <Animated.View style={[tw`w-8 h-8 bg-slate-700 rounded-md mr-4`, { opacity }]} />
                        <View>
                            {/* Title */}
                            <Animated.View style={[tw`w-32 h-4 bg-slate-700 rounded mb-2`, { opacity }]} />
                            {/* Subtitle */}
                            <Animated.View style={[tw`w-24 h-3 bg-slate-700 rounded`, { opacity }]} />
                        </View>
                    </View>
                    {/* Arabic Name */}
                    <Animated.View style={[tw`w-20 h-6 bg-slate-700 rounded`, { opacity }]} />
                </View>
            ))}
        </View>
    );
};

// ২. হাদিস কার্ড স্কেলেটন
const HadithCardSkeleton = () => {
    const opacity = usePulseAnimation();
    return (
        <View style={tw`mb-8 p-4 bg-[${THEME.card}] rounded-xl border border-[${THEME.border}] items-center`}>
            <Animated.View style={[tw`w-40 h-5 bg-slate-700 rounded mb-4`, { opacity }]} />
            <Animated.View style={[tw`w-full h-3 bg-slate-700 rounded mb-2`, { opacity }]} />
            <Animated.View style={[tw`w-11/12 h-3 bg-slate-700 rounded mb-2`, { opacity }]} />
            <Animated.View style={[tw`w-3/4 h-3 bg-slate-700 rounded mb-4`, { opacity }]} />
            <Animated.View style={[tw`w-32 h-3 bg-slate-700 rounded self-end`, { opacity }]} />
        </View>
    );
};

// ৩. আয়াত ডিটেইলস স্কেলেটন
const AyahListSkeleton = () => {
    const opacity = usePulseAnimation();
    return (
        <View style={tw`px-4 py-4`}>
            {/* Bismillah Placeholder */}
            <View style={tw`items-center my-6`}>
                <Animated.View style={[tw`w-48 h-8 bg-slate-700 rounded mb-2`, { opacity }]} />
            </View>

            {[1, 2, 3].map((key) => (
                <View key={key} style={tw`mb-4 p-4 rounded-lg bg-[${THEME.page}] border border-[${THEME.border}]`}>
                    {/* Header: Number & Checkmark */}
                    <View style={tw`flex-row justify-between items-center mb-4`}>
                        <Animated.View style={[tw`w-10 h-4 bg-slate-700 rounded`, { opacity }]} />
                        <Animated.View style={[tw`w-6 h-6 bg-slate-700 rounded-full`, { opacity }]} />
                    </View>
                    {/* Arabic Text (Right aligned blocks) */}
                    <View style={tw`items-end mb-4`}>
                        <Animated.View style={[tw`w-full h-6 bg-slate-700 rounded mb-2`, { opacity }]} />
                        <Animated.View style={[tw`w-10/12 h-6 bg-slate-700 rounded`, { opacity }]} />
                    </View>
                    {/* Divider */}
                    <View style={tw`h-[1px] bg-slate-700 mb-4 opacity-20`} />
                    {/* Bangla Text (Left aligned blocks) */}
                    <View style={tw`items-start`}>
                        <Animated.View style={[tw`w-11/12 h-4 bg-slate-700 rounded mb-2`, { opacity }]} />
                        <Animated.View style={[tw`w-3/4 h-4 bg-slate-700 rounded`, { opacity }]} />
                    </View>
                </View>
            ))}
        </View>
    );
};

const IslamicOrnament = (): React.JSX.Element => (
    <View style={tw`items-center my-4`}>
        <Svg height="30" width="150" viewBox="0 0 200 40">
            <Path
                d="M100 20 C 80 0, 20 0, 0 20 C 20 40, 80 40, 100 20 M100 20 C 120 0, 180 0, 200 20 C 180 40, 120 40, 100 20 Z"
                fill="none" stroke={THEME.primary} strokeWidth="1.5"
            />
            <Path
                d="M100 20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0" fill={THEME.primary}
            />
        </Svg>
    </View>
);

const Bismillah = (): React.JSX.Element => (
    <View style={tw`items-center my-6 py-4`}>
        <Text style={tw`text-2xl text-[${THEME.primary}] font-['Amiri-Regular'] text-center leading-10`}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
    </View>
);

const AnimatedCheckmark = ({ isRead, onPress }: { isRead: boolean; onPress: () => void; }): React.JSX.Element => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        onPress();
        scaleValue.setValue(0.8);
        Animated.spring(scaleValue, {
            toValue: 1,
            bounciness: 12,
            speed: 20,
            useNativeDriver: true,
        }).start();
    };

    const animatedStyle = {
        transform: [{ scale: scaleValue }],
    };

    return (
        <TouchableOpacity onPress={handlePress} style={tw`p-2`} activeOpacity={0.7}>
            <Animated.View style={animatedStyle}>
                <AntDesign name={isRead ? "checkcircle" : "checkcircleo"} size={24} color={isRead ? THEME.secondary : THEME.textSub} />
            </Animated.View>
        </TouchableOpacity>
    );
};


// --- Main Screen Component ---
const QuranScreen = (): React.JSX.Element => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<ChapterDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false); // Separate loading for details
    const [error, setError] = useState<string | null>(null);
    const [readAyahs, setReadAyahs] = useState<Set<string>>(new Set());
    const [translationsVisible, setTranslationsVisible] = useState<boolean>(true);
    const [motivationalHadith, setMotivationalHadith] = useState<Hadith | null>(null);
    const [hadithLoading, setHadithLoading] = useState<boolean>(false);

    useEffect(() => {
        loadReadAyahs();
        fetchChapters();
        fetchRandomHadith();
    }, []);

    const fetchRandomHadith = useCallback(async () => {
        setHadithLoading(true);
        try {
            const response = await axios.get('https://random-hadith-generator.vercel.app/api/random');
            const data = response.data;
            setMotivationalHadith({
                hadith_bangla: data.hadith_bn,
                book_name: data.book_name_bn,
                chapter_name: data.chapter_name_bn,
                hadith_english: ''
            });
        } catch (err) {
            setMotivationalHadith({
                hadith_bangla: "তোমাদের মধ্যে সর্বোত্তম সে ব্যক্তি, যে নিজে কুরআন শিখে এবং অন্যকে তা শেখায়।",
                book_name: "সহিহ বুখারি",
                chapter_name: "কুরআনের ফযিলত",
                hadith_english: ""
            });
        } finally {
            setHadithLoading(false);
        }
    }, []);

    const loadReadAyahs = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@readAyahs');
            if (jsonValue !== null) setReadAyahs(new Set(JSON.parse(jsonValue)));
        } catch (e) {
            console.error("Failed to load read ayahs.", e);
        }
    };

    const saveReadAyahs = async (updatedSet: Set<string>) => {
        try {
            await AsyncStorage.setItem('@readAyahs', JSON.stringify(Array.from(updatedSet)));
        } catch (e) {
            console.error("Failed to save read ayahs.", e);
        }
    };

    const toggleReadStatus = useCallback((surahNumber: number, ayahNumber: number) => {
        const newReadAyahs = new Set(readAyahs);
        const key = `${surahNumber}:${ayahNumber}`;
        if (newReadAyahs.has(key)) {
            newReadAyahs.delete(key);
        } else {
            newReadAyahs.add(key);
        }
        setReadAyahs(newReadAyahs);
        saveReadAyahs(newReadAyahs);
    }, [readAyahs]);

    const fetchChapters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('https://api.quran.com/api/v4/chapters?language=bn');
            if (!response.data?.chapters) throw new Error("Invalid API response.");

            const formattedChapters = response.data.chapters.map((ch: any): Chapter => ({
                number: ch.id,
                name: ch.name_arabic,
                englishName: ch.name_simple,
                banglaName: surahNameCorrections[ch.id] || ch.translated_name.name,
                numberOfAyahs: ch.verses_count,
                revelationType: ch.revelation_place,
            }));
            setChapters(formattedChapters);
        } catch (err) {
            setError('সুরা লোড করতে সমস্যা হচ্ছে। ইন্টারনেট চেক করুন।');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchChapterDetails = useCallback(async (chapter: Chapter) => {
        // Set basic details first to show UI immediately, then load Ayahs
        setSelectedChapter({ ...chapter, ayahs: [] });
        setDetailsLoading(true);
        setError(null);

        try {
            const API_URL = `https://api.alquran.cloud/v1/surah/${chapter.number}/editions/quran-uthmani,bn.bengali`;
            const response = await axios.get(API_URL);

            const [arabicEdition, banglaEdition] = response.data.data;
            if (!arabicEdition?.ayahs || !banglaEdition?.ayahs) throw new Error('Could not get Ayah data from API.');

            const mergedAyahs: Ayah[] = arabicEdition.ayahs.map((ayah: any, index: number): Ayah => ({
                number: ayah.numberInSurah,
                text: ayah.text,
                sajda: ayah.sajda !== false,
                banglaText: banglaEdition.ayahs[index]?.text || 'অনুবাদ উপলব্ধ নয়।',
            }));

            setTranslationsVisible(true);
            setSelectedChapter({ ...chapter, ayahs: mergedAyahs });
        } catch (err) {
            setError('সুরা ডিটেইলস লোড করা যাচ্ছে না।');
            setSelectedChapter(null); // Go back to list on error
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    // --- Render Functions ---
    const renderChapterList = (): React.JSX.Element => (
        <ScrollView contentContainerStyle={tw`py-6 px-4`}>
            {/* Motivational Hadith Card */}
            {hadithLoading ? (
                <HadithCardSkeleton />
            ) : motivationalHadith ? (
                <View style={tw`mb-8 p-5 bg-[${THEME.card}] rounded-2xl border border-[${THEME.primary}]/20 shadow-lg relative overflow-hidden`}>
                    {/* Decoration */}
                    <View style={tw`absolute top-0 right-0 opacity-10`}>
                        <MaterialCommunityIcons name="format-quote-close" size={80} color={THEME.primary} />
                    </View>

                    <View style={tw`flex-row items-center justify-center mb-3`}>
                        <MaterialCommunityIcons name="star-four-points" size={16} color={THEME.primary} />
                        <Text style={tw`text-sm font-bold text-[${THEME.primary}] mx-2 uppercase tracking-wide`}>অনুপ্রেরণা</Text>
                        <MaterialCommunityIcons name="star-four-points" size={16} color={THEME.primary} />
                    </View>

                    <Text style={tw`text-base text-[${THEME.textMain}] leading-7 mb-4 text-center italic`}>
                        "{motivationalHadith.hadith_bangla}"
                    </Text>

                    <View style={tw`border-t border-[${THEME.border}] w-1/2 self-center my-2 opacity-50`} />

                    <Text style={tw`text-xs text-center text-[${THEME.textSub}] font-bold`}>
                        {motivationalHadith.book_name} • {motivationalHadith.chapter_name}
                    </Text>
                </View>
            ) : null}

            {/* Surah List */}
            {loading ? (
                <SurahListSkeleton />
            ) : (
                chapters.map((chapter) => (
                    <TouchableOpacity
                        key={chapter.number}
                        style={tw`flex-row items-center justify-between p-4 mb-3 bg-[${THEME.card}] rounded-xl border border-[${THEME.border}] shadow-sm`}
                        onPress={() => fetchChapterDetails(chapter)}
                        activeOpacity={0.7}
                    >
                        <View style={tw`flex-row items-center flex-1`}>
                            {/* Surah Number Badge */}
                            <View style={tw`w-10 h-10 mr-4 items-center justify-center bg-[${THEME.bg}] border border-[${THEME.border}] rounded-lg relative`}>
                                <View style={tw`absolute rotate-45 w-6 h-6 border border-[${THEME.primary}]/30`} />
                                <Text style={tw`text-sm font-bold text-[${THEME.primary}]`}>{chapter.number}</Text>
                            </View>

                            <View>
                                <Text style={tw`text-base font-bold text-[${THEME.textMain}]`}>{chapter.banglaName}</Text>
                                <Text style={tw`text-xs text-[${THEME.textSub}] mt-1`}>
                                    {chapter.englishName} • {chapter.numberOfAyahs} আয়াত • <Text style={tw`text-[${THEME.secondary}]`}>{chapter.revelationType === 'makkah' ? 'মাক্কী' : 'মাদানী'}</Text>
                                </Text>
                            </View>
                        </View>
                        <Text style={tw`text-2xl text-[${THEME.primary}] font-['Amiri-Regular'] ml-4 opacity-90`}>{chapter.name}</Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );

    const renderChapterDetails = (): React.JSX.Element | null => {
        if (!selectedChapter) return null;
        return (
            <>
                <View style={tw`flex-row items-center justify-between p-4 bg-[${THEME.card}] border-b border-[${THEME.border}] shadow-md z-10`}>
                    <TouchableOpacity onPress={() => setSelectedChapter(null)} style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}]`}>
                        <AntDesign name="arrowleft" size={20} color={THEME.textMain} />
                    </TouchableOpacity>
                    <View style={tw`flex-1 items-center`}>
                        <Text style={tw`text-lg font-bold text-[${THEME.primary}]`}>{selectedChapter.banglaName}</Text>
                        <Text style={tw`text-xs text-[${THEME.textSub}]`}>{selectedChapter.englishName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setTranslationsVisible(!translationsVisible)}
                        style={tw`p-2 bg-[${THEME.bg}] rounded-full border border-[${THEME.border}]`}
                    >
                        <MaterialCommunityIcons
                            name={translationsVisible ? "eye-outline" : "eye-off-outline"}
                            size={20}
                            color={THEME.secondary}
                        />
                    </TouchableOpacity>
                </View>

                {detailsLoading ? (
                    <AyahListSkeleton />
                ) : (
                    <ScrollView contentContainerStyle={tw`pb-6 px-4`}>
                        <IslamicOrnament />

                        {selectedChapter.number !== 9 && selectedChapter.number !== 1 && <Bismillah />}

                        {selectedChapter.ayahs.map((ayah) => {
                            const isRead = readAyahs.has(`${selectedChapter.number}:${ayah.number}`);
                            return (
                                <View
                                    key={ayah.number}
                                    style={tw`mb-4 p-4 rounded-xl bg-[${isRead ? '#0e2a2a' : THEME.page}] border border-[${isRead ? THEME.success : THEME.border}] shadow-sm relative overflow-hidden`}
                                >
                                    {/* Read Indicator Stripe */}
                                    {isRead && <View style={tw`absolute top-0 bottom-0 left-0 w-1 bg-[${THEME.success}]`} />}

                                    <View style={tw`flex-row justify-between items-center mb-4 border-b border-[${THEME.border}]/50 pb-2`}>
                                        <View style={tw`bg-[${THEME.bg}] px-3 py-1 rounded-full border border-[${THEME.border}]`}>
                                            <Text style={tw`font-bold text-[${THEME.primary}] text-xs`}>{selectedChapter.number} : {ayah.number}</Text>
                                        </View>
                                        <AnimatedCheckmark isRead={isRead} onPress={() => toggleReadStatus(selectedChapter.number, ayah.number)} />
                                    </View>

                                    <Text style={tw`text-right text-3xl leading-[50px] text-[${THEME.textMain}] mb-4 font-['Amiri-Regular']`}>
                                        {ayah.text}
                                    </Text>

                                    {translationsVisible && (
                                        <View style={tw`mt-2 bg-[${THEME.bg}]/50 p-3 rounded-lg border border-[${THEME.border}]/50`}>
                                            <Text style={tw`text-sm text-[${THEME.textSub}] leading-6 font-medium`}>
                                                {ayah.banglaText}
                                            </Text>
                                        </View>
                                    )}

                                    {ayah.sajda && (
                                        <View style={tw`mt-3 flex-row justify-end items-center`}>
                                            <View style={tw`flex-row items-center py-1 px-3 rounded-full bg-[${THEME.primary}]/10 border border-[${THEME.primary}]/30`}>
                                                <MaterialCommunityIcons name="book-open-page-variant" size={12} color={THEME.primary} style={tw`mr-1`} />
                                                <Text style={tw`text-[10px] font-bold text-[${THEME.primary}]`}>সাজদাহ ওয়াজিব</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        <View style={tw`mt-8 mb-4 p-6 bg-[${THEME.card}] rounded-2xl border border-dashed border-[${THEME.border}] items-center`}>
                            <MaterialCommunityIcons name="book-check-outline" size={32} color={THEME.textSub} style={tw`mb-2 opacity-50`} />
                            <Text style={tw`text-sm text-center text-[${THEME.textSub}] leading-6`}>
                                "নিশ্চয়ই আমি কুরআন অবতীর্ণ করেছি এবং আমিই এর সংরক্ষক।"{"\n"}
                                <Text style={tw`text-[${THEME.primary}] text-xs`}>- সূরা আল-হিজর, আয়াত ৯</Text>
                            </Text>
                        </View>
                    </ScrollView>
                )}
            </>
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {!selectedChapter && (
                <View style={tw`py-5 px-6 border-b border-[${THEME.border}] bg-[${THEME.bg}]`}>
                    <View style={tw`flex-row items-center justify-center`}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={24} color={THEME.primary} style={tw`mr-2`} />
                        <Text style={tw`text-2xl font-bold text-center text-[${THEME.textMain}] tracking-wider`}>আল-কুরআন</Text>
                    </View>
                    <Text style={tw`text-center text-[${THEME.secondary}] text-[10px] uppercase tracking-[4px] mt-1 opacity-80`}>Digital Quran</Text>
                </View>
            )}

            {error ? (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <MaterialCommunityIcons name="wifi-off" size={60} color={THEME.danger} style={tw`mb-4 opacity-80`} />
                    <Text style={tw`text-[${THEME.textMain}] text-lg font-bold text-center`}>দুঃখিত!</Text>
                    <Text style={tw`text-[${THEME.textSub}] text-sm text-center mt-2 mb-6`}>{error}</Text>
                    <TouchableOpacity
                        onPress={() => selectedChapter ? fetchChapterDetails(selectedChapter) : fetchChapters()}
                        style={tw`py-3 px-6 bg-[${THEME.secondary}] rounded-full shadow-lg shadow-cyan-500/20`}
                    >
                        <Text style={tw`text-[#0F172A] font-bold`}>আবার চেষ্টা করুন</Text>
                    </TouchableOpacity>
                </View>
            ) : selectedChapter ? (
                renderChapterDetails()
            ) : (
                renderChapterList()
            )}
        </SafeAreaView>
    );
};

export default QuranScreen;