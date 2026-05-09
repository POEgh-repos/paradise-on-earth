# PARADISE on Earth — Mobile App Deployment Guide
## Publishing to Apple App Store & Google Play Store

---

## Option A — Capacitor (Recommended — Reuse Your React Code)

Capacitor wraps your existing React web app into a native iOS/Android shell.
You keep one codebase and get a real native app.

### Prerequisites
- Mac with Xcode 15+ (required for iOS — Mac only)
- Android Studio (for Android — Mac or Windows)
- Apple Developer Account ($99/yr) → https://developer.apple.com
- Google Play Console Account ($25 one-time) → https://play.google.com/console

---

### Step 1 — Install Capacitor

```bash
cd paradise
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init "PARADISE on Earth" "io.paradiseonearth.app" --web-dir build
```

---

### Step 2 — Build the React App

```bash
npm run build
```

---

### Step 3 — Add Platforms

```bash
npx cap add ios
npx cap add android
```

---

### Step 4 — Sync Web Build to Native

Run this every time you update the React code:
```bash
npm run build && npx cap sync
```

---

### Step 5 — iOS (Xcode)

```bash
npx cap open ios
```

In Xcode:
1. Select your development team in Signing & Capabilities
2. Set Bundle Identifier: `io.paradiseonearth.app`
3. Set version and build number
4. Select "Any iOS Device" as target
5. Product → Archive → Distribute App → App Store Connect
6. Submit for review (Apple review takes 1-3 days)

**Required assets to prepare:**
- App icon: 1024×1024px PNG (no alpha, no rounded corners — Apple adds them)
- Screenshots: 6.7" iPhone, 6.5" iPhone, 12.9" iPad
- App description and keywords
- Privacy policy URL (required)

---

### Step 6 — Android (Android Studio)

```bash
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle/APK → Android App Bundle (.aab)
2. Create a new keystore (save the keystore file and password safely — you need it forever)
3. Upload `.aab` to Google Play Console
4. Fill in store listing: description, screenshots, content rating
5. Submit for review (Google review takes 1-3 days for new apps)

**Required assets:**
- Feature graphic: 1024×500px
- App icon: 512×512px PNG
- Screenshots: Phone, 7" tablet, 10" tablet

---

### Step 7 — Configure capacitor.config.ts

Create `capacitor.config.ts` in project root:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.paradiseonearth.app',
  appName: 'PARADISE on Earth',
  webDir: 'build',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'always',   // respects notch/dynamic island
    scrollEnabled: true,
  },
  android: {
    allowMixedContent: false,
  },
  server: {
    // Use this during development to point to your local dev server:
    // url: 'http://YOUR_LOCAL_IP:3000',
    // cleartext: true,
  },
};

export default config;
```

---

## Option B — React Native (Full Native Rebuild)

For a fully native experience (better performance, access to all native APIs),
consider rebuilding the UI with React Native. This is a larger effort.

Recommended stack:
- React Native (Expo) → https://expo.dev (easiest setup)
- React Navigation for routing
- React Native Reanimated for smooth animations
- NativeWind (Tailwind for React Native)

Expo publishes to both stores from one command:
```bash
npm install -g eas-cli
eas build --platform all
eas submit --platform all
```

Expo subscription: Free for development, $99/yr for production builds.

---

## Option C — PWA (Progressive Web App — No App Store)

The app already has a `manifest.json`. Add a service worker to enable
offline support and "Add to Home Screen" on both iOS and Android.

Install Workbox:
```bash
npx create-react-app . --template cra-template-pwa
```

Or add to existing:
```bash
npm install workbox-webpack-plugin
```

PWA advantages: No app store approval, instant updates, works on any device.
PWA disadvantages: No push notifications on iOS, limited native API access.

---

## Important Notes

1. **Privacy Policy** — Both stores require one. Use https://privacypolicygenerator.info
2. **Terms of Service** — Required for in-app purchases (MoMo payments)
3. **Age Rating** — Rate as 4+ (General) unless content requires otherwise
4. **App Store Review** — Apple is stricter. Ensure MoMo payment flows are clear
5. **Deep Links** — Configure universal links for sharing NFT pages

---

## Recommended Capacitor Plugins

```bash
# Status bar styling (matches dark theme)
npm install @capacitor/status-bar

# Haptic feedback for interactions
npm install @capacitor/haptics

# Share NFTs natively
npm install @capacitor/share

# Native browser for OAuth (Google/Apple sign-in)
npm install @capacitor/browser

# Push notifications (for MoMo payment confirmations)
npm install @capacitor/push-notifications
```

---

## Support
Return to your Claude conversation for help with any of these steps.
