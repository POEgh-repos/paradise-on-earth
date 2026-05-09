╔══════════════════════════════════════════════════════════════════╗
║           PARADISE on Earth — African Creative NFT Market        ║
║                         README & SETUP GUIDE                     ║
╚══════════════════════════════════════════════════════════════════╝

Version: 1.0.0
Built with: React 18, Google Fonts (Cormorant Garamond + Tenor Sans)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  paradise/
  ├── src/
  │   ├── App.jsx          ← Main platform (Feed, Explore, Creators, Wallet, Auth)
  │   ├── AdminPanel.jsx   ← Full admin dashboard
  │   └── index.js         ← React entry point
  ├── public/
  │   └── index.html       ← HTML shell
  ├── package.json         ← Dependencies
  └── README.txt           ← This file


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  QUICK START (Local)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Requirements: Node.js 16+ (https://nodejs.org)

  1. Open terminal and navigate to the project folder:
       cd paradise

  2. Install dependencies:
       npm install

  3. Start the development server:
       npm start

  4. Open your browser:
       http://localhost:3000


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSTANT PREVIEW (No install needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Option A — CodeSandbox:
    1. Go to https://codesandbox.io
    2. Create new → React
    3. Replace App.js with App.jsx contents
    4. Add AdminPanel.jsx as a new file
    5. It runs instantly in the browser

  Option B — StackBlitz:
    1. Go to https://stackblitz.com
    2. New → React project
    3. Follow same file replacement steps


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Access:  Sign In page → "Admin Access →" → Enter password
  Default password: admin123
  (Change this in App.jsx → AuthPage → handleAdmin function)

  Admin can:
  ✓ Create & edit Collections (with creator info, accent colors)
  ✓ Add & edit NFTs per collection
  ✓ Set price (ETH), MoMo price (GHS), rarity, description
  ✓ Write artist story per NFT
  ✓ Add traits (key/value pairs)
  ✓ Add perks & privileges for holders
  ✓ Upload unlock content (audio, video, image, document)
  ✓ Add upcoming events per collection
  ✓ Sync collections from OpenSea (demo — needs real API key)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INTEGRATIONS TO ACTIVATE (for production)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. OPENSEA API (NFT fetching)
     ─────────────────────────
     • Sign up: https://docs.opensea.io/reference
     • Get API key from your OpenSea dashboard
     • Add to .env:  REACT_APP_OPENSEA_API_KEY=your_key
     • Endpoint: GET https://api.opensea.io/api/v2/collection/{slug}/nfts
     • Replace the mock setTimeout in AdminPanel.jsx → fetchFromOpenSea()

  2. PRIVY / THIRDWEB (Auto wallet creation)
     ─────────────────────────────────────────
     • Sign up: https://privy.io  OR  https://thirdweb.com
     • Install: npm install @privy-io/react-auth
     • Wrap App with <PrivyProvider appId="your_app_id">
     • Replace mock auth in AuthPage → handleAuth() with real Privy login
     • Users get a real Polygon/ETH wallet on Google/Apple sign-in

  3. MTN MOMO API (Payments)
     ────────────────────────
     • Sign up: https://momodeveloper.mtn.com
     • Get sandbox credentials, then production approval
     • Create a backend endpoint (Node.js/Express) that:
         a. Receives MoMo number + amount
         b. Calls MTN Collections API to request payment
         c. Receives webhook on payment confirmation
         d. Triggers NFT transfer to buyer's wallet
     • Replace mock confirm flow in NFTModal → step "confirm"

  4. FIREBASE / SUPABASE (User data persistence)
     ─────────────────────────────────────────────
     • For storing user profiles, owned NFTs, social feed data
     • Sign up: https://firebase.google.com
     • Install: npm install firebase
     • Replace in-memory state (collections, user.ownedNFTs) with Firestore

  5. DEPLOY
     ───────
     • Build: npm run build
     • Deploy to Vercel: https://vercel.com (free, connects to GitHub)
     • Or Netlify: https://netlify.com (drag and drop the /build folder)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PLATFORM FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Feed         Social posts of fans flexing acquired NFTs
  Explore      Browse all NFTs with rarity filter + search
  Creators     Creator profiles with bio, events, full collection
  Collection   Personal wallet showing owned NFTs + portfolio value
  NFT Modal    Detail view: story, traits, perks, events, MoMo buy
  Admin        Full content management dashboard


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Fonts:     Cormorant Garamond (display) + Tenor Sans (body) + DM Mono
  Theme:     Dark luxury — deep black, warm gold (#c9a96e), cream white
  Symbols:   ◈ ◉ ◆ ◇ △ ○ ♪ ∞ (typographic, not emoji — premium feel)
  Motion:    Fade-in reveals, hover lifts, cinematic loader


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Built with Claude (Anthropic) · claude.ai
  For questions, return to your Claude conversation.

══════════════════════════════════════════════════════════════════════
