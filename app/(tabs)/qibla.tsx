// import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import React, { useEffect, useState } from 'react';
// import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
// import tw from 'twrnc';

// const { width } = Dimensions.get('window');

// const Qibla: React.FC = () => {
//     // প্রফেশনাল কালার প্যালেট
//     const BG_COLOR = '#0F172A';
//     const CARD_COLOR = '#1E293B';
//     const ACCENT_COLOR = '#3B82F6';
//     const SUCCESS_COLOR = '#10B981';
//     const WARNING_COLOR = '#F59E0B';
//     const TEXT_PRIMARY = '#F8FAFC';
//     const TEXT_SECONDARY = '#CBD5E1';
//     const COMPASS_RING = '#334155';

//     const [heading, setHeading] = useState<number>(0);
//     const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
//     const [errorMsg, setErrorMsg] = useState<string | null>(null);
//     const [isAligned, setIsAligned] = useState<boolean>(false);
//     const [alignmentAccuracy, setAlignmentAccuracy] = useState<number>(0);

//     const rotationAnim = new Animated.Value(0);
//     const pulseAnim = new Animated.Value(1);

//     const kaabaLatitude = 21.4225;
//     const kaabaLongitude = 39.8262;

//     useEffect(() => {
//         let headingSubscription: Location.LocationSubscription | undefined;

//         const startWatching = async () => {
//             let { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== 'granted') {
//                 setErrorMsg('কিবলার দিক খুঁজে পেতে লোকেশন অনুমতি প্রয়োজন');
//                 return;
//             }

//             try {
//                 const currentPosition = await Location.getCurrentPositionAsync({});
//                 const direction = calculateQiblaDirection(currentPosition.coords);
//                 setQiblaDirection(direction);

//                 headingSubscription = await Location.watchHeadingAsync(newHeading => {
//                     const currentHeading = newHeading.trueHeading;
//                     setHeading(currentHeading);

//                     Animated.timing(rotationAnim, {
//                         toValue: 360 - currentHeading,
//                         duration: 200,
//                         useNativeDriver: true,
//                     }).start();

//                     if (direction !== null) {
//                         const difference = Math.abs(currentHeading - direction);
//                         const accuracy = Math.max(0, 100 - (difference / 180) * 100);
//                         setAlignmentAccuracy(accuracy);

//                         const aligned = difference < 5 || difference > 355;
//                         setIsAligned(aligned);

//                         // যখন মিলে যাবে তখন পালস অ্যানিমেশন হবে
//                         if (aligned) {
//                             Animated.loop(
//                                 Animated.sequence([
//                                     Animated.timing(pulseAnim, {
//                                         toValue: 1.1,
//                                         duration: 1000,
//                                         useNativeDriver: true,
//                                     }),
//                                     Animated.timing(pulseAnim, {
//                                         toValue: 1,
//                                         duration: 1000,
//                                         useNativeDriver: true,
//                                     }),
//                                 ])
//                             ).start();
//                         } else {
//                             pulseAnim.setValue(1);
//                         }
//                     }
//                 });

//             } catch (error) {
//                 setErrorMsg('লোকেশন শনাক্ত করা যাচ্ছে না। অনুগ্রহ করে আপনার GPS সেটিংস পরীক্ষা করুন।');
//             }
//         };

//         startWatching();

//         return () => {
//             if (headingSubscription) {
//                 headingSubscription.remove();
//             }
//         };
//     }, []);

//     const calculateQiblaDirection = (coords: Location.LocationCoordinates): number => {
//         const { latitude, longitude } = coords;
//         const lat1 = toRadians(latitude);
//         const lon1 = toRadians(longitude);
//         const lat2 = toRadians(kaabaLatitude);
//         const lon2 = toRadians(kaabaLongitude);
//         const dLon = lon2 - lon1;

//         const y = Math.sin(dLon) * Math.cos(lat2);
//         const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

//         let bearing = toDegrees(Math.atan2(y, x));
//         bearing = (bearing + 360) % 360;

//         return bearing;
//     };

//     const toRadians = (deg: number): number => deg * (Math.PI / 180);
//     const toDegrees = (rad: number): number => rad * (180 / Math.PI);

//     const getAlignmentColor = () => {
//         if (alignmentAccuracy > 95) return SUCCESS_COLOR;
//         if (alignmentAccuracy > 80) return WARNING_COLOR;
//         return ACCENT_COLOR;
//     };

//     const getAlignmentText = () => {
//         if (alignmentAccuracy > 95) return 'সঠিকভাবে মিলেছে';
//         if (alignmentAccuracy > 80) return 'প্রায় হয়ে গেছে';
//         return 'আপনার ডিভাইসটি ঘোরান';
//     };

//     const renderCompass = () => (
//         <View style={tw`items-center justify-center`}>
//             {/* বাইরের কম্পাস রিং */}
//             <View style={[styles.compassRing, tw`border-[${COMPASS_RING}]`]}>
//                 {/* ডিগ্রি চিহ্ন */}
//                 {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
//                     <View
//                         key={degree}
//                         style={[
//                             styles.degreeMarker,
//                             { transform: [{ rotate: `${degree}deg` }] }
//                         ]}
//                     />
//                 ))}

//                 {/* মূল দিকগুলো */}
//                 <Text style={[styles.cardinalText, styles.northText]}>N</Text>
//                 <Text style={[styles.cardinalText, styles.eastText]}>E</Text>
//                 <Text style={[styles.cardinalText, styles.southText]}>S</Text>
//                 <Text style={[styles.cardinalText, styles.westText]}>W</Text>
//             </View>

//             {/* ঘূর্ণায়মান কম্পাস */}
//             <Animated.View
//                 style={[
//                     styles.rotatingCompass,
//                     {
//                         transform: [{
//                             rotate: rotationAnim.interpolate({
//                                 inputRange: [0, 360],
//                                 outputRange: ['0deg', '360deg']
//                             })
//                         }]
//                     }
//                 ]}
//             >
//                 <View style={[styles.compassInner, tw`border-[${ACCENT_COLOR}]`]}>
//                     {/* কিবলা নির্দেশক */}
//                     <Animated.View
//                         style={[
//                             styles.qiblaIndicator,
//                             {
//                                 transform: [
//                                     { rotate: `${qiblaDirection}deg` },
//                                     { translateY: -100 },
//                                     { scale: pulseAnim }
//                                 ],
//                                 backgroundColor: isAligned ? SUCCESS_COLOR : ACCENT_COLOR
//                             }
//                         ]}
//                     >
//                         <FontAwesome5
//                             name="kaaba"
//                             size={20}
//                             color={TEXT_PRIMARY}
//                         />
//                         <View style={[styles.indicatorLine, { backgroundColor: isAligned ? SUCCESS_COLOR : ACCENT_COLOR }]} />
//                     </Animated.View>
//                 </View>
//             </Animated.View>

//             {/* কেন্দ্র নির্দেশক */}
//             <View style={styles.centerPointer}>
//                 <FontAwesome5
//                     name="location-arrow"
//                     size={24}
//                     color={getAlignmentColor()}
//                     style={{ transform: [{ rotate: '-45deg' }] }}
//                 />
//             </View>
//         </View>
//     );

//     const renderContent = () => {
//         if (errorMsg) {
//             return (
//                 <View style={tw`items-center justify-center p-8`}>
//                     <MaterialIcons name="error-outline" size={64} color={WARNING_COLOR} />
//                     <Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text>
//                 </View>
//             );
//         }

//         if (qiblaDirection === null) {
//             return (
//                 <View style={tw`items-center justify-center p-8`}>
//                     <Text style={tw`text-[${TEXT_SECONDARY}] text-lg mb-4`}>কিবলার দিক শনাক্ত করা হচ্ছে...</Text>
//                     <MaterialIcons name="explore" size={48} color={ACCENT_COLOR} />
//                 </View>
//             );
//         }

//         return renderCompass();
//     };

//     return (
//         <View style={tw`flex-1 bg-[${BG_COLOR}]`}>
//             {/* হেডার */}
//             <View style={tw`pt-8 pb-6 px-6 bg-[${CARD_COLOR}] rounded-b-3xl shadow-lg`}>
//                 <Text style={tw`text-2xl font-bold text-center text-[${TEXT_PRIMARY}]`}>
//                     কিবলার দিক
//                 </Text>
//                 <Text style={tw`text-center text-[${TEXT_SECONDARY}] text-sm mt-2`}>
//                     কাবা নির্দেশকের সাথে তীরটি মেলান
//                 </Text>
//             </View>

//             {/* মূল কন্টেন্ট */}
//             <View style={tw`flex-1 items-center justify-center px-6`}>
//                 {renderContent()}
//             </View>

//             {/* নীচের তথ্য প্যানেল */}
//             {qiblaDirection !== null && (
//                 <View style={tw`absolute bottom-8 left-6 right-6 bg-[${CARD_COLOR}] rounded-2xl p-6 shadow-xl`}>
//                     <View style={tw`flex-row justify-between items-center mb-4`}>
//                         <View>
//                             <Text style={tw`text-[${TEXT_SECONDARY}] text-sm`}>বর্তমান দিক</Text>
//                             <Text style={tw`text-[${TEXT_PRIMARY}] text-xl font-bold`}>
//                                 {qiblaDirection.toFixed(1)}°
//                             </Text>
//                         </View>
//                         <View style={tw`items-end`}>
//                             <Text style={tw`text-[${TEXT_SECONDARY}] text-sm`}>মিলকরণ</Text>
//                             <Text style={[tw`text-lg font-bold`, { color: getAlignmentColor() }]}>
//                                 {getAlignmentText()}
//                             </Text>
//                         </View>
//                     </View>

//                     {/* নির্ভুলতা বার */}
//                     <View style={tw`w-full bg-[${COMPASS_RING}] rounded-full h-2`}>
//                         <View
//                             style={[
//                                 tw`h-2 rounded-full`,
//                                 {
//                                     width: `${alignmentAccuracy}%`,
//                                     backgroundColor: getAlignmentColor()
//                                 }
//                             ]}
//                         />
//                     </View>
//                     <Text style={tw`text-[${TEXT_SECONDARY}] text-xs text-center mt-2`}>
//                         {alignmentAccuracy.toFixed(0)}% নির্ভুলতা
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     compassRing: {
//         width: width * 0.8,
//         height: width * 0.8,
//         borderRadius: width * 0.4,
//         borderWidth: 8,
//         position: 'absolute',
//     },
//     rotatingCompass: {
//         width: width * 0.7,
//         height: width * 0.7,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     compassInner: {
//         width: width * 0.7,
//         height: width * 0.7,
//         borderRadius: width * 0.35,
//         borderWidth: 2,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     degreeMarker: {
//         position: 'absolute',
//         width: 2,
//         height: 20,
//         backgroundColor: '#475569',
//         top: 0,
//     },
//     cardinalText: {
//         position: 'absolute',
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#94A3B8',
//     },
//     northText: {
//         top: 20,
//     },
//     eastText: {
//         right: 20,
//     },
//     southText: {
//         bottom: 20,
//     },
//     westText: {
//         left: 20,
//     },
//     qiblaIndicator: {
//         position: 'absolute',
//         alignItems: 'center',
//         padding: 8,
//         borderRadius: 20,
//         flexDirection: 'row',
//     },
//     indicatorLine: {
//         width: 40,
//         height: 3,
//         marginLeft: 8,
//     },
//     centerPointer: {
//         position: 'absolute',
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: '#1E293B',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 8,
//     },
// });

// export default Qibla;


import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, Vibration, View } from 'react-native';
import tw from 'twrnc';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.75; // Increased compass size for prominence
const INDICATOR_ARROW_SIZE = 30;

const Qibla: React.FC = () => {
    // --- প্রফেশনাল কালার প্যালেট (Adjusted to match image aesthetic) ---
    const BG_COLOR = '#0F172A'; // Main background color (similar to image)
    const CARD_COLOR = '#1E293B'; // Card background color
    const ACCENT_GREEN = '#69D2B7'; // Green for alignment success
    const ACCENT_ORANGE = '#F59E0B'; // Orange for warning/partial alignment
    const PRIMARY_BLUE_TEXT = '#E0F2F1'; // Lighter text on dark background
    const SECONDARY_TEXT = '#AAB8C2'; // Secondary text color
    const DARK_TEXT = '#1F2937'; // Dark text for light elements
    const WHITE_COLOR = '#FFFFFF'; // Pure white for some elements
    const COMPASS_RING_COLOR = '#4A617C'; // Color for compass outer ring

    const [heading, setHeading] = useState<number>(0);
    const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isAligned, setIsAligned] = useState<boolean>(false);
    const [alignmentAccuracy, setAlignmentAccuracy] = useState<number>(0);
    const [locationName, setLocationName] = useState<string>('লোকেশন লোড হচ্ছে...');

    const rotationAnim = useRef(new Animated.Value(0)).current;
    const qiblaArrowPulseAnim = useRef(new Animated.Value(1)).current; // For Qibla arrow pulse
    const centerArrowPulseAnim = useRef(new Animated.Value(1)).current; // For center arrow pulse

    const kaabaLatitude = 21.4225;
    const kaabaLongitude = 39.8262;

    // --- Animations ---
    const startPulseAnimation = (animValue: Animated.Value) => {
        animValue.setValue(1); // Reset
        Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, {
                    toValue: 1.15,
                    duration: 700,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(animValue, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = (animValue: Animated.Value) => {
        animValue.stopAnimation(() => animValue.setValue(1)); // Stop and reset
    };

    useEffect(() => {
        let headingSubscription: Location.LocationSubscription | undefined;

        const startWatching = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('কিবলার দিক খুঁজে পেতে লোকেশন অনুমতি প্রয়োজন।');
                return;
            }

            try {
                const currentPosition = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
                const { latitude, longitude } = currentPosition.coords;

                // Get location name
                const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (geocode.length > 0) {
                    setLocationName(`${geocode[0].city || ''}, ${geocode[0].country || ''}`);
                } else {
                    setLocationName('অজানা স্থান');
                }

                const direction = calculateQiblaDirection(currentPosition.coords);
                setQiblaDirection(direction);

                headingSubscription = await Location.watchHeadingAsync(newHeading => {
                    const currentHeading = newHeading.trueHeading;
                    setHeading(currentHeading);

                    // Smooth rotation for the compass
                    Animated.timing(rotationAnim, {
                        toValue: currentHeading, // Rotate the compass based on device heading
                        duration: 300, // Smoother animation
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }).start();

                    if (direction !== null) {
                        // Calculate difference, ensuring it's always positive and within 0-180 for accuracy
                        let difference = Math.abs(currentHeading - direction);
                        if (difference > 180) difference = 360 - difference;

                        const accuracy = Math.max(0, 100 - (difference / 90) * 100); // 90 degree range for full accuracy scaling
                        setAlignmentAccuracy(accuracy);

                        const aligned = difference < 4; // Tolerance for alignment
                        setIsAligned(aligned);

                        if (aligned) {
                            startPulseAnimation(qiblaArrowPulseAnim);
                            startPulseAnimation(centerArrowPulseAnim);
                            Vibration.vibrate(50); // Small haptic feedback on alignment
                        } else {
                            stopPulseAnimation(qiblaArrowPulseAnim);
                            stopPulseAnimation(centerArrowPulseAnim);
                        }
                    }
                });

            } catch (error) {
                setErrorMsg('লোকেশন শনাক্ত করা যাচ্ছে না। অনুগ্রহ করে আপনার GPS সেটিংস পরীক্ষা করুন।');
                console.error("Location error:", error);
            }
        };

        startWatching();

        return () => {
            if (headingSubscription) {
                headingSubscription.remove();
            }
        };
    }, []);

    const calculateQiblaDirection = (coords: Location.LocationCoordinates): number => {
        const { latitude, longitude } = coords;
        const lat1 = toRadians(latitude);
        const lon1 = toRadians(longitude);
        const lat2 = toRadians(kaabaLatitude);
        const lon2 = toRadians(kaabaLongitude);
        const dLon = lon2 - lon1;

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

        let bearing = toDegrees(Math.atan2(y, x));
        bearing = (bearing + 360) % 360; // Ensure positive 0-360

        return bearing;
    };

    const toRadians = (deg: number): number => deg * (Math.PI / 180);
    const toDegrees = (rad: number): number => rad * (180 / Math.PI);

    const getAlignmentColor = () => {
        if (isAligned) return ACCENT_GREEN;
        if (alignmentAccuracy > 80) return ACCENT_ORANGE;
        return SECONDARY_TEXT;
    };

    const getAlignmentText = () => {
        if (isAligned) return 'সঠিকভাবে কিবলামুখী';
        if (alignmentAccuracy > 80) return 'প্রায় হয়ে গেছে';
        return 'আপনার ডিভাইসটি ঘোরান';
    };

    const renderCompass = () => (
        <View style={tw`items-center justify-center`}>
            {/* Compass Base */}
            <View style={[styles.compassBase, { borderColor: COMPASS_RING_COLOR }]}>
                {/* Rotating Compass Face */}
                <Animated.View
                    style={[
                        styles.rotatingCompassFace,
                        {
                            transform: [{
                                rotate: rotationAnim.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '-360deg'] // Rotate opposite to heading for static compass arrow
                                })
                            }]
                        }
                    ]}
                >
                    {/* Qibla Indicator - Rotates with compass face but points to static Qibla */}
                    {qiblaDirection !== null && (
                        <Animated.View
                            style={[
                                styles.qiblaIndicator,
                                {
                                    transform: [
                                        { translateX: COMPASS_SIZE / 2 - INDICATOR_ARROW_SIZE / 2 }, // Center the arrow horizontally
                                        { rotate: `${qiblaDirection}deg` },
                                        { translateY: -COMPASS_SIZE * 0.4 }, // Position it at the top edge
                                        { scale: qiblaArrowPulseAnim }
                                    ],
                                    backgroundColor: ACCENT_GREEN, // Qibla arrow always green
                                }
                            ]}
                        >
                            <FontAwesome5 name="kaaba" size={16} color={WHITE_COLOR} />
                            <MaterialIcons name="arrow-upward" size={20} color={WHITE_COLOR} style={tw`-mt-1`} />
                        </Animated.View>
                    )}

                    {/* Cardinal Points - Rotates with compass face */}
                    <Text style={[styles.cardinalText, styles.northText, { color: SECONDARY_TEXT }]}>উ</Text> {/* North (উত্তর) */}
                    <Text style={[styles.cardinalText, styles.eastText, { color: SECONDARY_TEXT }]}>পূ</Text> {/* East (পূর্ব) */}
                    <Text style={[styles.cardinalText, styles.southText, { color: SECONDARY_TEXT }]}>দ</Text> {/* South (দক্ষিণ) */}
                    <Text style={[styles.cardinalText, styles.westText, { color: SECONDARY_TEXT }]}>প</Text> {/* West (পশ্চিম) */}

                    {/* Degree Markers */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => (
                        <View
                            key={degree}
                            style={[
                                styles.degreeMarker,
                                {
                                    transform: [
                                        { rotate: `${degree}deg` },
                                        { translateY: -COMPASS_SIZE / 2 + 10 }
                                    ],
                                    backgroundColor: SECONDARY_TEXT
                                }
                            ]}
                        />
                    ))}
                </Animated.View>
            </View>

            {/* Center Device Indicator */}
            <Animated.View
                style={[
                    styles.centerIndicator,
                    { transform: [{ scale: centerArrowPulseAnim }] }
                ]}
            >
                <Ionicons name="navigate" size={INDICATOR_ARROW_SIZE} color={getAlignmentColor()} style={{ transform: [{ rotate: '0deg' }] }} />
            </Animated.View>
        </View>
    );

    const renderContent = () => {
        if (errorMsg) {
            return (
                <View style={tw`items-center justify-center p-8`}>
                    <MaterialIcons name="error-outline" size={64} color={ACCENT_ORANGE} />
                    <Text style={tw`text-[${PRIMARY_BLUE_TEXT}] text-lg text-center mt-4`}>{errorMsg}</Text>
                </View>
            );
        }

        if (qiblaDirection === null) {
            return (
                <View style={tw`items-center justify-center p-8`}>
                    <Text style={tw`text-[${SECONDARY_TEXT}] text-lg mb-4`}>কিবলার দিক গণনা করা হচ্ছে...</Text>
                    <MaterialIcons name="explore" size={48} color={ACCENT_GREEN} />
                </View>
            );
        }

        return renderCompass();
    };

    return (
        <View style={tw`flex-1 bg-[${BG_COLOR}]`}>
            {/* Header */}
            <View style={tw`pt-16 pb-6 px-6 bg-[${CARD_COLOR}] rounded-b-3xl shadow-lg`}>
                <Text style={tw`text-3xl font-bold text-center text-[${WHITE_COLOR}]`}>
                    কিবলার দিক
                </Text>
                <Text style={tw`text-center text-[${SECONDARY_TEXT}] text-base mt-2`}>
                    সঠিক দিকনির্দেশের জন্য আপনার ডিভাইসটি ঘোরান।
                </Text>
            </View>

            {/* Main Content */}
            <View style={tw`flex-1 items-center justify-center px-6`}>
                {renderContent()}
            </View>

            {/* Bottom Info Panel */}
            {qiblaDirection !== null && (
                <View style={tw`absolute bottom-0 left-0 right-0 p-6 bg-[${CARD_COLOR}] rounded-t-3xl shadow-xl`}>
                    <View style={tw`flex-row justify-between items-center mb-4`}>
                        <View>
                            <Text style={tw`text-[${SECONDARY_TEXT}] text-sm`}>বর্তমান কম্পাসের রিডিং</Text>
                            <Text style={tw`text-[${WHITE_COLOR}] text-2xl font-bold mt-1`}>
                                {heading.toFixed(0)}°
                            </Text>
                        </View>
                        <View style={tw`items-end`}>
                            <Text style={tw`text-[${SECONDARY_TEXT}] text-sm`}>কিবলার দিক</Text>
                            <Text style={[tw`text-2xl font-bold mt-1`, { color: ACCENT_GREEN }]}>
                                {qiblaDirection.toFixed(0)}°
                            </Text>
                        </View>
                    </View>

                    {/* Alignment Status */}
                    <Text style={[tw`text-xl font-bold text-center mb-3`, { color: getAlignmentColor() }]}>
                        {getAlignmentText()}
                    </Text>

                    {/* Accuracy Bar */}
                    <View style={tw`w-full bg-[${COMPASS_RING_COLOR}] rounded-full h-3`}>
                        <View
                            style={[
                                tw`h-3 rounded-full`,
                                {
                                    width: `${alignmentAccuracy}%`,
                                    backgroundColor: getAlignmentColor()
                                }
                            ]}
                        />
                    </View>
                    <Text style={tw`text-[${SECONDARY_TEXT}] text-xs text-center mt-2`}>
                        নির্ভুলতা: {alignmentAccuracy.toFixed(0)}%
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    compassBase: {
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
        borderRadius: COMPASS_SIZE / 2,
        borderWidth: 10, // Thicker border for the base
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Ensure rotating elements stay within bounds
    },
    rotatingCompassFace: {
        width: COMPASS_SIZE - 20, // Slightly smaller than base
        height: COMPASS_SIZE - 20,
        borderRadius: (COMPASS_SIZE - 20) / 2,
        backgroundColor: 'transparent', // Transparent to show the outer ring
        position: 'absolute',
    },
    qiblaIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: INDICATOR_ARROW_SIZE,
        height: INDICATOR_ARROW_SIZE * 2, // Make it a bit longer to stand out
        borderRadius: INDICATOR_ARROW_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        transformOrigin: `0px ${COMPASS_SIZE * 0.4}px`, // Adjust transform origin for rotation around center
    },
    cardinalText: {
        position: 'absolute',
        fontSize: 16,
        fontWeight: 'bold',
    },
    northText: {
        top: 20,
        alignSelf: 'center',
    },
    eastText: {
        right: 20,
        top: '50%',
        marginTop: -8, // Adjust for vertical centering
    },
    southText: {
        bottom: 20,
        alignSelf: 'center',
    },
    westText: {
        left: 20,
        top: '50%',
        marginTop: -8, // Adjust for vertical centering
    },
    degreeMarker: {
        position: 'absolute',
        width: 3,
        height: 15, // Longer markers
        borderRadius: 1.5,
        alignSelf: 'center',
        transformOrigin: `0px ${COMPASS_SIZE / 2}px`, // Rotate around center of face
    },
    centerIndicator: {
        position: 'absolute',
        width: COMPASS_SIZE * 0.2,
        height: COMPASS_SIZE * 0.2,
        borderRadius: COMPASS_SIZE * 0.1,
        backgroundColor: '#FFFFFF', // White background for clarity
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
});

export default Qibla;