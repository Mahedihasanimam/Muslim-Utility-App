import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

const Qibla: React.FC = () => {
    // প্রফেশনাল কালার প্যালেট
    const BG_COLOR = '#0F172A';
    const CARD_COLOR = '#1E293B';
    const ACCENT_COLOR = '#3B82F6';
    const SUCCESS_COLOR = '#10B981';
    const WARNING_COLOR = '#F59E0B';
    const TEXT_PRIMARY = '#F8FAFC';
    const TEXT_SECONDARY = '#CBD5E1';
    const COMPASS_RING = '#334155';

    const [heading, setHeading] = useState<number>(0);
    const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isAligned, setIsAligned] = useState<boolean>(false);
    const [alignmentAccuracy, setAlignmentAccuracy] = useState<number>(0);

    const rotationAnim = new Animated.Value(0);
    const pulseAnim = new Animated.Value(1);

    const kaabaLatitude = 21.4225;
    const kaabaLongitude = 39.8262;

    useEffect(() => {
        let headingSubscription: Location.LocationSubscription | undefined;

        const startWatching = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('কিবলার দিক খুঁজে পেতে লোকেশন অনুমতি প্রয়োজন');
                return;
            }

            try {
                const currentPosition = await Location.getCurrentPositionAsync({});
                const direction = calculateQiblaDirection(currentPosition.coords);
                setQiblaDirection(direction);

                headingSubscription = await Location.watchHeadingAsync(newHeading => {
                    const currentHeading = newHeading.trueHeading;
                    setHeading(currentHeading);

                    Animated.timing(rotationAnim, {
                        toValue: 360 - currentHeading,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();

                    if (direction !== null) {
                        const difference = Math.abs(currentHeading - direction);
                        const accuracy = Math.max(0, 100 - (difference / 180) * 100);
                        setAlignmentAccuracy(accuracy);

                        const aligned = difference < 5 || difference > 355;
                        setIsAligned(aligned);

                        // যখন মিলে যাবে তখন পালস অ্যানিমেশন হবে
                        if (aligned) {
                            Animated.loop(
                                Animated.sequence([
                                    Animated.timing(pulseAnim, {
                                        toValue: 1.1,
                                        duration: 1000,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(pulseAnim, {
                                        toValue: 1,
                                        duration: 1000,
                                        useNativeDriver: true,
                                    }),
                                ])
                            ).start();
                        } else {
                            pulseAnim.setValue(1);
                        }
                    }
                });

            } catch (error) {
                setErrorMsg('লোকেশন শনাক্ত করা যাচ্ছে না। অনুগ্রহ করে আপনার GPS সেটিংস পরীক্ষা করুন।');
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
        bearing = (bearing + 360) % 360;

        return bearing;
    };

    const toRadians = (deg: number): number => deg * (Math.PI / 180);
    const toDegrees = (rad: number): number => rad * (180 / Math.PI);

    const getAlignmentColor = () => {
        if (alignmentAccuracy > 95) return SUCCESS_COLOR;
        if (alignmentAccuracy > 80) return WARNING_COLOR;
        return ACCENT_COLOR;
    };

    const getAlignmentText = () => {
        if (alignmentAccuracy > 95) return 'সঠিকভাবে মিলেছে';
        if (alignmentAccuracy > 80) return 'প্রায় হয়ে গেছে';
        return 'আপনার ডিভাইসটি ঘোরান';
    };

    const renderCompass = () => (
        <View style={tw`items-center justify-center`}>
            {/* বাইরের কম্পাস রিং */}
            <View style={[styles.compassRing, tw`border-[${COMPASS_RING}]`]}>
                {/* ডিগ্রি চিহ্ন */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
                    <View
                        key={degree}
                        style={[
                            styles.degreeMarker,
                            { transform: [{ rotate: `${degree}deg` }] }
                        ]}
                    />
                ))}

                {/* মূল দিকগুলো */}
                <Text style={[styles.cardinalText, styles.northText]}>N</Text>
                <Text style={[styles.cardinalText, styles.eastText]}>E</Text>
                <Text style={[styles.cardinalText, styles.southText]}>S</Text>
                <Text style={[styles.cardinalText, styles.westText]}>W</Text>
            </View>

            {/* ঘূর্ণায়মান কম্পাস */}
            <Animated.View
                style={[
                    styles.rotatingCompass,
                    {
                        transform: [{
                            rotate: rotationAnim.interpolate({
                                inputRange: [0, 360],
                                outputRange: ['0deg', '360deg']
                            })
                        }]
                    }
                ]}
            >
                <View style={[styles.compassInner, tw`border-[${ACCENT_COLOR}]`]}>
                    {/* কিবলা নির্দেশক */}
                    <Animated.View
                        style={[
                            styles.qiblaIndicator,
                            {
                                transform: [
                                    { rotate: `${qiblaDirection}deg` },
                                    { translateY: -100 },
                                    { scale: pulseAnim }
                                ],
                                backgroundColor: isAligned ? SUCCESS_COLOR : ACCENT_COLOR
                            }
                        ]}
                    >
                        <FontAwesome5
                            name="kaaba"
                            size={20}
                            color={TEXT_PRIMARY}
                        />
                        <View style={[styles.indicatorLine, { backgroundColor: isAligned ? SUCCESS_COLOR : ACCENT_COLOR }]} />
                    </Animated.View>
                </View>
            </Animated.View>

            {/* কেন্দ্র নির্দেশক */}
            <View style={styles.centerPointer}>
                <FontAwesome5
                    name="location-arrow"
                    size={24}
                    color={getAlignmentColor()}
                    style={{ transform: [{ rotate: '-45deg' }] }}
                />
            </View>
        </View>
    );

    const renderContent = () => {
        if (errorMsg) {
            return (
                <View style={tw`items-center justify-center p-8`}>
                    <MaterialIcons name="error-outline" size={64} color={WARNING_COLOR} />
                    <Text style={tw`text-[${TEXT_PRIMARY}] text-lg text-center mt-4`}>{errorMsg}</Text>
                </View>
            );
        }

        if (qiblaDirection === null) {
            return (
                <View style={tw`items-center justify-center p-8`}>
                    <Text style={tw`text-[${TEXT_SECONDARY}] text-lg mb-4`}>কিবলার দিক শনাক্ত করা হচ্ছে...</Text>
                    <MaterialIcons name="explore" size={48} color={ACCENT_COLOR} />
                </View>
            );
        }

        return renderCompass();
    };

    return (
        <View style={tw`flex-1 bg-[${BG_COLOR}]`}>
            {/* হেডার */}
            <View style={tw`pt-8 pb-6 px-6 bg-[${CARD_COLOR}] rounded-b-3xl shadow-lg`}>
                <Text style={tw`text-2xl font-bold text-center text-[${TEXT_PRIMARY}]`}>
                    কিবলার দিক
                </Text>
                <Text style={tw`text-center text-[${TEXT_SECONDARY}] text-sm mt-2`}>
                    কাবা নির্দেশকের সাথে তীরটি মেলান
                </Text>
            </View>

            {/* মূল কন্টেন্ট */}
            <View style={tw`flex-1 items-center justify-center px-6`}>
                {renderContent()}
            </View>

            {/* নীচের তথ্য প্যানেল */}
            {qiblaDirection !== null && (
                <View style={tw`absolute bottom-8 left-6 right-6 bg-[${CARD_COLOR}] rounded-2xl p-6 shadow-xl`}>
                    <View style={tw`flex-row justify-between items-center mb-4`}>
                        <View>
                            <Text style={tw`text-[${TEXT_SECONDARY}] text-sm`}>বর্তমান দিক</Text>
                            <Text style={tw`text-[${TEXT_PRIMARY}] text-xl font-bold`}>
                                {qiblaDirection.toFixed(1)}°
                            </Text>
                        </View>
                        <View style={tw`items-end`}>
                            <Text style={tw`text-[${TEXT_SECONDARY}] text-sm`}>মিলকরণ</Text>
                            <Text style={[tw`text-lg font-bold`, { color: getAlignmentColor() }]}>
                                {getAlignmentText()}
                            </Text>
                        </View>
                    </View>

                    {/* নির্ভুলতা বার */}
                    <View style={tw`w-full bg-[${COMPASS_RING}] rounded-full h-2`}>
                        <View
                            style={[
                                tw`h-2 rounded-full`,
                                {
                                    width: `${alignmentAccuracy}%`,
                                    backgroundColor: getAlignmentColor()
                                }
                            ]}
                        />
                    </View>
                    <Text style={tw`text-[${TEXT_SECONDARY}] text-xs text-center mt-2`}>
                        {alignmentAccuracy.toFixed(0)}% নির্ভুলতা
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    compassRing: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        borderWidth: 8,
        position: 'absolute',
    },
    rotatingCompass: {
        width: width * 0.7,
        height: width * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compassInner: {
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    degreeMarker: {
        position: 'absolute',
        width: 2,
        height: 20,
        backgroundColor: '#475569',
        top: 0,
    },
    cardinalText: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    northText: {
        top: 20,
    },
    eastText: {
        right: 20,
    },
    southText: {
        bottom: 20,
    },
    westText: {
        left: 20,
    },
    qiblaIndicator: {
        position: 'absolute',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
        flexDirection: 'row',
    },
    indicatorLine: {
        width: 40,
        height: 3,
        marginLeft: 8,
    },
    centerPointer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default Qibla;