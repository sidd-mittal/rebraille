import { Stack } from "expo-router";
// Define the Tab navigator


export default function RootLayout() {
  return (
    <Stack
    screenOptions={{
      animation: "none"}}>
      <Stack.Screen name="login" options={{ title: "login", headerShown: false}} />
      <Stack.Screen name="home" options={{ title: "Home", headerShown: false}} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
      <Stack.Screen
        name="tabs"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}