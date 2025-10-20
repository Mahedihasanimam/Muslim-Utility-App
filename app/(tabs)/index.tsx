import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { hadiths } from '../../assets/hadiths'; // <-- Make sure this path is correct

// --- কালার প্যালেট ---
const BG_COLOR = '#0F172A';
const CARD_COLOR_PRIMARY = '#1E293B';
const ACCENT_COLOR = '#047857';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#CBD5E1';
const HADITH_BG = '#FEFBEA';
const HADITH_TEXT = '#4A443A';

// --- হেল্পার কম্পোনেন্ট ---
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

const ActionButton = ({ icon, name, onPress, iconSet = 'MaterialCommunityIcons' }: { icon: string; name: string; onPress: () => void; iconSet?: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome' }) => {
  const IconComponent = { Ionicons, MaterialCommunityIcons, FontAwesome }[iconSet];
  return (
    <TouchableOpacity style={tw`items-center flex-1`} onPress={onPress} activeOpacity={0.7}>
      <View style={tw`w-16 h-16 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl items-center justify-center`}>
        <IconComponent name={icon as any} size={28} color={ACCENT_COLOR} />
      </View>
      <Text style={tw`text-[${TEXT_SECONDARY}] text-sm mt-2 font-medium`}>{name}</Text>
    </TouchableOpacity>
  );
};

const Index = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState<any>(null);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string; index: number } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [ramadanDaysLeft, setRamadanDaysLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Dhaka, Bangladesh');

  // --- হাদিস এবং মুড মোডাল স্টেট ---
  const [currentHadith, setCurrentHadith] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isMoodModalVisible, setMoodModalVisible] = useState(false);

  // --- নতুন: নামাজ ট্র্যাকিং এর জন্য স্টেট ---
  const initialPrayerLog = { Fajr: null, Dhuhr: null, Asr: null, Maghrib: null, Isha: null };
  const [prayerLog, setPrayerLog] = useState(initialPrayerLog);
  const [isPrayerCheckModalVisible, setPrayerCheckModalVisible] = useState(false);
  const [prayerToAsk, setPrayerToAsk] = useState<string | null>(null);
  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const lastCheckedDate = useRef<string | null>(null); // তারিখ পরিবর্তনের জন্য ref

  // --- হাদিস সিলেক্ট করার ফাংশন ---
  const handleSelectMood = (mood: string) => {
    const filteredHadiths = hadiths.filter(h => h.category === mood);
    const randomIndex = Math.floor(Math.random() * filteredHadiths.length);
    setCurrentHadith(filteredHadiths[randomIndex]);
    setSelectedMood(mood);
    setMoodModalVisible(false);
  };

  const showAnotherHadith = () => {
    if (selectedMood) handleSelectMood(selectedMood);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('নামাজের সময় পেতে লোকেশন অনুমতি প্রয়োজন।');

        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        if (geocode.length > 0) setLocationName(`${geocode[0].city}, ${geocode[0].country}`);

        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&method=2`);
        const data = await response.json();
        if (data.code !== 200) throw new Error('নামাজের সময় পাওয়া যায়নি।');
        setPrayerData(data.data);

        // রমজানের কাউন্টডাউন
        const ramadanStartDate = new Date('2026-02-28T00:00:00');
        const diffDays = Math.ceil((ramadanStartDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        setRamadanDaysLeft(diffDays > 0 ? diffDays : 0);
      } catch (e: any) {
        setErrorMsg(e.message);
      } finally {
        setIsLoading(false);
        setMoodModalVisible(true);
      }
    };
    loadInitialData();
  }, []);

  // --- নতুন: দিনের শেষের রিপোর্ট দেখানোর ফাংশন ---
  const showEndOfDayReport = (finalLog: any) => {
    const missedPrayers = Object.keys(finalLog).filter(p => finalLog[p] === false);

    if (missedPrayers.length === 0) {
      Alert.alert(
        "দৈনিক নামাজের রিপোর্ট",
        "আলহামদুলিল্লাহ! আপনি আজকে ৫ ওয়াক্ত নামাজই আদায় করেছেন। আল্লাহ কবুল করুন।"
      );
    } else {
      Alert.alert(
        "দৈনিক নামাজের রিপোর্ট",
        `আজকে আপনার ${missedPrayers.join(', ')} নামাজগুলো কাজা হয়েছে। আগামীকাল থেকে চেষ্টা করবেন, ইনশাআল্লাহ।`
      );
    }
  };

  // --- নতুন: নামাজ লগ করার ফাংশন ---
  const logPrayer = (prayerName: string, hasPrayed: boolean) => {
    const updatedLog = { ...prayerLog, [prayerName]: hasPrayed };
    setPrayerLog(updatedLog);
    setPrayerCheckModalVisible(false);

    // যদি ইশার নামাজ লগ করা হয়, তবে দিনের রিপোর্ট দেখানো হবে
    if (prayerName === 'Isha') {
      showEndOfDayReport(updatedLog);
    }
  };

  // --- সময়, কাউন্টডাউন এবং নামাজ ট্র্যাকিং এর জন্য মূল useEffect ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (prayerData) {
        // --- নতুন: প্রতিদিন নামাজ লগ রিসেট করার লজিক ---
        const todayDate = prayerData.date.gregorian.date;
        if (lastCheckedDate.current !== todayDate) {
          lastCheckedDate.current = todayDate;
          setPrayerLog(initialPrayerLog);
        }

        const prayerTimings = prayerData.timings;
        // চেক করার জন্য প্রতিটি নামাজের সময় পার হয়েছে কিনা
        prayerNames.forEach(prayer => {
          if (prayerLog[prayer as keyof typeof prayerLog] !== null) return; // ইতিমধ্যে জিজ্ঞাসা করা হলে আর না

          const [h, m] = prayerTimings[prayer].split(':');
          const prayerTime = new Date();
          prayerTime.setHours(parseInt(h), parseInt(m), 0, 0);

          // নামাজের ১৫ মিনিট পর জিজ্ঞাসা করা হবে
          const promptTime = new Date(prayerTime.getTime() + 15 * 60000);

          if (now > promptTime) {
            setPrayerToAsk(prayer);
            setPrayerCheckModalVisible(true);
          }
        });
      }
    }, 1000); // প্রতি সেকেন্ডে চেক করা হচ্ছে

    return () => clearInterval(timer);
  }, [prayerData, prayerLog]); // prayerData ও prayerLog এর উপর নির্ভর করবে

  // --- পরবর্তী নামাজের সময় গণনার useEffect (আগের মতোই) ---
  useEffect(() => {
    if (prayerData) {
      const prayerTimesList = [
        { name: 'ফজর', time: prayerData.timings.Fajr }, { name: 'যোহর', time: prayerData.timings.Dhuhr },
        { name: 'আসর', time: prayerData.timings.Asr }, { name: 'মাগরিব', time: prayerData.timings.Maghrib },
        { name: 'ইশা', time: prayerData.timings.Isha },
      ];
      const now = new Date();
      let nextPrayer = null;
      for (let i = 0; i < prayerTimesList.length; i++) {
        const [h, m] = prayerTimesList[i].time.split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(h), parseInt(m), 0, 0);
        if (prayerTime > now) { nextPrayer = { ...prayerTimesList[i], index: i }; break; }
      }
      if (!nextPrayer) nextPrayer = { ...prayerTimesList[0], index: 0 };
      setNextPrayerInfo(nextPrayer);
      const [h, m] = nextPrayer.time.split(':');
      const targetTime = new Date();
      targetTime.setHours(parseInt(h), parseInt(m), 0, 0);
      if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
      const diff = targetTime.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }
  }, [currentTime, prayerData]);


  if (isLoading) return <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center`}><ActivityIndicator size="large" color={ACCENT_COLOR} /><Text style={tw`text-[${TEXT_SECONDARY}] mt-4 text-base`}>তথ্য লোড হচ্ছে...</Text></SafeAreaView>;
  if (errorMsg) return <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center p-8`}><MaterialCommunityIcons name="alert-circle-outline" size={64} color="#F59E0B" /><Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text></SafeAreaView>;

  const prayerNameMapping: { [key: string]: string } = { Fajr: 'ফজর', Dhuhr: 'যোহর', Asr: 'আসর', Maghrib: 'মাগরিব', Isha: 'ইশা' };

  // --- মুড বাটন কম্পোনেন্ট ---
  const MoodButton = ({ mood, label, icon }: { mood: string, label: string, icon: any }) => (
    <TouchableOpacity onPress={() => handleSelectMood(mood)} style={tw`items-center w-1/3 p-2`}>
      <Text style={tw`text-4xl`}>{icon}</Text>
      <Text style={tw`text-center text-sm text-slate-700 mt-1 font-semibold`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}]`}>
      {/* --- মুড সিলেকশন মোডাল (আপডেটেড) --- */}
      <Modal animationType="fade" transparent={true} visible={isMoodModalVisible} onRequestClose={() => { if (!currentHadith) handleSelectMood('guidance'); setMoodModalVisible(false); }}>
        <View style={tw`flex-1 justify-center items-center bg-black/60`}>
          <View style={tw`w-11/12 bg-white rounded-2xl p-5 items-center`}>
            <Text style={tw`text-xl font-bold text-slate-800 mb-2`}>আসসালামু আলাইকুম</Text>
            <Text style={tw`text-base text-slate-600 mb-6 text-center`}>আপনার বর্তমান অনুভূতি কেমন?</Text>
            <View style={tw`flex-row flex-wrap justify-center`}>
              <MoodButton mood="hope" label="প্রত্যাশী" icon="😊" />
              <MoodButton mood="patience" label="ধৈর্যহারা" icon="😔" />
              <MoodButton mood="gratitude" label="কৃতজ্ঞ" icon="💖" />
              <MoodButton mood="anxiety" label="উদ্বিগ্ন" icon="😟" />
              <MoodButton mood="forgiveness" label="ক্ষমাপ্রার্থী" icon="🙏" />
              <MoodButton mood="anger" label="রাগান্বিত" icon="😠" />
              <MoodButton mood="kindness" label="দয়ালু" icon="🤗" />
              <MoodButton mood="family" label="পারিবারিক" icon="👨‍👩‍👧‍👦" />
              <MoodButton mood="purpose" label="উদ্দেশ্যহীন" icon="🧭" />
              <MoodButton mood="friendship" label="বন্ধুত্ব" icon="🤝" />
              <MoodButton mood="honesty" label="সৎ" icon="⚖️" />
              <MoodButton mood="guidance" label="পথনির্দেশ" icon="🤔" />
            </View>
          </View>
        </View>
      </Modal>

      {/* --- নতুন: নামাজ চেক করার মোডাল --- */}
      <Modal animationType="fade" transparent={true} visible={isPrayerCheckModalVisible} onRequestClose={() => setPrayerCheckModalVisible(false)}>
        <View style={tw`flex-1 justify-center items-center bg-black/60`}>
          <View style={tw`w-11/12 bg-white rounded-2xl p-6 items-center`}>
            <Text style={tw`text-xl font-bold text-slate-800 mb-4 text-center`}>
              আপনি কি {prayerNameMapping[prayerToAsk!] || prayerToAsk}-এর নামাজ কায়েম করেছেন?
            </Text>
            <View style={tw`flex-row justify-around w-full mt-4`}>
              <TouchableOpacity onPress={() => logPrayer(prayerToAsk!, true)} style={tw`bg-emerald-600 rounded-lg py-3 px-10`}>
                <Text style={tw`text-white font-bold text-lg`}>হ্যাঁ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => logPrayer(prayerToAsk!, false)} style={tw`bg-rose-600 rounded-lg py-3 px-10`}>
                <Text style={tw`text-white font-bold text-lg`}>না</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={tw`pb-24`}>
        {/* --- হেডার ও অন্যান্য UI --- */}
        <View style={tw`flex-row justify-between items-center px-5 pt-3`}>
          <View><Text style={tw`text-3xl font-bold text-white`}>﷽</Text><Text style={tw`text-2xl font-semibold text-[${TEXT_PRIMARY}] mt-1`}>আসসালামু আলাইকুম</Text><Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{locationName}</Text></View>
          <TouchableOpacity style={tw`p-2`} onPress={() => router.push('/more')}><MaterialCommunityIcons name="menu" size={30} color="white" /></TouchableOpacity>
        </View>
        <View style={tw`mt-6 mx-5 p-4 bg-[${CARD_COLOR_PRIMARY}] rounded-xl flex-row justify-between items-center`}>
          <View><Text style={tw`font-bold text-white text-base`}>{currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</Text><Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{currentTime.toLocaleDateString('bn-BD', { year: 'numeric' })}</Text></View>
          <View style={tw`items-end`}><Text style={tw`font-bold text-white text-base`}>{prayerData?.date.hijri.day} {prayerData?.date.hijri.month.ar}</Text><Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{prayerData?.date.hijri.year} হিজরি</Text></View>
        </View>
        <View style={tw`mt-6 mx-5 p-6 bg-[${ACCENT_COLOR}] rounded-2xl items-center`}>
          <Text style={tw`text-lg font-medium text-black`}>পরবর্তী নামাজ: {nextPrayerInfo?.name}</Text>
          <Text style={tw`text-5xl font-bold text-white my-2`}>{timeRemaining}</Text>
        </View>
        <View style={tw`mt-6 px-4 py-4 mx-5 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl flex-row justify-around items-center`}>
          <PrayerTimeItem icon="weather-sunset-up" name="ফজর" time={prayerData?.timings.Fajr} isActive={nextPrayerInfo?.name === 'ফজর'} />
          <PrayerTimeItem icon="weather-sunny" name="যোহর" time={prayerData?.timings.Dhuhr} isActive={nextPrayerInfo?.name === 'যোহর'} />
          <PrayerTimeItem icon="weather-hazy" name="আসর" time={prayerData?.timings.Asr} isActive={nextPrayerInfo?.name === 'আসর'} />
          <PrayerTimeItem icon="weather-sunset-down" name="মাগরিব" time={prayerData?.timings.Maghrib} isActive={nextPrayerInfo?.name === 'মাগরিব'} />
          <PrayerTimeItem icon="weather-night" name="ইশা" time={prayerData?.timings.Isha} isActive={nextPrayerInfo?.name === 'ইশা'} />
        </View>
        <View style={tw`mt-8 px-5 flex-row justify-between`}>
          <ActionButton icon="compass-outline" name="কিবলা" onPress={() => router.push('/qibla')} />
          <ActionButton icon="hand-pray" name="তাসবিহ" onPress={() => router.push('/tasbeeh')} />
          <ActionButton icon="book-open-variant" name="দুআ" onPress={() => router.push('/dua')} />
          <ActionButton icon="hand-coin-outline" name="যাকাত" onPress={() => router.push('/zakat')} />
        </View>
        <View style={tw`mt-8 mx-5 p-5 bg-[${HADITH_BG}] rounded-2xl min-h-[180px] justify-center`}>
          {currentHadith ? (
            <><View style={tw`flex-row justify-between items-center mb-3`}><Text style={tw`text-lg font-bold text-[${HADITH_TEXT}]`}> ruh</Text><TouchableOpacity onPress={showAnotherHadith} style={tw`p-1`}><MaterialCommunityIcons name="refresh" size={22} color={HADITH_TEXT} /></TouchableOpacity></View><Text style={tw`text-xl text-[${HADITH_TEXT}] text-right leading-9 mb-3 font-medium`}>{currentHadith.arabic}</Text><Text style={tw`text-base text-[${HADITH_TEXT}] leading-6`}>{currentHadith.translation}</Text><Text style={tw`text-sm font-semibold text-[${HADITH_TEXT}] mt-3 opacity-80`}>{currentHadith.reference}</Text><TouchableOpacity onPress={() => setMoodModalVisible(true)} style={tw`mt-4 self-center`}><Text style={tw`text-sm font-bold text-[${ACCENT_COLOR}]`}>অনুভূতি পরিবর্তন করুন</Text></TouchableOpacity></>
          ) : (<View style={tw`items-center`}><ActivityIndicator color={HADITH_TEXT} /><Text style={tw`text-[${HADITH_TEXT}] mt-2`}>হাদিস লোড হচ্ছে...</Text></View>)}
        </View>
      </ScrollView>
      {ramadanDaysLeft > 0 && (<TouchableOpacity style={tw`absolute bottom-0 left-0 right-0 bg-[${CARD_COLOR_PRIMARY}] p-4 flex-row justify-center items-center border-t border-t-[${ACCENT_COLOR}]/50`}><MaterialCommunityIcons name="moon-waning-crescent" size={20} color={ACCENT_COLOR} /><Text style={tw`text-white font-bold text-base ml-3`}>রমজান আসতে বাকি: {ramadanDaysLeft} দিন </Text></TouchableOpacity>)}
    </SafeAreaView>
  );
};
export default Index;