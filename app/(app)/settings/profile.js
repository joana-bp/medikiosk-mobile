import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../src/auth';
import { Body, Button, Card, Chips, ErrorText, Field, Screen, Title } from '../../../src/components/ui';
import { fonts, useTheme } from '../../../src/theme';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const pick = (p) => ({ firstName: p.firstName || '', middleName: p.middleName || '', lastName: p.lastName || '', address: p.address || '', birthday: p.birthday || '', sex: p.sex || '', bloodType: p.bloodType || '', email: p.email || '' });

function Row({ label, value }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>{label}</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, marginTop: 2 }}>{value || '—'}</Text>
    </View>
  );
}

export default function Profile() {
  const { patient, refresh, updateProfile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pick(patient));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  // always show what the server has
  useFocusEffect(useCallback(() => { refresh().catch(() => {}); }, [refresh]));

  const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`;

  async function save() {
    setError('');
    if (!draft.firstName || !draft.lastName || !draft.email) return setError('Name and email cannot be empty.');
    if (draft.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(draft.birthday)) return setError('Birthday should look like 1990-05-21.');
    setBusy(true);
    try {
      const body = { ...draft };
      if (!body.birthday) delete body.birthday;
      if (!body.sex) delete body.sex;
      if (!body.bloodType) delete body.bloodType;
      await updateProfile(body);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen style={{ gap: 16 }} padBottom={40}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={10} style={{ alignSelf: 'flex-start' }}>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.teal }}>← Settings</Text>
      </Pressable>
      <View style={{ alignItems: 'center', gap: 8, marginTop: 4 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: '#fff' }}>{initials}</Text>
        </View>
        <Title style={{ fontSize: 22 }}>{patient.fullName}</Title>
        <Body muted small>{patient.id}</Body>
      </View>

      {editing ? (
        <View style={{ gap: 14 }}>
          <Field label="First name" value={draft.firstName} onChangeText={set('firstName')} autoCapitalize="words" />
          <Field label="Middle name" value={draft.middleName} onChangeText={set('middleName')} autoCapitalize="words" />
          <Field label="Last name" value={draft.lastName} onChangeText={set('lastName')} autoCapitalize="words" />
          <Field label="Address" value={draft.address} onChangeText={set('address')} autoCapitalize="sentences" />
          <Field label="Birthday (YYYY-MM-DD)" value={draft.birthday} onChangeText={set('birthday')} keyboardType="numbers-and-punctuation" />
          <Chips label="Sex" options={['Male', 'Female', 'Other']} value={draft.sex} onChange={set('sex')} />
          <Chips label="Blood type" options={BLOOD_TYPES} value={draft.bloodType} onChange={set('bloodType')} />
          <Field label="Email" value={draft.email} onChangeText={set('email')} keyboardType="email-address" />
          <ErrorText>{error}</ErrorText>
          <Button title="Save changes" onPress={save} loading={busy} />
          <Button title="Cancel" variant="ghost" onPress={() => { setEditing(false); setError(''); }} />
        </View>
      ) : (
        <>
          <Card style={{ paddingVertical: 4 }}>
            <Row label="Email" value={patient.email} />
            <Row label="Birthday" value={patient.birthday ? `${patient.birthday}${patient.age != null ? ` (${patient.age} yrs)` : ''}` : ''} />
            <Row label="Sex" value={patient.sex} />
            <Row label="Blood type" value={patient.bloodType} />
            <Row label="Address" value={patient.address} />
          </Card>
          <Button title="Edit profile" variant="secondary" onPress={() => { setDraft(pick(patient)); setEditing(true); }} />
        </>
      )}
    </Screen>
  );
}
