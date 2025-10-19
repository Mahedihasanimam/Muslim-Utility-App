import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top, paddingBottom: bottom, backgroundColor: "#0F172A" }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/firstOnboarding" />
        <Stack.Screen name="onboarding/secondOnboarding" />
        <Stack.Screen name="onboarding/thirdOnboarding" />
        <Stack.Screen name="auth/signIn" />
        <Stack.Screen name="auth/signUp" />
        <Stack.Screen name="auth/forgotPasswrod" />
        <Stack.Screen name="auth/otpVerify" />
        <Stack.Screen name="auth/CreateNewPassword" />


      </Stack>
    </SafeAreaView>
  );
}
