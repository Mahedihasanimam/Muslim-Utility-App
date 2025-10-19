import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

// --- কালার প্যালেট (অ্যাপের থিমের সাথে সামঞ্জস্যপূর্ণ) ---
const BG_COLOR = '#0F172A';
const CARD_COLOR_PRIMARY = '#1E293B';
const ACCENT_COLOR = '#047857';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#CBD5E1';
const HADITH_BG = '#FEFBEA'; // হালকা ক্রিম কালার
const HADITH_TEXT = '#4A443A';

// --- নামাজের টাইমলাইনের জন্য হেল্পার কম্পোনেন্ট ---
const PrayerTimeItem = ({ icon, name, time, isActive = false }: { icon: any, name: string, time: string, isActive?: boolean }) => {
  const color = isActive ? ACCENT_COLOR : TEXT_SECONDARY;
  return (
    <View style={tw`items-center`}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[tw`text-xs font-semibold mt-1`, { color }]}>{name}</Text>
      <Text style={[tw`text-xs`, { color }]}>{time}</Text>
    </View>
  );
};

// --- শর্টকাট বাটনের জন্য হেল্পার কম্পোনেন্ট ---
const ActionButton = ({ icon, name, onPress, iconSet = 'MaterialCommunityIcons' }: { icon: string; name: string; onPress: () => void; iconSet?: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome' }) => {
  const IconComponent = { Ionicons, MaterialCommunityIcons, FontAwesome }[iconSet];
  return (
    <TouchableOpacity style={tw`items-center flex-1`} onPress={onPress} activeOpacity={0.7}>
      <View style={tw`w-16 h-16 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl items-center justify-center`}>
        <IconComponent name={icon} size={28} color={ACCENT_COLOR} />
      </View>
      <Text style={tw`text-[${TEXT_SECONDARY}] text-sm mt-2 font-medium`}>{name}</Text>
    </TouchableOpacity>
  );
};

// --- হাদিসের ডেটা ---
const hadiths = [
  {
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    translation: "সমস্ত আমল নিয়তের উপর নির্ভরশীল।",
    reference: "সহীহ বুখারী, হাদিস: ১"
  },
  {
    arabic: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا",
    translation: "যে আমাদের সাথে প্রতারণা করে, সে আমাদের অন্তর্ভুক্ত নয়।",
    reference: "সহীহ মুসলিম, হাদিস: ১০১"
  },
  {
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    translation: "পবিত্রতা ঈমানের অর্ধেক।",
    reference: "সহীহ মুসলিম, হাদিস: ২২৩"
  },
];

const Index = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState<any>(null);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string; index: number } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [dailyHadith, setDailyHadith] = useState(hadiths[0]);
  const [ramadanDaysLeft, setRamadanDaysLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Dhaka, Bangladesh');

  // ডেটা লোড করার জন্য useEffect
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('নামাজের সময় পেতে লোকেশন অনুমতি প্রয়োজন।');
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          setLocationName(`${geocode[0].city}, ${geocode[0].country}`);
        }

        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
        if (!response.ok) throw new Error('API থেকে ডেটা আনা সম্ভব হয়নি।');

        const data = await response.json();
        if (data.code !== 200) throw new Error('নামাজের সময় পাওয়া যায়নি।');
        setPrayerData(data.data);

        // প্রতিদিন একটি নির্দিষ্ট হাদিস দেখানোর জন্য
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setDailyHadith(hadiths[dayOfYear % hadiths.length]);

        // রমজানের কাউন্টডাউন (এখানে 1447 হিজরির সম্ভাব্য তারিখ দেওয়া হয়েছে)
        const ramadanStartDate = new Date('2026-02-28T00:00:00');
        const today = new Date();
        const diffTime = ramadanStartDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setRamadanDaysLeft(diffDays);

      } catch (e: any) {
        setErrorMsg(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // সময় ও কাউন্টডাউনের জন্য useEffect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    if (prayerData) {
      const prayerTimesList = [
        { name: 'ফজর', time: prayerData.timings.Fajr, icon: 'weather-sunset-up' },
        { name: 'যোহর', time: prayerData.timings.Dhuhr, icon: 'weather-partly-cloudy' },
        { name: 'আসর', time: prayerData.timings.Asr, icon: 'weather-hazy' },
        { name: 'মাগরিব', time: prayerData.timings.Maghrib, icon: 'weather-sunset-down' },
        { name: 'ইশা', time: prayerData.timings.Isha, icon: 'weather-night' },
      ];

      const now = new Date();
      let nextPrayer = null;

      for (let i = 0; i < prayerTimesList.length; i++) {
        const [h, m] = prayerTimesList[i].time.split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(h), parseInt(m), 0, 0);

        if (prayerTime > now) {
          nextPrayer = { ...prayerTimesList[i], index: i };
          break;
        }
      }

      if (!nextPrayer) { // যদি সব নামাজ শেষ হয়ে যায়, তবে পরবর্তী দিনের ফজর
        nextPrayer = { ...prayerTimesList[0], index: 0 };
      }
      setNextPrayerInfo(nextPrayer);

      const [h, m] = nextPrayer.time.split(':');
      const targetTime = new Date();
      targetTime.setHours(parseInt(h), parseInt(m), 0, 0);

      if (targetTime < now) { // পরবর্তী দিনের ফজর হলে
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const diff = targetTime.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }

    return () => clearInterval(timer);
  }, [currentTime, prayerData]);


  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center`}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={tw`text-[${TEXT_SECONDARY}] mt-4 text-base`}>তথ্য লোড হচ্ছে...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center p-8`}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#F59E0B" />
        <Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}]`}>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        {/* --- হেডার --- */}
        <View style={tw`px-5 pt-8`}>
          <Text style={tw`text-3xl font-bold text-white`}>﷽</Text>
          <Text style={tw`text-2xl font-semibold text-[${TEXT_PRIMARY}] mt-1`}>আসসালামু আলাইকুম</Text>
          <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{locationName}</Text>
        </View>

        {/* --- তারিখ এবং হিজরি তারিখ --- */}
        <View style={tw`mt-6 mx-5 p-4 bg-[${CARD_COLOR_PRIMARY}] rounded-xl flex-row justify-between items-center`}>
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

        {/* --- পরবর্তী নামাজের কার্ড --- */}
        <View style={tw`mt-6 mx-5 p-6 bg-[${ACCENT_COLOR}] rounded-2xl items-center`}>
          <Text style={tw`text-lg font-medium text-black`}>পরবর্তী নামাজ: {nextPrayerInfo?.name}</Text>
          <Text style={tw`text-5xl font-bold text-white my-2`}>{timeRemaining}</Text>
        </View>

        {/* --- নামাজের টাইমলাইন --- */}
        <View style={tw`mt-6 px-4 py-4 mx-5 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl flex-row justify-around items-center`}>
          <PrayerTimeItem icon="weather-sunset-up" name="ফজর" time={prayerData?.timings.Fajr} isActive={nextPrayerInfo?.name === 'ফজর'} />
          <PrayerTimeItem icon="weather-sunny" name="যোহর" time={prayerData?.timings.Dhuhr} isActive={nextPrayerInfo?.name === 'যোহর'} />
          <PrayerTimeItem icon="weather-hazy" name="আসর" time={prayerData?.timings.Asr} isActive={nextPrayerInfo?.name === 'আসর'} />
          <PrayerTimeItem icon="weather-sunset-down" name="মাগরিব" time={prayerData?.timings.Maghrib} isActive={nextPrayerInfo?.name === 'মাগরিব'} />
          <PrayerTimeItem icon="weather-night" name="ইশা" time={prayerData?.timings.Isha} isActive={nextPrayerInfo?.name === 'ইশা'} />
        </View>

        {/* --- শর্টকাট বাটন --- */}
        <View style={tw`mt-8 px-5 flex-row justify-between`}>
          <ActionButton icon="compass-outline" name="কিবলা" onPress={() => router.push('/qibla')} />
          <ActionButton icon="rosary" name="তাসবিহ" onPress={() => router.push('/tasbeeh')} />
          <ActionButton icon="book-open-variant" name="দুআ" onPress={() => router.push('/dua')} />
          <ActionButton icon="hand-coin-outline" name="যাকাত" onPress={() => router.push('/zakat')} />
        </View>

        {/* --- দিনের হাদিস --- */}
        <View style={tw`mt-8 mx-5 p-5 bg-[${HADITH_BG}] rounded-2xl`}>
          <Text style={tw`text-lg font-bold text-[${HADITH_TEXT}] mb-3`}>দিনের হাদিস</Text>
          <Text style={tw`text-xl text-[${HADITH_TEXT}] text-right leading-9 mb-3 font-medium`}>
            {dailyHadith.arabic}
          </Text>
          <Text style={tw`text-base text-[${HADITH_TEXT}] leading-6`}>
            {dailyHadith.translation}
          </Text>
          <Text style={tw`text-sm font-semibold text-[${HADITH_TEXT}] mt-3 opacity-80`}>
            {dailyHadith.reference}
          </Text>
        </View>

      </ScrollView>

      {/* --- রমজানের কাউন্টডাউন ফুটার --- */}
      {ramadanDaysLeft > 0 && (
        <TouchableOpacity style={tw`absolute bottom-0 left-0 right-0 bg-[${CARD_COLOR_PRIMARY}] p-4 flex-row justify-center items-center border-t border-t-[${ACCENT_COLOR}]/50`}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={ACCENT_COLOR} />
          <Text style={tw`text-white font-bold text-base ml-3`}>রমজান আসতে বাকি: {ramadanDaysLeft} দিন </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Index;