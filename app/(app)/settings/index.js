import { useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/auth';
import { API_URL } from '../../../src/api';
import { Body, Button, Card, Chips, ErrorText, Field, Screen, Title } from '../../../src/components/ui';
import { fonts, useTheme } from '../../../src/theme';

const LABEL = { system: 'Match phone', light: 'Light', dark: 'Dark' };
const VALUE = { 'Match phone': 'system', Light: 'light', Dark: 'dark' };

export default function Settings() {
  const { patient, signOut, changePassword } = useAuth();
  const { colors, pref, setPreference } = useTheme();
  const router = useRouter();
  const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`;
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [msg, setMsg] = useState({ ok: false, text: '' });
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg({ ok: false, text: '' });
    if (!cur || !next) return setMsg({ ok: false, text: 'Please fill in every box.' });
    if (next.length < 8) return setMsg({ ok: false, text: 'New password must be at least 8 characters.' });
    if (next !== again) return setMsg({ ok: false, text: 'New passwords do not match.' });
    setBusy(true);
    try {
      await changePassword(cur, next);
      setMsg({ ok: true, text: 'Password changed.' });
      setCur(''); setNext(''); setAgain('');
      setOpen(false);
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  }

  function confirmSignOut() {
    if (Platform.OS === 'web') return signOut();
    Alert.alert('Sign out?', 'You will need to sign in again to see your check-ins.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <Screen style={{ gap: 16 }} padBottom={40}>
      <Title>Settings</Title>

      <Pressable onPress={() => router.push('/settings/profile')} accessibilityRole="button" accessibilityLabel="Open my profile">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 18, color: '#fff' }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink }}>{patient.fullName}</Text>
            <Body muted small>My profile · {patient.id}</Body>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Card>
      </Pressable>

      <Card style={{ gap: 12 }}>
        <Chips label="Appearance" options={Object.values(LABEL)} value={LABEL[pref]} onChange={(v) => v && setPreference(VALUE[v])} />
      </Card>

      <Card style={{ gap: 12 }}>
        <Body style={{ fontWeight: '600' }}>Password</Body>
        {open ? (
          <View style={{ gap: 12 }}>
            <Field label="Current password" value={cur} onChangeText={setCur} secureTextEntry />
            <Field label="New password (8+ characters)" value={next} onChangeText={setNext} secureTextEntry />
            <Field label="Confirm new password" value={again} onChangeText={setAgain} secureTextEntry />
            {msg.text && !msg.ok ? <ErrorText>{msg.text}</ErrorText> : null}
            <Button title="Change password" onPress={submit} loading={busy} />
            <Button title="Cancel" variant="ghost" onPress={() => { setOpen(false); setMsg({ ok: false, text: '' }); }} />
          </View>
        ) : (
          <>
            {msg.ok && <Body small style={{ color: '#1b6b3a' }}>{msg.text}</Body>}
            <Button title="Change password" variant="secondary" onPress={() => setOpen(true)} />
          </>
        )}
      </Card>

      <Button title="Sign out" variant="danger" onPress={confirmSignOut} />
      <Body muted small style={{ textAlign: 'center' }}>MediKiosk · {API_URL}</Body>
    </Screen>
  );
}
