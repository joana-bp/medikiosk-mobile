import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/auth';
import { AuthScreen, GlassCard, GradientButton, IconInput } from '../../src/components/auth';
import { ErrorText } from '../../src/components/ui';
import { fonts, useTheme } from '../../src/theme';

const logo = require('../../assets/brand/logo-full.png');
const logoWhite = require('../../assets/brand/logo-full-white.png');

export default function SignIn() {
  const { signIn } = useAuth();
  const { colors, mode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);

  async function submit() {
    setError('');
    if (!email || !password) return setError('Please enter your email and password.');
    setBusy(true);
    try {
      await signIn(email, password); // the router moves into the app once signed in
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <Image source={mode === 'dark' ? logoWhite : logo} style={{ width: 190, height: 52, marginBottom: 34 }} resizeMode="contain" accessibilityLabel="MediKiosk" />
        <Text style={{ fontFamily: fonts.display, fontSize: 34, color: colors.ink, letterSpacing: -0.4 }}>Welcome!</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14.5, color: colors.muted, marginTop: 6, textAlign: 'center' }}>Sign in to check your health logs and keep your kiosk QR code handy. </Text>
      </View>

      <GlassCard>
        <IconInput icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType="username" />
        <IconInput icon="lock-closed-outline" placeholder="Password" secure value={password} onChangeText={setPassword} autoComplete="current-password" textContentType="password" onSubmitEditing={submit} />
        <Pressable onPress={() => setHelp((h) => !h)} accessibilityRole="button" style={{ alignSelf: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted }}>Forgot password?</Text>
        </Pressable>
        {help && <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10 }}>Please ask the clinic staff to reset your password. They will give you a temporary one.</Text>}
        <ErrorText>{error}</ErrorText>
        <GradientButton title="Sign In" onPress={submit} loading={busy} />
      </GlassCard>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 26 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Don't have an account? </Text>
        <Link href="/sign-up" style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: colors.teal }}>Sign up</Link>
      </View>
    </AuthScreen>
  );
}
