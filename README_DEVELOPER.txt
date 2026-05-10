╔══════════════════════════════════════════════════════╗
║      PARADISE on Earth — Developer Reference         ║
╚══════════════════════════════════════════════════════╝
Version: 1.6.0 | Stack: React 18 + Firebase + Vercel

FILE STRUCTURE
src/
├── index.js          React entry point
├── zodiac.js         12 zodiac signs with symbols + dates
├── firebase.js       Firebase init + all helpers
├── tokens.js         Design system: T tokens, GLOBAL_CSS, components
├── GalaxyBackground  Canvas2D star field with parallax + shooting stars
├── App.jsx           Router, state, all page components, Firebase hooks
├── SocialFeed.jsx    Feed: composer, post cards, stories, @mentions
├── ProfilePage.jsx   Profile settings: avatar, zodiac, bio, banner
└── AdminPanel.jsx    Admin: collections, NFTs, events, moderation

DESIGN TOKENS (T object in tokens.js)
T.bg         #06060e     Deep space background
T.gold       #c9a96e     Primary accent
T.white      #f2ede7     Warm white text
T.muted      #7a7690     Secondary text
T.green      #6aaa88     Success / verified
T.red        #c46a6a     Error / danger / flag
T.font       Cormorant Garamond — display serif
T.sans       Tenor Sans — body text
T.mono       DM Mono — labels, wallet addresses, prices
T.smooth     cubic-bezier(0.4,0,0.2,1)

SHARED COMPONENTS (all exported from tokens.js)
<Btn>              variant: gold|outline|ghost|danger|verify|flag|block|pin|admin
<Divider>          1px separator
<Tag>              Pill label with custom color
<Input>            Styled input with gold focus state
<Textarea>         Styled multiline input
<Select>           Dark-themed dropdown
<Field>            Label + input + hint wrapper
<Toast>            Fixed bottom notification (success/error)
<VerifiedCrown>    Animated 👑 for verified users
<FlagBadge>        Animated ❓❓❓ for flagged users
<AnimatedAvatar>   Photo ↔ zodiac cross-fade every 3s

FIREBASE HELPERS (firebase.js)
Auth:
  signInWithGoogle()           Redirect (mobile) or popup (desktop)
  getGoogleRedirect()          Handle redirect result on page load
  listenAuth(callback)         onAuthStateChanged wrapper
  logOut()                     Signs out

Users:
  createUserProfile(uid,data)  Create /users/{uid} if not exists, returns data
  getUserProfile(uid)          Read profile from Firestore
  updateUserProfile(uid,data)  Update profile fields

Posts:
  createPost(data)             Add to /posts
  subscribeToPosts(cb)         Real-time listener, ordered by createdAt desc
  likePost(postId, uid)        Toggle like with increment/arrayUnion
  setPinned(id, val)           Pin/unpin a post
  setBlocked(id, val)          Block/unblock a post
  deletePost(id)               Delete a post

Notifications:
  createNotification(toUid, data)        Add to /notifications/{uid}/items
  subscribeToNotifications(uid, cb)      Real-time listener for user notifs
  markNotifRead(uid, nid)               Mark one notification as read

Collections:
  subscribeToCollections(cb)   Real-time listener on /collections
  saveCollection(data)         Create or update a collection

Media:
  uploadMedia(file, path)      Upload to Firebase Storage → returns URL

Moderation:
  flagUser(uid, data)          Create /flaggedUsers/{uid}
  unflagUser(uid)              Delete flagged record
  verifyUser(uid, val)         Set verified:true/false on user

LocalStorage:
  storage_ls.get(key, default) Safe get from localStorage
  storage_ls.set(key, value)   Safe set to localStorage

ROUTING
Single page state string. Persisted in localStorage (poe_page key).
Pages: feed | explore | creators | wallet | profile | auth | admin

Page transitions: opacity + translateY fade via PageTransition component.
Duration: 160ms out, 180ms in.

ADDING A PAGE
1. Create NewPage.jsx
2. lazy import in App.jsx
3. Add case: {page==="newpage" && <NewPage ... />}
4. Add to BOTTOM_NAV array
5. Add to pageLabels object

ADMIN ACCESS
Path: Sign In → Admin Access → password: admin123
Change in App.jsx → AuthPage → doAdmin():
  if (pass === "YOUR_PASSWORD") onAdminAuth();
Admin email (for auto-detect): set in listenAuth in App.jsx

FIRESTORE SCHEMA
/users/{uid}
  name, email, photoURL, wallet, verified, flagged
  ownedNFTs: string[]
  profile: { displayName, username, bio, location, website,
             avatar:{type,value}, zodiac:{sign,symbol},
             coverColor, banner:{data} }
  createdAt, updatedAt

/posts/{id}
  uid, user, username, avatar, zodiac, text, comment, media[]
  collectionId?, nftId?, action?
  likes, likedBy[], comments, reposts
  pinned, blocked, createdAt

/collections/{id}
  name, creator, role, avatar, accent, description
  followers, totalPieces, media?
  nfts: [{id,name,price,momoPrice,rarity,image,bg,likes,
          description,story,traits,perks,content,media}]
  events: [{id,title,date,location,desc}]

/notifications/{uid}/items/{nid}
  message, icon, read, timeLabel, createdAt

/flaggedUsers/{username}
  at, flaggedBy

POLYGON WALLET
Currently deterministic: "0x" + uid.slice(0,8).toUpperCase() + "…POE"
To use real Privy embedded wallets:
  npm install @privy-io/react-auth
  Wrap index.js in <PrivyProvider appId="...">
  Replace wallet assignment in createUserProfile()
  Use useWallets() hook to get real Polygon address

NOTIFICATIONS SYSTEM
Uses Firestore subcollections: /notifications/{uid}/items
createNotification() called whenever a relevant action happens.
subscribeToNotifications() = real-time bell update.
markNotifRead() marks individual items.
Bell pulses + shows unread count badge.

PAGE TRANSITIONS
PageTransition component wraps all pages.
On page change: old page fades out (160ms) → new page fades in (180ms).
Uses opacity + translateY — no layout thrashing.

SITE STORAGE (localStorage)
Last visited page persisted via storage_ls.
Key: "poe_page" — restored on next visit.

DEPLOYMENT
Push to GitHub main → Vercel auto-deploys (~60s)
Build: npm run build | Output: build/ | Node: 18+

KNOWN TODO
[ ] Apple Sign-in (needs Apple Developer account $99/yr)
[ ] MTN MoMo real backend (needs momodeveloper.mtn.com account)
[ ] Privy real wallet integration
[ ] Image upload to Firebase Storage (currently base64 in Firestore)
[ ] Following system data layer (UI exists, no backend)
[ ] Push notifications via FCM (web push)
