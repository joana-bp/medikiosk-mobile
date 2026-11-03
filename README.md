# MediKiosk Mobile (patients)

React Native (JavaScript) with **Expo Router**. It is the patient side of MediKiosk and talks to the same FastAPI backend as the staff console.

## What a patient can do
- Sign in or create an account
- See their latest check-in, and browse all past check-ins in History with filters (readings only, never an urgency tier)
- Show their permanent QR code to a kiosk (`MEDIKIOSK:<token>`)
- View and edit their profile
- Change password, pick light/dark appearance, sign out

## Run it
```bash
npm install
cp .env.example .env     # then set EXPO_PUBLIC_API_URL (see below)
npx expo start           # scan the QR with Expo Go, or press a / i / w
```

`EXPO_PUBLIC_API_URL` must be an address the phone can reach:
| Where the app runs | Value |
|---|---|
| Android emulator | `http://10.0.2.2:8000` |
| iOS simulator | `http://localhost:8000` |
| Real phone (same Wi-Fi) | `http://<laptop LAN IP>:8000` (start the backend with `--host 0.0.0.0`) |
| Web preview (`npx expo start --web`) | `http://localhost:8000`, and add the web origin to the backend's `CORS_ORIGINS` |

## Layout (Expo Router)
```
app/
  _layout.js          fonts, theme, auth; swaps (auth) and (app) with Stack.Protected
  (auth)/index.js     sign in (the first screen)
  (auth)/sign-up.js
  (app)/_layout.js    bottom tabs
  (app)/index.js      Vitals (latest check-in)
  (app)/history.js    all check-ins, filter by date range, one date or kiosk
  (app)/qr.js         My QR
  (app)/settings/index.js    profile card, appearance, change password, sign out
  (app)/settings/profile.js  view / edit profile (opens from Settings)
src/                  api client, auth, theme, storage, shared components
```

The sign-in token is kept in the phone's secure storage (Keychain / Keystore).

## Notes
- Birthday is typed as `YYYY-MM-DD` (no date-picker dependency).
- Forgot-password is not built; the clinic resets it, as in the web version.
- The kiosk reads `MEDIKIOSK:` + token. The app builds that text itself from `/api/patient/me/qr-token`.

## App icon and splash
- `assets/icon.png` (1024, iOS and legacy Android), `android-icon-*.png` (adaptive icon: foreground, gradient background, monochrome), `splash-icon*.png` (native splash, light and dark), `favicon.png`.
- They are generated from the logo in `assets/brand/`. The logo mark is only ~230 px wide, so the big icon is slightly soft; if you have the logo as an SVG or a 1000 px+ PNG, replace the files in `assets/` and the icon gets sharper.
- App id is `ph.medikiosk.mobile` (change it in `app.json` before publishing).
- Opening animation: `src/components/Splash.js` (logo fades in, holds, fades into the sign-in screen).

## Build an APK
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview   # "preview" gives an installable .apk
```
Set `EXPO_PUBLIC_API_URL` to your deployed backend's address first (an installed APK cannot reach `localhost`).
