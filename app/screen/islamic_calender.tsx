import tw from '@/assets/lib/tailwind'; // আপনার twrnc ইম্পোর্ট পাথ
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- বাংলা রূপান্তর হেল্পার ---

// ইংরেজি ডিজিটকে বাংলা ডিজিটে রূপান্তর
const enToBnDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
};
const convertToBangla = (numberString: string | number): string => {
    let str = String(numberString);
    return str.replace(/[0-9]/g, (digit) => enToBnDigits[digit] || digit);
};

// হিজরি মাস (API-এর ইংরেজি নামের সাথে ম্যাপ করা)
const hijriMonths: { [key: string]: string } = {
    'Muḥarram': 'মহররম',
    'Ṣafar': 'সফর',
    "Rabī' al-awwal": 'রবিউল আউয়াল',
    "Rabī' al-thānī": 'রবিউস সানি',
    'Jumādá al-ūlá': 'জমাদিউল আউয়াল',
    'Jumādá al-ākhirah': 'জমাদিউস সানি',
    'Rajab': 'রজব',
    "Sha'bān": 'শাবান',
    'Ramaḍān': 'রমজান',
    'Shawwāl': 'শাওয়াল',
    "Dhū al-Qa'dah": 'জিলকদ',
    "Dhū al-Ḥijjah": 'জিলহজ',
};

// গ্রেগরিয়ান মাস
const gregorianMonths: { [key: string]: string } = {
    'January': 'জানুয়ারি', 'February': 'ফেব্রুয়ারি', 'March': 'মার্চ',
    'April': 'এপ্রিল', 'May': 'মে', 'June': 'জুন',
    'July': 'জুলাই', 'August': 'আগস্ট', 'September': 'সেপ্টেম্বর',
    'October': 'অক্টোবর', 'November': 'নভেম্বর', 'December': 'ডিসেম্বর',
};

// বার (API-এর ইংরেজি নামের সাথে ম্যাপ করা)
const weekdays: { [key: string]: string } = {
    'Saturday': 'শনিবার',
    'Sunday': 'রবিবার',
    'Monday': 'সোমবার',
    'Tuesday': 'মঙ্গলবার',
    'Wednesday': 'বুধবার',
    'Thursday': 'বৃহস্পতিবার',
    'Friday': 'শুক্রবার',
};

// --- API ডেটা টাইপ ---
interface HijriDate {
    date: string;
    day: string;
    weekday: { en: string };
    month: { en: string; number: number };
    year: string;
}
interface GregorianDate {
    date: string;
    day: string;
    weekday: { en: string };
    month: { en: string; number: number };
    year: string;
}

// --- মূল ক্যালেন্ডার কম্পোনেন্ট ---
const IslamicCalendarScreen: React.FC = () => {
    const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
    const [gregorianDate, setGregorianDate] = useState<GregorianDate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDate = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // --- !!! পরিবর্তন এখানে !!! ---
                // /today এর বদলে /timingsByCity এন্ডপয়েন্ট ব্যবহার করা হয়েছে
                const response = await fetch(
                    'https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=8',
                );
                // --- !!! পরিবর্তন শেষ !!! ---

                if (!response.ok) {
                    // নেটওয়ার্ক বা সার্ভার ত্রুটি হলে
                    throw new Error(`API থেকে ডেটা আনতে সমস্যা হচ্ছে (Status: ${response.status})`);
                }

                const data = await response.json();

                // API সফলভাবে ডেটা পাঠালে
                if (data.code === 200 && data.data && data.data.date) {
                    setHijriDate(data.data.date.hijri);
                    setGregorianDate(data.data.date.gregorian);
                } else {
                    // API থেকে কোনো কারণে ভুল ডেটা এলে
                    throw new Error('API থেকে সঠিক ফরম্যাটে ডেটা আসেনি');
                }
            } catch (err) {
                // যেকোনো ধরনের fetch ত্রুটি ধরতে
                console.error("API Fetch Error:", err); // ডিবাগিং এর জন্য কনসোলে সম্পূর্ণ ত্রুটি দেখাবে
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('একটি অজানা ত্রুটি ঘটেছে');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDate();
    }, []);

    // --- রেন্ডারিং লজিক ---

    // লোডিং অবস্থা
    if (isLoading) {
        return (
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-900`}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={tw`text-gray-400 mt-2`}>লোড হচ্ছে...</Text>
            </SafeAreaView>
        );
    }

    // ত্রুটি অবস্থা
    if (error || !hijriDate || !gregorianDate) {
        return (
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-900 p-5`}>
                <Ionicons name="cloud-offline-outline" size={60} color="#f87171" />
                <Text style={tw`text-red-400 text-lg text-center mt-4`}>
                    তারিখ আনতে সমস্যা হয়েছে
                </Text>
                <Text style={tw`text-gray-500 text-center mt-2`}>
                    {error || 'ডেটা পাওয়া যায়নি।'}
                </Text>
            </SafeAreaView>
        );
    }

    // সফলভাবে লোড হলে
    // ডেটা বাংলায় রূপান্তর
    const hijriDay = convertToBangla(hijriDate.day);
    const hijriMonth = hijriMonths[hijriDate.month.en] || hijriDate.month.en;
    const hijriYear = convertToBangla(hijriDate.year);

    const gregDay = convertToBangla(gregorianDate.day);
    const gregMonth = gregorianMonths[gregorianDate.month.en] || gregorianDate.month.en;
    const gregYear = convertToBangla(gregorianDate.year);
    const gregWeekday = weekdays[gregorianDate.weekday.en] || gregorianDate.weekday.en;

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-900`}>
            <StatusBar barStyle="light-content" backgroundColor={tw.color('gray-900')} />

            {/* হেডার */}
            <View style={tw`p-4 border-b border-gray-700`}>
                <Text style={tw`text-white text-2xl font-bold text-center`}>
                    ইসলামিক ক্যালেন্ডার
                </Text>
            </View>

            {/* ক্যালেন্ডার কার্ড */}
            <View style={tw`flex-1 justify-center items-center p-5`}>
                <View style={tw`bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-sm items-center border border-gray-700`}>
                    {/* হিজরি তারিখ */}
                    <Text style={tw`text-teal-400 text-7xl font-bold`}>
                        {hijriDay}
                    </Text>
                    <Text style={tw`text-white text-3xl font-semibold mt-2`}>
                        {hijriMonth}
                    </Text>
                    <Text style={tw`text-gray-400 text-2xl`}>
                        {hijriYear} হিজরি
                    </Text>

                    {/* বিভাজক */}
                    <View style={tw`h-px w-3/4 bg-gray-600 my-5`} />

                    {/* গ্রেগরিয়ান তারিখ */}
                    <Text style={tw`text-white text-2xl font-medium`}>
                        {gregWeekday}
                    </Text>
                    <Text style={tw`text-gray-300 text-xl mt-1`}>
                        {gregDay} {gregMonth}, {gregYear}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default IslamicCalendarScreen;
