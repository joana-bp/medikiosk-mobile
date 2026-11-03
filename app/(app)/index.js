import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/auth';
import { Body, Card, ErrorText, Screen, Title } from '../../src/components/ui';
import { Tiles } from '../../src/components/Readings';
import { fonts, useTheme } from '../../src/theme';

export default function Vitals() {
  const { patient, getHistory } = useAuth();
  const { colors } = useTheme();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setHistory(await getHistory(patient.id));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [getHistory, patient.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const latest = history?.[0];

  return (
    <Screen refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} style={{ gap: 16 }}>
      <View>
        <Body muted small>Hello,</Body>
        <Title>{patient.firstName}</Title>
      </View>
      <ErrorText>{error}</ErrorText>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink }}>Latest check-in</Text>
            <Body muted small>{latest ? `${latest.kioskName}` : history ? 'No check-ins yet' : 'Loading…'}</Body>
          </View>
          {latest && <Body muted small>{latest.date}</Body>}
        </View>
        {latest ? <Tiles readings={latest.readings} /> : history && <Body muted>When you check in at a MediKiosk, your readings will appear here.</Body>}
      </Card>

      {history && history.length > 1 && (
        <Link href="/history" style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: colors.teal, textAlign: 'center', paddingVertical: 4 }}>
          See all {history.length} check-ins in History →
        </Link>
      )}

      <Body muted small style={{ marginTop: 4 }}>
        These numbers are for your information only. Please ask the clinic staff what they mean for you.
      </Body>
    </Screen>
  );
}
