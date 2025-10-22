
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import tw from 'twrnc';
import { hadiths } from '../../assets/hadiths';

// --- নোটিফিকেশন হ্যান্ডলার (অপরিবর্তিত) ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- কালার প্যালেট (অপরিবর্তিত) ---
const BG_COLOR = '#0F172A';
const CARD_COLOR_PRIMARY = '#1E293B';
const ACCENT_COLOR = '#047857';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#CBD5E1';
const HADITH_BG = '#FEFBEA';
const HADITH_TEXT = '#4A443A';

// --- টাইপস (অপরিবর্তিত) ---
interface PrayerTimeItemProps {
  icon: any; name: string; time: string; isActive?: boolean;
}
interface ActionButtonProps {
  icon: string; name: string; onPress: () => void; iconSet?: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome';
}
interface CircularProgressProps {
  size: number; strokeWidth: number; progress: number;
}
interface MoodButtonProps {
  mood: string; label: string; icon: any;
}

// --- হেল্পার কম্পোনেন্ট (অপরিবর্তিত) ---
const PrayerTimeItem = ({ icon, name, time, isActive = false }: PrayerTimeItemProps) => {
  const color = isActive ? ACCENT_COLOR : TEXT_SECONDARY;
  return (
    <View style={tw`items-center`}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[tw`text-xs font-semibold mt-1`, { color }]}>{name}</Text>
      <Text style={[tw`text-xs`, { color }]}>{time}</Text>
    </View>
  );
};
const ActionButton = ({ icon, name, onPress, iconSet = 'MaterialCommunityIcons' }: ActionButtonProps) => {
  const IconComponent = { Ionicons, MaterialCommunityIcons, FontAwesome }[iconSet];

  return (
    <TouchableOpacity
      style={tw`items-center mr-4`} // 👈 removed flex-1 and added margin-right for spacing
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`w-16 h-16 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl items-center justify-center`}>
        <IconComponent name={icon as any} size={28} color={ACCENT_COLOR} />
      </View>
      <Text style={tw`text-[${TEXT_SECONDARY}] text-sm mt-2 font-medium`}>{name}</Text>
    </TouchableOpacity>
  );
};

const CircularProgress = ({ size, strokeWidth, progress }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <View style={tw`justify-center items-center`}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle stroke={BG_COLOR} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke={ACCENT_COLOR} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

// --- নোটিফিকেশন পারমিশন ফাংশন (অপরিবর্তিত) ---
async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('নোটিফিকেশন', 'নামাজের সময়ের নোটিফিকেশন পেতে অনুগ্রহ করে অ্যাপ সেটিংসে অনুমতি দিন।');
    return false;
  }
  return true;
}

// --- মূল কম্পোনেন্ট ---
const Index = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState<any>(null);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string; index: number } | null>(null);
  const [ramadanDaysLeft, setRamadanDaysLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Dhaka, Bangladesh');
  const [currentPrayerInfo, setCurrentPrayerInfo] = useState<{ name: string; time: string } | null>(null);
  const [prayerProgress, setPrayerProgress] = useState(0);
  const [currentWaqtTimeRemaining, setCurrentWaqtTimeRemaining] = useState('');
  const [nextPrayerTimeRemaining, setNextPrayerTimeRemaining] = useState('');
  const [currentHadith, setCurrentHadith] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isMoodModalVisible, setMoodModalVisible] = useState(false);

  const initialPrayerLog = { Fajr: null, Dhuhr: null, Asr: null, Maghrib: null, Isha: null };
  type PrayerLogType = typeof initialPrayerLog;
  const [prayerLog, setPrayerLog] = useState<PrayerLogType>(initialPrayerLog);
  const [isPrayerCheckModalVisible, setPrayerCheckModalVisible] = useState(false);
  const [prayerToAsk, setPrayerToAsk] = useState<string | null>(null);

  const [isPrayerLogLoading, setIsPrayerLogLoading] = useState(true);
  const PRAYER_LOG_STORAGE_KEY = '@MyIslamicApp:prayerLog';
  const NOTIFICATION_SCHEDULE_KEY = '@MyIslamicApp:notificationScheduleDate';
  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const prayerNamesBN: { [key: string]: string } = { Fajr: 'ফজর', Dhuhr: 'যোহর', Asr: 'আসর', Maghrib: 'মাগরিব', Isha: 'ইশা' };

  // --- হাদিস ফাংশন (অপরিবর্তিত) ---
  const handleSelectMood = (mood: string) => {
    if (!hadiths || hadiths.length === 0) {
      console.error("Hadith data file is empty or not loaded. Check assets/hadiths.ts");
      setMoodModalVisible(false);
      return;
    }
    let filteredHadiths = hadiths.filter((h: any) => h.category === mood);
    if (filteredHadiths.length === 0) {
      console.warn(`No hadiths found for category: ${mood}. Defaulting to all.`);
      filteredHadiths = hadiths;
    }
    if (filteredHadiths.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredHadiths.length);
      setCurrentHadith(filteredHadiths[randomIndex]);
      setSelectedMood(mood);
    } else {
      console.error("Failed to select any hadith. The hadiths array might be empty.");
    }
    setMoodModalVisible(false);
  };
  const showAnotherHadith = () => { if (selectedMood) handleSelectMood(selectedMood); };

  // --- প্রাথমিক ডেটা লোড (অপরিবর্তিত) ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') throw new Error('নামাজের সময় পেতে লোকেশন অনুমতি প্রয়োজন।');
        await registerForPushNotificationsAsync();
        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        if (geocode.length > 0) setLocationName(`${geocode[0].city}, ${geocode[0].country}`);
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&method=2`);
        const data = await response.json();
        if (data.code !== 200) throw new Error('নামাজের সময় পাওয়া যায়নি।');
        setPrayerData(data.data);
        const ramadanStartDate = new Date('2026-02-28T00:00:00');
        const diffDays = Math.ceil((ramadanStartDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        setRamadanDaysLeft(diffDays > 0 ? diffDays : 0);
      } catch (e: any) {
        setErrorMsg(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- লগ লোড এবং নোটিফিকেশন শিডিউল (অপরিবর্তিত) ---
  useEffect(() => {
    if (!prayerData) {
      if (!isLoading) {
        setIsPrayerLogLoading(false);
      }
      return;
    }
    const todayDate = prayerData.date.gregorian.date;
    const timeToDate = (timeStr: string): Date => {
      const now = new Date();
      const [h, m] = timeStr.split(':');
      now.setHours(parseInt(h), parseInt(m), 0, 0);
      return now;
    };
    const loadPrayerLog = async () => {
      try {
        const storedData = await AsyncStorage.getItem(PRAYER_LOG_STORAGE_KEY);
        if (storedData) {
          const { log, date } = JSON.parse(storedData);
          if (date === todayDate) {
            setPrayerLog(log);
          } else {
            setPrayerLog(initialPrayerLog);
            await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: initialPrayerLog, date: todayDate }));
          }
        } else {
          await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: initialPrayerLog, date: todayDate }));
        }
      } catch (e) { console.error("Failed to load prayer log", e); }
      finally {
        setIsPrayerLogLoading(false);
      }
    };
    const schedulePrayerNotifications = async () => {
      try {
        const lastScheduledDate = await AsyncStorage.getItem(NOTIFICATION_SCHEDULE_KEY);
        if (lastScheduledDate === todayDate) return;
        await Notifications.cancelAllScheduledNotificationsAsync();
        const timings = prayerData.timings;
        let scheduledCount = 0;
        const now = new Date();
        for (const prayer of prayerNames) {
          const prayerTime = timeToDate(timings[prayer]);
          if (prayerTime > now) {
            const secondsUntil = Math.round((prayerTime.getTime() - now.getTime()) / 1000);
            if (secondsUntil <= 0) continue;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '🕌 নামাজের সময়',
                body: `এখন ${prayerNamesBN[prayer as keyof typeof prayerNamesBN]}-এর ওয়াক্ত শুরু।`,
                sound: 'default',
              },
              trigger: { seconds: secondsUntil },
            });
            scheduledCount++;
          }
        }
        console.log(`Scheduled ${scheduledCount} new notifications.`);
        await AsyncStorage.setItem(NOTIFICATION_SCHEDULE_KEY, todayDate);
      } catch (e) {
        console.error("Failed to schedule notifications", e);
      }
    };
    loadPrayerLog();
    schedulePrayerNotifications();
  }, [prayerData, isLoading]);

  // --- মোডাল দেখানোর useEffect (অপরিবর্তিত) ---
  useEffect(() => {
    if (!isLoading && !isPrayerLogLoading) {
      if (!errorMsg) {
        setMoodModalVisible(true);
      }
    }
  }, [isLoading, isPrayerLogLoading, errorMsg]);


  // --- নামাজ রিপোর্ট ও লগ ফাংশন (অপরিবর্তিত) ---
  const showEndOfDayReport = (finalLog: PrayerLogType) => {
    const missedPrayers = Object.keys(finalLog).filter(p => finalLog[p as keyof PrayerLogType] === false);
    if (missedPrayers.length === 0) {
      Alert.alert("দৈনিক নামাজের রিপোর্ট", "আলহামদুলিল্লাহ! আপনি আজকে ৫ ওয়াক্ত নামাজই আদায় করেছেন। আল্লাহ কবুল করুন।");
    } else {
      Alert.alert("দৈনিক নামাজের রিপোর্ট", `আজকে আপনার ${missedPrayers.join(', ')} নামাজগুলো কাজা হয়েছে। আগামীকাল থেকে চেষ্টা করবেন, ইনশাআল্লাহ।`);
    }
  };
  const logPrayer = async (prayerName: string, hasPrayed: boolean) => {
    if (!prayerData) {
      Alert.alert("ত্রুটি", "নামাজের তথ্য লোড না হওয়ায় লগ সেভ করা সম্ভব হচ্ছে না।");
      return;
    }
    const updatedLog = { ...prayerLog, [prayerName]: hasPrayed };
    setPrayerLog(updatedLog);
    setPrayerCheckModalVisible(false);
    try {
      const todayDate = prayerData.date.gregorian.date;
      await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: updatedLog, date: todayDate }));
    } catch (e) {
      console.error("Failed to save prayer log", e);
    }
    if (prayerName === 'Isha') {
      showEndOfDayReport(updatedLog);
    }
  };

  // --- মূল সময়, কাউন্টডাউন এবং ট্র্যাকিং useEffect (অপরিবর্তিত) ---
  useEffect(() => {
    if (!prayerData || isPrayerLogLoading) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const timeToDate = (timeStr: string, date: Date = new Date(now.getTime())): Date => {
        const [h, m] = timeStr.split(':');
        const newDate = new Date(date.getTime());
        newDate.setHours(parseInt(h), parseInt(m), 0, 0);
        return newDate;
      };
      const formatDiff = (diff: number): string => {
        if (diff < 0) diff = 0;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      };
      const timings = prayerData.timings;
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const fajrTime = timeToDate(timings.Fajr);
      const sunriseTime = timeToDate(timings.Sunrise);
      const dhuhrTime = timeToDate(timings.Dhuhr);
      const asrTime = timeToDate(timings.Asr);
      const maghribTime = timeToDate(timings.Maghrib);
      const ishaTime = timeToDate(timings.Isha);
      const ishaYesterdayTime = timeToDate(timings.Isha, yesterday);
      const fajrTomorrowTime = timeToDate(timings.Fajr, tomorrow);
      const allSlots = [
        { name: 'ইশা', start: ishaYesterdayTime, end: fajrTime, isPrayer: true },
        { name: 'ফজর', start: fajrTime, end: sunriseTime, isPrayer: true },
        { name: 'নামাজ নেই', start: sunriseTime, end: dhuhrTime, isPrayer: false },
        { name: 'যোহর', start: dhuhrTime, end: asrTime, isPrayer: true },
        { name: 'আসর', start: asrTime, end: maghribTime, isPrayer: true },
        { name: 'মাগরিব', start: maghribTime, end: ishaTime, isPrayer: true },
        { name: 'ইশা', start: ishaTime, end: fajrTomorrowTime, isPrayer: true }
      ];
      const currentSlot = allSlots.find(slot => now >= slot.start && now < slot.end);
      if (currentSlot && currentSlot.isPrayer) {
        setCurrentPrayerInfo({ name: currentSlot.name, time: currentSlot.start.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) });
        const totalDuration = currentSlot.end.getTime() - currentSlot.start.getTime();
        const elapsed = now.getTime() - currentSlot.start.getTime();
        const progress = (elapsed / totalDuration) * 100;
        setPrayerProgress(progress > 100 ? 100 : progress);
        const diffRemaining = currentSlot.end.getTime() - now.getTime();
        setCurrentWaqtTimeRemaining(formatDiff(diffRemaining));
      } else {
        setCurrentPrayerInfo(null);
        setPrayerProgress(0);
        setCurrentWaqtTimeRemaining('');
      }
      const prayerTimesList = [
        { name: 'ফজর', time: timings.Fajr }, { name: 'যোহর', time: timings.Dhuhr },
        { name: 'আসর', time: timings.Asr }, { name: 'মাগরিব', time: timings.Maghrib },
        { name: 'ইশা', time: timings.Isha },
      ];
      let nextPrayer = null;
      for (let i = 0; i < prayerTimesList.length; i++) {
        const prayerTime = timeToDate(prayerTimesList[i].time);
        if (prayerTime > now) { nextPrayer = { ...prayerTimesList[i], index: i }; break; }
      }
      if (!nextPrayer) { nextPrayer = { ...prayerTimesList[0], index: 0 }; }
      setNextPrayerInfo(nextPrayer);
      const nextPrayerTargetTime = timeToDate(nextPrayer.time);
      if (nextPrayerTargetTime < now) { nextPrayerTargetTime.setDate(nextPrayerTargetTime.getDate() + 1); }
      const diffToNext = nextPrayerTargetTime.getTime() - now.getTime();
      setNextPrayerTimeRemaining(formatDiff(diffToNext));
      if (!isPrayerCheckModalVisible) {
        for (const prayer of prayerNames) {
          if (prayerLog[prayer as keyof PrayerLogType] !== null) {
            continue;
          }
          const prayerTime = timeToDate(timings[prayer]);
          const promptTime = new Date(prayerTime.getTime() + 15 * 60000);
          if (now > promptTime) {
            setPrayerToAsk(prayer);
            setPrayerCheckModalVisible(true);
            break;
          }
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerData, prayerLog, isPrayerLogLoading, isPrayerCheckModalVisible]);

  // --- লোডিং ও এরর স্ক্রিন (অপরিবর্তিত) ---
  if (isLoading || isPrayerLogLoading) return (
    <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center`}>
      <ActivityIndicator size="large" color={ACCENT_COLOR} />
      <Text style={tw`text-[${TEXT_SECONDARY}] mt-4 text-base`}>তথ্য লোড হচ্ছে...</Text>
    </SafeAreaView>
  );
  if (errorMsg) return (
    <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center p-8`}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#F59E0B" />
      <Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text>
    </SafeAreaView>
  );

  // --- মুড বাটন (অপরিবর্তিত) ---
  const MoodButton = ({ mood, label, icon }: MoodButtonProps) => (
    <TouchableOpacity onPress={() => handleSelectMood(mood)} style={tw`items-center w-1/3 p-2`}>
      <Text style={tw`text-4xl`}>{icon}</Text>
      <Text style={tw`text-center text-sm text-slate-700 mt-1 font-semibold`}>{label}</Text>
    </TouchableOpacity>
  );




  // --- JSX (UI) ---
  return (
    <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}]`}>
      {/* --- মুড সিলেকশন মোডাল (অপরিবর্তিত) --- */}
      <Modal
        animationType="fade" transparent={true} visible={isMoodModalVisible}
        onRequestClose={() => {
          if (!currentHadith) handleSelectMood('guidance');
          setMoodModalVisible(false);
        }}
      >
        <TouchableOpacity
          style={tw`flex-1 justify-center items-center bg-black/60`}
          activeOpacity={1}
          onPressOut={() => {
            if (!currentHadith) handleSelectMood('guidance');
            setMoodModalVisible(false);
          }}
        >
          <View style={tw`w-11/12 bg-white rounded-2xl p-5 items-center`} onStartShouldSetResponder={() => true}>
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
        </TouchableOpacity>
      </Modal>

      {/* --- নামাজ চেক করার মোডাল (অপরিবর্তিত) --- */}
      <Modal animationType="fade" transparent={true} visible={isPrayerCheckModalVisible} onRequestClose={() => setPrayerCheckModalVisible(false)}>
        <View style={tw`flex-1 justify-center items-center bg-black/60`}>
          <View style={tw`w-11/12 bg-white rounded-2xl p-6 items-center`}>
            <Text style={tw`text-xl font-bold text-slate-800 mb-4 text-center`}>
              আপনি কি {prayerNamesBN[prayerToAsk!] || prayerToAsk}-এর নামাজ কায়েম করেছেন?
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
        {/* --- হেডার ও তারিখ (অপরিবর্তিত) --- */}
        <View style={tw`flex-row justify-between items-center px-5 pt-3`}>
          <View>
            <Text style={tw`text-3xl font-bold text-white`}>﷽</Text>
            <Text style={tw`text-2xl font-semibold text-[${TEXT_PRIMARY}] mt-1`}>আসসালামু আলাইকুম</Text>
            <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{locationName}</Text>
          </View>
          <TouchableOpacity style={tw`p-2`} onPress={() => router.push('/more')}>
            <MaterialCommunityIcons name="menu" size={30} color="white" />
          </TouchableOpacity>
        </View>
        <View style={tw`mt-6 mx-5 p-4 bg-[${CARD_COLOR_PRIMARY}] rounded-xl flex-row justify-between items-center`}>
          <View>
            <Text style={tw`font-bold text-white text-base`}>{currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{currentTime.toLocaleDateString('bn-BD', { year: 'numeric' })}</Text>
          </View>
          <View style={tw`items-end`}>
            <Text style={tw`font-bold text-white text-base`}>{prayerData?.date.hijri.day} {prayerData?.date.hijri.month.ar}</Text>
            <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{prayerData?.date.hijri.year} হিজরি</Text>
          </View>
        </View>

        {/* --- বর্তমান ও পরবর্তী নামাজের কার্ড (অপরিবর্তিত) --- */}
        <View style={tw`mt-6 mx-5 p-6 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl items-center`}>
          {currentPrayerInfo ? (
            <>
              <Text style={tw`text-lg font-semibold text-[${TEXT_SECONDARY}]`}>বর্তমান ওয়াক্ত</Text>
              <View style={tw`my-4 relative justify-center items-center`}>
                <CircularProgress size={180} strokeWidth={14} progress={prayerProgress} />
                <View style={tw`absolute justify-center items-center`}>
                  <Text style={tw`text-4xl font-bold text-white`}>{currentPrayerInfo.name}</Text>
                  <Text style={tw`text-sm text-[${TEXT_SECONDARY}] mt-1`}>ওয়াক্ত শেষ হতে বাকি</Text>
                  <Text style={tw`text-2xl font-medium text-white mt-1`}>{currentWaqtTimeRemaining}</Text>
                </View>
              </View>
              <Text style={tw`text-base text-[${TEXT_SECONDARY}] text-center`}>
                পরবর্তী নামাজ: <Text style={tw`font-bold text-white`}>{nextPrayerInfo?.name} ( {nextPrayerInfo?.time} )</Text>
              </Text>
            </>
          ) : (
            <>
              <Text style={tw`text-lg font-semibold text-[${TEXT_SECONDARY}]`}>এখন নামাজের ওয়াক্ত নয়</Text>
              <Text style={tw`text-4xl font-bold text-white my-4`}>{currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={tw`text-base text-[${TEXT_SECONDARY}] text-center`}>
                ( {nextPrayerInfo?.time} )
              </Text>
              <Text style={tw`text-base text-[${TEXT_SECONDARY}] mt-1`}>
                শুরু হতে বাকি: <Text style={tw`font-bold text-white`}>{nextPrayerTimeRemaining}</Text>
              </Text>
            </>
          )}
        </View>

        {/* --- নামাজের সময়সূচী (অপরিবর্তিত) --- */}
        <View style={tw`mt-6 px-4 py-4 mx-5 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl flex-row justify-around items-center`}>
          <PrayerTimeItem icon="weather-sunset-up" name="ফজর" time={prayerData?.timings.Fajr} isActive={currentPrayerInfo?.name === 'ফজর'} />
          <PrayerTimeItem icon="weather-sunny" name="যোহর" time={prayerData?.timings.Dhuhr} isActive={currentPrayerInfo?.name === 'যোহর'} />
          <PrayerTimeItem icon="weather-hazy" name="আসর" time={prayerData?.timings.Asr} isActive={currentPrayerInfo?.name === 'আসর'} />
          <PrayerTimeItem icon="weather-sunset-down" name="মাগরিব" time={prayerData?.timings.Maghrib} isActive={currentPrayerInfo?.name === 'মাগরিব'} />
          <PrayerTimeItem icon="weather-night" name="ইশা" time={prayerData?.timings.Isha} isActive={currentPrayerInfo?.name === 'ইশা'} />
        </View>

        {/* --- বাটনসমূহ (অপরিবর্তিত) --- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`flex-row items-center px-5 mt-8`}
        >
          <ActionButton icon="pray-outline" name="নামাজ" onPress={() => router.push('/namaz')} />
          <ActionButton icon="book-open-variant" name="দুআ" onPress={() => router.push('/dua')} />
          <ActionButton icon="compass-outline" name="কিবলা" onPress={() => router.push('/qibla')} />
          <ActionButton icon="hand-pray" name="তাসবিহ" onPress={() => router.push('/tasbeeh')} />
          <ActionButton icon="hand-coin-outline" name="যাকাত" onPress={() => router.push('/zakat')} />
        </ScrollView>




        {/* --- হাদিস কার্ড (অপরিবর্তিত) --- */}
        <View style={tw`mt-8 mx-5 p-5 bg-[${HADITH_BG}] rounded-2xl min-h-[180px] justify-center`}>
          {currentHadith ? (
            <>
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-lg font-bold text-[${HADITH_TEXT}]`}> ruh</Text>
                <TouchableOpacity onPress={showAnotherHadith} style={tw`p-1`}>
                  <MaterialCommunityIcons name="refresh" size={22} color={HADITH_TEXT} />
                </TouchableOpacity>
              </View>
              <Text style={tw`text-xl text-[${HADITH_TEXT}] text-right leading-9 mb-3 font-medium`}>{currentHadith.arabic}</Text>
              <Text style={tw`text-base text-[${HADITH_TEXT}] leading-6`}>{currentHadith.translation}</Text>
              <Text style={tw`text-sm font-semibold text-[${HADITH_TEXT}] mt-3 opacity-80`}>{currentHadith.reference}</Text>
              <TouchableOpacity onPress={() => setMoodModalVisible(true)} style={tw`mt-4 self-center`}>
                <Text style={tw`text-sm font-bold text-[${ACCENT_COLOR}]`}>অনুভূতি পরিবর্তন করুন</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={tw`items-center`}>
              <ActivityIndicator color={HADITH_TEXT} />
              <Text style={tw`text-[${HADITH_TEXT}] mt-2`}>হাদিস লোড হচ্ছে...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- রমজান কাউন্টডাউন (অপরিবর্তিত) --- */}
      {
        ramadanDaysLeft > 0 && (
          <TouchableOpacity style={tw`absolute bottom-0 left-0 right-0 bg-[${CARD_COLOR_PRIMARY}] p-4 flex-row justify-center items-center border-t border-t-[${ACCENT_COLOR}]/50`}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={ACCENT_COLOR} />
            <Text style={tw`text-white font-bold text-base ml-3`}>রমজান আসতে বাকি: {ramadanDaysLeft} দিন </Text>
          </TouchableOpacity>
        )
      }
    </SafeAreaView >
  );
};

export default Index;