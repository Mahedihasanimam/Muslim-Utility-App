import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

// আপনার ট্যাবগুলো সংজ্ঞায়িত করুন
const tabs = [
    { name: "/", label: "হোম", icon: "home", type: "Feather" },
    { name: "/chat", label: "জিজ্ঞাসা", icon: "robot-happy", type: "MaterialCommunityIcons" }, // AI Tab
    { name: "/quran", label: "কুরআন", icon: "book", type: "Feather" },
    { name: "/qibla", label: "কিবলা", icon: "compass", type: "Feather" },
    { name: "/zakat", label: "যাকাত", icon: "hand-heart", type: "MaterialCommunityIcons" },
] as const;

export default function CustomTabBar() {
    const router = useRouter();
    const pathname = usePathname();

    // Islamic Tech Theme Colors (Same as Chat Screen)
    const TAB_BACKGROUND_COLOR = "#0F172A"; // Deep Navy
    const ACTIVE_COLOR = "#FBBF24";       // Amber/Gold (Islamic Vibe)
    const INACTIVE_COLOR = "#64748B";     // Slate 500 (Subtle)
    const BORDER_COLOR = "#1E293B";       // Slate 800

    return (
        <View
            style={tw`flex-row bg-[${TAB_BACKGROUND_COLOR}] border-t border-[${BORDER_COLOR}] pb-safe pt-3 justify-around items-center shadow-lg`}
        >
            {tabs.map((tab) => {
                const isActive = pathname === tab.name;
                const IconComponent = tab.type === "Feather" ? Feather : MaterialCommunityIcons;

                return (
                    <TouchableOpacity
                        key={tab.name}
                        onPress={() => router.push(tab.name)}
                        style={tw`items-center justify-center flex-1 py-1`}
                        activeOpacity={0.7}
                    >
                        {/* Active Indicator Line (Optional Design Touch) */}
                        {isActive && (
                            <View style={tw`absolute -top-3 w-8 h-0.5 bg-[${ACTIVE_COLOR}] rounded-full`} />
                        )}

                        <IconComponent
                            name={tab.icon as any}
                            size={24}
                            // যদি AI ট্যাব হয় এবং অ্যাক্টিভ থাকে, তবে একটু ফিউচারিস্টিক Cyan কালার মিক্স করতে পারেন, 
                            // তবে ক্লিন লুকের জন্য সব গোল্ড রাখাই ভালো।
                            color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                        />
                        <Text
                            style={[
                                tw`text-[10px] mt-1.5 font-medium tracking-wide`,
                                { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}