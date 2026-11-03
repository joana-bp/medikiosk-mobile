import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

const logo = require('../../assets/brand/logo-full.png');
const logoWhite = require('../../assets/brand/logo-full-white.png');

/**
 * Opening animation: the logo fades and settles in, holds a moment, then the whole
 * screen fades away to reveal the app. It matches the native splash (same logo, same
 * background) so the hand-off from the phone's own splash is seamless.
 */
export default function Splash({ ready, onDone }) {
  const { mode } = useTheme();
  const dark = mode === 'dark';
  const fade = useRef(new Animated.Value(0)).current;   // logo opacity
  const scale = useRef(new Animated.Value(0.9)).current;
  const out = useRef(new Animated.Value(1)).current;    // whole overlay opacity
  const [minShown, setMinShown] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start(() => setTimeout(() => setMinShown(true), 500)); // hold the logo for a beat
  }, [fade, scale]);

  // leave once the logo has been shown AND the app (fonts, saved sign-in) is ready
  useEffect(() => {
    if (!(minShown && ready)) return;
    Animated.timing(out, { toValue: 0, duration: 450, useNativeDriver: true }).start(onDone);
  }, [minShown, ready, out, onDone]);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: dark ? '#0b2a32' : '#eef5f6', opacity: out, alignItems: 'center', justifyContent: 'center' }]}>
      <Animated.Image source={dark ? logoWhite : logo} resizeMode="contain" accessibilityLabel="MediKiosk"
        style={{ width: 240, height: 75, opacity: fade, transform: [{ scale }] }} />
    </Animated.View>
  );
}
