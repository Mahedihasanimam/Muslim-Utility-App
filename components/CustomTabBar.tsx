// import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
// import { usePathname, useRouter } from "expo-router";
// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import tw from "twrnc";

// // Define your tabs
// const tabs = [
//     { name: "/", label: "Home", icon: "home", type: "Feather" },
//     { name: "/prayer", label: "Prayer", icon: "mosque", type: "MaterialCommunityIcons" }, // Prayer Times
//     { name: "/qibla", label: "Qibla", icon: "compass", type: "Feather" }, // Qibla Direction
//     { name: "/zakat", label: "Zakat", icon: "hand-heart", type: "MaterialCommunityIcons" }, // Zakat Calculator/Sadaqah Tracker
//     { name: "/more", label: "More", icon: "dots-horizontal", type: "MaterialCommunityIcons" }, // For Profile, Tasbeeh, etc.
// ] as const;

// export default function CustomTabBar() {
//     const router = useRouter();
//     const pathname = usePathname();

//     // --- Dark Theme Color Palette based on #0F172A ---
//     // This background matches the card color from your Qibla component
//     const TAB_BACKGROUND_COLOR = '#1E293B';
//     // A lighter, muted color for inactive items, ensuring visibility on the dark background
//     const INACTIVE_COLOR = '#94A3B8';
//     // A bright, clear color for the active tab to make it pop
//     const ACTIVE_COLOR = '#F8FAFC';
//     // A subtle border color that separates the tab bar from the content
//     const BORDER_COLOR = '#334155';

//     return (
//         <View
//             style={[
//                 tw`flex-row pb-safe pt-2 justify-around items-center`,
//                 {
//                     backgroundColor: TAB_BACKGROUND_COLOR,
//                     borderTopWidth: 1,
//                     borderColor: BORDER_COLOR,
//                 }
//             ]}
//         >
//             {tabs.map((tab) => {
//                 const isActive = pathname === tab.name;
//                 const IconComponent = tab.type === "Feather" ? Feather : MaterialCommunityIcons;

//                 return (
//                     <TouchableOpacity
//                         key={tab.name}
//                         onPress={() => router.push(tab.name)}
//                         style={tw`items-center justify-center flex-1 py-1`}
//                         activeOpacity={0.7}
//                     >
//                         <IconComponent
//                             name={tab.icon}
//                             size={24}
//                             color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
//                         />
//                         <Text
//                             style={[
//                                 tw`text-xs mt-1 font-medium`,
//                                 { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }
//                             ]}
//                         >
//                             {tab.label}
//                         </Text>
//                     </TouchableOpacity>
//                 );
//             })}
//         </View>
//     );
// }


import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

// আপনার ট্যাবগুলো সংজ্ঞায়িত করুন
const tabs = [
    { name: "/", label: "Home", icon: "home", type: "Feather" },
    { name: "/prayer", label: "Prayer", icon: "mosque", type: "MaterialCommunityIcons" },
    { name: "/qibla", label: "Qibla", icon: "compass", type: "Feather" },
    { name: "/zakat", label: "Zakat", icon: "hand-heart", type: "MaterialCommunityIcons" },
    { name: "/more", label: "More", icon: "dots-horizontal", type: "MaterialCommunityIcons" },
] as const;

export default function CustomTabBar() {
    const router = useRouter();
    const pathname = usePathname();

    // নতুন ডার্ক থিমের জন্য কালার প্যালেট
    const TAB_BACKGROUND_COLOR = "#0F172A"; // আপনার দেওয়া মূল ব্যাকগ্রাউন্ড কালার
    const ACTIVE_COLOR = "#FFFFFF";       // সক্রিয় ট্যাবের জন্য উজ্জ্বল সাদা
    const INACTIVE_COLOR = "#64748B";     // নিষ্ক্রিয় ট্যাবের জন্য একটি হালকা ধূসর (Slate 500)
    const BORDER_COLOR = "#334155";       // ব্যাকগ্রাউন্ডের সাথে মানানসই বর্ডার কালার (Slate 700)

    return (
        <View
            style={tw`flex-row bg-[${TAB_BACKGROUND_COLOR}] border-t border-t-[${BORDER_COLOR}] pb-safe pt-2 justify-around items-center`}
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
                        <IconComponent
                            name={tab.icon}
                            size={24}
                            color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                        />
                        <Text
                            style={[
                                tw`text-xs mt-1 font-medium`,
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