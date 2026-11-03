// Pieces of two-step sign-in used in more than one screen: linking the authenticator app, and showing the recovery codes.
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth';
import { Body, Button, ErrorText, Field } from './ui';
import { fonts, useTheme } from '../theme';

/** The 10 one-time recovery codes. Shown once, so the person must confirm they saved them. */
export function RecoveryCodes({ codes, onDone, doneTitle = 'Continue' }) {
  const { colors } = useTheme();
  const [saved, setSaved] = useState(false);

  const share = () => Share.share({ message: `MediKiosk recovery codes (each works once):\n\n${codes.join('\n')}` }).catch(() => {});

  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 18, color: colors.ink }}>Save your recovery codes</Text>
      <Body small muted>If you lose your phone, each code lets you sign in once. They are shown only now. Store them somewhere safe, not on this phone alone.</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 12, rowGap: 8 }}>
        {codes.map((c) => (
          <Text key={c} selectable style={{ width: '50%', fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.ink, letterSpacing: 0.4 }}>{c}</Text>
        ))}
      </View>
      <Button title="Copy / share codes" variant="secondary" onPress={share} />
      <Pressable onPress={() => setSaved((s) => !s)} accessibilityRole="checkbox" accessibilityState={{ checked: saved }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name={saved ? 'checkbox' : 'square-outline'} size={24} color={colors.teal} />
        <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>I have saved these codes somewhere safe.</Text>
      </Pressable>
      <Button title={doneTitle} onPress={onDone} disabled={!saved} />
    </View>
  );
}

/**
 * Links the authenticator app: shows a QR code (and the key to type in by hand), checks the first code, then shows the recovery codes.
 *   token       the setup token while signing in; leave out when already signed in (Settings)
 *   onEnabled   called right after the code is accepted with { token, patient, recoveryCodes } (Settings saves the new session here,
 *               because turning 2FA on ends the old one)
 *   onDone      called when the person has saved the recovery codes (sign-in saves the session here)
 */
export function SetupFlow({ token, onEnabled, onDone, onCancel }) {
  const { mfaStart, mfaFinish } = useAuth();
  const { colors } = useTheme();
  const [setup, setSetup] = useState(null); // { secret, otpauthUri }
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let off = false;
    mfaStart(token).then((s) => !off && setSetup(s)).catch((e) => !off && setError(e.message));
    return () => { off = true; };
    // only when the flow opens: mfaStart is a new function whenever the saved session changes, which must not ask for a second secret
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit() {
    setError('');
    if (!code.trim()) return setError('Enter the 6-digit code your app shows.');
    setBusy(true);
    try {
      const r = await mfaFinish(code, token);
      await onEnabled?.(r);
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (result) return <RecoveryCodes codes={result.recoveryCodes} onDone={() => onDone?.(result)} />;

  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 18, color: colors.ink }}>Set up two-step verification</Text>
      <Body small muted>1. In an authenticator app (Google Authenticator, Microsoft Authenticator, Authy), add an account by scanning this code. 2. Type the 6-digit code the app shows.</Body>
      <View style={{ alignSelf: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 14, minHeight: 184, minWidth: 184, alignItems: 'center', justifyContent: 'center' }}>
        {setup ? <QRCode value={setup.otpauthUri} size={160} color="#0d2f38" backgroundColor="#ffffff" ecl="M" /> : error ? null : <ActivityIndicator color={colors.teal} />}
      </View>
      {setup && <Body small muted>On this phone, or can&apos;t scan? Type this key into the app instead: <Text selectable style={{ fontFamily: fonts.bodyBold, color: colors.ink }}>{setup.secret}</Text></Body>}
      <Field label="Code from the app" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={7} placeholder="123456" autoComplete="one-time-code" />
      <ErrorText>{error}</ErrorText>
      <Button title="Turn on" onPress={submit} loading={busy} disabled={!setup} />
      {onCancel && <Button title="Cancel" variant="ghost" onPress={onCancel} />}
    </View>
  );
}
