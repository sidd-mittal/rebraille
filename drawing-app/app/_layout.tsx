import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
    screenOptions={{
      animation: "none"}}>
      <Stack.Screen name="login" options={{ title: "login" }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
    </Stack>
  );
}