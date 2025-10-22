import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Feather, Ionicons যোগ করা হয়েছে
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'; // <-- Audio ইম্পোর্ট
import * as Clipboard from 'expo-clipboard'; // <-- Clipboard ইম্পোর্ট
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, // <-- Share API (React Native built-in)
    Alert,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView, // অডিও লোডিং এর জন্য
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import tw from 'twrnc';
// import * as Sharing from 'expo-sharing'; // <-- Sharing ইম্পোর্ট করা যেতে পারে, তবে RN Share API যথেষ্ট
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- AsyncStorage for Bookmarks
import * as Haptics from 'expo-haptics'; // <-- Haptics ইম্পোর্ট

// JSON ফাইল ইম্পোর্ট
import allDuaData from '../../assets/duas_surahs.json';

// কালার প্যালেট (অপরিবর্তিত, তবে কিছু নতুন যোগ করা যেতে পারে)
const PRIMARY_DARK_COLOR = '#0F172A';
const ACCENT_COLOR = '#69D2B7';
const ACCENT_COLOR_DARKER = '#047857'; // Play button active color
const TEXT_LIGHT = '#F8FAFC';
const TEXT_MUTED = '#CBD5E1';
const TEXT_DARK = '#334155'; // Icon button color inactive
const CARD_BG_COLOR = '#1E293B';
const BORDER_COLOR = '#334155';
const SEARCH_BG_COLOR = '#334155';
const MODAL_BG_COLOR = 'rgba(15, 23, 42, 0.98)'; // Slightly less transparent
const BOOKMARK_COLOR = '#F59E0B'; // Yellow/Orange for bookmarks

// --- ইন্টারফেস (অডিও, বেনিফিট সহ আপডেট) ---
interface BaseItem {
    id: string;
    type: 'dua' | 'salat_dua' | 'surah' | 'special_verse';
    title_bn?: string;
    arabic: string | string[];
    banglaPronunciation: string | string[];
    banglaMeaning: string | string[];
    source: string;
    audioUrl?: string; // <-- অডিও URL (Optional)
    benefits_bn?: string; // <-- ফযিলত (Optional)
}
// Other interfaces (DuaItem, SurahItem etc.) remain the same
interface DuaItem extends BaseItem { type: 'dua' | 'salat_dua'; }
interface SurahItem extends BaseItem { type: 'surah'; }
interface SpecialVerseItem extends BaseItem { type: 'special_verse'; }
type AnyItem = DuaItem | SurahItem | SpecialVerseItem;
interface Category { title: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; items: AnyItem[]; }
interface Section { sectionTitle: string; categories: Category[]; }

// ডেটা টাইপ নিশ্চিত করা
const allData: Section[] = allDuaData as Section[];
const BOOKMARKS_STORAGE_KEY = '@MyIslamicApp:DuaBookmarks';

// --- মূল কম্পোনেন্ট ---
const DuaScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<AnyItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // --- নতুন স্টেট ---
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1); // ফন্ট সাইজের জন্য
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set()); // বুকমার্ক আইডি সেট
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false); // শুধু বুকমার্ক দেখানোর ফিল্টার

    // অডিও স্টেট
    const soundObject = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false); // অডিও লোডিং ইন্ডিকেটর

    // --- অডিও সেশন কনফিগার ---
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // Deprecated
            // playsInSilentModeIOS: true, // Deprecated
            // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, // Deprecated
            // shouldDuckAndroid: true, // Deprecated
            staysActiveInBackground: false, // ব্যাকগ্রাউন্ডে প্লে হবে না (সাধারণত দরকার হয় না)
            playThroughEarpieceAndroid: false,
            // New API replacements:
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            shouldDuckAndroid: true,

        });

        // কম্পোনেন্ট আনমাউন্ট হলে অডিও আনলোড করুন
        return () => {
            soundObject.current?.unloadAsync();
        };
    }, []);

    // --- বুকমার্ক লোড ---
    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const storedBookmarks = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
                if (storedBookmarks) {
                    setBookmarkedIds(new Set(JSON.parse(storedBookmarks)));
                }
            } catch (e) {
                console.error("Failed to load bookmarks", e);
            }
        };
        loadBookmarks();
    }, []);

    // --- বুকমার্ক সেভ ---
    const saveBookmarks = async (newBookmarks: Set<string>) => {
        try {
            await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(newBookmarks)));
        } catch (e) {
            console.error("Failed to save bookmarks", e);
        }
    };

    // --- বুকমার্ক টগল ---
    const toggleBookmark = (itemId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // ফিডব্যাক
        const newBookmarks = new Set(bookmarkedIds);
        if (newBookmarks.has(itemId)) {
            newBookmarks.delete(itemId);
        } else {
            newBookmarks.add(itemId);
        }
        setBookmarkedIds(newBookmarks);
        saveBookmarks(newBookmarks); // AsyncStorage-তে সেভ করুন
    };

    // --- সার্চ ফিল্টারিং (বুকমার্ক ফিল্টার সহ আপডেট) ---
    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        let results: AnyItem[] = [];

        if (showBookmarksOnly) {
            // শুধু বুকমার্ক করা আইটেম থেকে সার্চ করুন বা সব বুকমার্ক দেখান
            allData.forEach(section => {
                section.categories.forEach(category => {
                    category.items.forEach(item => {
                        if (bookmarkedIds.has(item.id)) {
                            // যদি সার্চ কোয়েরি থাকে, তবে ম্যাচিং চেক করুন
                            if (query) {
                                const titleMatch = item.title_bn?.toLowerCase().includes(query);
                                const arabicString = Array.isArray(item.arabic) ? item.arabic.join(' ') : item.arabic;
                                const arabicMatch = arabicString.toLowerCase().includes(query);
                                const pronunString = Array.isArray(item.banglaPronunciation) ? item.banglaPronunciation.join(' ') : item.banglaPronunciation;
                                const pronunMatch = pronunString.toLowerCase().includes(query);
                                const meaningString = Array.isArray(item.banglaMeaning) ? item.banglaMeaning.join(' ') : item.banglaMeaning;
                                const meaningMatch = meaningString.toLowerCase().includes(query);
                                if (titleMatch || arabicMatch || pronunMatch || meaningMatch) {
                                    results.push(item);
                                }
                            } else {
                                // সার্চ কোয়েরি না থাকলে সব বুকমার্ক যোগ করুন
                                results.push(item);
                            }
                        }
                    });
                });
            });
        } else if (query) {
            // স্বাভাবিক সার্চ
            allData.forEach(section => { /* ... আগের সার্চ লজিক ... */
                section.categories.forEach(category => {
                    category.items.forEach(item => {
                        const titleMatch = item.title_bn?.toLowerCase().includes(query);
                        const arabicString = Array.isArray(item.arabic) ? item.arabic.join(' ') : item.arabic;
                        const arabicMatch = arabicString.toLowerCase().includes(query);
                        const pronunString = Array.isArray(item.banglaPronunciation) ? item.banglaPronunciation.join(' ') : item.banglaPronunciation;
                        const pronunMatch = pronunString.toLowerCase().includes(query);
                        const meaningString = Array.isArray(item.banglaMeaning) ? item.banglaMeaning.join(' ') : item.banglaMeaning;
                        const meaningMatch = meaningString.toLowerCase().includes(query);

                        if (titleMatch || arabicMatch || pronunMatch || meaningMatch) {
                            results.push(item);
                        }
                    });
                });
            });
        }

        setIsSearching(query.length > 0 || showBookmarksOnly); // সার্চ চলছে যদি কোয়েরি থাকে অথবা বুকমার্ক ফিল্টার চালু থাকে
        setFilteredItems(results);

    }, [searchQuery, bookmarkedIds, showBookmarksOnly]); // <-- ডিপেন্ডেন্সি আপডেট


    const toggleCategory = (title: string) => { /* ... unchanged ... */ };
    const handleCategoryPress = (category: Category) => {
        setSelectedCategory(category); // Sets which category's data to show in the modal
        setModalVisible(true);         // Sets the state to make the modal visible
    };

    // --- অডিও প্লে/পজ ফাংশন ---
    const playPauseAudio = async (item: AnyItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!item.audioUrl) return;

        // যদি অন্য কোনো অডিও চলছিল, সেটা বন্ধ করুন
        if (soundObject.current && currentPlayingId !== item.id) {
            await soundObject.current.stopAsync();
            await soundObject.current.unloadAsync();
            soundObject.current = null;
            setIsPlaying(false);
            setCurrentPlayingId(null);
        }

        // যদি এই অডিওটিই চলছিল, তবে পজ/রিজিউম করুন
        if (soundObject.current && currentPlayingId === item.id) {
            if (isPlaying) {
                await soundObject.current.pauseAsync();
                setIsPlaying(false);
            } else {
                await soundObject.current.playAsync();
                setIsPlaying(true);
            }
        }
        // যদি নতুন অডিও হয় বা কোনো অডিও না চলে
        else {
            setIsAudioLoading(true); // লোডিং শুরু
            setCurrentPlayingId(item.id); // লোডিং এর শুরুতেই আইডি সেট করুন
            try {
                if (soundObject.current) { // Ensure cleanup if somehow exists
                    await soundObject.current.unloadAsync();
                }
                const { sound } = await Audio.Sound.createAsync(
                    { uri: item.audioUrl },
                    { shouldPlay: true } // লোড হওয়ার সাথে সাথে প্লে হবে
                );
                soundObject.current = sound;
                setIsPlaying(true);

                // প্লেব্যাক শেষ হলে স্টেট রিসেট
                soundObject.current.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                        setCurrentPlayingId(null);
                        soundObject.current?.unloadAsync(); // আনলোড করুন
                        soundObject.current = null;
                    } else if (status.isLoaded === false && soundObject.current) {
                        // Handle unload case if triggered externally
                        setIsPlaying(false);
                        setCurrentPlayingId(null);
                        soundObject.current = null;
                    }
                });

            } catch (error) {
                console.error('Error playing audio:', error);
                Alert.alert("ত্রুটি", "অডিও চালাতে সমস্যা হচ্ছে।");
                setCurrentPlayingId(null); // ত্রুটি হলে আইডি রিসেট
                setIsPlaying(false);
            } finally {
                setIsAudioLoading(false); // লোডিং শেষ
            }
        }
    };


    // --- কপি ফাংশন ---
    const copyToClipboard = (item: AnyItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const arabicText = Array.isArray(item.arabic) ? item.arabic.join('\n') : item.arabic;
        const pronunText = Array.isArray(item.banglaPronunciation) ? item.banglaPronunciation.join('\n') : item.banglaPronunciation;
        const meaningText = Array.isArray(item.banglaMeaning) ? item.banglaMeaning.join('\n') : item.banglaMeaning;
        const textToCopy = `${item.title_bn ? item.title_bn + '\n\n' : ''}${arabicText}\n\nউচ্চারণ:\n${pronunText}\n\nঅর্থ:\n${meaningText}\n\nসূত্র: ${item.source}`;
        Clipboard.setStringAsync(textToCopy);
        Alert.alert("কপি হয়েছে", "দুআ/সূরা ক্লিপবোর্ডে কপি করা হয়েছে।"); // অথবা টোস্ট মেসেজ
    };

    // --- শেয়ার ফাংশন ---
    const shareItem = async (item: AnyItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const arabicText = Array.isArray(item.arabic) ? item.arabic.join('\n') : item.arabic;
            const pronunText = Array.isArray(item.banglaPronunciation) ? item.banglaPronunciation.join('\n') : item.banglaPronunciation;
            const meaningText = Array.isArray(item.banglaMeaning) ? item.banglaMeaning.join('\n') : item.banglaMeaning;
            const message = `${item.title_bn ? item.title_bn + '\n\n' : ''}${arabicText}\n\nউচ্চারণ:\n${pronunText}\n\nঅর্থ:\n${meaningText}\n\nসূত্র: ${item.source}\n\n(DeenerPothe শেয়ার করা হয়েছে)`; // <-- আপনার অ্যাপের নাম যোগ করুন

            await Share.share({
                message: message,
                title: item.title_bn || 'গুরুত্বপূর্ণ দুআ/সূরা' // শেয়ার ডায়ালগের টাইটেল (iOS)
            });
        } catch (error: any) {
            Alert.alert("ত্রুটি", "শেয়ার করতে সমস্যা হয়েছে: " + error.message);
        }
    };


    // --- আইটেম রেন্ডার করার ফাংশন (আপডেটেড: বাটন সহ) ---
    const renderItemCard = ({ item }: { item: AnyItem }) => {
        const arabicText = Array.isArray(item.arabic) ? item.arabic.join('\n') : item.arabic;
        const pronunText = Array.isArray(item.banglaPronunciation) ? item.banglaPronunciation.join('\n') : item.banglaPronunciation;
        const meaningText = Array.isArray(item.banglaMeaning) ? item.banglaMeaning.join('\n') : item.banglaMeaning;
        const isBookmarked = bookmarkedIds.has(item.id);
        const isCurrentlyPlaying = currentPlayingId === item.id && isPlaying;
        const isCurrentlyLoading = currentPlayingId === item.id && isAudioLoading;

        return (
            <View style={styles.itemCard}>
                {item.title_bn && <Text style={[styles.itemTitle, { fontSize: 16 * fontSizeMultiplier }]}>{item.title_bn}</Text>}
                <Text style={[styles.itemArabic, { fontSize: 24 * fontSizeMultiplier, lineHeight: 40 * fontSizeMultiplier }]}>{arabicText}</Text>
                <Text style={[styles.itemPronunciation, { fontSize: 15 * fontSizeMultiplier, lineHeight: 22 * fontSizeMultiplier }]}>
                    <Text style={styles.itemLabel}>উচ্চারণ:</Text> {pronunText}
                </Text>
                <Text style={[styles.itemMeaning, { fontSize: 15 * fontSizeMultiplier, lineHeight: 22 * fontSizeMultiplier }]}>
                    <Text style={styles.itemLabel}>অর্থ:</Text> {meaningText}
                </Text>
                {item.benefits_bn && (
                    <Text style={[styles.itemBenefits, { fontSize: 14 * fontSizeMultiplier, lineHeight: 20 * fontSizeMultiplier }]}>
                        <Text style={styles.itemLabel}>ফযিলত:</Text> {item.benefits_bn}
                    </Text>
                )}
                <Text style={[styles.itemSource, { fontSize: 12 * fontSizeMultiplier }]}>সূত্র: {item.source}</Text>

                {/* --- Action Buttons --- */}
                <View style={styles.itemActionsContainer}>
                    {/* Play/Pause Button */}
                    {item.audioUrl && (
                        <TouchableOpacity onPress={() => playPauseAudio(item)} style={styles.iconButton} disabled={isCurrentlyLoading}>
                            {isCurrentlyLoading ? (
                                <ActivityIndicator size="small" color={ACCENT_COLOR} />
                            ) : (
                                <Ionicons name={isCurrentlyPlaying ? "pause-circle" : "play-circle"} size={28} color={isCurrentlyPlaying ? ACCENT_COLOR_DARKER : ACCENT_COLOR} />
                            )}
                        </TouchableOpacity>
                    )}
                    {/* Spacer if no audio */}
                    {!item.audioUrl && <View style={styles.iconButtonPlaceholder} />}

                    {/* Bookmark Button */}
                    <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.iconButton}>
                        <MaterialCommunityIcons name={isBookmarked ? "heart" : "heart-outline"} size={26} color={isBookmarked ? BOOKMARK_COLOR : TEXT_DARK} />
                    </TouchableOpacity>

                    {/* Copy Button */}
                    <TouchableOpacity onPress={() => copyToClipboard(item)} style={styles.iconButton}>
                        <Feather name="copy" size={24} color={TEXT_DARK} />
                    </TouchableOpacity>

                    {/* Share Button */}
                    <TouchableOpacity onPress={() => shareItem(item)} style={styles.iconButton}>
                        <Feather name="share-2" size={24} color={TEXT_DARK} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // --- ক্যাটাগরি কার্ড রেন্ডার (অপরিবর্তিত) ---
    const renderCategoryCard = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => {
                console.log('Card Tapped:', item.title); // <-- Add this log
                handleCategoryPress(item);
            }}
            activeOpacity={0.8}
        >
            <MaterialCommunityIcons name={item.icon} size={36} color={ACCENT_COLOR} style={styles.categoryIcon} />
            <Text style={styles.categoryCardTitle}>{item.title}</Text>
        </TouchableOpacity>
    );


    // --- ফন্ট সাইজ পরিবর্তন ---
    const adjustFontSize = (direction: 'increase' | 'decrease') => {
        Haptics.selectionAsync();
        const step = 0.1;
        const min = 0.8;
        const max = 1.5;
        if (direction === 'increase' && fontSizeMultiplier < max) {
            setFontSizeMultiplier(prev => Math.min(prev + step, max));
        } else if (direction === 'decrease' && fontSizeMultiplier > min) {
            setFontSizeMultiplier(prev => Math.max(prev - step, min));
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DARK_COLOR} />

            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>দুআ ও সূরা সমূহ</Text>
                {/* Search Bar & Filters */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <AntDesign name="search1" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="খুঁজুন..."
                            placeholderTextColor={TEXT_MUTED}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 5 }}>
                                <AntDesign name="closecircle" size={18} color={TEXT_MUTED} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Bookmark Filter Button */}
                    <TouchableOpacity
                        style={[styles.filterButton, showBookmarksOnly && styles.filterButtonActive]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setShowBookmarksOnly(!showBookmarksOnly);
                        }}
                    >
                        <MaterialCommunityIcons name={showBookmarksOnly ? "heart" : "heart-outline"} size={22} color={showBookmarksOnly ? PRIMARY_DARK_COLOR : BOOKMARK_COLOR} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- কন্টেন্ট এরিয়া --- */}
            {isSearching ? (
                // --- Search Results ---
                <FlatList
                    data={filteredItems}
                    renderItem={renderItemCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.searchResultContainer}
                    ListEmptyComponent={<Text style={styles.noResultsText}>{showBookmarksOnly ? "কোনো বুকমার্ক পাওয়া যায়নি।" : `"${searchQuery}" এর জন্য কিছু খুঁজে পাওয়া যায়নি।`}</Text>}
                />
            ) : (
                // --- Category Grid ---
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {allData.map((section, sectionIndex) => (
                        <View key={`section-${sectionIndex}`} style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>{section.sectionTitle}</Text>
                            <FlatList
                                data={section.categories}
                                renderItem={renderCategoryCard}
                                keyExtractor={(category) => category.title}
                                numColumns={2}
                                columnWrapperStyle={styles.categoryRow}
                                scrollEnabled={false}
                            />
                        </View>
                    ))}
                    <View style={tw`h-10`}></View>
                </ScrollView>
            )}

            {/* --- ক্যাটাগরি মোডাল --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)} // Reset category handled in onDismiss maybe? Check RN docs. Best to reset on close press.
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{selectedCategory?.title}</Text>
                        {/* Font Size Controls */}
                        <View style={styles.fontSizeControls}>
                            <TouchableOpacity onPress={() => adjustFontSize('decrease')} style={styles.fontSizeButton}>
                                <Text style={styles.fontSizeButtonText}>A-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => adjustFontSize('increase')} style={styles.fontSizeButton}>
                                <Text style={styles.fontSizeButtonText}>A+</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <AntDesign name="close" size={24} color={TEXT_MUTED} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={selectedCategory?.items || []}
                        renderItem={renderItemCard} // Pass font size multiplier? No, renderItemCard reads state.
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.modalListContent}
                    />
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
};

// --- স্টাইলশীট (আপডেটেড) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: PRIMARY_DARK_COLOR },
    header: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 20, paddingHorizontal: 15, backgroundColor: CARD_BG_COLOR,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: TEXT_LIGHT, textAlign: 'center', marginBottom: 15 },
    searchRow: { flexDirection: 'row', alignItems: 'center' }, // New container for search + filter
    searchContainer: {
        flex: 1, // Take available space
        flexDirection: 'row', alignItems: 'center', backgroundColor: SEARCH_BG_COLOR,
        borderRadius: 10, paddingHorizontal: 10, height: 45, marginRight: 10, // Add margin
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: TEXT_LIGHT, fontSize: 16 },
    filterButton: {
        padding: 10,
        backgroundColor: CARD_BG_COLOR,
        borderRadius: 10,
        borderColor: BOOKMARK_COLOR,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 45, width: 45, // Make it square
    },
    filterButtonActive: {
        backgroundColor: BOOKMARK_COLOR, // Change background when active
    },
    scrollContainer: { paddingVertical: 20, paddingHorizontal: 10 },
    sectionContainer: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: ACCENT_COLOR, marginBottom: 15, marginLeft: 10 },
    categoryRow: { justifyContent: 'space-between', paddingHorizontal: 5 }, // Add padding for space between cards
    categoryCard: {
        backgroundColor: CARD_BG_COLOR, borderRadius: 12, padding: 15, // Reduced padding slightly
        marginBottom: 15, alignItems: 'center', justifyContent: 'center',
        width: '48%', height: 130, // Adjusted height
        borderColor: BORDER_COLOR, borderWidth: 1,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    categoryIcon: { marginBottom: 8 },
    categoryCardTitle: { fontSize: 15, fontWeight: 'bold', color: TEXT_LIGHT, textAlign: 'center' },
    searchResultContainer: { paddingVertical: 10, paddingHorizontal: 15 },
    noResultsText: { textAlign: 'center', color: TEXT_MUTED, fontSize: 16, marginTop: 50, paddingHorizontal: 20 },
    itemCard: {
        marginBottom: 15, padding: 15, borderRadius: 8,
        backgroundColor: CARD_BG_COLOR, // Darker than modal background
        borderColor: BORDER_COLOR, borderWidth: 1,
    },
    itemTitle: { fontWeight: 'bold', color: ACCENT_COLOR, marginBottom: 12 },
    itemArabic: { color: TEXT_LIGHT, textAlign: 'right', marginBottom: 12 },
    itemPronunciation: { color: TEXT_MUTED, marginBottom: 8, fontStyle: 'italic' },
    itemMeaning: { color: TEXT_MUTED, marginBottom: 10 },
    itemBenefits: { color: TEXT_MUTED, marginTop: 5, marginBottom: 10, fontStyle: 'italic', fontSize: 14 }, // Style for benefits
    itemLabel: { fontWeight: '600', color: ACCENT_COLOR },
    itemSource: { fontStyle: 'italic', color: TEXT_MUTED, textAlign: 'right', marginTop: 8 },
    itemActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distribute buttons evenly
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: BORDER_COLOR,
    },
    iconButton: {
        padding: 8, // Increase touch area
        flex: 1, // Make buttons take equal space
        alignItems: 'center', // Center icon within button
    },
    iconButtonPlaceholder: { // To maintain layout when audio is absent
        flex: 1,
    },
    modalContainer: { flex: 1, backgroundColor: MODAL_BG_COLOR, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 15, paddingVertical: 10, // Adjusted padding
        borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_LIGHT, flexShrink: 1, marginRight: 5 }, // Allow shrinking
    closeButton: { padding: 8 },
    modalListContent: { padding: 15 },
    // Font Size Controls Styles
    fontSizeControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10, // Space from title and close button
    },
    fontSizeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        backgroundColor: SEARCH_BG_COLOR,
        borderRadius: 5,
    },
    fontSizeButtonText: {
        color: TEXT_LIGHT,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DuaScreen;