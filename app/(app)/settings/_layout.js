import { Stack } from 'expo-router';

// Settings is its own little stack: the main list, then Profile on top of it.
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
