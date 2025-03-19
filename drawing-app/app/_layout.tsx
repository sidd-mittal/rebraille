import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            animation: "none",
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />
          <Stack.Screen name="home" options={{ title: "Home", headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
