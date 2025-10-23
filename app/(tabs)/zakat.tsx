

import { FontAwesome5 } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import tw from 'twrnc';

const BG_COLOR = '#0F172A';
const CARD_COLOR = '#1E293B';
const ACCENT_COLOR = '#66D2E8';
const TEXT_PRIMARY = '#F1F5F9';
const TEXT_SECONDARY = '#94A3B8';
const TEXT_INVERSE = '#0A191E';
const DANGER_COLOR = '#F87171';
const SUCCESS_COLOR = '#34D399';
const PRIMARY_DARK_COLOR = '#0E4A5B';
const BORDER_COLOR = '#334155';

interface InputFieldProps {
    label: string;
    value: string;
    setter: (value: string) => void;
    placeholder: string;
}

interface CalculationDetails {
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
}

interface AssetField {
    label: string;
    value: string;
    setter: (value: string) => void;
}

// --- হেল্পার কম্পোনেন্ট: InputField (শুধুমাত্র একবার ডিফাইন করা) ---
const InputField: React.FC<InputFieldProps> = ({ label, value, setter, placeholder }) => {
    // Define colors locally or pass them as props if needed elsewhere
    const TEXT_PRIMARY_INPUT = '#F1F5F9';
    const TEXT_SECONDARY_INPUT = '#94A3B8';
    const BG_COLOR_INPUT = '#0F172A'; // Slightly darker than CARD_COLOR for contrast
    const BORDER_COLOR_INPUT = '#334155';

    return (
        <View style={tw`mb-4`}>
            <Text style={tw`text-[${TEXT_SECONDARY_INPUT}] text-base mb-2`}>{label}</Text>
            <TextInput
                style={[tw`border rounded-lg p-3 text-lg`, {
                    backgroundColor: BG_COLOR_INPUT,
                    color: TEXT_PRIMARY_INPUT,
                    borderColor: BORDER_COLOR_INPUT,
                    textAlignVertical: 'center', // Improve text alignment on Android
                    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Adjust padding for platforms
                }]}
                placeholder={placeholder}
                placeholderTextColor={TEXT_SECONDARY_INPUT}
                keyboardType="numeric"
                value={value}
                onChangeText={(text) => setter(text.replace(/[^0-9.]/g, ''))} // Allow only numbers and dot
            />
        </View>
    );
};


// --- মূল কম্পোনেন্ট: ZakatCalculator ---
const ZakatCalculator: React.FC = () => {
    // Typed state variables
    const [goldValue, setGoldValue] = useState<any>('');
    const [silverValue, setSilverValue] = useState<string>('');
    const [cashValue, setCashValue] = useState<string>('');
    const [investmentsValue, setInvestmentsValue] = useState<string>('');
    const [businessValue, setBusinessValue] = useState<string>('');
    const [debtsValue, setDebtsValue] = useState<string>('');
    const [nisabValue, setNisabValue] = useState<string>('');
    const [zakatAmount, setZakatAmount] = useState<number | null>(null);
    const [calculationDetails, setCalculationDetails] = useState<CalculationDetails>({
        totalAssets: 0,
        totalDebts: 0,
        netWorth: 0,
    });
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    // ViewShot ref
    const viewShotRef = useRef<ViewShot>(null);

    // Typed array of asset fields
    const assetFields: AssetField[] = [
        { label: "স্বর্ণের বাজার মূল্য", value: goldValue, setter: setGoldValue },
        { label: "রূপার বাজার মূল্য", value: silverValue, setter: setSilverValue },
        { label: "নগদ অর্থ ও ব্যাংক ব্যালেন্স", value: cashValue, setter: setCashValue },
        { label: "বিনিয়োগ / শেয়ার", value: investmentsValue, setter: setInvestmentsValue },
        { label: "ব্যবসায়িক পণ্যের মূল্য", value: businessValue, setter: setBusinessValue },
    ];

    const calculateZakat = (): void => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const totalAssets = assetFields.reduce((sum, field) => sum + (parseFloat(field.value.replace(/,/g, '')) || 0), 0); // Remove commas if any
        const debts = parseFloat(debtsValue.replace(/,/g, '')) || 0;
        const nisab = parseFloat(nisabValue.replace(/,/g, '')) || 0;
        const netWorth = totalAssets - debts;

        setCalculationDetails({ totalAssets, totalDebts: debts, netWorth });

        if (nisab <= 0) {
            Alert.alert(
                "নিসাব প্রয়োজন",
                "অনুগ্রহ করে বর্তমান নিসাবের পরিমাণ প্রবেশ করান।"
            );
            setZakatAmount(null);
            return; // Stop calculation
        }

        if (netWorth < nisab) {
            Alert.alert(
                "নিসাব পরিমাণ পূর্ণ হয়নি",
                "আপনার যাকাতযোগ্য সম্পদের পরিমাণ নিসাবের চেয়ে কম, তাই বর্তমানে আপনার উপর যাকাত ফরজ নয়।"
            );
            setZakatAmount(0); // Set to 0 for clarity in modal if opened accidentally
            // Optionally open modal to show calculation breakdown anyway:
            // setModalVisible(true);
        } else {
            setZakatAmount(netWorth * 0.025);
            setModalVisible(true);
        }
    };

    const shareResult = async () => {
        if (!viewShotRef.current?.capture) {
            Alert.alert("ত্রুটি", "ফলাফল ক্যাপচার করা সম্ভব হচ্ছে না।");
            return;
        }
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const uri = await viewShotRef.current.capture();
            if (uri) {
                const imagePath = `${FileSystem.cacheDirectory}zakat_result_${Date.now()}.png`;
                await FileSystem.copyAsync({ from: uri, to: imagePath });
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(imagePath, {
                        mimeType: 'image/png',
                        dialogTitle: 'যাকাত হিসাব শেয়ার করুন',
                    });
                } else {
                    Alert.alert("শেয়ার সম্ভব নয়", "আপনার ডিভাইসে শেয়ারিং অপশন পাওয়া যায়নি।");
                }
            } else {
                Alert.alert("ত্রুটি", "ফলাফলের ছবি তৈরি করা সম্ভব হয়নি।");
            }
        } catch (error: any) {
            console.error("Error capturing or sharing view:", error);
            Alert.alert("ত্রুটি", "ফলাফল শেয়ার করতে সমস্যা হয়েছে: " + error.message);
        }
    };

    // Helper to format numbers with commas (Bangladeshi style)
    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined) return '0.00';
        // Basic BDT formatting (lakh, crore - simplified)
        // More robust library might be needed for perfect formatting
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // return num.toFixed(2); // Simpler alternative
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
            <ScrollView contentContainerStyle={tw`p-5`}>
                <Text style={styles.headerTitle}>যাকাত ক্যালকুলেটর</Text>
                <Text style={styles.headerSubtitle}>আপনার প্রদেয় যাকাতের পরিমাণ হিসাব করুন।</Text>

                {/* Nisab Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="info-circle" size={20} color={ACCENT_COLOR} />
                        <Text style={styles.cardTitle}>নিসাব পরিমাণ (টাকা)</Text>
                    </View>
                    <InputField
                        label="বর্তমান নিসাবের মূল্য"
                        value={nisabValue}
                        setter={setNisabValue}
                        placeholder="যেমন: 600000"
                    />
                    <Text style={styles.infoText}>
                        * নিসাব হলো যাকাত ফরজ হওয়ার জন্য ন্যূনতম সম্পদের পরিমাণ। এটি ৮৭.৪৮ গ্রাম স্বর্ণ অথবা ৬১২.৩৬ গ্রাম রূপার বাজার মূল্যের সমপরিমাণ। আপনার স্থানীয় বাজারদর অনুযায়ী এই মূল্য লিখুন।
                    </Text>
                </View>

                {/* Assets Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="wallet" size={20} color={ACCENT_COLOR} />
                        <Text style={styles.cardTitle}>আপনার যাকাতযোগ্য সম্পদ</Text>
                    </View>
                    {assetFields.map((field, index) => (
                        <InputField
                            key={index}
                            label={field.label}
                            value={field.value}
                            setter={field.setter}
                            placeholder="টাকার পরিমাণ লিখুন"
                        />
                    ))}
                </View>

                {/* Debts Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="file-invoice-dollar" size={20} color={ACCENT_COLOR} />
                        <Text style={styles.cardTitle}>আপনার দেনা/ঋণ</Text>
                    </View>
                    <InputField
                        label="মোট প্রদেয় দেনা/ঋণের পরিমাণ (আগামী এক বছরের মধ্যে পরিশোধযোগ্য)"
                        value={debtsValue}
                        setter={setDebtsValue}
                        placeholder="টাকার পরিমাণ লিখুন"
                    />
                    <Text style={styles.infoText}>
                        * শুধুমাত্র সেই ঋণগুলো বাদ যাবে যা আগামী এক চন্দ্র বছরের মধ্যে পরিশোধ করতে হবে। দীর্ঘমেয়াদী ঋণের কিস্তি যা এই সময়ের মধ্যে পড়বে, শুধু সেই পরিমাণ বাদ যাবে।
                    </Text>
                </View>

                {/* Calculate Button */}
                <TouchableOpacity style={styles.calculateButton} onPress={calculateZakat}>
                    <Text style={styles.calculateButtonText}>যাকাত হিসাব করুন</Text>
                </TouchableOpacity>

                {/* --- Result Modal --- */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>

                            {/* --- ক্যাপচার করার জন্য View --- */}
                            <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.95 }} style={{ backgroundColor: CARD_COLOR }}>
                                <View style={styles.captureView}>
                                    {/* App Logo */}
                                    <Image
                                        source={require('@/assets/images/logo.png')} // <-- আপনার লোগোর সঠিক পাথ দিন
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.modalTitle}>যাকাত হিসাবের ফলাফল</Text>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>মোট যাকাতযোগ্য সম্পদ:</Text>
                                        <Text style={styles.detailValue}>৳ {formatNumber(calculationDetails.totalAssets)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>প্রদেয় দেনা:</Text>
                                        <Text style={[styles.detailValue, { color: DANGER_COLOR }]}>- ৳ {formatNumber(calculationDetails.totalDebts)}</Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.detailRow}>
                                        <Text style={styles.netWorthLabel}>নিট যাকাতযোগ্য সম্পদ:</Text>
                                        <Text style={styles.netWorthValue}>৳ {formatNumber(calculationDetails.netWorth)}</Text>
                                    </View>

                                    {/* Zakat Amount Box */}
                                    <View style={styles.zakatAmountBox}>
                                        <Text style={styles.zakatLabel}>আপনার প্রদেয় যাকাত (২.৫%)</Text>
                                        <Text style={styles.zakatAmountText}>৳ {formatNumber(zakatAmount)}</Text>
                                    </View>
                                    {calculationDetails.netWorth < parseFloat(nisabValue || '0') && zakatAmount === 0 && (
                                        <Text style={styles.nisabWarningText}>
                                            নিট সম্পদ নিসাব (৳ {formatNumber(parseFloat(nisabValue || '0'))}) অপেক্ষা কম হওয়ায় যাকাত ফরজ নয়।
                                        </Text>
                                    )}
                                    <Text style={styles.footerText}>DeenerPothe দ্বারা হিসাবকৃত</Text>
                                </View>
                            </ViewShot>
                            {/* --- ক্যাপচার ভিউ শেষ --- */}

                            {/* --- Modal Actions --- */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.shareButton]}
                                    onPress={shareResult}
                                >
                                    <FontAwesome5 name="share-alt" size={16} color={TEXT_INVERSE} style={{ marginRight: 8 }} />
                                    <Text style={styles.modalButtonText}>শেয়ার/ডাউনলোড</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.closeButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <FontAwesome5 name="times" size={16} color={TEXT_INVERSE} style={{ marginRight: 8 }} />
                                    <Text style={styles.modalButtonText}>বন্ধ করুন</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- স্টাইলশীট (Styles) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: BG_COLOR },
    headerTitle: tw`text-3xl font-bold text-center text-[${ACCENT_COLOR}] mb-2`,
    headerSubtitle: tw`text-center text-[${TEXT_SECONDARY}] text-base mb-8`,
    card: tw`bg-[${CARD_COLOR}] rounded-xl p-5 mb-6 shadow-md border border-[${BORDER_COLOR}]`, // Added border
    cardHeader: tw`flex-row items-center mb-4 border-b border-[${BORDER_COLOR}] pb-3`, // Added divider
    cardTitle: tw`text-xl font-bold text-[${ACCENT_COLOR}] ml-3`,
    infoText: tw`text-xs text-[${TEXT_SECONDARY}] leading-5 mt-2`,
    calculateButton: tw`bg-[${ACCENT_COLOR}] rounded-lg p-4 items-center my-4 shadow-lg`,
    calculateButtonText: tw`text-[${TEXT_INVERSE}] text-lg font-bold`,
    // Modal Styles
    modalOverlay: tw`flex-1 justify-center items-center bg-black bg-opacity-85 p-4`,
    modalContent: tw`bg-[${CARD_COLOR}] rounded-2xl w-full max-w-md overflow-hidden shadow-xl`, // Added shadow
    modalTitle: tw`text-2xl font-bold text-center text-[${ACCENT_COLOR}] mb-6 pt-5 px-5`,
    detailRow: tw`flex-row justify-between mb-3 px-6`,
    detailLabel: tw`text-[${TEXT_SECONDARY}] text-base`,
    detailValue: tw`text-[${TEXT_PRIMARY}] text-base font-semibold`,
    netWorthLabel: tw`text-[${TEXT_PRIMARY}] text-lg font-bold`,
    netWorthValue: tw`text-[${TEXT_PRIMARY}] text-lg font-bold`,
    divider: tw`border-t border-[${BORDER_COLOR}] my-4 mx-6`,
    zakatAmountBox: tw`bg-[${PRIMARY_DARK_COLOR}] rounded-lg p-4 mx-6 mb-4 items-center border border-[${ACCENT_COLOR}] shadow-inner`, // Added shadow-inner effect
    zakatLabel: tw`text-[${ACCENT_COLOR}] text-base mb-1`,
    zakatAmountText: tw`text-white text-3xl font-extrabold`,
    nisabWarningText: { // Style for the warning text when Zakat is not due
        color: DANGER_COLOR,
        fontSize: 12,
        textAlign: 'center',
        marginTop: -10, // Pull it closer to the Zakat box
        marginBottom: 10,
        marginHorizontal: 24,
    },
    modalActions: tw`flex-row justify-between mt-0 border-t border-[${BORDER_COLOR}]`, // Removed mt-6
    modalButton: tw`flex-1 p-4 items-center justify-center flex-row`,
    shareButton: { backgroundColor: SUCCESS_COLOR },
    closeButton: { backgroundColor: DANGER_COLOR },
    modalButtonText: tw`text-[${TEXT_INVERSE}] font-bold text-base`,
    // Capture View Styles
    captureView: {
        paddingVertical: 25, // More vertical padding
        paddingHorizontal: 20,
        backgroundColor: CARD_COLOR,
        alignItems: 'center',
    },
    logo: {
        width: 70, // Slightly smaller logo
        height: 70,
        marginBottom: 15,
    },
    footerText: {
        marginTop: 20, // More space before footer
        fontSize: 10,
        color: TEXT_SECONDARY,
        textAlign: 'center',
    }
});

export default ZakatCalculator;