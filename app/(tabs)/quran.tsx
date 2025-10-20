import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import tw from 'twrnc';

// --- App Color Palette ---
const PRIMARY_DARK_COLOR = '#0a101f';
const ACCENT_COLOR = '#69D2B7';
const TEXT_LIGHT = '#F1F5F9';
const TEXT_MUTED = '#94A3B8';
const CARD_BG_COLOR = '#1E293B';
const BORDER_COLOR = '#334155';
const WARNING_COLOR = '#F59E0B';
const PAGE_COLOR = '#1c2637';
const READ_BORDER_COLOR = '#2dd4bf';

// --- Corrected Surah Names (Transliterated in Bangla) ---
const surahNameCorrections: { [key: number]: string } = {
    1: "আল ফাতিহা",
    2: "আল বাকারা",
    3: "আল ইমরান",
    4: "আন নিসা",
    5: "আল মায়িদাহ",
    6: "আল আনআম",
    7: "আল আরাফ",
    8: "আল আনফাল",
    9: "আত তাওবাহ",
    10: "ইউনুস",
    11: "হুদ",
    12: "ইউসুফ",
    13: "আর রাদ",
    14: "ইবরাহিম",
    15: "আল হিজর",
    16: "আন নাহল",
    17: "আল ইসরা",
    18: "আল কাহফ",
    19: "মারইয়াম",
    20: "ত্ব-হা",
    21: "আল আম্বিয়া",
    22: "আল হাজ্জ",
    23: "আল মুমিনুন",
    24: "আন নুর",
    25: "আল ফুরকান",
    26: "আশ শুআরা",
    27: "আন নমল",
    28: "আল কাসাস",
    29: "আল আনকাবুত",
    30: "আর রুম",
    31: "লুকমান",
    32: "আস সাজদাহ",
    33: "আল আহযাব",
    34: "সাবা",
    35: "ফাতির",
    36: "ইয়াসিন",
    37: "আস সাফফাত",
    38: "সদ",
    39: "আয যুমার",
    40: "গাফির",
    41: "ফুসসিলাত",
    42: "আশ শূরা",
    43: "আয যুখরুফ",
    44: "আদ দুখান",
    45: "আল জাছিয়াহ",
    46: "আল আহকাফ",
    47: "মুহাম্মাদ",
    48: "আল ফাতহ",
    49: "আল হুজুরাত",
    50: "কফ",
    51: "আয যারিয়াত",
    52: "আত তুর",
    53: "আন নাজম",
    54: "আল কমার",
    55: "আর রহমান",
    56: "আল ওয়াকিয়াহ",
    57: "আল হাদিদ",
    58: "আল মুজাদালাহ",
    59: "আল হাশর",
    60: "আল মুমতাহিনাহ",
    61: "আস সাফ",
    62: "আল জুমুআহ",
    63: "আল মুনাফিকুন",
    64: "আত তাগাবুন",
    65: "আত তালাক",
    66: "আত তাহরিম",
    67: "আল মুলক",
    68: "আল কলাম",
    69: "আল হাক্কাহ",
    70: "আল মাআরিজ",
    71: "নূহ",
    72: "আল জ্বিন",
    73: "আল মুযযাম্মিল",
    74: "আল মুদ্দাসসির",
    75: "আল কিয়ামাহ",
    76: "আল ইনসান",
    77: "আল মুরসালাত",
    78: "আন নাবা",
    79: "আন নাযিয়াত",
    80: "আবাসা",
    81: "আত তাকভির",
    82: "আল ইনফিতার",
    83: "আল মুতাফফিফিন",
    84: "আল ইনশিকাক",
    85: "আল বুরুজ",
    86: "আত তারিক",
    87: "আল আলা",
    88: "আল গাশিয়াহ",
    89: "আল ফাজর",
    90: "আল বালাদ",
    91: "আশ শামস",
    92: "আল লাইল",
    93: "আদ দোহা",
    94: "আশ শারহ",
    95: "আত তিন",
    96: "আল আলাক",
    97: "আল কদর",
    98: "আল বাইয়িনাহ",
    99: "আয যিলযাল",
    100: "আল আদিয়াত",
    101: "আল কারিআহ",
    102: "আত তাকাসুর",
    103: "আল আসর",
    104: "আল হুমাযাহ",
    105: "আল ফিল",
    106: "কুরাইশ",
    107: "আল মাউন",
    108: "আল কাউসার",
    109: "আল কাফিরুন",
    110: "আন নাসর",
    111: "আল মাসাদ",
    112: "আল ইখলাস",
    113: "আল ফালাক",
    114: "আন নাস"
};


// --- TypeScript Interfaces ---
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
const IslamicOrnament = (): JSX.Element => (
    <View style={tw`items-center my-4`}>
        <Svg height="30" width="150" viewBox="0 0 200 40">
            <Path
                d="M100 20 C 80 0, 20 0, 0 20 C 20 40, 80 40, 100 20 M100 20 C 120 0, 180 0, 200 20 C 180 40, 120 40, 100 20 Z"
                fill="none" stroke={ACCENT_COLOR} strokeWidth="1.5"
            />
            <Path
                d="M100 20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0" fill={ACCENT_COLOR}
            />
        </Svg>
    </View>
);

const Bismillah = (): JSX.Element => (
    <View style={tw`items-center my-6 py-4`}>
        <Text style={tw`text-2xl text-[${ACCENT_COLOR}] font-['Amiri-Regular'] text-center leading-10`}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
    </View>
);

const AnimatedCheckmark = ({ isRead, onPress }: { isRead: boolean; onPress: () => void; }): JSX.Element => {
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
                <AntDesign name={isRead ? "checkcircle" : "checkcircleo"} size={24} color={isRead ? READ_BORDER_COLOR : TEXT_MUTED} />
            </Animated.View>
        </TouchableOpacity>
    );
};


// --- Main Screen Component ---
const QuranScreen = (): JSX.Element => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<ChapterDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
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
            console.error("Failed to fetch hadith.", err);
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
            setError('Could not load Surah list.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchChapterDetails = useCallback(async (chapter: Chapter) => {
        try {
            setLoading(true);
            setError(null);
            const API_URL = `https://api.alquran.cloud/v1/surah/${chapter.number}/editions/quran-uthmani,bn.bengali`;
            const response = await axios.get(API_URL);

            const [arabicEdition, banglaEdition] = response.data.data;
            if (!arabicEdition?.ayahs || !banglaEdition?.ayahs) throw new Error('Could not get Ayah data from API.');

            const mergedAyahs: Ayah[] = arabicEdition.ayahs.map((ayah: any, index: number): Ayah => ({
                number: ayah.numberInSurah,
                text: ayah.text,
                sajda: ayah.sajda !== false,
                banglaText: banglaEdition.ayahs[index]?.text || 'Translation not available.',
            }));

            setTranslationsVisible(true);
            setSelectedChapter({ ...chapter, ayahs: mergedAyahs });
        } catch (err) {
            setError('Could not load Surah details.');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Render Functions ---
    const renderChapterList = (): JSX.Element => (
        <ScrollView contentContainerStyle={tw`py-6 px-4`}>
            <View style={tw`mb-8 p-4 bg-[${CARD_BG_COLOR}] rounded-xl border border-[${BORDER_COLOR}]`}>
                <Text style={tw`text-lg font-bold text-center text-[${ACCENT_COLOR}] mb-2`}>অনুপ্রেরণামূলক হাদিস</Text>
                {hadithLoading ? (
                    <ActivityIndicator size="small" color={ACCENT_COLOR} />
                ) : motivationalHadith ? (
                    <>
                        <Text style={tw`text-base text-[${TEXT_LIGHT}] leading-6 mb-2 text-justify`}>"{motivationalHadith.hadith_bangla}"</Text>
                        <Text style={tw`text-sm text-right text-[${TEXT_MUTED}]`}>{`${motivationalHadith.book_name} - ${motivationalHadith.chapter_name}`}</Text>
                    </>
                ) : <Text style={tw`text-center text-[${TEXT_MUTED}]`}>হাদিস লোড করা যায়নি</Text>}
            </View>

            {chapters.map((chapter) => (
                <TouchableOpacity key={chapter.number} style={tw`flex-row items-center justify-between p-4 mb-3 bg-[${CARD_BG_COLOR}] rounded-xl border border-[${BORDER_COLOR}]`} onPress={() => fetchChapterDetails(chapter)} activeOpacity={0.7}>
                    <View style={tw`flex-row items-center flex-1`}>
                        <Text style={tw`text-lg font-bold text-[${ACCENT_COLOR}] mr-4 w-8 text-center`}>{chapter.number}</Text>
                        <View>
                            <Text style={tw`text-lg font-bold text-[${TEXT_LIGHT}]`}>{chapter.banglaName}</Text>
                            <Text style={tw`text-sm text-[${TEXT_MUTED}]`}>{chapter.englishName} • {chapter.numberOfAyahs} Ayahs • <Text style={tw`capitalize`}>{chapter.revelationType === 'makkah' ? 'Makki' : 'Madani'}</Text></Text>
                        </View>
                    </View>
                    <Text style={tw`text-2xl text-[${TEXT_LIGHT}] font-['Amiri-Regular'] ml-4`}>{chapter.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderChapterDetails = (): JSX.Element | null => {
        if (!selectedChapter) return null;
        return (
            <>
                <View style={tw`flex-row items-center justify-between p-4 bg-[${CARD_BG_COLOR}] border-b border-[${BORDER_COLOR}]`}>
                    <TouchableOpacity onPress={() => setSelectedChapter(null)} style={tw`p-2`}>
                        <AntDesign name="arrowleft" size={24} color={ACCENT_COLOR} />
                    </TouchableOpacity>
                    <View style={tw`flex-1 items-center`}>
                        <Text style={tw`text-xl font-bold text-[${TEXT_LIGHT}]`}>{selectedChapter.banglaName}</Text>
                        <Text style={tw`text-sm text-[${TEXT_MUTED}]`}>{selectedChapter.englishName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setTranslationsVisible(!translationsVisible)} style={tw`p-2 mx-1`}>
                        <MaterialCommunityIcons name={translationsVisible ? "file-eye-outline" : "file-eye"} size={24} color={ACCENT_COLOR} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={tw`pb-6 px-4`}>
                    <IslamicOrnament />

                    {selectedChapter.number !== 9 && selectedChapter.number !== 1 && <Bismillah />}

                    {selectedChapter.ayahs.map((ayah) => {
                        const isRead = readAyahs.has(`${selectedChapter.number}:${ayah.number}`);
                        return (
                            <View key={ayah.number} style={tw`mb-4 p-4 rounded-lg bg-[${isRead ? '#1a3633' : PAGE_COLOR}] border border-[${isRead ? READ_BORDER_COLOR : BORDER_COLOR}]`}>
                                <View style={tw`flex-row justify-between items-center mb-4`}>
                                    <Text style={tw`font-bold text-[${ACCENT_COLOR}] text-lg`}>{selectedChapter.number}:{ayah.number}</Text>
                                    <AnimatedCheckmark isRead={isRead} onPress={() => toggleReadStatus(selectedChapter.number, ayah.number)} />
                                </View>

                                <Text style={tw`text-right text-3xl leading-10 text-[${TEXT_LIGHT}] mb-4 font-['Amiri-Regular']`}>
                                    {ayah.text}
                                </Text>

                                {translationsVisible && (
                                    <>
                                        <View style={tw`border-b border-dashed border-[${BORDER_COLOR}] my-2`} />
                                        <View style={tw`mt-4`}>
                                            <Text style={tw`text-base text-[${TEXT_MUTED}]`}>
                                                <Text style={tw`font-bold text-[${ACCENT_COLOR}]`}> অনুবাদ: </Text>
                                                {ayah.banglaText}
                                            </Text>
                                        </View>
                                    </>
                                )}

                                {ayah.sajda && (
                                    <View style={tw`mt-4 flex-row justify-end items-center`}>
                                        <View style={tw`py-1 px-3 rounded-full bg-[${ACCENT_COLOR}]`}>
                                            <Text style={tw`text-xs font-bold text-[${PRIMARY_DARK_COLOR}]`}>সাজদাহ</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    <View style={tw`mt-8 p-4 bg-[${CARD_BG_COLOR}] rounded-xl border border-dashed border-[${BORDER_COLOR}] items-center`}>
                        <Text style={tw`text-base text-center text-[${TEXT_MUTED}]`}>"এটি সেই কিতাব যাতে কোন সন্দেহ নেই, যা আল্লাহভীরুদের জন্য পথপ্রদর্শক।" (সূরা আল-বাকারা, আয়াত: ২)</Text>
                    </View>
                </ScrollView>
            </>
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[${PRIMARY_DARK_COLOR}]`}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DARK_COLOR} />

            {!selectedChapter && (
                <View style={tw`py-6 px-6`}>
                    <Text style={tw`text-3xl font-bold text-center text-[${TEXT_LIGHT}]`}>আল-কুরআন</Text>
                </View>
            )}

            {loading ? (
                <View style={tw`flex-1 items-center justify-center`}>
                    <ActivityIndicator size="large" color={ACCENT_COLOR} />
                    <Text style={tw`text-[${TEXT_MUTED}] text-lg mt-4`}>লোড হচ্ছে...</Text>
                </View>
            ) : error ? (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={60} color={WARNING_COLOR} />
                    <Text style={tw`text-[${TEXT_MUTED}] text-lg text-center mt-4`}>{error}</Text>
                    <TouchableOpacity onPress={() => selectedChapter ? fetchChapterDetails(selectedChapter) : fetchChapters()} style={tw`mt-5 py-2 px-5 bg-[${ACCENT_COLOR}] rounded-md`}>
                        <Text style={tw`text-[${PRIMARY_DARK_COLOR}] font-semibold`}>আবার চেষ্টা করো</Text>
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
