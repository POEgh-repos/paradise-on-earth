# PARADISE on Earth — Code Guide

## File Structure

```
paradise/
├── public/
│   └── index.html          ← Title bar, meta tags, favicons, PWA config
├── src/
│   ├── tokens.js           ← Design system (colours, fonts, animations, shared components)
│   ├── GalaxyBackground.jsx← Animated canvas star field (zero dependencies)
│   ├── App.jsx             ← Main app: routing, all pages, global state
│   ├── AdminPanel.jsx      ← Admin dashboard: collections, NFTs, events, moderation
│   ├── ProfilePage.jsx     ← User profile settings: avatar, bio, appearance, logout
│   ├── SocialFeed.jsx      ← Feed page: post composer, post cards, @mentions, #hashtags
│   └── index.js            ← React entry point
└── package.json
```

---

## Core Concepts

### State lives in App.jsx
All global state — user, posts, collections, mod state — lives in `App.jsx`.
Child pages receive data and handlers as props. No external state library (Redux etc.)
is needed at this scale.

### Design tokens — tokens.js
All colours, fonts, easing curves, button variants, and shared components live in
`tokens.js`. When changing the look:
- Colours → edit `T` object at the top
- Animation easing → edit `T.ease`, `T.spring`, `T.smooth`
- Button styles → edit `variants` object inside `Btn`
- Global CSS / keyframes → edit `GLOBAL_CSS` string

### Page routing
There is no React Router. Routing is a single `page` state string in App.jsx.
To add a new page:
1. Create `MyPage.jsx`
2. Add `{page==="mypage" && <MyPage ... />}` in App.jsx render
3. Add `["mypage","Label"]` to the bottom nav array
4. Add `"mypage":"My Page"` to `pageMap`

### Lazy loading
Heavy pages (ProfilePage, SocialFeedPage, AdminPanel) are `React.lazy()` loaded.
They only load when first visited. This keeps initial load fast.

---

## Adding a New Collection (via Admin)

1. Sign in as admin (password: `admin123`)
2. Admin ⌘ → Collections tab → + New Collection
3. Fill in: name, creator, role, avatar symbol, accent colour
4. Go to NFTs tab → select the collection → + Add NFT
5. Fill in price, rarity, traits, perks, upload unlock content and media

To change the admin password, edit `doAdmin` in `AuthPage` inside `App.jsx`:
```js
if(adminPass === "YOUR_NEW_PASSWORD") onAdminAuth();
```

---

## Connecting Real Services

### 1. OpenSea (NFT Data)
```js
// In AdminPanel.jsx, replace fetchOSea() timeout with:
const res = await fetch(
  `https://api.opensea.io/api/v2/collection/${slug}/nfts`,
  { headers: { "X-API-KEY": process.env.REACT_APP_OPENSEA_API_KEY } }
);
const data = await res.json();
// Map data.nfts to the NFT shape in SEED_COLLECTIONS
```

### 2. Privy (Auto Wallet)
```bash
npm install @privy-io/react-auth
```
```jsx
// In index.js:
import { PrivyProvider } from "@privy-io/react-auth";
root.render(
  <PrivyProvider appId={process.env.REACT_APP_PRIVY_APP_ID}
    config={{ loginMethods:["google","apple"], defaultChain:"polygon" }}>
    <App />
  </PrivyProvider>
);
// In AuthPage, replace doAuth() with:
const { login } = usePrivy();
// After login, user.wallet is auto-assigned
```

### 3. MTN MoMo
Backend endpoint (Node.js/Express):
```js
app.post("/api/momo/pay", async (req, res) => {
  const { phone, amount, externalId } = req.body;
  // POST to https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay
  // On success webhook: transfer NFT to buyer wallet via Privy/Thirdweb
});
```
In NFTModal, replace the step="confirm" mock with a real fetch to this endpoint.

### 4. Firebase (Data Persistence)
```bash
npm install firebase
```
```js
// Replace SEED_POSTS/SEED_COLLECTIONS useState with Firestore reads:
import { collection, onSnapshot } from "firebase/firestore";
useEffect(() => {
  const unsub = onSnapshot(collection(db, "posts"), snap => {
    setPosts(snap.docs.map(d => ({id:d.id,...d.data()})));
  });
  return unsub;
}, []);
```

---

## Moderation System

| Action        | What it does                            | Where stored              |
|---------------|-----------------------------------------|---------------------------|
| Verify user   | Adds 👑 crown to their name everywhere  | `verifiedUsers` state     |
| Flag user     | Adds ❓❓❓ to their name               | `flaggedUsers` state      |
| Pin post      | Sorts post to top of feed               | `posts` array (pinned:true)|
| Block post    | Shows "removed by moderator" in feed    | `blockedPosts` Set        |
| Delete post   | Permanently removes from state          | `posts` array             |
| Warn user     | Sends alert (hook for notification API) | Not persisted (add Firebase)|

---

## Common Customisations

**Change brand name**: Search `PARADISE` across all files and replace

**Change gold colour**: In `tokens.js`, change `gold: "#c9a96e"` to any hex

**Add a new NFT rarity tier**: In `tokens.js` Tag component and NFTCard `rc` object

**Change admin password**: `App.jsx` → `AuthPage` → `doAdmin` function

**Add a new font**: Edit the Google Fonts URL in `GLOBAL_CSS` in `tokens.js`

**Disable galaxy background**: In `App.jsx`, remove `<GalaxyBackground />` from render

