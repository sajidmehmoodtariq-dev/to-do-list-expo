// app/_layout.tsx
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";

export default function RootLayout() {
  const colorScheme = useColorScheme(); // Detects system theme (Dark/Light)

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "My To-Do App" }} />
      </Stack>
    </ThemeProvider>
  );
}