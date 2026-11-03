import { Text, View } from 'react-native';
import { fonts, useTheme } from '../theme';

// Shown exactly as measured. A patient never sees an urgency tier: that stays with the clinic staff.
export function tiles(r = {}) {
  const bp = r.bloodPressure;
  return [
    { label: 'Heart rate', value: r.heartRate?.value, unit: r.heartRate?.unit },
    { label: 'Blood pressure', value: bp ? `${bp.systolic}/${bp.diastolic}` : undefined, unit: bp?.unit },
    { label: 'Temperature', value: r.temperature?.value, unit: r.temperature?.unit },
    { label: 'SpO₂', value: r.spo2?.value, unit: r.spo2?.unit },
    { label: 'Respiration', value: r.respiration?.value, unit: r.respiration?.unit },
    { label: 'BMI', value: r.bmi?.value, unit: r.bmi?.unit },
  ];
}

export function Tiles({ readings }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {tiles(readings).map((t) => (
        <View key={t.label} style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surfaceAlt, borderRadius: 14, padding: 12 }}>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.muted }}>{t.label}</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 4 }}>
            {t.value ?? '—'} <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>{t.value != null ? t.unit : ''}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}
