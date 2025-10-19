
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import tw from 'twrnc';

// --- নতুন কালার প্যালেট ---
const BG_COLOR = '#0F172A';
const CARD_COLOR = '#1E293B';
const ACCENT_COLOR = '#047857'; // prémium ডিপ-সবুজ
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#CBD5E1';
const BORDER_COLOR = '#334155';
const SHURUQ_COLOR = '#F59E0B'; // সূর্যোদয়ের জন্য হলুদ

interface Prayer {
    name: string;
    englishName: string;
    time: string;
    icon: any;
}

// --- হেল্পার ফাংশন: সময় ফরম্যাট করার জন্য ---
const formatTo12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'অপরাহ্ণ' : 'পূর্বাহ্ণ';
    const h = hours % 12 || 12;
    const paddedM = String(minutes).padStart(2, '0');
    const bengaliTime = `${String(h)}:${paddedM}`.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
    return `${bengaliTime} ${ampm}`;
};

const PrayerScreen = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerData, setPrayerData] = useState<any>(null); // API থেকে সব ডেটা রাখার জন্য
    const [prayerTimes, setPrayerTimes] = useState<Prayer[]>([]);
    const [nextPrayerIndex, setNextPrayerIndex] = useState(-1);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [locationName, setLocationName] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const listAnimations = useRef<Animated.Value[]>([]).current;

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('নামাজের সময় পেতে লোকেশন অনুমতি প্রয়োজন।');
                setIsLoading(false); return;
            }
            try {
                const location = await Location.getCurrentPositionAsync({});
                const geocode = await Location.reverseGeocodeAsync(location.coords);
                if (geocode.length > 0) setLocationName(`${geocode[0].city}, ${geocode[0].country}`);

                const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2`);
                if (!response.ok) throw new Error('নেটওয়ার্ক সমস্যা হয়েছে।');
                const data = await response.json();
                if (data.code !== 200) throw new Error('নামাজের সময় আনা সম্ভব হয়নি।');

                setPrayerData(data.data); // সম্পূর্ণ ডেটা সেভ করা হলো

                const { timings } = data.data;
                const formattedPrayers: Prayer[] = [
                    { name: 'ফজর', englishName: 'Fajr', time: timings.Fajr, icon: 'weather-sunset-up' },
                    { name: 'শুরুক', englishName: 'Sunrise', time: timings.Sunrise, icon: 'weather-sunny' },
                    { name: 'যোহর', englishName: 'Dhuhr', time: timings.Dhuhr, icon: 'weather-partly-cloudy' },
                    { name: 'আসর', englishName: 'Asr', time: timings.Asr, icon: 'weather-hazy' },
                    { name: 'মাগরিব', englishName: 'Maghrib', time: timings.Maghrib, icon: 'weather-sunset-down' },
                    { name: 'ইশা', englishName: 'Isha', time: timings.Isha, icon: 'weather-night' },
                ];
                setPrayerTimes(formattedPrayers);
            } catch (error) {
                setErrorMsg('ডেটা লোড করতে সমস্যা হয়েছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrayerTimes();
    }, []);

    useEffect(() => {
        // (কাউন্টডাউন এবং অ্যানিমেশন লজিক অপরিবর্তিত)
        if (!isLoading && prayerTimes.length > 0) {
            if (listAnimations.length !== prayerTimes.length) {
                prayerTimes.forEach((_, i) => { listAnimations[i] = new Animated.Value(0); });
            }
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
            const animations = prayerTimes.map((_, i) => Animated.timing(listAnimations[i], { toValue: 1, duration: 500, useNativeDriver: true }));
            Animated.stagger(100, animations).start();
        }
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        if (prayerTimes.length > 0) {
            const calculablePrayers = prayerTimes.filter(p => p.englishName !== 'Sunrise');
            const parseTime = (timeStr: string): Date => {
                const now = new Date();
                const [hours, minutes] = timeStr.split(':').map(Number);
                now.setHours(hours, minutes, 0, 0);
                return now;
            };
            const prayerDates = calculablePrayers.map(p => parseTime(p.time));
            let nextIndexInCalculable = prayerDates.findIndex(prayerDate => prayerDate > currentTime);
            if (nextIndexInCalculable === -1) nextIndexInCalculable = 0;
            const nextPrayerName = calculablePrayers[nextIndexInCalculable].englishName;
            const actualIndex = prayerTimes.findIndex(p => p.englishName === nextPrayerName);
            setNextPrayerIndex(actualIndex);
            let nextPrayerTime = prayerDates[nextIndexInCalculable];
            if (nextIndexInCalculable === 0 && nextPrayerTime < currentTime) {
                nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
            }
            const diff = nextPrayerTime.getTime() - currentTime.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]));
        }
        return () => clearInterval(timer);
    }, [currentTime, prayerTimes, isLoading]);

    // প্রতিটি নামাজের সারি ডিজাইন
    const PrayerRow = ({ prayer, isActive, index }: { prayer: Prayer; isActive: boolean; index: number }) => {
        if (!listAnimations[index]) return null;
        const isShuruq = prayer.englishName === 'Sunrise';
        const activeStyle = isActive && !isShuruq;
        const rowAnimation = { opacity: listAnimations[index], transform: [{ translateY: listAnimations[index].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] };
        return (
            <Animated.View style={[tw`flex-row justify-between items-center p-4 mx-4 my-1.5 rounded-xl ${activeStyle ? `bg-[${ACCENT_COLOR}]` : `bg-[${CARD_COLOR}]`}`, styles.cardShadow, rowAnimation]}>
                <View style={tw`flex-row items-center flex-1`}>
                    <View style={tw`w-11 h-11 rounded-full items-center justify-center mr-4 ${activeStyle ? 'bg-white/20' : 'bg-white/10'}`}>
                        <MaterialCommunityIcons name={prayer.icon} size={22} color={isShuruq ? SHURUQ_COLOR : (activeStyle ? TEXT_PRIMARY : TEXT_SECONDARY)} />
                    </View>
                    <Text style={[tw`text-base font-semibold`, { color: isShuruq ? SHURUQ_COLOR : (activeStyle ? TEXT_PRIMARY : TEXT_SECONDARY) }]}>{prayer.name}</Text>
                </View>
                <Text style={[tw`text-lg font-bold`, { color: isShuruq ? SHURUQ_COLOR : (activeStyle ? TEXT_PRIMARY : TEXT_PRIMARY) }]}>{formatTo12Hour(prayer.time)}</Text>
            </Animated.View>
        );
    };

    // তথ্য দেখানোর জন্য ছোট কম্পোনেন্ট
    const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string | null }) => (
        <View style={tw`flex-row items-center p-3 border-b border-b-[${BORDER_COLOR}]`}>
            <MaterialCommunityIcons name={icon} size={20} color={TEXT_SECONDARY} style={tw`mr-4`} />
            <Text style={tw`text-[${TEXT_SECONDARY}] text-sm flex-1`}>{label}</Text>
            <Text style={tw`text-[${TEXT_PRIMARY}] text-sm font-semibold`}>{value}</Text>
        </View>
    );

    if (isLoading) { return <View style={tw`flex-1 justify-center items-center bg-[${BG_COLOR}]`}><ActivityIndicator size="large" color={ACCENT_COLOR} /><Text style={tw`text-[${TEXT_SECONDARY}] mt-4 text-base`}>নামাজের সময় আনা হচ্ছে...</Text></View>; }
    if (errorMsg) { return <View style={tw`flex-1 justify-center items-center bg-[${BG_COLOR}] p-8`}><MaterialCommunityIcons name="alert-circle-outline" size={64} color={SHURUQ_COLOR} /><Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text></View>; }

    return (
        <View style={tw`flex-1 bg-[${BG_COLOR}]`}>
            {/* --- নতুন হেডার --- */}
            <ImageBackground source={{ uri: 'https://www.transparenttextures.com/patterns/arabesque.png' }} style={tw`pt-10 pb-6 px-6 bg-[${CARD_COLOR}]`} imageStyle={{ opacity: 0.05 }}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={tw`text-2xl font-bold text-center text-[${TEXT_PRIMARY}] mb-4`}>নামাজের সময়</Text>
                    <View style={tw`mt-6 mx-5 p-4 bg-[#224880] rounded-xl flex-row justify-between items-center`}>
                        <View>
                            <Text style={tw`font-bold text-white text-base`}>
                                {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </Text>
                            <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>
                                {currentTime.toLocaleDateString('bn-BD', { year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={tw`items-end`}>
                            <Text style={tw`font-bold text-white text-base`}>{prayerData?.date.hijri.day} {prayerData?.date.hijri.month.ar}</Text>
                            <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{prayerData?.date.hijri.year} হিজরি</Text>
                        </View>
                    </View>
                </Animated.View>
            </ImageBackground>

            <ScrollView contentContainerStyle={tw`pb-8`} showsVerticalScrollIndicator={false}>
                {nextPrayerIndex !== -1 && (
                    <Animated.View style={[tw`mx-6 mt-6 bg-[${ACCENT_COLOR}] rounded-2xl p-6`, styles.cardShadow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <View>
                                <Text style={tw`text-white/80 text-sm font-medium uppercase tracking-wider`}>পরবর্তী নামাজ</Text>
                                <Text style={tw`text-white text-3xl font-bold mt-1`}>{prayerTimes[nextPrayerIndex]?.name}</Text>
                            </View>
                            <View style={tw`items-end`}>
                                <Text style={tw`text-white/80 text-sm font-medium uppercase tracking-wider`}>বাকি সময়</Text>
                                <Text style={tw`text-white text-3xl font-bold mt-1`}>{timeRemaining}</Text>
                            </View>
                        </View>
                        <Text style={tw`text-center text-white/70 text-xs mt-4`}>এখন {prayerTimes[nextPrayerIndex]?.name}-এর ওয়াক্ত শুরু হওয়ার অপেক্ষা</Text>
                    </Animated.View>
                )}

                <Animated.View style={[tw`mt-6`, { opacity: fadeAnim }]}>
                    {prayerTimes.map((prayer, index) => (
                        <PrayerRow key={prayer.name} prayer={prayer} isActive={index === nextPrayerIndex} index={index} />
                    ))}
                </Animated.View>

                {/* --- অতিরিক্ত তথ্য --- */}
                <Animated.View style={[tw`mt-6 mx-4 bg-[${CARD_COLOR}] rounded-xl`, styles.cardShadow, { opacity: fadeAnim }]}>
                    <Text style={tw`text-[${TEXT_PRIMARY}] text-base font-semibold text-center py-3`}>অন্যান্য গুরুত্বপূর্ণ সময়</Text>
                    <InfoRow icon="weather-sunset" label="ইমসাক" value={formatTo12Hour(prayerData?.timings.Imsak)} />
                    <InfoRow icon="weather-night" label="মধ্যরাত" value={formatTo12Hour(prayerData?.timings.Midnight)} />
                    <InfoRow icon="timelapse" label="রাতের শেষ তৃতীয়াংশ" value={formatTo12Hour(prayerData?.timings.Lastthird)} />
                </Animated.View>

                <Animated.View style={[tw`mt-6 mx-4 bg-[${CARD_COLOR}] rounded-xl`, styles.cardShadow, { opacity: fadeAnim }]}>
                    <Text style={tw`text-[${TEXT_PRIMARY}] text-base font-semibold text-center py-3`}>মেটা তথ্য</Text>
                    <InfoRow icon="map-marker-outline" label="লোকেশন" value={locationName} />
                    <InfoRow icon="web" label="টাইমজোন" value={prayerData?.meta.timezone} />
                    <InfoRow icon="calculator-variant-outline" label="হিসাব পদ্ধতি" value={prayerData?.meta.method.name} />
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({ cardShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 } });
export default PrayerScreen;