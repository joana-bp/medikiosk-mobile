import { useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '../theme';

/** Same soft teal wash as the staff web sign-in: light gradient with two blurred teal glows. */
export function AuthBackground({ children }) {
  const { mode } = useTheme();
  const [box, setBox] = useState(() => { const w = Dimensions.get('screen'); return { width: w.width, height: w.height }; });
  const dark = mode === 'dark';
  const base = dark ? ['#0b2a32', '#0d3a45', '#0f4955'] : ['#f4fafb', '#e3f1f3', '#d5ebee'];
  const glow = dark ? '#2fa4b3' : '#1f8c99';
  const { width, height } = box;
  return (
    // the picture is painted behind everything and sized from the real container, so it always reaches the bottom edge
    <View style={{ flex: 1, backgroundColor: base[1] }} onLayout={(e) => setBox(e.nativeEvent.layout)}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={base} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={glow} stopOpacity={dark ? 0.35 : 0.34} />
              <Stop offset="1" stopColor={glow} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={width * 0.05} cy={height * 0.04} r={Math.max(width, 300) * 0.8} fill="url(#g)" />
          <Circle cx={width * 0.98} cy={height * 0.98} r={Math.max(width, 300) * 0.95} fill="url(#g)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

/** Scrolls on small phones and when the keyboard is up; content sits centred otherwise. */
export function AuthScreen({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <AuthBackground>
      <ThemeToggle top={insets.top + 10} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>
        {children}
      </ScrollView>
    </AuthBackground>
  );
}

/** Frosted-glass card. */
export function GlassCard({ children, style }) {
  const { mode } = useTheme();
  const dark = mode === 'dark';
  return (
    <View style={[{
      backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)', borderColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.9)',
      borderWidth: 1, borderRadius: 26, padding: 20, gap: 14,
    // No shadow/elevation on phones: on Android they paint a solid white box behind a see-through card.
    }, Platform.OS === 'web' ? { backdropFilter: 'blur(22px) saturate(140%)', boxShadow: '0 12px 24px rgba(15,73,85,0.14)' } : null, style]}>
      {children}
    </View>
  );
}

/** Input with a leading icon; `secure` adds the show/hide eye. */
export function IconInput({ icon, secure, style, ...input }) {
  const { colors, mode } = useTheme();
  const [hidden, setHidden] = useState(true);
  const dark = mode === 'dark';
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,0.18)' : colors.border, borderRadius: 14, paddingHorizontal: 14, minHeight: 52 }, style]}>
      <Ionicons name={icon} size={20} color={colors.muted} />
      <TextInput autoCapitalize="none" placeholderTextColor={colors.placeholder} secureTextEntry={secure && hidden} {...input}
        style={{ flex: 1, minWidth: 0, fontFamily: fonts.body, fontSize: 15, color: colors.ink, paddingVertical: 12, outlineStyle: 'none' }} />
      {secure && (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

/** Big gradient call-to-action, same teal as the web sign-in button. */
export function GradientButton({ title, onPress, loading, style }) {
  const { mode } = useTheme();
  const colors = mode === 'dark' ? ['#2fa4b3', '#4cb7c4'] : ['#1a5660', '#1f8c99'];
  return (
    <Pressable accessibilityRole="button" onPress={loading ? undefined : onPress} style={({ pressed }) => [{ opacity: loading ? 0.7 : pressed ? 0.88 : 1 }, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 16, minHeight: 54, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: mode === 'dark' ? '#06222a' : '#fff' }}>{loading ? 'Signing in…' : title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Small sun/moon button in the corner: switches between light and dark right on the sign-in screens. */
function ThemeToggle({ top }) {
  const { colors, mode, setPreference } = useTheme();
  const dark = mode === 'dark';
  return (
    <Pressable onPress={() => setPreference(dark ? 'light' : 'dark')} hitSlop={10} accessibilityRole="button" accessibilityLabel={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ position: 'absolute', right: 20, top, zIndex: 5, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.95)' }}>
      <Ionicons name={dark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.tealDeep} />
    </Pressable>
  );
}