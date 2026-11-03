import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken, setUnauthorizedHandler } from './api';
import { storage } from './storage';

const KEY = 'mk.patient.session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null); // { token, patient }

  const save = useCallback(async (s) => {
    setToken(s?.token || null);
    setSession(s);
    if (s) await storage.set(KEY, JSON.stringify(s));
    else await storage.remove(KEY);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => save(null));
    (async () => {
      const raw = await storage.get(KEY);
      if (raw) {
        try {
          const s = JSON.parse(raw);
          setToken(s.token);
          setSession(s);
        } catch {
          await storage.remove(KEY);
        }
      }
      setReady(true);
    })();
  }, [save]);

  const value = useMemo(() => ({
    ready,
    patient: session?.patient || null,
    signedIn: !!session,

    async signIn(email, password) {
      const d = await api('/api/patient/login', { method: 'POST', auth: false, body: { email: email.trim(), password } });
      await save({ token: d.token, patient: d.patient });
    },
    async signUp(f) {
      const d = await api('/api/patient/signup', {
        method: 'POST', auth: false,
        body: {
          firstName: f.firstName.trim(), middleName: (f.middleName || '').trim(), lastName: f.lastName.trim(),
          address: (f.address || '').trim(), birthday: f.birthday || null, sex: f.sex || null, bloodType: f.bloodType || null,
          email: f.email.trim(), password: f.password,
        },
      });
      await save({ token: d.token, patient: d.patient });
    },
    async refresh() {
      const patient = await api('/api/patient/me');
      await save({ token: session.token, patient });
      return patient;
    },
    async updateProfile(fields) {
      const patient = await api('/api/patient/me', { method: 'PATCH', body: fields });
      await save({ token: session.token, patient });
      return patient;
    },
    changePassword: (currentPassword, newPassword) => api('/api/patient/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
    // The permanent QR text the kiosk reads: MEDIKIOSK:<token>
    getQrText: async () => `MEDIKIOSK:${(await api('/api/patient/me/qr-token')).qrToken}`,
    getHistory: (id) => api(`/api/vitals/history?patientId=${encodeURIComponent(id)}`),
    signOut: () => save(null),
  }), [ready, session, save]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
