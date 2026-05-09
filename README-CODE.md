# PARADISE on Earth — Code Guide
## Developer Reference for Modification & Maintenance

---

## Project Structure

```
paradise/
├── public/
│   ├── index.html          Browser shell + meta tags + PWA
│   ├── manifest.json       PWA manifest
│   └── favicon.svg         Favicon (replace with your logo)
│
├── src/
│   ├── tokens.js           ★ Design system: all colours, fonts, animations, shared components
│   ├── App.jsx             ★ Main app: routing, global state, Nav, NFT card/modal, Explore, Creators, Wallet
│   ├── SocialFeed.jsx      Feed page + PostComposer + PostCard
│   ├── ProfilePage.jsx     User profile settings + AvatarDisplay component
│   ├── AdminPanel.jsx      Admin dashboard: collections, NFTs, events, moderation, OpenSea sync
│   ├── GalaxyBackground.jsx Canvas star field animation
│   └── index.js            React entry point
│
├── CHANGELOG.md            Full version history
├── README.txt              Quick start
├── README-DEPLOY.md        Web deployment guide
├── README-MOBILE.md        iOS/Android guide
├── README-CODE.md          ← This file
├── README-RESOURCES.md     Provider recommendations
└── package.json
```

---

## Architecture

### State Management
All app state lives in `App.jsx`. There is no Redux or Zustand — pure React `useState` and `useCallback`.
The state flows down as props. For a larger team, consider migrating to Zustand.

Key state:
```
collections  → Array of creator collections + their NFTs and events
posts        → Feed posts (seeded + user-created)
flaggedUsers → { username: { at: timestamp } }
verifiedUsers→ { username: boolean }
blockedPosts → Set<postId>
user         → null | { name, avatar, wallet, verified, flagged, profile: {...} }
isAdmin      → boolean
```

### Routing
No React Router — page routing uses a `page` state string and conditional rendering.
To add a new page:
1. Add a new string to `pageMap` in App.jsx
2. Add a new `{page==="newpage" && <NewPage />}` render line
3. Add a bottom tab button if needed

### Design System (tokens.js)
All colours, fonts, easing curves, shared components live in `tokens.js`.
**Always import from tokens.js — never hardcode colours.**

```javascript
import { T, Btn, Divider, Tag, Field, Input, Textarea, Select, Toast,
         VerifiedCrown, FlagBadge, GLOBAL_CSS } from "./tokens";
```

Key tokens:
```javascript
T.gold      // #c9a96e  — primary accent
T.white     // #f2ede7  — body text
T.muted     // #7a7690  — secondary text
T.surface   // glassmorphism background (light)
T.surfaceH  // glassmorphism background (heavy)
T.border    // rgba(255,255,255,0.09)
T.smooth    // cubic-bezier for transitions
T.ease      // cubic-bezier for animations
```

---

## How to Make Common Changes

### Change the admin password
In `App.jsx` → `AuthPage` function:
```javascript
const doAdmin = () => {
  if (adminPass === "YOUR_NEW_PASSWORD") onAdminAuth();
  // In production: verify against a backend/env variable
};
```
For production: use `process.env.REACT_APP_ADMIN_PASSWORD`

### Change the admin display name / username
In `App.jsx` at the top:
```javascript
export const ADMIN_PROFILE = {
  name: "YOUR_NAME",
  username: "your_username",
  // ...
};
```

And in `Nav`:
```javascript
{isAdmin ? <span className="god-text">YOUR_NAME</span> : ...}
@{isAdmin ? "your_username" : ...}
```

### Add a new page
1. Create `src/NewPage.jsx`
2. In `App.jsx`:
   ```javascript
   // Add to lazy imports
   const NewPage = lazy(() => import("./NewPage"));

   // Add to pageMap
   const pageMap = { ..., newpage: "New Page" };

   // Add to router
   {page === "newpage" && <NewPage />}

   // Add to bottom nav
   ["newpage", "◇", "New"]
   ```

### Add a new colour/token
In `tokens.js`:
```javascript
export const T = {
  // ... existing tokens
  newColor: "#your_hex",
};
```

### Change fonts
In `tokens.js`, update the Google Fonts import URL and `T.font`/`T.sans`/`T.mono`.

### Add a new NFT to a collection
In `App.jsx`, find `SEED_COLLECTIONS` and add to the `nfts` array. Or use the Admin Panel.

---

## Key Components Reference

### `Btn` (tokens.js)
```jsx
<Btn variant="gold" size="md" onClick={fn}>Label</Btn>
// variants: gold | outline | ghost | danger | verify | flag | block | pin | admin
// sizes: sm | md | lg
```

### `AvatarDisplay` (ProfilePage.jsx)
```jsx
<AvatarDisplay avatar={{ type:"symbol", value:"◆" }} size={40} />
<AvatarDisplay avatar={{ type:"photo", value:"data:image/..." }} size={40} />
```

### `NFTCard` (App.jsx — exported)
```jsx
<NFTCard nft={nftObject} collection={collectionObject} onClick={fn} owned={bool} />
```

### `VerifiedCrown` / `FlagBadge` (tokens.js)
```jsx
{user.verified && <VerifiedCrown />}
{user.flagged  && <FlagBadge at={user.flaggedAt} />}
```

---

## Performance Notes

- All page components are lazy-loaded (`React.lazy + Suspense`)
- Galaxy canvas uses `requestAnimationFrame` with cleanup
- Animations use `transform` and `opacity` only (GPU-accelerated — no layout thrash)
- `will-change: transform` applied to cards
- `useCallback` wraps all event handlers in App.jsx

### To improve further:
- Add `React.memo` to `NFTCard`, `PostCard`
- Virtualise the feed list with `react-window` for >100 posts
- Add image lazy loading to NFT card artwork
- Move SEED data to a JSON file imported dynamically

---

## Connecting Real APIs

### OpenSea (NFT data)
Replace the mock `setTimeout` in `AdminPanel.jsx → fetchOS()`:
```javascript
const res = await fetch(
  `https://api.opensea.io/api/v2/collection/${slug}/nfts`,
  { headers: { "x-api-key": process.env.REACT_APP_OPENSEA_API_KEY } }
);
const data = await res.json();
// Map data.nfts to your NFT schema
```

### Privy (Wallet creation on sign-in)
```javascript
import { usePrivy } from "@privy-io/react-auth";
const { login, user } = usePrivy();
// user.wallet.address → polygon address
```

### MTN MoMo
Your backend (Node.js/Express) should:
1. Receive POST with `{ momoNumber, amount, nftId }`
2. Call MTN Collections API: `POST /collection/v1_0/requesttopay`
3. Poll or receive webhook on payment confirmation
4. Transfer NFT to buyer's wallet via OpenSea or Polygon API
5. Return success to frontend

---

## Testing

No test suite is currently included. Recommended additions:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Key things to test:
- Admin auth flow
- Post creation and like toggle
- NFT modal open/close
- Profile save

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Parsing error: Unexpected token` | JSX syntax error | Check for extra `}` or `>` in JSX props |
| `Cannot read properties of null` | User is null when accessing `user.profile` | Use optional chaining: `user?.profile?.displayName` |
| Blank white screen | Build error or missing import | Check browser console for the specific error |
| Fonts not loading | Google Fonts URL incorrect | Check network tab — fonts should load from fonts.googleapis.com |
| Galaxy not showing | Canvas context error | Check GalaxyBackground.jsx `useEffect` cleanup |

---

## Git Workflow (Recommended)

```bash
# Feature branch
git checkout -b feature/my-change
# ... make changes ...
git add . && git commit -m "feat: description of change"
git push origin feature/my-change
# Open PR → review → merge to main → auto-deploys
```

**Branch naming:**
- `feature/` — new features
- `fix/` — bug fixes
- `style/` — UI-only changes
- `chore/` — dependencies, config

---

All changes should be logged in `CHANGELOG.md` with version, date and description.
