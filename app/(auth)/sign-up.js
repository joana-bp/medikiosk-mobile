import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth';
import { Body, Button, Chips, ErrorText, Field, Title } from '../../src/components/ui';
import { AuthScreen, GlassCard } from '../../src/components/auth';
import { SetupFlow } from '../../src/components/TwoFactor';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const blank = { lastName: '', firstName: '', middleName: '', address: '', birthday: '', sex: '', bloodType: '', email: '', password: '', confirm: '' };

export default function SignUp() {
  const router = useRouter();
  const { signUp, commitSession } = useAuth();
  const [setupToken, setSetupToken] = useState(null); // set when the clinic requires two-step sign-in from the start
  const [f, setF] = useState(blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    setError('');
    if (!f.lastName || !f.firstName || !f.email || !f.password) return setError('Please fill in your name, email and password.');
    if (f.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(f.birthday)) return setError('Birthday should look like 1990-05-21.');
    if (f.password.length < 8) return setError('Password must be at least 8 characters.');
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const r = await signUp(f); // when signed in, the router moves into the app by itself
      if (r.step === 'setup') setSetupToken(r.setupToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (setupToken) {
    return (
      <AuthScreen>
        <GlassCard>
          <Body muted>Your account is created. One more step: this clinic asks everyone to use two-step verification.</Body>
          <SetupFlow token={setupToken} onDone={commitSession} />
        </GlassCard>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <View style={{ marginBottom: 20, gap: 6 }}>
        <Title>Create your account</Title>
      <Body muted>Use the same name you give the clinic, so your check-ins match.</Body>
      </View>
      <GlassCard>
      <Field label="First name" value={f.firstName} onChangeText={set('firstName')} autoCapitalize="words" />
      <Field label="Middle name (optional)" value={f.middleName} onChangeText={set('middleName')} autoCapitalize="words" />
      <Field label="Last name" value={f.lastName} onChangeText={set('lastName')} autoCapitalize="words" />
      <Field label="Address (optional)" value={f.address} onChangeText={set('address')} autoCapitalize="sentences" />
      <Field label="Birthday (YYYY-MM-DD)" value={f.birthday} onChangeText={set('birthday')} keyboardType="numbers-and-punctuation" placeholder="1990-05-21" />
      <Chips label="Sex" options={['Male', 'Female', 'Other']} value={f.sex} onChange={set('sex')} />
      <Chips label="Blood type (optional)" options={BLOOD_TYPES} value={f.bloodType} onChange={set('bloodType')} />
      <Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoComplete="email" />
      <Field label="Password (8+ characters)" value={f.password} onChangeText={set('password')} secureTextEntry textContentType="newPassword" />
      <Field label="Confirm password" value={f.confirm} onChangeText={set('confirm')} secureTextEntry textContentType="newPassword" />
      <ErrorText>{error}</ErrorText>
      <Button title="Create account" onPress={submit} loading={busy} />
      <Button title="Back" variant="ghost" onPress={() => router.back()} />
      </GlassCard>
    </AuthScreen>
  );
}
