import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/auth';
import { AuthScreen, GlassCard, GradientButton, IconInput } from '../../src/components/auth';
import { Body, Button, ErrorText } from '../../src/components/ui';
import { SetupFlow } from '../../src/components/TwoFactor';
import { fonts, useTheme } from '../../src/theme';

const logo = require('../../assets/brand/logo-full.png');
const logoWhite = require('../../assets/brand/logo-full-white.png');

export default function SignIn() {
  const { signIn, signInWithCode, emailCode, commitSession } = useAuth();
  const { colors, mode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);
  // sign-in can take a second step: { name: 'password' } -> { name: 'code', mfaToken } or { name: 'setup', setupToken }
  const [step, setStep] = useState({ name: 'password' });
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');

  async function submit() {
    setError('');
    if (!email || !password) return setError('Please enter your email and password.');
    setBusy(true);
    try {
      const r = await signIn(email, password); // when signed in, the router moves into the app by itself
      if (r.step === 'code') { setCode(''); setStep({ name: 'code', mfaToken: r.mfaToken }); }
      else if (r.step === 'setup') setStep({ name: 'setup', setupToken: r.setupToken });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    setError(''); setNote('');
    if (!code.trim()) return setError('Enter the code from your authenticator app.');
    setBusy(true);
    try {
      await signInWithCode(step.mfaToken, code);
    } catch (e) {
      setError(e.message);
      if (e.status === 401 && /expired/i.test(e.message)) backToPassword(); // the 5-minute step timed out
    } finally {
      setBusy(false);
    }
  }

  async function sendEmailCode() {
    setError(''); setNote('');
    try {
      await emailCode(step.mfaToken);
      setNote('We emailed you a 6-digit code. Type it above. It works once and expires in 10 minutes.');
    } catch (e) {
      setError(e.status === 404 ? 'Emailed codes are not available. Use your authenticator app or a recovery code.' : e.message);
    }
  }

  function backToPassword() { setStep({ name: 'password' }); setPassword(''); setCode(''); setError(''); setNote(''); }

  if (step.name === 'setup') {
    return (
      <AuthScreen>
        <GlassCard>
          <SetupFlow token={step.setupToken} onDone={commitSession} onCancel={backToPassword} />
        </GlassCard>
      </AuthScreen>
    );
  }

  if (step.name === 'code') {
    return (
      <AuthScreen>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink, letterSpacing: -0.4 }}>Two-step verification</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14.5, color: colors.muted, marginTop: 6, textAlign: 'center' }}>Open your authenticator app and enter the 6-digit code for MediKiosk.</Text>
        </View>
        <GlassCard>
          <IconInput icon="shield-checkmark-outline" placeholder="123456" value={code} onChangeText={setCode} autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={13} onSubmitEditing={submitCode} />
          <Body small muted>Lost your phone? Type one of your recovery codes here instead (like a1b2c3-d4e5f6).</Body>
          <ErrorText>{error}</ErrorText>
          {note ? <Body small style={{ color: colors.tealDeep }}>{note}</Body> : null}
          <GradientButton title="Verify" onPress={submitCode} loading={busy} />
          <Button title="Email me a code instead" variant="ghost" onPress={sendEmailCode} />
          <Button title="Back to sign in" variant="ghost" onPress={backToPassword} />
        </GlassCard>
      </AuthScreen>
    );
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
