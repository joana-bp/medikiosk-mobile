import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '../theme';

/** Page wrapper: background, safe-area padding, optional scrolling. */
export function Screen({ children, scroll = true, padBottom = 24, style, refreshing, onRefresh }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: padBottom };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: colors.bg }, pad, style]}>{children}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[pad, { flexGrow: 1 }, style]} keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.teal} /> : undefined}>
      {children}
    </ScrollView>
  );
}

export function Title({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[{ fontFamily: fonts.display, fontSize: 26, color: colors.ink, letterSpacing: -0.3 }, style]}>{children}</Text>;
}

export function Body({ children, muted, small, style, ...rest }) {
  const { colors } = useTheme();
  return <Text {...rest} style={[{ fontFamily: fonts.body, fontSize: small ? 12.5 : 15, lineHeight: small ? 18 : 22, color: muted ? colors.muted : colors.inkSoft }, style]}>{children}</Text>;
}

export function Card({ children, style }) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16 }, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const { colors } = useTheme();
  const v = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surfaceAlt, fg: colors.tealDeep, border: colors.surfaceAlt },
    ghost: { bg: 'transparent', fg: colors.tealDeep, border: colors.border },
    danger: { bg: colors.dangerBg, fg: colors.danger, border: colors.dangerBg },
  }[variant];
  const off = disabled || loading;
  return (
    <Pressable accessibilityRole="button" onPress={off ? undefined : onPress}
      style={({ pressed }) => [{ backgroundColor: v.bg, borderColor: v.border, borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.55 : pressed ? 0.85 : 1, minHeight: 50 }, style]}>
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: v.fg }}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, error, style, ...input }) {
  const { colors } = useTheme();
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.inkSoft }}>{label}</Text>
      <TextInput placeholderTextColor={colors.placeholder} autoCapitalize="none" {...input}
        style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink, backgroundColor: colors.surface, borderWidth: 1, borderColor: error ? colors.danger : colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }} />
    </View>
  );
}

/** Pick one option from a short list (sex, blood type). */
export function Chips({ label, options, value, onChange }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.inkSoft }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const on = value === o;
          return (
            <Pressable key={o} onPress={() => onChange(on ? '' : o)} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : colors.surface }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13.5, color: on ? colors.onPrimary : colors.inkSoft }}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ErrorText({ children }) {
  const { colors } = useTheme();
  if (!children) return null;
  return <Text accessibilityRole="alert" style={{ fontFamily: fonts.body, fontSize: 13.5, color: colors.danger, backgroundColor: colors.dangerBg, borderRadius: 10, padding: 10 }}>{children}</Text>;
}

export const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
