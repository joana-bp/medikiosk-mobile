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

    // Sign-in can take a second step. Returns what to do next:
    //   { step: 'done' }                      signed in
    //   { step: 'code', mfaToken }            ask for the authenticator / recovery code
    //   { step: 'setup', setupToken }         the clinic requires two-step sign-in: set it up first
    async signIn(email, password) {
      const d = await api('/api/patient/login', { method: 'POST', auth: false, body: { email: email.trim(), password } });
      if (d.mfaRequired) return { step: 'code', mfaToken: d.mfaToken };
      if (d.mfaSetupRequired) return { step: 'setup', setupToken: d.setupToken };
      await save({ token: d.token, patient: d.patient });
      return { step: 'done' };
    },
    async signInWithCode(mfaToken, code) {
      const d = await api('/api/patient/login/mfa', { method: 'POST', auth: false, body: { mfaToken, code: code.trim() } });
      await save({ token: d.token, patient: d.patient });
    },
    // Emailed one-time code (only when the clinic has turned that on)
    emailCode: (mfaToken) => api('/api/patient/login/mfa/email', { method: 'POST', auth: false, body: { mfaToken } }),
    // Saves a finished sign-in ({ token, patient }), e.g. after setting up two-step sign-in
    commitSession: (d) => save({ token: d.token, patient: d.patient }),

    // ---- two-step sign-in settings. Pass `token` while still signing in (setup token); omit it when already signed in.
    mfaStart: (token) => api('/api/mfa/setup', { method: 'POST', token }),
    mfaFinish: (code, token) => api('/api/mfa/enable', { method: 'POST', token, body: { code: code.trim() } }), // { token, patient, recoveryCodes }
    async mfaDisable(password, code) {
      const d = await api('/api/mfa/disable', { method: 'POST', body: { password, code: code.trim() } });
      const patient = await api('/api/patient/me', { token: d.token }); // turning it off ends the old session; use the new token
      await save({ token: d.token, patient });
    },
    newRecoveryCodes: async (code) => (await api('/api/mfa/recovery-codes/regenerate', { method: 'POST', body: { code: code.trim() } })).recoveryCodes,
    async signUp(f) {
      const d = await api('/api/patient/signup', {
        method: 'POST', auth: false,
        body: {
          firstName: f.firstName.trim(), middleName: (f.middleName || '').trim(), lastName: f.lastName.trim(),
          address: (f.address || '').trim(), birthday: f.birthday || null, sex: f.sex || null, bloodType: f.bloodType || null,
          email: f.email.trim(), password: f.password,
        },
      });
      if (d.mfaSetupRequired) return { step: 'setup', setupToken: d.setupToken };
      await save({ token: d.token, patient: d.patient });
      return { step: 'done' };
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
