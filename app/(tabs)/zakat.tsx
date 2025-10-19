import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

// Interface for InputField component props
interface InputFieldProps {
    label: string;
    value: string;
    setter: (value: string) => void;
    placeholder: string;
}

// Typed Helper Component for input fields
const InputField: React.FC<InputFieldProps> = ({ label, value, setter, placeholder }) => {
    const TEXT_PRIMARY = '#F1F5F9';
    const TEXT_SECONDARY = '#94A3B8';
    const BG_COLOR = '#0A191E';
    const BORDER_COLOR = '#334155';

    return (
        <View style={tw`mb-4`}>
            <Text style={tw`text-[${TEXT_SECONDARY}] text-base mb-2`}>{label}</Text>
            <TextInput
                style={tw`bg-[${BG_COLOR}] text-[${TEXT_PRIMARY}] border border-[${BORDER_COLOR}] rounded-lg p-3 text-lg`}
                placeholder={placeholder}
                placeholderTextColor={TEXT_SECONDARY}
                keyboardType="numeric"
                value={value}
                onChangeText={setter}
            />
        </View>
    );
};

// Interface for the structure of calculation details state
interface CalculationDetails {
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
}

// Interface for the structure of asset field objects
interface AssetField {
    label: string;
    value: string;
    setter: (value: string) => void;
}

const ZakatCalculator: React.FC = () => {
    // Color Palette from your app's theme
    const BG_COLOR = '#0F172A';
    const CARD_COLOR = '#1E293B';
    const ACCENT_COLOR = '#66D2E8';
    const TEXT_PRIMARY = '#F1F5F9';
    const TEXT_SECONDARY = '#94A3B8';
    const TEXT_INVERSE = '#0A191E';
    const DANGER_COLOR = '#F87171';

    // Typed state variables
    const [goldValue, setGoldValue] = useState<string>('');
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

    // Typed array of asset fields
    const assetFields: AssetField[] = [
        { label: "স্বর্ণের বাজার মূল্য", value: goldValue, setter: setGoldValue },
        { label: "রূপার বাজার মূল্য", value: silverValue, setter: setSilverValue },
        { label: "নগদ অর্থ ও ব্যাংক ব্যালেন্স", value: cashValue, setter: setCashValue },
        { label: "বিনিয়োগ / শেয়ার", value: investmentsValue, setter: setInvestmentsValue },
        { label: "ব্যবসায়িক পণ্যের মূল্য", value: businessValue, setter: setBusinessValue },
    ];

    const calculateZakat = (): void => {
        const totalAssets = assetFields.reduce((sum, field) => sum + (parseFloat(field.value) || 0), 0);
        const debts = parseFloat(debtsValue) || 0;
        const nisab = parseFloat(nisabValue) || 0;
        const netWorth = totalAssets - debts;

        setCalculationDetails({ totalAssets, totalDebts: debts, netWorth });

        if (netWorth < nisab) {
            Alert.alert(
                "নিসাব পরিমাণ পূর্ণ হয়নি",
                "আপনার যাকাতযোগ্য সম্পদের পরিমাণ নিসাবের চেয়ে কম, তাই বর্তমানে আপনার উপর যাকাত ফরজ নয়।"
            );
            setZakatAmount(null);
        } else {
            setZakatAmount(netWorth * 0.025);
            setModalVisible(true);
        }
    };

    return (
        <ScrollView style={tw`flex-1 bg-[${BG_COLOR}]`} contentContainerStyle={tw`p-5`}>
            <Text style={tw`text-3xl font-bold text-center text-[${ACCENT_COLOR}] mb-2`}>যাকাত ক্যালকুলেটর</Text>
            <Text style={tw`text-center text-[${TEXT_SECONDARY}] text-base mb-8`}>আপনার প্রদেয় যাকাতের পরিমাণ হিসাব করুন।</Text>

            <View style={tw`bg-[${CARD_COLOR}] rounded-xl p-5 mb-6`}>
                <View style={tw`flex-row items-center mb-4`}>
                    <FontAwesome5 name="info-circle" size={20} color={ACCENT_COLOR} />
                    <Text style={tw`text-xl font-bold text-[${ACCENT_COLOR}] ml-3`}>নিসাব পরিমাণ (টাকা)</Text>
                </View>
                <InputField
                    label="বর্তমান নিসাবের মূল্য"
                    value={nisabValue}
                    setter={setNisabValue}
                    placeholder="যেমন: ৬০০০০০"
                />
                <Text style={tw`text-xs text-[${TEXT_SECONDARY}] leading-5`}>
                    * নিসাব হলো যাকাত ফরজ হওয়ার জন্য ন্যূনতম সম্পদের পরিমাণ। এটি ৮৭.৪৮ গ্রাম স্বর্ণ অথবা ৬১২.৩৬ গ্রাম রূপার বাজার মূল্যের সমপরিমাণ।
                </Text>
            </View>

            <View style={tw`bg-[${CARD_COLOR}] rounded-xl p-5 mb-6`}>
                <View style={tw`flex-row items-center mb-4`}>
                    <FontAwesome5 name="wallet" size={20} color={ACCENT_COLOR} />
                    <Text style={tw`text-xl font-bold text-[${ACCENT_COLOR}] ml-3`}>আপনার যাকাতযোগ্য সম্পদ</Text>
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

            <View style={tw`bg-[${CARD_COLOR}] rounded-xl p-5 mb-6`}>
                <View style={tw`flex-row items-center mb-4`}>
                    <FontAwesome5 name="file-invoice-dollar" size={20} color={ACCENT_COLOR} />
                    <Text style={tw`text-xl font-bold text-[${ACCENT_COLOR}] ml-3`}>আপনার দেনা/ঋণ</Text>
                </View>
                <InputField
                    label="মোট দেনা/ঋণের পরিমাণ"
                    value={debtsValue}
                    setter={setDebtsValue}
                    placeholder="টাকার পরিমাণ লিখুন"
                />
            </View>

            <TouchableOpacity
                style={tw`bg-[${ACCENT_COLOR}] rounded-lg p-4 items-center my-4 shadow-lg`}
                onPress={calculateZakat}
            >
                <Text style={tw`text-[${TEXT_INVERSE}] text-lg font-bold`}>যাকাত হিসাব করুন</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-80 p-5`}>
                    <View style={tw`bg-[${CARD_COLOR}] rounded-2xl p-6 w-full`}>
                        <Text style={tw`text-2xl font-bold text-center text-[${ACCENT_COLOR}] mb-6`}>যাকাত হিসাবের ফলাফল</Text>

                        <View style={tw`flex-row justify-between mb-3`}>
                            <Text style={tw`text-[${TEXT_SECONDARY}] text-base`}>মোট সম্পদ:</Text>
                            <Text style={tw`text-[${TEXT_PRIMARY}] text-base font-semibold`}>৳ {calculationDetails.totalAssets.toFixed(2)}</Text>
                        </View>

                        <View style={tw`flex-row justify-between mb-4`}>
                            <Text style={tw`text-[${TEXT_SECONDARY}] text-base`}>মোট দেনা:</Text>
                            <Text style={tw`text-[${DANGER_COLOR}] text-base font-semibold`}>- ৳ {calculationDetails.totalDebts.toFixed(2)}</Text>
                        </View>

                        <View style={tw`border-t border-gray-700 my-4`} />

                        <View style={tw`flex-row justify-between mb-6 items-center`}>
                            <Text style={tw`text-[${TEXT_PRIMARY}] text-lg font-bold`}>যাকাতযোগ্য নিট সম্পদ:</Text>
                            <Text style={tw`text-[${TEXT_PRIMARY}] text-lg font-bold`}>৳ {calculationDetails.netWorth.toFixed(2)}</Text>
                        </View>

                        <View style={tw`bg-[${BG_COLOR}] rounded-lg p-4 items-center border border-[${ACCENT_COLOR}]`}>
                            <Text style={tw`text-[${ACCENT_COLOR}] text-base mb-1`}>আপনার প্রদেয় যাকাত (২.৫%)</Text>
                            <Text style={tw`text-white text-4xl font-extrabold`}>৳ {zakatAmount?.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity
                            style={tw`bg-[${ACCENT_COLOR}] rounded-lg p-3 items-center mt-8`}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={tw`text-[${TEXT_INVERSE}] font-bold text-base`}>বন্ধ করুন</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default ZakatCalculator;