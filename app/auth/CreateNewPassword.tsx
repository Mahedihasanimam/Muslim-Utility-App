import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import tw from 'twrnc';

// --- Color Palette ---
const PRIMARY_DARK_COLOR = '#0a101f'; // Deeper navy for a more serene feel
const ACCENT_COLOR = '#69D2B7';
const TEXT_LIGHT = '#F1F5F9';
const TEXT_MUTED = '#94A3B8';
const CARD_BG_COLOR = '#1E293B';
const BORDER_COLOR = '#334155';
const WARNING_COLOR = '#F59E0B';
const PAGE_COLOR = '#1c2637'; // A slightly different dark shade for the "page"

// --- Interfaces for TypeScript ---
interface Chapter {
  number: number;
  name: string; // Arabic name
  englishName: string; // English transliteration
  banglaName: string; // Bengali name
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string; // Arabic text
  banglaText: string; // Bengali translation
  sajda: boolean;
}

interface ChapterDetails {
  number: number;
  name: string; // Arabic name
  englishName: string;
  banglaName: string;
  ayahs: Ayah[];
}

// --- A simple Islamic ornament component ---
const IslamicOrnament = () => (
  <View style={tw`items-center my-4`}>
    <Svg height="30" width="150" viewBox="0 0 200 40">
      <Path
        d="M100 20 C 80 0, 20 0, 0 20 C 20 40, 80 40, 100 20 M100 20 C 120 0, 180 0, 200 20 C 180 40, 120 40, 100 20 Z"
        fill="none"
        stroke={ACCENT_COLOR}
        strokeWidth="1.5"
      />
      <Path
        d="M100 20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0"
        fill={ACCENT_COLOR}
      />
    </Svg>
  </View>
);

const QuranScreen = (): JSX.Element => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [readAyahs, setReadAyahs] = useState<Set<string>>(new Set());

  // --- AsyncStorage Functions to persist read status ---
  const loadReadAyahs = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@readAyahs');
      if (jsonValue !== null) {
        const item = JSON.parse(jsonValue);
        setReadAyahs(new Set(item));
      }
    } catch (e) {
      console.error("Failed to load read ayahs from storage.", e);
    }
  };

  const saveReadAyahs = async (updatedSet: Set<string>) => {
    try {
      const array = Array.from(updatedSet);
      const jsonValue = JSON.stringify(array);
      await AsyncStorage.setItem('@readAyahs', jsonValue);
    } catch (e) {
      console.error("Failed to save read ayahs to storage.", e);
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    loadReadAyahs();
    fetchChapters();
  }, []);

  // --- Toggle and Save Read Status ---
  const toggleReadStatus = useCallback((surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    const newReadAyahs = new Set(readAyahs);
    if (newReadAyahs.has(key)) {
      newReadAyahs.delete(key);
    } else {
      newReadAyahs.add(key);
    }
    setReadAyahs(newReadAyahs);
    saveReadAyahs(newReadAyahs);
  }, [readAyahs]);

  // --- API Fetching Logic ---
  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://api.quran.com/api/v4/chapters?language=bn');
      if (!response.data?.chapters) throw new Error("API response invalid.");

      const chaptersData: Chapter[] = response.data.chapters.map((ch: any) => ({
        number: ch.id,
        name: ch.name_arabic,
        englishName: ch.name_simple,
        banglaName: ch.translated_name.name,
        numberOfAyahs: ch.verses_count,
        revelationType: ch.revelation_place,
      }));
      setChapters(chaptersData);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setError('সূরা তালিকা লোড করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChapterDetails = useCallback(async (chapter: Chapter) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedChapter(null);

      const BENGALI_TRANSLATION_ID = 131; // Dr. Abu Bakar Zakaria
      const [arabicRes, banglaRes] = await Promise.all([
        axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapter.number}`),
        axios.get(`https://api.quran.com/api/v4/quran/translations/${BENGALI_TRANSLATION_ID}?chapter_number=${chapter.number}`)
      ]);

      const mergedAyahs: Ayah[] = arabicRes.data.verses.map((ayah: any, index: number) => ({
        number: parseInt(ayah.verse_key.split(':')[1]),
        text: ayah.text_uthmani,
        sajda: ayah.sajdah_number !== null,
        banglaText: banglaRes.data.translations[index]?.text.replace(/<sup.*?>.*?<\/sup>/g, '') || '',
      }));

      setSelectedChapter({ ...chapter, ayahs: mergedAyahs });
    } catch (err) {
      console.error("Error fetching chapter details:", err);
      setError('সূরার বিস্তারিত তথ্য লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }, []);


  // --- Render Functions ---
  const renderChapterList = () => (
    <ScrollView contentContainerStyle={tw`py-6 px-4`} showsVerticalScrollIndicator={false}>
      {chapters.map((chapter) => (
        <TouchableOpacity
          key={chapter.number}
          style={tw`flex-row items-center justify-between p-4 mb-3 bg-[${CARD_BG_COLOR}] rounded-xl border border-[${BORDER_COLOR}]`}
          onPress={() => fetchChapterDetails(chapter)}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <Text style={tw`text-lg font-bold text-[${ACCENT_COLOR}] mr-4 w-8 text-center`}>{chapter.number}</Text>
            <View>
              <Text style={tw`text-lg font-bold text-[${TEXT_LIGHT}]`}>{chapter.banglaName}</Text>
              <Text style={tw`text-sm text-[${TEXT_MUTED}]`}>{chapter.englishName} • {chapter.numberOfAyahs} Ayahs</Text>
            </View>
          </View>
          <Text style={tw`text-2xl text-[${TEXT_LIGHT}] font-['Amiri-Regular'] ml-4`}>{chapter.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderChapterDetails = () => {
    if (!selectedChapter) return null;
    return (
      <ScrollView contentContainerStyle={tw`py-6 px-4`} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setSelectedChapter(null)} style={tw`flex-row items-center mb-4 self-start`}>
          <AntDesign name="arrowleft" size={24} color={ACCENT_COLOR} style={tw`mr-2`} />
          <Text style={tw`text-lg font-bold text-[${ACCENT_COLOR}]`}>সকল সূরা</Text>
        </TouchableOpacity>

        <View style={tw`mb-4`}>
          <Text style={tw`text-3xl font-bold text-center text-[${TEXT_LIGHT}] mb-1`}>{selectedChapter.banglaName}</Text>
          <Text style={tw`text-lg text-center text-[${TEXT_MUTED}]`}>{selectedChapter.englishName}</Text>
          <IslamicOrnament />
        </View>

        {selectedChapter.ayahs.map((ayah) => {
          const isRead = readAyahs.has(`${selectedChapter.number}:${ayah.number}`);
          return (
            <View key={ayah.number} style={tw`mb-4 p-4 rounded-lg bg-[${PAGE_COLOR}] border border-[${BORDER_COLOR}]`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <TouchableOpacity
                  onPress={() => toggleReadStatus(selectedChapter.number, ayah.number)}
                  style={tw`flex-row items-center p-2`}
                  activeOpacity={0.6}
                >
                  <AntDesign name={isRead ? "checkcircle" : "checkcircleo"} size={24} color={isRead ? ACCENT_COLOR : TEXT_MUTED} />
                  <Text style={tw`font-bold text-[${isRead ? ACCENT_COLOR : TEXT_MUTED}] ml-2`}>{selectedChapter.number}:{ayah.number}</Text>
                </TouchableOpacity>
                {ayah.sajda && (
                  <View style={tw`py-1 px-3 rounded-full bg-[${ACCENT_COLOR}]`}>
                    <Text style={tw`text-xs font-bold text-[${PRIMARY_DARK_COLOR}]`}>সিজদা</Text>
                  </View>
                )}
              </View>

              <Text style={tw`text-right text-3xl leading-10 text-[${TEXT_LIGHT}] mb-4 font-['Amiri-Regular']`}>
                {ayah.text}
              </Text>

              <View style={tw`border-b border-dashed border-[${BORDER_COLOR}] my-4`} />

              <Text style={tw`text-base text-[${TEXT_MUTED}]`}>
                {ayah.banglaText}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // --- Main Return ---
  return (
    <SafeAreaView style={tw`flex-1 bg-[${PRIMARY_DARK_COLOR}]`}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DARK_COLOR} />
      <View style={tw`py-6 px-6`}>
        <Text style={tw`text-3xl font-bold text-center text-[${TEXT_LIGHT}]`}>আল-কুরআন</Text>
      </View>

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={tw`text-[${TEXT_MUTED}] text-lg mt-4`}>লোড হচ্ছে...</Text>
        </View>
      ) : error ? (
        <View style={tw`flex-1 items-center justify-center p-8`}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color={WARNING_COLOR} />
          <Text style={tw`text-[${TEXT_MUTED}] text-lg text-center mt-4`}>{error}</Text>
          <TouchableOpacity onPress={() => selectedChapter ? fetchChapterDetails(selectedChapter as Chapter) : fetchChapters()} style={tw`mt-5 py-2 px-5 bg-[${ACCENT_COLOR}] rounded-md`}>
            <Text style={tw`text-[${PRIMARY_DARK_COLOR}] font-semibold`}>আবার চেষ্টা করুন</Text>
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
