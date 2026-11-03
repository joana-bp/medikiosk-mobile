import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/auth';
import { Body, Card, Chips, ErrorText, Field, Screen, Title } from '../../src/components/ui';
import { Tiles } from '../../src/components/Readings';
import { fonts, useTheme } from '../../src/theme';

const pad = (n) => String(n).padStart(2, '0');
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return key(d); };

const RANGES = { 'All time': null, 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90 };

export default function History() {
  const { patient, getHistory } = useAuth();
  const { colors } = useTheme();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState('All time');
  const [kiosk, setKiosk] = useState('');
  const [day, setDay] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    try {
      setRows(await getHistory(patient.id));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [getHistory, patient.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const kiosks = useMemo(() => [...new Set((rows || []).map((r) => r.kioskName))], [rows]);
  const dayOk = /^\d{4}-\d{2}-\d{2}$/.test(day);

  const shown = useMemo(() => {
    let list = (rows || []).filter((r) => {
      const d = r.date.slice(0, 10); // "2026-11-03 04:15 AM" -> "2026-11-03"
      if (dayOk) return d === day;
      if (RANGES[range] && d < daysAgo(RANGES[range])) return false;
      return true;
    });
    if (kiosk) list = list.filter((r) => r.kioskName === kiosk);
    return newestFirst ? list : [...list].reverse();
  }, [rows, range, kiosk, day, dayOk, newestFirst]);

  const clear = () => { setRange('All time'); setKiosk(''); setDay(''); };
  const filtered = range !== 'All time' || kiosk || day;

  return (
    <Screen refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} style={{ gap: 14 }}>
      <Title>History</Title>
      <Card style={{ gap: 14 }}>
        <Chips label="When" options={Object.keys(RANGES)} value={dayOk ? '' : range} onChange={(v) => { setDay(''); setRange(v || 'All time'); }} />
        <Field label="Or pick one date (YYYY-MM-DD)" value={day} onChangeText={setDay} placeholder="2026-11-03" keyboardType="numbers-and-punctuation" error={day && !dayOk} />
        {kiosks.length > 1 && <Chips label="Kiosk" options={kiosks} value={kiosk} onChange={setKiosk} />}
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Body muted small>{rows ? `${shown.length} of ${rows.length} check-in${rows.length === 1 ? '' : 's'}` : 'Loading…'}</Body>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {filtered ? <Pressable onPress={clear} accessibilityRole="button"><Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted }}>Clear filters</Text></Pressable> : null}
          <Pressable onPress={() => setNewestFirst((v) => !v)} accessibilityRole="button">
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.teal }}>{newestFirst ? 'Newest first ↓' : 'Oldest first ↑'}</Text>
          </Pressable>
        </View>
      </View>

      <ErrorText>{error}</ErrorText>
      {rows && shown.length === 0 && !error && (
        <Card><Body muted>{rows.length === 0 ? 'No check-ins yet. They will appear here after you use a MediKiosk.' : 'No check-ins match these filters.'}</Body></Card>
      )}

      {shown.map((h) => (
        <Card key={h.id} style={{ padding: 0 }}>
          <Pressable onPress={() => setOpen(open === h.id ? null : h.id)} accessibilityRole="button" style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink }}>{h.date}</Text>
              <Body muted small>{h.kioskName}</Body>
            </View>
            <Text style={{ color: colors.muted, fontSize: 18 }}>{open === h.id ? '▴' : '▾'}</Text>
          </Pressable>
          {open === h.id && <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}><Tiles readings={h.readings} /></View>}
        </Card>
      ))}

      <Body muted small>These numbers are for your information only. Please ask the clinic staff what they mean for you.</Body>
    </Screen>
  );
}
