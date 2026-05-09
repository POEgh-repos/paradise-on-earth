# PARADISE on Earth — Mobile App Deployment

Deploy as a native mobile app for iOS and Android using Capacitor (free, official).

---

## Option A — Capacitor (Recommended)

Capacitor wraps your React app in a native shell. You get a real App Store / Play Store app.

### Prerequisites
- macOS with Xcode (for iOS)
- Android Studio (for Android, works on Mac/Windows/Linux)
- Apple Developer account ($99/year) for App Store
- Google Play Developer account ($25 one-time) for Play Store

### Step 1 — Install Capacitor

```bash
cd paradise
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "PARADISE on Earth" "io.paradiseonearth.app" --web-dir build
```

### Step 2 — Build the React app

```bash
npm run build
```

### Step 3 — Add platforms

```bash
npx cap add ios
npx cap add android
```

### Step 4 — Sync and open

```bash
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

### Step 5 — Configure app icon and splash

- Replace `ios/App/App/Assets.xcassets/AppIcon.appiconset/` with your icon PNGs
- Use https://appicon.co to generate all required sizes from one image
- For splash screen: `npm install @capacitor/splash-screen`

### Step 6 — Build for release

**iOS**: In Xcode → Product → Archive → Distribute App → App Store Connect
**Android**: In Android Studio → Build → Generate Signed Bundle/APK

---

## Option B — PWA (Progressive Web App) — Zero Cost, No App Store

A PWA makes the site installable directly from the browser. No App Store needed.
Users get an icon on their home screen and offline support.

### Enable PWA in 3 steps

1. Create `/public/manifest.json`:
```json
{
  "name": "PARADISE on Earth",
  "short_name": "PARADISE",
  "description": "African Creative NFT Market",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#06060e",
  "theme_color": "#06060e",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

2. Add service worker (already handled by Create React App):
```bash
# In src/index.js, change:
serviceWorkerRegistration.unregister();
# to:
serviceWorkerRegistration.register();
```

3. Deploy to HTTPS (Vercel/Netlify handle this automatically)

Users on iOS: Share → Add to Home Screen
Users on Android Chrome: Install app banner appears automatically

---

## Option C — React Native (Full Rebuild)

If you want truly native performance and deeper device access (camera, push notifications,
biometrics), a React Native rewrite is the path. This is a significant undertaking.

Recommended stack:
- **Expo** (https://expo.dev) — easiest React Native setup
- Reuse all business logic and state management from this app
- Rebuild UI components using React Native's StyleSheet (no web CSS)
- Timeline: 2–4 weeks for an experienced developer

---

## App Store Submission Checklist

### iOS (Apple)
- [ ] Apple Developer account ($99/year): https://developer.apple.com
- [ ] App icon: 1024×1024px PNG, no transparency, no rounded corners (Apple adds them)
- [ ] Screenshots: 6.7" (iPhone 14 Pro Max) and 12.9" (iPad) sizes
- [ ] Privacy policy URL (required for any app that handles user data)
- [ ] App category: "Shopping" or "Entertainment"
- [ ] Age rating: 4+ (no objectionable content)

### Android (Google Play)
- [ ] Google Play Developer account ($25 one-time): https://play.google.com/console
- [ ] App icon: 512×512px PNG
- [ ] Feature graphic: 1024×500px
- [ ] At least 2 screenshots
- [ ] Privacy policy URL
- [ ] Content rating: Complete questionnaire (likely "Everyone")

---

## Push Notifications (Optional Enhancement)

```bash
npm install @capacitor/push-notifications firebase
```

Use Firebase Cloud Messaging (FCM) — free up to 1 million messages/month.
Send notifications when: new NFT drops, someone likes a post, purchase confirmed.

