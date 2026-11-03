import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../src/auth';
import { Body, Button, Card, ErrorText, Screen, Title } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

/** The permanent QR the kiosk camera reads to sign the patient in. Always drawn dark-on-white so it scans in dark mode too. */
export default function MyQr() {
  const { patient, getQrText } = useAuth();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const exportRef = useRef(null); // a hidden, larger copy of the code used for the saved image

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      setText(await getQrText());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [getQrText]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // PNG (base64) of the large hidden QR
  const toBase64 = () => new Promise((resolve, reject) => {
    if (!exportRef.current) return reject(new Error('The code is not ready yet.'));
    exportRef.current.toDataURL((b64) => resolve(b64));
  });

  async function saveImage() {
    setError('');
    setNote('');
    setSaving(true);
    try {
      const b64 = await toBase64();
      const name = `${patient.id}-kiosk-qr.png`;
      if (Platform.OS === 'web') {
        const a = document.createElement('a');
        a.href = `data:image/png;base64,${b64}`;
        a.download = name;
        a.click();
        setNote('Image saved.');
      } else {
        const file = new File(Paths.cache, name);
        file.create({ overwrite: true });
        file.write(b64, { encoding: 'base64' });
        if (!(await Sharing.isAvailableAsync())) throw new Error('Saving images is not available on this phone.');
        // the phone's share sheet lets the person pick "Save image" / "Save to Photos" / "Save to Files"
        await Sharing.shareAsync(file.uri, { mimeType: 'image/png', dialogTitle: 'Save my MediKiosk QR code', UTI: 'public.png' });
      }
    } catch (e) {
      setError(e.message || 'Could not save the image.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen style={{ gap: 16 }}>
      <Title>My QR code</Title>
      <Body muted>Show this to the camera on a MediKiosk to sign in.</Body>
      <Card style={{ alignItems: 'center', gap: 14, paddingVertical: 24 }}>
        <View style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 16, minHeight: 240, minWidth: 240, alignItems: 'center', justifyContent: 'center' }}>
          {text ? <QRCode value={text} size={208} color="#0d2f38" backgroundColor="#ffffff" ecl="M" /> : busy ? <ActivityIndicator color={colors.teal} /> : null}
        </View>
        <Body style={{ textAlign: 'center' }}>{patient.fullName}</Body>
        <Body muted small>{patient.id}</Body>
      </Card>
      {text ? <Button title="Save as image" variant="secondary" onPress={saveImage} loading={saving} /> : null}
      {note ? <Body small style={{ color: colors.ok }}>{note}</Body> : null}
      <ErrorText>{error}</ErrorText>
      {error && !text ? <Button title="Try again" variant="secondary" onPress={load} /> : null}
      <Body muted small>Keep it private, like a password. If you lose it or share it by mistake, ask the clinic for a new one.</Body>
      {/* never shown: a 768 px copy with a white border, so the saved picture is sharp and scans easily */}
      {text ? (
        <View style={{ position: 'absolute', left: -2000, top: 0, opacity: 0 }} pointerEvents="none">
          <QRCode value={text} size={768} quietZone={48} color="#0d2f38" backgroundColor="#ffffff" ecl="M" getRef={(c) => { exportRef.current = c; }} />
        </View>
      ) : null}
    </Screen>
  );
}