import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage ব্যবহার করার জন্য ইনস্টল করুন
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

// AsyncStorage ইনস্টল করতে:
// npx expo install @react-native-async-storage/async-storage

const { width } = Dimensions.get('window');

interface TasbeehRecord {
    id: string;
    name: string;
    count: number;
    goal: number;
    lastUpdated: string; // YYYY-MM-DD
}

interface DailyLog {
    date: string; // YYYY-MM-DD
    tasbeehs: {
        id: string;
        name: string;
        count: number;
    }[];
}

const TasbeehTrackerScreen = () => {
    // আপনার প্রাইমারি কালার এবং অন্যান্য কালার
    const PRIMARY_DARK_COLOR = '#0F172A';
    const ACCENT_COLOR = '#69D2B7';
    const TEXT_LIGHT = '#F8FAFC';
    const TEXT_MUTED = '#CBD5E1';
    const CARD_BG_COLOR = '#1E293B';
    const BORDER_COLOR = '#334155';
    const SUCCESS_COLOR = '#10B981';
    const WARNING_COLOR = '#F59E0B';

    const [currentTasbeehs, setCurrentTasbeehs] = useState<TasbeehRecord[]>([]);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newTasbeehName, setNewTasbeehName] = useState('');
    const [newTasbeehGoal, setNewTasbeehGoal] = useState('100'); // Default goal

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    useEffect(() => {
        loadTasbeehData();
    }, []);

    const loadTasbeehData = async () => {
        try {
            const storedTasbeehs = await AsyncStorage.getItem('tasbeehRecords');
            const storedDailyLog = await AsyncStorage.getItem('dailyTasbeehLog');

            let initialTasbeehs: TasbeehRecord[] = storedTasbeehs ? JSON.parse(storedTasbeehs) : [
                { id: 'subhanallah', name: 'সুবহানাল্লাহ', count: 0, goal: 33, lastUpdated: '' },
                { id: 'alhamdulillah', name: 'আলহামদুলিল্লাহ', count: 0, goal: 33, lastUpdated: '' },
                { id: 'allahuakbar', name: 'আল্লাহু আকবার', count: 0, goal: 34, lastUpdated: '' },
                { id: 'istighfar', name: 'আস্তাগফিরুল্লাহ', count: 0, goal: 100, lastUpdated: '' },
            ];

            // Reset counts if it's a new day
            initialTasbeehs = initialTasbeehs.map(t => ({
                ...t,
                count: t.lastUpdated === today ? t.count : 0, // Reset if not today
                lastUpdated: t.lastUpdated === today ? t.lastUpdated : today,
            }));

            setCurrentTasbeehs(initialTasbeehs);

            const parsedDailyLog: DailyLog = storedDailyLog ? JSON.parse(storedDailyLog) : { date: today, tasbeehs: [] };
            if (parsedDailyLog.date !== today) {
                setDailyLog({ date: today, tasbeehs: [] });
            } else {
                setDailyLog(parsedDailyLog);
            }

        } catch (error) {
            console.error('Error loading tasbeeh data:', error);
        }
    };

    const saveTasbeehData = async (tasbeehs: TasbeehRecord[], log: DailyLog | null) => {
        try {
            await AsyncStorage.setItem('tasbeehRecords', JSON.stringify(tasbeehs));
            if (log) {
                await AsyncStorage.setItem('dailyTasbeehLog', JSON.stringify(log));
            }
        } catch (error) {
            console.error('Error saving tasbeeh data:', error);
        }
    };

    const incrementTasbeeh = (tasbeehId: string) => {
        setCurrentTasbeehs(prevTasbeehs => {
            const updatedTasbeehs = prevTasbeehs.map(t => {
                if (t.id === tasbeehId) {
                    const newCount = t.count + 1;
                    const newLastUpdated = today;
                    return { ...t, count: newCount, lastUpdated: newLastUpdated };
                }
                return t;
            });
            saveTasbeehData(updatedTasbeehs, dailyLog); // Save immediately
            return updatedTasbeehs;
        });
    };

    const resetTasbeehCount = (tasbeehId: string) => {
        setCurrentTasbeehs(prevTasbeehs => {
            const updatedTasbeehs = prevTasbeehs.map(t => {
                if (t.id === tasbeehId) {
                    // Add current count to daily log before resetting
                    const existingLogEntry = dailyLog?.tasbeehs.find(log => log.id === tasbeehId);
                    if (existingLogEntry) {
                        existingLogEntry.count += t.count;
                    } else {
                        dailyLog?.tasbeehs.push({ id: t.id, name: t.name, count: t.count });
                    }
                    return { ...t, count: 0, lastUpdated: today };
                }
                return t;
            });
            saveTasbeehData(updatedTasbeehs, dailyLog); // Save immediately
            return updatedTasbeehs;
        });
    };

    const addCustomTasbeeh = () => {
        if (newTasbeehName.trim() === '') {
            Alert.alert('অপূর্ণ তথ্য', 'দয়া করে তাসবীহের নামটি লিখুন।');
            return;
        }
        const goalNum = parseInt(newTasbeehGoal);
        if (isNaN(goalNum) || goalNum <= 0) {
            Alert.alert('অপূর্ণ তথ্য', 'দয়া করে একটি সঠিক লক্ষ্য সংখ্যা দিন।');
            return;
        }

        const newTasbeeh: TasbeehRecord = {
            id: newTasbeehName.toLowerCase().replace(/\s/g, ''), // Simple ID generation
            name: newTasbeehName,
            count: 0,
            goal: goalNum,
            lastUpdated: today,
        };
        const updatedTasbeehs = [...currentTasbeehs, newTasbeeh];
        setCurrentTasbeehs(updatedTasbeehs);
        saveTasbeehData(updatedTasbeehs, dailyLog);
        setNewTasbeehName('');
        setNewTasbeehGoal('100');
        setModalVisible(false);
    };

    const getOverallProgress = () => {
        if (currentTasbeehs.length === 0) return 0;
        const totalCount = currentTasbeehs.reduce((sum, t) => sum + t.count, 0);
        const totalGoal = currentTasbeehs.reduce((sum, t) => sum + t.goal, 0);
        return (totalCount / totalGoal) * 100;
    };

    const renderTasbeehCard = (tasbeeh: TasbeehRecord) => {
        const progress = (tasbeeh.count / tasbeeh.goal) * 100;
        const isGoalMet = tasbeeh.count >= tasbeeh.goal;

        return (
            <View style={tw`bg-[${CARD_BG_COLOR}] rounded-xl p-4 mb-4 shadow-md border border-[${BORDER_COLOR}]`}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                    <Text style={tw`text-lg font-bold text-[${TEXT_LIGHT}]`}>{tasbeeh.name}</Text>
                    <TouchableOpacity onPress={() => resetTasbeehCount(tasbeeh.id)} style={tw`p-1 rounded-full bg-[${BORDER_COLOR}]`}>
                        <AntDesign name="reload1" size={16} color={TEXT_MUTED} />
                    </TouchableOpacity>
                </View>

                <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-sm text-[${TEXT_MUTED}]`}>লক্ষ্য: {tasbeeh.goal}</Text>
                    <Text style={tw`text-lg font-bold ${isGoalMet ? `text-[${SUCCESS_COLOR}]` : `text-[${ACCENT_COLOR}]`}`}>
                        {tasbeeh.count}
                    </Text>
                </View>

                {/* Progress Bar */}
                <View style={tw`w-full bg-[${BORDER_COLOR}] rounded-full h-2`}>
                    <View style={[tw`h-2 rounded-full`, { width: `${Math.min(100, progress)}%`, backgroundColor: isGoalMet ? SUCCESS_COLOR : ACCENT_COLOR }]} />
                </View>
                {isGoalMet && (
                    <Text style={tw`text-[${SUCCESS_COLOR}] text-xs text-center mt-2 font-semibold`}>আজকের লক্ষ্য পূরণ হয়েছে!</Text>
                )}

                <TouchableOpacity
                    onPress={() => incrementTasbeeh(tasbeeh.id)}
                    style={tw`mt-4 py-3 bg-[${ACCENT_COLOR}] rounded-lg items-center justify-center`}
                >
                    <Text style={tw`text-lg font-bold text-[${PRIMARY_DARK_COLOR}]`}>+1 জিকির করুন</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={tw`flex-1 bg-[${PRIMARY_DARK_COLOR}]`}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DARK_COLOR} />

            {/* Header */}
            <View style={tw`pt-16 pb-6 px-6 bg-[${CARD_BG_COLOR}] rounded-b-3xl shadow-lg`}>
                <Text style={tw`text-3xl font-bold text-center text-[${TEXT_LIGHT}]`}>
                    আমার তাসবীহ ট্র্যাকার
                </Text>
                <Text style={tw`text-center text-[${TEXT_MUTED}] text-base mt-2`}>
                    আজকের জিকিরের রেকর্ড রাখুন
                </Text>
            </View>

            <ScrollView contentContainerStyle={tw`py-6 px-5`} showsVerticalScrollIndicator={false}>

                {/* Overall Progress Card */}
                <View style={tw`bg-[${CARD_BG_COLOR}] rounded-xl p-5 mb-5 shadow-md border border-[${BORDER_COLOR}] flex-row items-center justify-between`}>
                    <View>
                        <Text style={tw`text-xl font-bold text-[${TEXT_LIGHT}]`}>
                            আজকের সামগ্রিক অগ্রগতি
                        </Text>
                        <Text style={tw`text-2xl font-bold text-[${ACCENT_COLOR}] mt-2`}>
                            {getOverallProgress().toFixed(0)}%
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="trophy-outline" size={50} color={ACCENT_COLOR} />
                </View>

                {/* List of Tasbeehs */}
                {currentTasbeehs.map(tasbeeh => renderTasbeehCard(tasbeeh))}

                {/* Add Custom Tasbeeh Button */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={tw`flex-row items-center justify-center bg-[${CARD_BG_COLOR}] rounded-xl p-4 mb-5 shadow-md border border-[${BORDER_COLOR}]`}
                >
                    <AntDesign name="pluscircleo" size={24} color={ACCENT_COLOR} style={tw`mr-3`} />
                    <Text style={tw`text-lg font-bold text-[${ACCENT_COLOR}]`}>
                        নতুন তাসবীহ যোগ করুন
                    </Text>
                </TouchableOpacity>

                {/* --- Daily Log/History Section (Simplified for this example) --- */}
                <View style={tw`bg-[${CARD_BG_COLOR}] rounded-xl p-5 mb-5 shadow-md border border-[${BORDER_COLOR}]`}>
                    <Text style={tw`text-xl font-bold text-[${TEXT_LIGHT}] mb-3`}>আজকের জিকিরের সারাংশ</Text>
                    {dailyLog && dailyLog.tasbeehs.length > 0 ? (
                        dailyLog.tasbeehs.map((item, index) => (
                            <View key={index} style={tw`flex-row justify-between py-1 border-b border-[${BORDER_COLOR}] last:border-b-0`}>
                                <Text style={tw`text-[${TEXT_MUTED}] text-base`}>{item.name}</Text>
                                <Text style={tw`text-[${TEXT_LIGHT}] text-base font-semibold`}>{item.count} বার</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={tw`text-[${TEXT_MUTED}] text-base`}>আজ কোনো তাসবীহ রেকর্ড হয়নি।</Text>
                    )}
                    <Text style={tw`text-[${TEXT_MUTED}] text-xs mt-3 text-right`}>শেষ আপডেট: {dailyLog?.date || 'N/A'}</Text>
                </View>


            </ScrollView>

            {/* Add Custom Tasbeeh Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: CARD_BG_COLOR, borderColor: BORDER_COLOR }]}>
                        <Text style={tw`text-2xl font-bold text-[${TEXT_LIGHT}] mb-4`}>নতুন তাসবীহ</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: PRIMARY_DARK_COLOR, borderColor: BORDER_COLOR, color: TEXT_LIGHT }]}
                            placeholder="তাসবীহের নাম (যেমন: দরূদ শরীফ)"
                            placeholderTextColor={TEXT_MUTED}
                            value={newTasbeehName}
                            onChangeText={setNewTasbeehName}
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: PRIMARY_DARK_COLOR, borderColor: BORDER_COLOR, color: TEXT_LIGHT, marginTop: 10 }]}
                            placeholder="লক্ষ্য সংখ্যা (যেমন: ১০০)"
                            placeholderTextColor={TEXT_MUTED}
                            keyboardType="numeric"
                            value={newTasbeehGoal}
                            onChangeText={setNewTasbeehGoal}
                        />
                        <TouchableOpacity
                            onPress={addCustomTasbeeh}
                            style={tw`mt-5 py-3 w-full bg-[${ACCENT_COLOR}] rounded-lg items-center`}
                        >
                            <Text style={tw`text-lg font-bold text-[${PRIMARY_DARK_COLOR}]`}>যোগ করুন</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={tw`mt-3 py-3 w-full border border-[${TEXT_MUTED}] rounded-lg items-center`}
                        >
                            <Text style={tw`text-lg font-bold text-[${TEXT_MUTED}]`}>বাতিল</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent background
    },
    modalView: {
        width: '90%',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
    },
    input: {
        width: '100%',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
});

export default TasbeehTrackerScreen;