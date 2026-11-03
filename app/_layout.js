import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../src/auth';
import { ThemeProvider, useTheme } from '../src/theme';
import Splash from '../src/components/Splash';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { ready, signedIn } = useAuth();
  const { colors } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const done = useCallback(() => setSplashDone(true), []);
  // Two groups of screens: signed-out (auth) and signed-in (app). Expo Router swaps them automatically.
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={colors.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={ready && !signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={ready && signedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      {!splashDone && <Splash ready={ready} onDone={done} />}
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Montserrat_600SemiBold, Montserrat_700Bold, Inter_400Regular, Inter_500Medium, Inter_700Bold });
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
