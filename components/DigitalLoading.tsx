import React from 'react';
import { Animated, Dimensions, Easing, SafeAreaView, Text, View } from 'react-native';
import tw from 'twrnc';

const { width, height } = Dimensions.get('window');
const ACCENT_COLOR = '#69D2B7';
const BG_COLOR = '#0f172a'; // Assuming your background color
const TEXT_LIGHT = '#F1F5F9';
const TEXT_SECONDARY = '#CBD5E1';

const FullScreenDigitalLoading = ({ text = "তথ্য লোড হচ্ছে..." }) => {
    const pulseAnimation = new Animated.Value(0);
    const shimmerAnimation = new Animated.Value(-width);

    React.useEffect(() => {
        // Pulse animation for entire screen
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnimation, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnimation, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Shimmer animation for skeleton
        Animated.loop(
            Animated.timing(shimmerAnimation, {
                toValue: width,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const skeletonOpacity = pulseAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0.9],
    });

    const shimmerPosition = shimmerAnimation.interpolate({
        inputRange: [-width, width],
        outputRange: [-width, width],
    });

    return (
        <SafeAreaView style={tw`flex-1 bg-[${BG_COLOR}]`}>
            {/* Header Skeleton */}
            <View style={tw`p-6 border-b border-[#1e293b]`}>
                <View style={tw`flex-row items-center justify-between mb-4`}>
                    <View style={tw`w-32 h-10 bg-[#1e293b] rounded-lg overflow-hidden`}>
                        <Animated.View
                            style={[
                                tw`absolute top-0 left-0 right-0 bottom-0`,
                                {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: [{ translateX: shimmerPosition }],
                                },
                            ]}
                        />
                    </View>
                    <View style={tw`w-10 h-10 bg-[#1e293b] rounded-full overflow-hidden`}>
                        <Animated.View
                            style={[
                                tw`absolute top-0 left-0 right-0 bottom-0`,
                                {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: [{ translateX: shimmerPosition }],
                                },
                            ]}
                        />
                    </View>
                </View>

                <View style={tw`w-48 h-6 bg-[#1e293b] rounded-full overflow-hidden mb-2`}>
                    <Animated.View
                        style={[
                            tw`absolute top-0 left-0 right-0 bottom-0`,
                            {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                transform: [{ translateX: shimmerPosition }],
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Main Content Area Skeleton */}
            <View style={tw`p-6`}>
                {/* Date Card Skeleton */}
                <Animated.View
                    style={[
                        tw`w-full h-32 bg-[#1e293b] rounded-xl p-4 mb-6 border border-[#334155]/50`,
                        { opacity: skeletonOpacity }
                    ]}
                >
                    <View style={tw`flex-row justify-between items-start`}>
                        <View style={tw`w-24 h-6 bg-[#334155] rounded-full overflow-hidden mb-4`}>
                            <Animated.View
                                style={[
                                    tw`absolute top-0 left-0 right-0 bottom-0`,
                                    {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        transform: [{ translateX: shimmerPosition }],
                                    },
                                ]}
                            />
                        </View>
                        <View style={tw`w-20 h-6 bg-[#334155] rounded-full overflow-hidden`}>
                            <Animated.View
                                style={[
                                    tw`absolute top-0 left-0 right-0 bottom-0`,
                                    {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        transform: [{ translateX: shimmerPosition }],
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={tw`flex-row justify-between`}>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <View key={item} style={tw`items-center`}>
                                <View style={tw`w-8 h-8 bg-[#334155] rounded-full overflow-hidden mb-2`}>
                                    <Animated.View
                                        style={[
                                            tw`absolute top-0 left-0 right-0 bottom-0`,
                                            {
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                transform: [{ translateX: shimmerPosition }],
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={tw`w-12 h-3 bg-[#334155] rounded-full overflow-hidden`}>
                                    <Animated.View
                                        style={[
                                            tw`absolute top-0 left-0 right-0 bottom-0`,
                                            {
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                transform: [{ translateX: shimmerPosition }],
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Prayer Times Skeleton */}
                <View style={tw`mb-8`}>
                    <View style={tw`w-40 h-5 bg-[#1e293b] rounded-full overflow-hidden mb-4`}>
                        <Animated.View
                            style={[
                                tw`absolute top-0 left-0 right-0 bottom-0`,
                                {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: [{ translateX: shimmerPosition }],
                                },
                            ]}
                        />
                    </View>

                    {[1, 2, 3, 4, 5].map((item) => (
                        <Animated.View
                            key={item}
                            style={[
                                tw`flex-row justify-between items-center py-4 border-b border-[#1e293b]`,
                                { opacity: skeletonOpacity }
                            ]}
                        >
                            <View style={tw`flex-row items-center`}>
                                <View style={tw`w-10 h-10 bg-[#1e293b] rounded-full overflow-hidden mr-3`}>
                                    <Animated.View
                                        style={[
                                            tw`absolute top-0 left-0 right-0 bottom-0`,
                                            {
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                transform: [{ translateX: shimmerPosition }],
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={tw`w-24 h-4 bg-[#1e293b] rounded-full overflow-hidden`}>
                                    <Animated.View
                                        style={[
                                            tw`absolute top-0 left-0 right-0 bottom-0`,
                                            {
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                transform: [{ translateX: shimmerPosition }],
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                            <View style={tw`w-16 h-4 bg-[#1e293b] rounded-full overflow-hidden`}>
                                <Animated.View
                                    style={[
                                        tw`absolute top-0 left-0 right-0 bottom-0`,
                                        {
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            transform: [{ translateX: shimmerPosition }],
                                        },
                                    ]}
                                />
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Digital Loading Indicator (Floating) */}
                <View style={tw`absolute bottom-10 left-0 right-0 items-center`}>
                    <Animated.View
                        style={[
                            tw`bg-[#1a2332] rounded-2xl p-4 border border-[${ACCENT_COLOR}]/20 shadow-lg`,
                            {
                                transform: [
                                    {
                                        scale: pulseAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.95, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={tw`flex-row items-center justify-center mb-2`}>
                            {[0, 1, 2].map((index) => (
                                <Animated.View
                                    key={index}
                                    style={[
                                        tw`w-2 h-2 rounded-full mx-1 bg-[${ACCENT_COLOR}]`,
                                        {
                                            opacity: pulseAnimation.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: index === 1 ? [0.3, 1, 0.3] : [0.7, 0.9, 0.7],
                                            }),
                                            transform: [
                                                {
                                                    scale: pulseAnimation.interpolate({
                                                        inputRange: [0, 0.5, 1],
                                                        outputRange: [1, 1.2, 1],
                                                    }),
                                                },
                                            ],
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={tw`text-[${TEXT_SECONDARY}] text-sm text-center`}>
                            {text} • {Math.floor(Math.random() * 30) + 70}%
                        </Text>
                    </Animated.View>

                    {/* Quranic Verse */}
                    <Animated.View
                        style={[
                            tw`mt-4 px-6 py-3 rounded-lg`,
                            {
                                backgroundColor: 'rgba(105, 210, 183, 0.1)',
                                opacity: pulseAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1],
                                }),
                            }
                        ]}
                    >
                        <Text style={tw`text-[${TEXT_SECONDARY}] text-xs text-center italic`}>
                            "নিশ্চয় আল্লাহ্ প্রত্যেক বস্তুর হিসাব রাখেন" (সূরা আন-নিসা, ৮৬)
                        </Text>
                    </Animated.View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default FullScreenDigitalLoading;