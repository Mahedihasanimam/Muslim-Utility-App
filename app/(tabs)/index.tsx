


// import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import * as Notifications from 'expo-notifications';
// import { useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { Circle, Svg } from 'react-native-svg';
// import tw from 'twrnc';
// import { hadiths } from '../../assets/hadiths';

// import DigitalLoading from '@/components/DigitalLoading';
// import { getIslamicAdvice, getPrayerMissedAdvice } from '@/components/utils/GeminiService';
// import motivationmessagesData from '../../assets/motivationalMessages.json';
// const motivationalMessages: string[] = motivationmessagesData.map(item => item.message);
// // একটি র‍্যান্ডম মেসেজ বেছে নেওয়ার ফাংশন
// const getRandomMessage = (): string => {
//   const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
//   return motivationalMessages[randomIndex];
// };
// // --- নতুন কোড শেষ ---

// // --- নোটিফিকেশন হ্যান্ডলার (অপরিবর্তিত) ---
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// // --- কালার প্যালেট (অপরিবর্তিত) ---
// const BG_COLOR = '#0F172A';
// const CARD_COLOR_PRIMARY = '#1E293B';
// const ACCENT_COLOR = '#047857';
// const TEXT_PRIMARY = '#F8FAFC';
// const TEXT_SECONDARY = '#CBD5E1';
// const HADITH_BG = '#FEFBEA';
// const HADITH_TEXT = '#4A443A';

// // --- টাইপস (অপরিবর্তিত) ---
// interface PrayerTimeItemProps {
//   icon: any; name: string; time: string; isActive?: boolean;
// }
// interface ActionButtonProps {
//   icon: string; name: string; onPress: () => void; iconSet?: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome';
// }
// interface CircularProgressProps {
//   size: number; strokeWidth: number; progress: number;
// }
// interface MoodButtonProps {
//   mood: string; label: string; icon: any;
// }

// // --- হেল্পার কম্পোনেন্ট (অপরিবর্তিত) ---
// const PrayerTimeItem = ({ icon, name, time, isActive = false }: PrayerTimeItemProps) => {
//   const color = isActive ? ACCENT_COLOR : TEXT_SECONDARY;
//   return (
//     <View style={tw`items-center`}>
//       <MaterialCommunityIcons name={icon} size={24} color={color} />
//       <Text style={[tw`text-xs font-semibold mt-1`, { color }]}>{name}</Text>
//       <Text style={[tw`text-xs`, { color }]}>{time}</Text>
//     </View>
//   );
// };
// const ActionButton = ({ icon, name, onPress, iconSet = 'MaterialCommunityIcons' }: ActionButtonProps) => {
//   const IconComponent = { Ionicons, MaterialCommunityIcons, FontAwesome }[iconSet];

//   return (
//     <TouchableOpacity
//       style={tw`items-center mr-4`}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <View style={tw`w-16 h-16 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl items-center justify-center`}>
//         <IconComponent name={icon as any} size={28} color={ACCENT_COLOR} />
//       </View>
//       <Text style={tw`text-[${TEXT_SECONDARY}] text-sm mt-2 font-medium`}>{name}</Text>
//     </TouchableOpacity>
//   );
// };

// const CircularProgress = ({ size, strokeWidth, progress }: CircularProgressProps) => {
//   const radius = (size - strokeWidth) / 2;
//   const circumference = radius * 2 * Math.PI;
//   const strokeDashoffset = circumference - (progress / 100) * circumference;
//   return (
// <View style={tw`justify-center items-center`}>
//   <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//     <Circle stroke={BG_COLOR} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
//     <Circle
//       stroke={ACCENT_COLOR} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth}
//       strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
//       transform={`rotate(-90 ${size / 2} ${size / 2})`}
//     />
//   </Svg>
// </View>
//   );
// };

// // --- নোটিফিকেশন পারমিশন ফাংশন (অপরিবর্তিত) ---
// async function registerForPushNotificationsAsync(): Promise<boolean> {
//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }
//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;
//   if (existingStatus !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }
//   if (finalStatus !== 'granted') {
//     Alert.alert('নোটিফিকেশন', 'নামাজের সময়ের নোটিফিকেশন পেতে অনুগ্রহ করে অ্যাপ সেটিংসে অনুমতি দিন।');
//     return false;
//   }
//   return true;
// }

// // --- মূল কম্পোনেন্ট ---
// const Index = () => {
//   const router = useRouter();
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [prayerData, setPrayerData] = useState<any>(null);
//   const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string; index: number } | null>(null);
//   const [ramadanDaysLeft, setRamadanDaysLeft] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [locationName, setLocationName] = useState('Dhaka, Bangladesh');
//   const [currentPrayerInfo, setCurrentPrayerInfo] = useState<{ name: string; time: string } | null>(null);
//   const [prayerProgress, setPrayerProgress] = useState(0);
//   const [currentWaqtTimeRemaining, setCurrentWaqtTimeRemaining] = useState('');
//   const [nextPrayerTimeRemaining, setNextPrayerTimeRemaining] = useState('');
//   const [currentHadith, setCurrentHadith] = useState<any>(null);
//   const [selectedMood, setSelectedMood] = useState<string | null>(null);
//   const [isMoodModalVisible, setMoodModalVisible] = useState(false);

//   const initialPrayerLog = { Fajr: null, Dhuhr: null, Asr: null, Maghrib: null, Isha: null };
//   type PrayerLogType = typeof initialPrayerLog;
//   const [prayerLog, setPrayerLog] = useState<PrayerLogType>(initialPrayerLog);
//   const [isPrayerCheckModalVisible, setPrayerCheckModalVisible] = useState(false);
//   const [prayerToAsk, setPrayerToAsk] = useState<string | null>(null);

//   const [isPrayerLogLoading, setIsPrayerLogLoading] = useState(true);
//   const PRAYER_LOG_STORAGE_KEY = '@MyIslamicApp:prayerLog';
//   const NOTIFICATION_SCHEDULE_KEY = '@MyIslamicApp:notificationScheduleDate';
//   const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
//   const prayerNamesBN: { [key: string]: string } = { Fajr: 'ফজর', Dhuhr: 'যোহর', Asr: 'আসর', Maghrib: 'মাগরিব', Isha: 'ইশা' };
//   const [isAiLoading, setIsAiLoading] = useState(false);

//   const [aiAdviceData, setAiAdviceData] = useState<any>(null);

//   const handleSelectMood = async (mood: string) => {
//     setMoodModalVisible(false);
//     setIsAiLoading(true);
//     setAiAdviceData(null);

//     try {
//       // JSON ডাটা আসবে
//       const data = await getIslamicAdvice(mood);
//       console.log('ai api resonse', data);
//       if (data) {
//         setAiAdviceData(data); // পুরো অবজেক্ট সেট করুন
//         setSelectedMood(mood);
//       } else {
//         fallbackToStaticData(mood);
//       }
//     } catch (e) {
//       fallbackToStaticData(mood);
//     } finally {
//       setIsAiLoading(false);
//     }
//   };

//   // স্ট্যাটিক ডেটা লোড করার হেল্পার ফাংশন (তোমার আগের লজিক)
//   const fallbackToStaticData = (mood: string) => {
//     if (!hadiths || hadiths.length === 0) return;
//     let filteredHadiths = hadiths.filter((h: any) => h.category === mood);
//     if (filteredHadiths.length === 0) filteredHadiths = hadiths;

//     const randomIndex = Math.floor(Math.random() * filteredHadiths.length);
//     setCurrentHadith(filteredHadiths[randomIndex]);
//     setSelectedMood(mood);
//   };








//   const showAnotherHadith = () => { if (selectedMood) handleSelectMood(selectedMood); };

//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//         if (locationStatus !== 'granted') throw new Error('নামাজের সময় পেতে লোকেশন অনুমতি প্রয়োজন।');
//         await registerForPushNotificationsAsync();
//         const location = await Location.getCurrentPositionAsync({});
//         const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
//         if (geocode.length > 0) setLocationName(`${geocode[0].city}, ${geocode[0].country}`);
//         const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&method=2`);
//         const data = await response.json();
//         if (data.code !== 200) throw new Error('নামাজের সময় পাওয়া যায়নি।');
//         setPrayerData(data.data);
//         const ramadanStartDate = new Date('2026-02-28T00:00:00');
//         const diffDays = Math.ceil((ramadanStartDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
//         setRamadanDaysLeft(diffDays > 0 ? diffDays : 0);
//       } catch (e: any) {
//         setErrorMsg(e.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (!prayerData) {
//       if (!isLoading) {
//         setIsPrayerLogLoading(false);
//       }
//       return;
//     }
//     const todayDate = prayerData.date.gregorian.date;
//     const timeToDate = (timeStr: string): Date => {
//       const now = new Date();
//       const [h, m] = timeStr.split(':');
//       now.setHours(parseInt(h), parseInt(m), 0, 0);
//       return now;
//     };
//     const loadPrayerLog = async () => {
//       try {
//         const storedData = await AsyncStorage.getItem(PRAYER_LOG_STORAGE_KEY);
//         if (storedData) {
//           const { log, date } = JSON.parse(storedData);
//           if (date === todayDate) {
//             setPrayerLog(log);
//           } else {
//             setPrayerLog(initialPrayerLog);
//             await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: initialPrayerLog, date: todayDate }));
//           }
//         } else {
//           await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: initialPrayerLog, date: todayDate }));
//         }
//       } catch (e) { console.error("Failed to load prayer log", e); }
//       finally {
//         setIsPrayerLogLoading(false);
//       }
//     };

//     const schedulePrayerNotifications = async () => {
//       try {
//         const lastScheduledDate = await AsyncStorage.getItem(NOTIFICATION_SCHEDULE_KEY);

//         if (lastScheduledDate === todayDate) {
//           console.log('Notifications already scheduled for today.');
//           return;
//         }


//         await Notifications.cancelAllScheduledNotificationsAsync();

//         const timings = prayerData.timings;
//         let scheduledCount = 0;
//         const now = new Date();

//         for (const prayer of prayerNames) {
//           const prayerTime = timeToDate(timings[prayer]);

//           if (prayerTime > now) {
//             const secondsUntil = Math.round((prayerTime.getTime() - now.getTime()) / 1000);
//             if (secondsUntil <= 0) continue;


//             const title = `🕌 ${prayerNamesBN[prayer as keyof typeof prayerNamesBN]}-এর ওয়াক্ত`;

//             const randomBody = getRandomMessage();

//             await Notifications.scheduleNotificationAsync({
//               content: {
//                 title: title,
//                 body: randomBody,
//                 sound: 'default',
//               },
//               trigger: { seconds: secondsUntil },
//             });
//             scheduledCount++;
//           }
//         }
//         console.log(`Scheduled ${scheduledCount} new notifications for today.`);
//         // আজকের তারিখ সেভ করে রাখুন
//         await AsyncStorage.setItem(NOTIFICATION_SCHEDULE_KEY, todayDate);
//       } catch (e) {
//         console.error("Failed to schedule notifications", e);
//       }
//     };
//     // --- !!! পরিবর্তন শেষ !!! ---

//     loadPrayerLog();
//     schedulePrayerNotifications();
//   }, [prayerData, isLoading]);

//   // --- মোডাল দেখানোর useEffect (অপরিবর্তিত) ---
//   useEffect(() => {
//     if (!isLoading && !isPrayerLogLoading) {
//       if (!errorMsg) {
//         setMoodModalVisible(true);
//       }
//     }
//   }, [isLoading, isPrayerLogLoading, errorMsg]);


//   // --- নামাজ রিপোর্ট ও লগ ফাংশন (অপরিবর্তিত) ---
//   const showEndOfDayReport = (finalLog: PrayerLogType) => {
//     const missedPrayers = Object.keys(finalLog).filter(p => finalLog[p as keyof PrayerLogType] === false);
//     if (missedPrayers.length === 0) {
//       Alert.alert("দৈনিক নামাজের রিপোর্ট", "আলহামদুলিল্লাহ! আপনি আজকে ৫ ওয়াক্ত নামাজই আদায় করেছেন। আল্লাহ কবুল করুন।");
//     } else {
//       Alert.alert("দৈনিক নামাজের রিপোর্ট", `আজকে আপনার ${missedPrayers.join(', ')} নামাজগুলো কাজা হয়েছে। আগামীকাল থেকে চেষ্টা করবেন, ইনশাআল্লাহ।`);
//     }
//   };
//   // --- আপডেটেড logPrayer ফাংশন ---
//   const logPrayer = async (prayerName: string, hasPrayed: boolean) => {
//     if (!prayerData) {
//       Alert.alert("ত্রুটি", "নামাজের তথ্য লোড না হওয়ায় লগ সেভ করা সম্ভব হচ্ছে না।");
//       return;
//     }

//     // ১. লগ আপডেট করুন
//     const updatedLog = { ...prayerLog, [prayerName]: hasPrayed };
//     setPrayerLog(updatedLog);
//     setPrayerCheckModalVisible(false); // মোডাল বন্ধ

//     // ২. স্টোরেজে সেভ করুন
//     try {
//       const todayDate = prayerData.date.gregorian.date;
//       await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: updatedLog, date: todayDate }));
//     } catch (e) {
//       console.error("Failed to save prayer log", e);
//     }

//     // ৩. 🔥 নতুন ফিচার: যদি নামাজ মিস হয় (hasPrayed === false)
//     if (!hasPrayed) {
//       setIsAiLoading(true); // গ্লোবাল লোডিং দেখাতে পারেন অথবা সাইলেন্টলি করতে পারেন

//       // AI কে কল করা
//       const motivation = await getPrayerMissedAdvice(prayerNamesBN[prayerName] || prayerName);

//       setIsAiLoading(false);

//       // সুন্দর একটি অ্যালার্ট দেখানো
//       Alert.alert("Don't give up! 💪", motivation, [
//         { text: "ইনশাআল্লাহ", onPress: () => console.log("User motivated") }
//       ]);
//     }

//     if (prayerName === 'Isha') {
//       showEndOfDayReport(updatedLog);
//     }
//   };

//   // --- মূল সময়, কাউন্টডাউন এবং ট্র্যাকিং useEffect (অপরিবর্তিত) ---
//   useEffect(() => {
//     if (!prayerData || isPrayerLogLoading) return;

//     const timer = setInterval(() => {
//       const now = new Date();
//       setCurrentTime(now);
//       const timeToDate = (timeStr: string, date: Date = new Date(now.getTime())): Date => {
//         const [h, m] = timeStr.split(':');
//         const newDate = new Date(date.getTime());
//         newDate.setHours(parseInt(h), parseInt(m), 0, 0);
//         return newDate;
//       };
//       const formatDiff = (diff: number): string => {
//         if (diff < 0) diff = 0;
//         const hours = Math.floor(diff / 3600000);
//         const minutes = Math.floor((diff % 3600000) / 60000);
//         const seconds = Math.floor((diff % 60000) / 1000);
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//       };
//       const timings = prayerData.timings;
//       const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//       const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//       const fajrTime = timeToDate(timings.Fajr);
//       const sunriseTime = timeToDate(timings.Sunrise);
//       const dhuhrTime = timeToDate(timings.Dhuhr);
//       const asrTime = timeToDate(timings.Asr);
//       const maghribTime = timeToDate(timings.Maghrib);
//       const ishaTime = timeToDate(timings.Isha);
//       const ishaYesterdayTime = timeToDate(timings.Isha, yesterday);
//       const fajrTomorrowTime = timeToDate(timings.Fajr, tomorrow);
//       const allSlots = [
//         { name: 'ইশা', start: ishaYesterdayTime, end: fajrTime, isPrayer: true },
//         { name: 'ফজর', start: fajrTime, end: sunriseTime, isPrayer: true },
//         { name: 'নামাজ নেই', start: sunriseTime, end: dhuhrTime, isPrayer: false },
//         { name: 'যোহর', start: dhuhrTime, end: asrTime, isPrayer: true },
//         { name: 'আসর', start: asrTime, end: maghribTime, isPrayer: true },
//         { name: 'মাগরিব', start: maghribTime, end: ishaTime, isPrayer: true },
//         { name: 'ইশা', start: ishaTime, end: fajrTomorrowTime, isPrayer: true }
//       ];
//       const currentSlot = allSlots.find(slot => now >= slot.start && now < slot.end);
//       if (currentSlot && currentSlot.isPrayer) {
//         setCurrentPrayerInfo({ name: currentSlot.name, time: currentSlot.start.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) });
//         const totalDuration = currentSlot.end.getTime() - currentSlot.start.getTime();
//         const elapsed = now.getTime() - currentSlot.start.getTime();
//         const progress = (elapsed / totalDuration) * 100;
//         setPrayerProgress(progress > 100 ? 100 : progress);
//         const diffRemaining = currentSlot.end.getTime() - now.getTime();
//         setCurrentWaqtTimeRemaining(formatDiff(diffRemaining));
//       } else {
//         setCurrentPrayerInfo(null);
//         setPrayerProgress(0);
//         setCurrentWaqtTimeRemaining('');
//       }
//       const prayerTimesList = [
//         { name: 'ফজর', time: timings.Fajr }, { name: 'যোহর', time: timings.Dhuhr },
//         { name: 'আসর', time: timings.Asr }, { name: 'মাগরিব', time: timings.Maghrib },
//         { name: 'ইশা', time: timings.Isha },
//       ];
//       let nextPrayer = null;
//       for (let i = 0; i < prayerTimesList.length; i++) {
//         const prayerTime = timeToDate(prayerTimesList[i].time);
//         if (prayerTime > now) { nextPrayer = { ...prayerTimesList[i], index: i }; break; }
//       }
//       if (!nextPrayer) { nextPrayer = { ...prayerTimesList[0], index: 0 }; }
//       setNextPrayerInfo(nextPrayer);
//       const nextPrayerTargetTime = timeToDate(nextPrayer.time);
//       if (nextPrayerTargetTime < now) { nextPrayerTargetTime.setDate(nextPrayerTargetTime.getDate() + 1); }
//       const diffToNext = nextPrayerTargetTime.getTime() - now.getTime();
//       setNextPrayerTimeRemaining(formatDiff(diffToNext));
//       if (!isPrayerCheckModalVisible) {
//         for (const prayer of prayerNames) {
//           if (prayerLog[prayer as keyof PrayerLogType] !== null) {
//             continue;
//           }
//           const prayerTime = timeToDate(timings[prayer]);
//           const promptTime = new Date(prayerTime.getTime() + 15 * 60000);
//           if (now > promptTime) {
//             setPrayerToAsk(prayer);
//             setPrayerCheckModalVisible(true);
//             break;
//           }
//         }
//       }
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [prayerData, prayerLog, isPrayerLogLoading, isPrayerCheckModalVisible]);

//   // --- লোডিং ও এরর স্ক্রিন (অপরিবর্তিত) ---
//   if (isLoading || isPrayerLogLoading) return (
//     <DigitalLoading />
//   );
//   if (errorMsg) return (
//     <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}] justify-center items-center p-8`}>
//       <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#F59E0B" />
//       <Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text>
//     </SafeAreaView>
//   );

//   // --- মুড বাটন (অপরিবর্তিত) ---
//   const MoodButton = ({ mood, label, icon }: MoodButtonProps) => (
//     <TouchableOpacity onPress={() => handleSelectMood(mood)} style={tw`items-center w-1/3 p-2`}>
//       <Text style={tw`text-4xl`}>{icon}</Text>
//       <Text style={tw`text-center text-sm text-slate-700 mt-1 font-semibold`}>{label}</Text>
//     </TouchableOpacity>
//   );

//   // --- JSX (UI) ---
//   return (
//     <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}]`}>
//       {/* --- মুড সিলেকশন মোডাল (অপরিবর্তিত) --- */}
//       <Modal
//         animationType="fade" transparent={true} visible={isMoodModalVisible}
//         onRequestClose={() => {
//           if (!currentHadith) handleSelectMood('guidance');
//           setMoodModalVisible(false);
//         }}
//       >
//         <TouchableOpacity
//           style={tw`flex-1 justify-center items-center bg-black/60`}
//           activeOpacity={1}
//           onPressOut={() => {
//             if (!currentHadith) handleSelectMood('guidance');
//             setMoodModalVisible(false);
//           }}
//         >
//           <View style={tw`w-11/12 bg-white rounded-2xl p-5 items-center`} onStartShouldSetResponder={() => true}>
//             <Text style={tw`text-xl font-bold text-slate-800 mb-2`}>আসসালামু আলাইকুম</Text>
//             <Text style={tw`text-base text-slate-600 mb-6 text-center`}>আপনার বর্তমান অনুভূতি কেমন?</Text>
//             <View style={tw`flex-row flex-wrap justify-center`}>
//               <MoodButton mood="hope" label="প্রত্যাশী" icon="😊" />
//               <MoodButton mood="patience" label="ধৈর্যহারা" icon="😔" />
//               <MoodButton mood="gratitude" label="কৃতজ্ঞ" icon="💖" />
//               <MoodButton mood="anxiety" label="উদ্বিগ্ন" icon="😟" />
//               <MoodButton mood="forgiveness" label="ক্ষমাপ্রার্থী" icon="🙏" />
//               <MoodButton mood="anger" label="রাগান্বিত" icon="😠" />
//               <MoodButton mood="kindness" label="দয়ালু" icon="🤗" />
//               <MoodButton mood="family" label="পারিবারিক" icon="👨‍👩‍👧‍👦" />
//               <MoodButton mood="purpose" label="উদ্দেশ্যহীন" icon="🧭" />
//               <MoodButton mood="friendship" label="বন্ধুত্ব" icon="🤝" />
//               <MoodButton mood="honesty" label="সৎ" icon="⚖️" />
//               <MoodButton mood="guidance" label="পথনির্দেশ" icon="🤔" />
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* --- নামাজ চেক করার মোডাল (অপরিবর্তিত) --- */}
//       <Modal animationType="fade" transparent={true} visible={isPrayerCheckModalVisible} onRequestClose={() => setPrayerCheckModalVisible(false)}>
//         <View style={tw`flex-1 justify-center items-center bg-black/60`}>
//           <View style={tw`w-11/12 bg-white rounded-2xl p-6 items-center`}>
//             <Text style={tw`text-xl font-bold text-slate-800 mb-4 text-center`}>
//               আপনি কি {prayerNamesBN[prayerToAsk!] || prayerToAsk}-এর নামাজ কায়েম করেছেন?
//             </Text>
//             <View style={tw`flex-row justify-around w-full mt-4`}>
//               <TouchableOpacity onPress={() => logPrayer(prayerToAsk!, true)} style={tw`bg-emerald-600 rounded-lg py-3 px-10`}>
//                 <Text style={tw`text-white font-bold text-lg`}>হ্যাঁ</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => logPrayer(prayerToAsk!, false)} style={tw`bg-rose-600 rounded-lg py-3 px-10`}>
//                 <Text style={tw`text-white font-bold text-lg`}>না</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <ScrollView contentContainerStyle={tw`pb-24`}>
//         {/* --- হেডার ও তারিখ (অপরিবর্তিত) --- */}
//         <View style={tw`flex-row justify-between items-center px-5 pt-3`}>
//           <View>
//             <Text style={tw`text-3xl font-bold text-white`}>﷽</Text>
//             <Text style={tw`text-2xl font-semibold text-[${TEXT_PRIMARY}] mt-1`}>আসসালামু আলাইকুম</Text>
//             <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{locationName}</Text>
//           </View>
//           <TouchableOpacity style={tw`p-2`} onPress={() => router.push('/more')}>
//             <MaterialCommunityIcons name="menu" size={30} color="white" />
//           </TouchableOpacity>
//         </View>
//         <View style={tw`mt-6 mx-5 p-4 bg-[${CARD_COLOR_PRIMARY}] rounded-xl flex-row justify-between items-center`}>
//           <View>
//             <Text style={tw`font-bold text-white text-base`}>{currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
//             <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{currentTime.toLocaleDateString('bn-BD', { year: 'numeric' })}</Text>
//           </View>
//           <View style={tw`items-end`}>
//             <Text style={tw`font-bold text-white text-base`}>{prayerData?.date.hijri.day} {prayerData?.date.hijri.month.ar}</Text>
//             <Text style={tw`text-sm text-[${TEXT_SECONDARY}]`}>{prayerData?.date.hijri.year} হিজরি</Text>
//           </View>
//         </View>

//         {/* --- বর্তমান ও পরবর্তী নামাজের কার্ড (অপরিবর্তিত) --- */}
//         <View style={tw`mt-6 mx-5 p-6 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl items-center`}>
//           {currentPrayerInfo ? (
//             <>
//               <Text style={tw`text-lg font-semibold text-[${TEXT_SECONDARY}]`}>বর্তমান ওয়াক্ত</Text>
//               <View style={tw`my-4 relative justify-center items-center`}>
//                 <CircularProgress size={180} strokeWidth={14} progress={prayerProgress} />
//                 <View style={tw`absolute justify-center items-center`}>
//                   <Text style={tw`text-4xl font-bold text-white`}>{currentPrayerInfo.name}</Text>
//                   <Text style={tw`text-sm text-[${TEXT_SECONDARY}] mt-1`}>ওয়াক্ত শেষ হতে বাকি</Text>
//                   <Text style={tw`text-2xl font-medium text-white mt-1`}>{currentWaqtTimeRemaining}</Text>
//                 </View>
//               </View>
//               <Text style={tw`text-base text-[${TEXT_SECONDARY}] text-center`}>
//                 পরবর্তী নামাজ: <Text style={tw`font-bold text-white`}>{nextPrayerInfo?.name} ( {nextPrayerInfo?.time} )</Text>
//               </Text>
//             </>
//           ) : (
//             <>
//               <Text style={tw`text-lg font-semibold text-[${TEXT_SECONDARY}]`}>এখন নামাজের ওয়াক্ত নয়</Text>
//               <Text style={tw`text-4xl font-bold text-white my-4`}>{currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</Text>
//               <Text style={tw`text-base text-[${TEXT_SECONDARY}] text-center`}>
//                 ( {nextPrayerInfo?.time} )
//               </Text>
//               <Text style={tw`text-base text-[${TEXT_SECONDARY}] mt-1`}>
//                 শুরু হতে বাকি: <Text style={tw`font-bold text-white`}>{nextPrayerTimeRemaining}</Text>
//               </Text>
//             </>
//           )}
//         </View>

//         {/* --- নামাজের সময়সূচী (অপরিবর্তিত) --- */}
//         <View style={tw`mt-6 px-4 py-4 mx-5 bg-[${CARD_COLOR_PRIMARY}] rounded-2xl flex-row justify-around items-center`}>
//           <PrayerTimeItem icon="weather-sunset-up" name="ফজর" time={prayerData?.timings.Fajr} isActive={currentPrayerInfo?.name === 'ফজর'} />
//           <PrayerTimeItem icon="weather-sunny" name="যোহর" time={prayerData?.timings.Dhuhr} isActive={currentPrayerInfo?.name === 'যোহর'} />
//           <PrayerTimeItem icon="weather-hazy" name="আসর" time={prayerData?.timings.Asr} isActive={currentPrayerInfo?.name === 'আসর'} />
//           <PrayerTimeItem icon="weather-sunset-down" name="মাগরিব" time={prayerData?.timings.Maghrib} isActive={currentPrayerInfo?.name === 'মাগরিব'} />
//           <PrayerTimeItem icon="weather-night" name="ইশা" time={prayerData?.timings.Isha} isActive={currentPrayerInfo?.name === 'ইশা'} />
//         </View>

//         {/* --- বাটনসমূহ (অপরিবর্তিত) --- */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={tw`flex-row items-center px-5 mt-8`}
//         >
//           <ActionButton icon="hands-pray" name="নামাজ" onPress={() => router.push('/namaz')} />
//           <ActionButton icon="book-open-variant" name="দুআ" onPress={() => router.push('/dua')} />
//           <ActionButton icon="compass-outline" name="কিবলা" onPress={() => router.push('/qibla')} />
//           <ActionButton icon="hands-pray" name="তাসবিহ" onPress={() => router.push('/tasbeeh')} />
//           <ActionButton icon="hand-coin-outline" name="যাকাত" onPress={() => router.push('/zakat')} />
//         </ScrollView>

//         {/* --- হাদিস / AI পরামর্শ কার্ড --- */}
//         <View style={tw`mt-8 mx-5 p-5 bg-[${HADITH_BG}] rounded-2xl min-h-[180px] justify-center shadow-sm`}>

//           {/* লোডিং স্টেট */}
//           {isAiLoading ? (
//             <View style={tw`items-center py-4`}>
//               <ActivityIndicator size="large" color={ACCENT_COLOR} />
//               <Text style={tw`text-[${HADITH_TEXT}] mt-3 text-center font-medium`}>
//                 কুরআন ও হাদিসের আলোয় আপনার জন্য পরামর্শ খোঁজা হচ্ছে...
//               </Text>
//             </View>
//           ) : aiAdviceData ? (
//             <View>
//               <View style={tw`flex-row justify-between items-center mb-2 border-b border-gray-300 pb-2`}>
//                 <Text style={tw`text-lg font-bold text-[${ACCENT_COLOR}]`}>পরামর্শ ({selectedMood})</Text>
//                 <MaterialCommunityIcons name="robot-happy-outline" size={24} color={ACCENT_COLOR} />
//               </View>

//               {/* Advice */}
//               <Text style={tw`text-base text-[${HADITH_TEXT}] mb-3`}>{aiAdviceData.advice}</Text>

//               {/* Dua Section Box */}
//               <View style={tw`bg-emerald-50 p-3 rounded-lg border border-emerald-100`}>
//                 <Text style={tw`text-xl text-right font-bold text-emerald-800 mb-1`}>{aiAdviceData.dua_arabic}</Text>
//                 <Text style={tw`text-sm text-center text-emerald-600 italic`}>{aiAdviceData.dua_meaning}</Text>
//                 <Text style={tw`text-xs text-right text-gray-400 mt-2`}>সূত্র: {aiAdviceData.reference}</Text>
//               </View>

//               <TouchableOpacity onPress={() => setMoodModalVisible(true)} style={tw`mt-4 self-center`}>
//                 <Text style={tw`text-sm font-bold text-[${ACCENT_COLOR}]`}>অন্য অনুভূতি?</Text>
//               </TouchableOpacity>
//             </View>

//           ) : currentHadith ? (
//             /* আগের স্ট্যাটিক হাদিস ডিজাইন (অপরিবর্তিত) */
//             <>
//               <View style={tw`flex-row justify-between items-center mb-3`}>
//                 <Text style={tw`text-lg font-bold text-[${HADITH_TEXT}]`}>আজকের হাদিস</Text>
//                 <TouchableOpacity onPress={showAnotherHadith} style={tw`p-1`}>
//                   <MaterialCommunityIcons name="refresh" size={22} color={HADITH_TEXT} />
//                 </TouchableOpacity>
//               </View>
//               <Text style={tw`text-xl text-[${HADITH_TEXT}] text-right leading-9 mb-3 font-medium`}>{currentHadith.arabic}</Text>
//               <Text style={tw`text-base text-[${HADITH_TEXT}] leading-6`}>{currentHadith.translation}</Text>
//               <Text style={tw`text-sm font-semibold text-[${HADITH_TEXT}] mt-3 opacity-80`}>{currentHadith.reference}</Text>
//               <TouchableOpacity onPress={() => setMoodModalVisible(true)} style={tw`mt-4 self-center`}>
//                 <Text style={tw`text-sm font-bold text-[${ACCENT_COLOR}]`}>অনুভূতি পরিবর্তন করুন</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             /* ডিফল্ট লোডিং */
//             <View style={tw`items-center`}>
//               <ActivityIndicator color={HADITH_TEXT} />
//               <Text style={tw`text-[${HADITH_TEXT}] mt-2`}>হাদিস লোড হচ্ছে...</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* --- রমজান কাউন্টডাউন (অপরিবর্তিত) --- */}
//       {
//         ramadanDaysLeft > 0 && (
//           <TouchableOpacity style={tw`absolute bottom-0 left-0 right-0 bg-[${CARD_COLOR_PRIMARY}] p-4 flex-row justify-center items-center border-t border-t-[${ACCENT_COLOR}]/50`}>
//             <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={ACCENT_COLOR} />
//             <Text style={tw`text-white font-bold text-base ml-3`}>রমজান আসতে বাকি: {ramadanDaysLeft} দিন </Text>
//           </TouchableOpacity>
//         )
//       }
//     </SafeAreaView >
//   );
// };

// export default Index;

import DigitalLoading from '@/components/DigitalLoading';
import { getIslamicAdvice, getPrayerMissedAdvice } from '@/components/utils/GeminiService';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import tw from 'twrnc';
import { hadiths } from '../../assets/hadiths';
import motivationmessagesData from '../../assets/motivationalMessages.json';

const motivationalMessages: string[] = motivationmessagesData.map(item => item.message);

// --- থিম কনফিগারেশন (Islamic Tech Vibe) ---
const THEME = {
  bg: '#0F172A',           // Deep Navy
  card: '#1E293B',         // Slate 800
  primary: '#FBBF24',      // Amber/Gold (Islamic)
  secondary: '#22D3EE',    // Cyan (Tech/AI)
  textMain: '#F8FAFC',     // Slate 50
  textSub: '#94A3B8',      // Slate 400
  border: 'rgba(251, 191, 36, 0.3)', // Gold with opacity
};

// --- র‍্যান্ডম মেসেজ হেল্পার ---
const getRandomMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
};

// --- নোটিফিকেশন হ্যান্ডলার ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- টাইপস ---
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

// --- কাস্টম স্কেলেটন লোডার (হাদিস কার্ডের জন্য) ---
const HadithSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  return (
    <View style={tw`w-full`}>
      {/* Header Skeleton */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Animated.View style={[tw`h-5 w-32 rounded bg-slate-700`, { opacity }]} />
        <Animated.View style={[tw`h-8 w-8 rounded-full bg-slate-700`, { opacity }]} />
      </View>

      {/* Arabic Text Skeleton (Right Aligned) */}
      <View style={tw`items-end mb-4 space-y-2`}>
        <Animated.View style={[tw`h-6 w-3/4 rounded bg-slate-700`, { opacity }]} />
        <Animated.View style={[tw`h-6 w-1/2 rounded bg-slate-700`, { opacity }]} />
      </View>

      {/* Bangla Text Skeleton (Left Aligned) */}
      <View style={tw`items-start mb-4 space-y-2`}>
        <Animated.View style={[tw`h-4 w-full rounded bg-slate-700`, { opacity }]} />
        <Animated.View style={[tw`h-4 w-11/12 rounded bg-slate-700`, { opacity }]} />
        <Animated.View style={[tw`h-4 w-4/5 rounded bg-slate-700`, { opacity }]} />
      </View>

      {/* Reference Skeleton */}
      <View style={tw`items-end mt-2`}>
        <Animated.View style={[tw`h-3 w-24 rounded bg-slate-700`, { opacity }]} />
      </View>

      {/* Button Skeleton */}
      <View style={tw`items-center mt-5`}>
        <Animated.View style={[tw`h-8 w-40 rounded-full bg-slate-700`, { opacity }]} />
      </View>
    </View>
  );
};

// --- হেল্পার কম্পোনেন্ট ---
const PrayerTimeItem = ({ icon, name, time, isActive = false }: PrayerTimeItemProps) => {
  const color = isActive ? THEME.primary : THEME.textSub;
  return (
    <View style={tw`items-center`}>
      <View style={[
        tw`p-2 rounded-full mb-1`,
        isActive && tw`bg-[${THEME.primary}]/10 border border-[${THEME.primary}]/30`
      ]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[tw`text-[10px] font-bold mt-1`, { color }]}>{name}</Text>
      <Text style={[tw`text-[10px] font-medium`, { color }]}>{time}</Text>
    </View>
  );
};

const ActionButton = ({ icon, name, onPress, iconSet = 'MaterialCommunityIcons' }: ActionButtonProps) => {
  const IconComponent = { Ionicons, MaterialCommunityIcons, FontAwesome }[iconSet];

  return (
    <TouchableOpacity
      style={tw`items-center mr-4`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`w-14 h-14 bg-[${THEME.card}] border border-slate-700 rounded-2xl items-center justify-center shadow-sm`}>
        <IconComponent name={icon as any} size={24} color={THEME.secondary} />
      </View>
      <Text style={tw`text-[${THEME.textSub}] text-[11px] mt-2 font-medium`}>{name}</Text>
    </TouchableOpacity>
  );
};

const CircularProgress = ({ size, strokeWidth, progress }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <View style={tw`justify-center items-center bg-[${THEME.card}/10 rounded-full p-1`}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle stroke={THEME.card} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke={THEME.secondary}
          fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

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

const Index = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState<any>(null);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string; index: number } | null>(null);
  const [ramadanDaysLeft, setRamadanDaysLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('ঢাকা, বাংলাদেশ');
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdviceData, setAiAdviceData] = useState<any>(null);

  const handleSelectMood = async (mood: string) => {
    setMoodModalVisible(false);
    setIsAiLoading(true);
    setAiAdviceData(null);
    setCurrentHadith(null); // Clear previous static hadith

    try {
      const data = await getIslamicAdvice(mood);
      if (data) {
        setAiAdviceData(data);
        setSelectedMood(mood);
      } else {
        fallbackToStaticData(mood);
      }
    } catch (e) {
      fallbackToStaticData(mood);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fallbackToStaticData = (mood: string) => {
    if (!hadiths || hadiths.length === 0) return;
    let filteredHadiths = hadiths.filter((h: any) => h.category === mood);
    if (filteredHadiths.length === 0) filteredHadiths = hadiths;
    const randomIndex = Math.floor(Math.random() * filteredHadiths.length);
    setCurrentHadith(filteredHadiths[randomIndex]);
    setSelectedMood(mood);
  };

  const showAnotherHadith = () => { if (selectedMood) handleSelectMood(selectedMood); };

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

  useEffect(() => {
    if (!prayerData) {
      if (!isLoading) setIsPrayerLogLoading(false);
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
            const title = `🕌 ${prayerNamesBN[prayer as keyof typeof prayerNamesBN]}-এর ওয়াক্ত`;
            const randomBody = getRandomMessage();
            await Notifications.scheduleNotificationAsync({
              content: { title: title, body: randomBody, sound: 'default' },
              trigger: { seconds: secondsUntil },
            });
            scheduledCount++;
          }
        }
        await AsyncStorage.setItem(NOTIFICATION_SCHEDULE_KEY, todayDate);
      } catch (e) { console.error("Failed to schedule notifications", e); }
    };

    loadPrayerLog();
    schedulePrayerNotifications();
  }, [prayerData, isLoading]);

  useEffect(() => {
    if (!isLoading && !isPrayerLogLoading) {
      if (!errorMsg) setMoodModalVisible(true);
    }
  }, [isLoading, isPrayerLogLoading, errorMsg]);

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
      Alert.alert("ত্রুটি", "নামাজের তথ্য লোড না হওয়ায় লগ সেভ করা সম্ভব হচ্ছে না।");
      return;
    }
    const updatedLog = { ...prayerLog, [prayerName]: hasPrayed };
    setPrayerLog(updatedLog);
    setPrayerCheckModalVisible(false);
    try {
      const todayDate = prayerData.date.gregorian.date;
      await AsyncStorage.setItem(PRAYER_LOG_STORAGE_KEY, JSON.stringify({ log: updatedLog, date: todayDate }));
    } catch (e) { console.error("Failed to save prayer log", e); }

    if (!hasPrayed) {
      setIsAiLoading(true);
      const motivation = await getPrayerMissedAdvice(prayerNamesBN[prayerName] || prayerName);
      setIsAiLoading(false);
      Alert.alert("হাল ছাড়বেন না! 💪", motivation, [{ text: "ইনশাআল্লাহ", onPress: () => console.log("User motivated") }]);
    }

    if (prayerName === 'Isha') showEndOfDayReport(updatedLog);
  };

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
          if (prayerLog[prayer as keyof PrayerLogType] !== null) continue;
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

  if (isLoading || isPrayerLogLoading) return <DigitalLoading />;
  if (errorMsg) return (
    <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}] justify-center items-center p-8`}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color={THEME.primary} />
      <Text style={tw`text-[${THEME.textMain}] text-lg text-center mt-4`}>{errorMsg}</Text>
    </SafeAreaView>
  );

  const MoodButton = ({ mood, label, icon }: MoodButtonProps) => (
    <TouchableOpacity onPress={() => handleSelectMood(mood)} style={tw`items-center w-1/3 p-2`}>
      <Text style={tw`text-4xl`}>{icon}</Text>
      <Text style={tw`text-center text-xs text-slate-600 mt-1 font-semibold`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[${THEME.bg}]`}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      <Modal
        animationType="fade" transparent={true} visible={isMoodModalVisible}
        onRequestClose={() => { if (!currentHadith) handleSelectMood('guidance'); setMoodModalVisible(false); }}
      >
        <TouchableOpacity
          style={tw`flex-1 justify-center items-center bg-black/80`}
          activeOpacity={1}
          onPressOut={() => { if (!currentHadith) handleSelectMood('guidance'); setMoodModalVisible(false); }}
        >
          <View style={tw`w-11/12 bg-[${THEME.card}] border border-[${THEME.primary}]/20 rounded-3xl p-6 items-center shadow-2xl`}>
            {/* Modal Header */}
            <MaterialCommunityIcons name="moon-waning-crescent" size={32} color={THEME.primary} style={tw`mb-2 opacity-80`} />
            <Text style={tw`text-xl font-bold text-white mb-1 tracking-wide`}>আসসালামু আলাইকুম</Text>
            <Text style={tw`text-xs text-slate-400 mb-6 text-center leading-5`}>
              আজকের দিনে আপনার মনের অবস্থা কেমন?{"\n"}
              <Text style={tw`text-[${THEME.secondary}]`}>AI আপনাকে প্রাসঙ্গিক পরামর্শ দিবে।</Text>
            </Text>

            {/* Mood Grid */}
            <View style={tw`flex-row flex-wrap justify-between w-full`}>
              <MoodButton mood="hope" label="প্রত্যাশী" icon="😊" />
              <MoodButton mood="patience" label="ধৈর্যহারা" icon="😔" />
              <MoodButton mood="gratitude" label="কৃতজ্ঞ" icon="💖" />
              <MoodButton mood="anxiety" label="উদ্বিগ্ন" icon="😟" />
              <MoodButton mood="forgiveness" label="ক্ষমাপ্রার্থী" icon="🙏" />
              <MoodButton mood="anger" label="রাগান্বিত" icon="😠" />
              <MoodButton mood="kindness" label="দয়ালু" icon="🤗" />
              <MoodButton mood="family" label="পারিবারিক" icon="👨‍👩‍👧‍👦" />
              <MoodButton mood="purpose" label="উদ্দেশ্যহীন" icon="🧭" />
            </View>

            {/* Additional Options Row (Optional/Expansion) */}
            <View style={tw`flex-row flex-wrap justify-center w-full mt-1 border-t border-slate-700/50 pt-4`}>
              <MoodButton mood="friendship" label="বন্ধুত্ব" icon="🤝" />
              <MoodButton mood="honesty" label="সৎ" icon="⚖️" />
              <MoodButton mood="guidance" label="পথনির্দেশ" icon="🤔" />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={isPrayerCheckModalVisible} onRequestClose={() => setPrayerCheckModalVisible(false)}>
        <View style={tw`flex-1 justify-center items-center bg-black/80`}>
          <View style={tw`w-11/12 bg-[${THEME.card}] border border-[${THEME.primary}]/30 rounded-2xl p-6 items-center shadow-lg`}>
            <MaterialCommunityIcons name="mosque" size={40} color={THEME.primary} style={tw`mb-2`} />
            <Text style={tw`text-xl font-bold text-white mb-4 text-center`}>
              আপনি কি {prayerNamesBN[prayerToAsk!] || prayerToAsk}-এর নামাজ কায়েম করেছেন?
            </Text>
            <View style={tw`flex-row justify-around w-full mt-4`}>
              <TouchableOpacity onPress={() => logPrayer(prayerToAsk!, true)} style={tw`bg-emerald-600 rounded-xl py-3 px-10 border border-emerald-400`}>
                <Text style={tw`text-white font-bold text-lg`}>হ্যাঁ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => logPrayer(prayerToAsk!, false)} style={tw`bg-rose-600 rounded-xl py-3 px-10 border border-rose-400`}>
                <Text style={tw`text-white font-bold text-lg`}>না</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={tw`pb-24`}>
        <View style={tw`flex-row justify-between items-center px-5 pt-3`}>
          <View>
            <Text style={tw`text-2xl font-bold text-[${THEME.primary}]`}>﷽</Text>
            <Text style={tw`text-xl font-semibold text-[${THEME.textMain}] mt-1`}>আসসালামু আলাইকুম</Text>
            <Text style={tw`text-xs text-[${THEME.textSub}] flex-row items-center`}>
              <Ionicons name="location-sharp" size={10} color={THEME.secondary} /> {locationName}
            </Text>
          </View>
          <TouchableOpacity style={tw`p-2 bg-[${THEME.card}] rounded-full border border-slate-700`} onPress={() => router.push('/more')}>
            <MaterialCommunityIcons name="menu" size={24} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        <View style={tw`mt-6 mx-5 p-4 bg-[${THEME.card}] rounded-2xl flex-row justify-between items-center border border-slate-800`}>
          <View>
            <Text style={tw`font-bold text-[${THEME.textMain}] text-sm`}>{currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            <Text style={tw`text-xs text-[${THEME.textSub}]`}>{currentTime.toLocaleDateString('bn-BD', { year: 'numeric' })}</Text>
          </View>
          <View style={tw`items-end`}>
            <Text style={tw`font-bold text-[${THEME.primary}] text-sm`}>{prayerData?.date.hijri.day} {prayerData?.date.hijri.month.ar}</Text>
            <Text style={tw`text-xs text-[${THEME.textSub}]`}>{prayerData?.date.hijri.year} হিজরি</Text>
          </View>
        </View>

        <View style={tw`mt-6 mx-5 p-6 bg-[${THEME.card}] rounded-3xl items-center border border-[${THEME.border}] shadow-lg`}>
          {currentPrayerInfo ? (
            <>
              <Text style={tw`text-base font-medium text-[${THEME.textSub}] mb-2`}>বর্তমান_ওয়াক্ত</Text>
              <View style={tw`relative justify-center items-center`}>
                <CircularProgress size={180} strokeWidth={12} progress={prayerProgress} />
                <View style={tw`absolute justify-center items-center`}>
                  <Text style={tw`text-4xl font-bold text-[${THEME.textMain}] tracking-wider`}>{currentPrayerInfo.name}</Text>
                  <Text style={tw`text-[10px] text-[${THEME.textSub}] mt-1 uppercase tracking-widest`}>বাকি সময়</Text>
                  <Text style={tw`text-2xl font-mono text-[${THEME.secondary}] mt-1`}>{currentWaqtTimeRemaining}</Text>
                </View>
              </View>
              <Text style={tw`text-xs text-[${THEME.textSub}] text-center mt-4`}>
                পরবর্তী: <Text style={tw`font-bold text-[${THEME.primary}]`}>{nextPrayerInfo?.name} ({nextPrayerInfo?.time})</Text>
              </Text>
            </>
          ) : (
            <>
              <Text style={tw`text-lg font-semibold text-[${THEME.textSub}]`}>এখন নামাজের ওয়াক্ত নয়</Text>
              <Text style={tw`text-5xl font-bold text-[${THEME.textMain}] my-6`}>{currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={tw`text-sm text-[${THEME.textSub}] mt-1`}>
                শুরু হতে বাকি: <Text style={tw`font-bold text-[${THEME.secondary}]`}>{nextPrayerTimeRemaining}</Text>
              </Text>
            </>
          )}
        </View>

        <View style={tw`mt-6 px-4 py-4 mx-5 bg-[${THEME.card}] rounded-2xl flex-row justify-around items-center border border-slate-800`}>
          <PrayerTimeItem icon="weather-sunset-up" name="ফজর" time={prayerData?.timings.Fajr} isActive={currentPrayerInfo?.name === 'ফজর'} />
          <PrayerTimeItem icon="weather-sunny" name="যোহর" time={prayerData?.timings.Dhuhr} isActive={currentPrayerInfo?.name === 'যোহর'} />
          <PrayerTimeItem icon="weather-hazy" name="আসর" time={prayerData?.timings.Asr} isActive={currentPrayerInfo?.name === 'আসর'} />
          <PrayerTimeItem icon="weather-sunset-down" name="মাগরিব" time={prayerData?.timings.Maghrib} isActive={currentPrayerInfo?.name === 'মাগরিব'} />
          <PrayerTimeItem icon="weather-night" name="ইশা" time={prayerData?.timings.Isha} isActive={currentPrayerInfo?.name === 'ইশা'} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`flex-row items-center px-5 mt-8`}>
          <ActionButton icon="hands-pray" name="নামাজ" onPress={() => router.push('/namaz')} />
          <TouchableOpacity style={tw`items-center mr-4`} onPress={() => router.push('/chat')} activeOpacity={0.7}>
            <View style={tw`w-14 h-14 bg-[${THEME.card}] border border-[${THEME.primary}] rounded-2xl items-center justify-center shadow-md`}>
              <MaterialCommunityIcons name="robot-happy" size={26} color={THEME.primary} />
            </View>
            <Text style={tw`text-[${THEME.primary}] text-[11px] mt-2 font-bold`}>জিজ্ঞাসা</Text>
          </TouchableOpacity>
          <ActionButton icon="book-open-variant" name="দুআ" onPress={() => router.push('/dua')} />

          {/* //kibla */}
          <ActionButton icon="compass" name="কিবলা" onPress={() => router.push('/qibla')} />
          <ActionButton icon="hand-heart" name="যাকাত" onPress={() => router.push('/zakat')} />


          <ActionButton icon="baby-face-outline" name="ইসলামিক নাম" onPress={() => router.push('/screen/BabyNames')} />



        </ScrollView>

        <View style={tw`mt-8 mx-5 p-5 bg-[${THEME.card}] border border-[${THEME.primary}]/20 rounded-2xl min-h-[180px] justify-center shadow-lg relative overflow-hidden`}>
          <View style={tw`absolute top-0 right-0 opacity-10`}>
            <MaterialCommunityIcons name="star-four-points" size={80} color={THEME.primary} />
          </View>

          {isAiLoading ? (
            <HadithSkeleton />
          ) : aiAdviceData ? (
            <View>
              <View style={tw`flex-row justify-between items-center mb-3 pb-2 border-b border-slate-700`}>
                <Text style={tw`text-base font-bold text-[${THEME.primary}]`}>AI পরামর্শ ({selectedMood})</Text>
                <MaterialCommunityIcons name="robot-outline" size={20} color={THEME.secondary} />
              </View>
              <Text style={tw`text-sm text-[${THEME.textMain}] leading-6 mb-3`}>{aiAdviceData.advice}</Text>
              <View style={tw`bg-[#0F172A]/50 p-3 rounded-lg border border-[${THEME.primary}]/20`}>
                <Text style={tw`text-lg text-right font-bold text-[${THEME.primary}] mb-1`}>{aiAdviceData.dua_arabic}</Text>
                <Text style={tw`text-xs text-center text-[${THEME.textSub}] italic`}>{aiAdviceData.dua_meaning}</Text>
                <Text style={tw`text-[10px] text-right text-slate-500 mt-2`}>সূত্র: {aiAdviceData.reference}</Text>
              </View>
              <TouchableOpacity onPress={() => setMoodModalVisible(true)} style={tw`mt-4 self-center bg-[${THEME.primary}]/10 px-4 py-2 rounded-full border border-[${THEME.primary}]/30`}>
                <Text style={tw`text-xs font-bold text-[${THEME.primary}]`}>অন্য অনুভূতি?</Text>
              </TouchableOpacity>
            </View>
          ) : currentHadith ? (
            <>
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-base font-bold text-[${THEME.primary}]`}>আজকের হাদিস</Text>
                <TouchableOpacity onPress={showAnotherHadith} style={tw`p-1 bg-slate-800 rounded-full`}>
                  <MaterialCommunityIcons name="refresh" size={18} color={THEME.textSub} />
                </TouchableOpacity>
              </View>
              <Text style={tw`text-lg text-[${THEME.textMain}] text-right leading-8 mb-3 font-medium`}>{currentHadith.arabic}</Text>
              <Text style={tw`text-sm text-[${THEME.textSub}] leading-6`}>{currentHadith.translation}</Text>
              <Text style={tw`text-xs font-semibold text-[${THEME.primary}] mt-3 opacity-80`}>{currentHadith.reference}</Text>
              <TouchableOpacity onPress={() => setMoodModalVisible(true)} style={tw`mt-4 self-center`}>
                <Text style={tw`text-xs font-bold text-[${THEME.secondary}] uppercase tracking-wide`}>অনুভূতি পরিবর্তন করুন</Text>
              </TouchableOpacity>
            </>
          ) : (
            <HadithSkeleton />
          )}
        </View>
      </ScrollView>

      {ramadanDaysLeft > 0 && (
        <TouchableOpacity style={tw`absolute bottom-0 left-0 right-0 bg-[${THEME.card}] p-3 flex-row justify-center items-center border-t border-[${THEME.primary}]/30 shadow-2xl`}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={16} color={THEME.primary} />
          <Text style={tw`text-[${THEME.textMain}] font-bold text-xs ml-2`}>রমজান আসতে বাকি: <Text style={tw`text-[${THEME.primary}] text-sm`}>{ramadanDaysLeft}</Text> দিন </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Index;