# PARADISE on Earth — Resource Providers & Maintenance Guide

A practical guide to every service this app needs, with honest costs, setup links,
and advice from experience building Web3 + social platforms in Africa.

---

## 1. HOSTING — Where the site lives

### Vercel (Recommended)
- **URL**: https://vercel.com
- **Free tier**: Unlimited personal projects, 100GB bandwidth/month
- **Paid**: $20/month (Pro) — needed for team members or heavy traffic
- **Why**: Zero-config React deployment, automatic HTTPS, global CDN, instant rollbacks
- **Setup**: Connect GitHub → auto-deploys on every push to `main`

### Cloudflare Pages (Alternative)
- **URL**: https://pages.cloudflare.com
- **Free tier**: Unlimited sites, 500 builds/month
- **Advantage**: Cloudflare's global network is the fastest CDN in West Africa

### ⚠️ Avoid shared hosting (GoDaddy, Bluehost etc.) for React apps — they don't support SPAs properly.

---

## 2. DOMAIN NAME

### Namecheap (Recommended)
- **URL**: https://namecheap.com
- **Cost**: $8–15/year for .io, .com, .africa domains
- **.africa** domains are available and signal African identity: `paradise.africa`

### Porkbun (Cheapest)
- **URL**: https://porkbun.com
- Often the cheapest renewal prices

### ⚠️ Always buy your own domain. Never let a developer buy it on your behalf.

---

## 3. NFT DATA — OpenSea API

- **URL**: https://docs.opensea.io/reference
- **Cost**: Free (up to 4 requests/second on free tier)
- **Paid**: Contact OpenSea for higher rate limits
- **Setup**: Create account → Developer Dashboard → Generate API Key
- **Add to `.env`**: `REACT_APP_OPENSEA_API_KEY=your_key`

### Alternative: Alchemy NFT API
- **URL**: https://www.alchemy.com/nft
- **Why**: Better Africa latency, generous free tier (300M compute units/month)
- **Also supports**: Polygon, Ethereum, Base

---

## 4. WALLETS — Auto-assigning crypto wallets to users

### Privy (Recommended)
- **URL**: https://privy.io
- **Cost**: Free up to 1,000 Monthly Active Wallets; $0.05/wallet after
- **Why**: Simplest embedded wallet for Google/Apple sign-in → auto Polygon wallet
- **Supports**: Polygon, Ethereum, Base, Solana

### Thirdweb (Alternative)
- **URL**: https://thirdweb.com
- **Cost**: Free tier available; $0.02/transaction after
- **Why**: More features for NFT minting and smart contracts

### Dynamic.xyz
- **URL**: https://dynamic.xyz
- **Cost**: Free up to 1,000 MAU
- **Why**: Beautiful sign-in UX, supports social login + crypto wallets together

---

## 5. AUTHENTICATION

### Firebase Auth (Recommended for simplicity)
- **URL**: https://firebase.google.com
- **Cost**: Free up to 10,000 auth/month (Spark plan)
- **Supports**: Google, Apple, Email, Phone
- **Pair with**: Privy for wallet assignment after auth

### Privy (all-in-one)
Handles both auth AND wallet — reduces complexity. Best choice if you're starting fresh.

---

## 6. DATABASE — Storing posts, profiles, follows

### Firebase Firestore (Recommended)
- **URL**: https://firebase.google.com/products/firestore
- **Cost**: Free up to 1GB storage, 50K reads/day, 20K writes/day
- **Paid**: $0.06/100K reads, $0.18/100K writes
- **Why**: Real-time sync built in — perfect for social feeds

### Supabase (PostgreSQL alternative)
- **URL**: https://supabase.com
- **Cost**: Free 500MB database, 2GB bandwidth
- **Why**: Open source, SQL queries, good for complex filtering

### ⚠️ Do not use the browser's localStorage for production data — it disappears when the user clears their cache.

---

## 7. MEDIA STORAGE — User uploads, NFT media, profile photos

### Cloudinary (Recommended)
- **URL**: https://cloudinary.com
- **Cost**: Free 25GB storage, 25GB bandwidth/month
- **Why**: Auto-optimises images, serves WebP/AVIF, CDN included
- **Use for**: Profile photos, post images, collection cover media

### Firebase Storage
- **URL**: https://firebase.google.com/products/storage
- **Cost**: Free 5GB storage, 1GB/day download
- **Why**: Pairs naturally with Firebase Auth + Firestore

---

## 8. PAYMENTS — MTN MoMo

### MTN MoMo Developer API
- **URL**: https://momodeveloper.mtn.com
- **Cost**: Free sandbox; production requires MTN business approval
- **What you need**:
  1. Register at momodeveloper.mtn.com
  2. Subscribe to "Collections" product
  3. Get your Subscription Key (Ocp-Apim-Subscription-Key)
  4. Generate API User and API Key via Postman or code
  5. Apply for production access (requires business registration in Ghana/Nigeria/Ivory Coast etc.)
- **Timeline**: Sandbox in 1 day; production approval 1–4 weeks

### Important
MoMo payments must go through a **backend server** — never call MoMo directly
from the frontend (exposes your keys). Use Node.js/Express or Firebase Functions.

---

## 9. SMART CONTRACTS — Minting NFTs

### OpenSea (No-code minting)
- Mint directly on OpenSea Studio: https://opensea.io/studio
- No coding required for creators
- The admin fetches minted collections via OpenSea API into PARADISE

### Thirdweb (Code-based)
- **URL**: https://thirdweb.com/contracts
- Deploy ERC-721 contracts to Polygon with one click
- $0.02/transaction on Polygon (very cheap)

### Polygon Network (Recommended chain)
- Much cheaper gas fees than Ethereum mainnet
- Fast transactions (~2 seconds)
- Widely supported by OpenSea, Privy, Thirdweb

---

## 10. EMAIL — Transactional emails (purchase receipts, notifications)

### Resend (Recommended)
- **URL**: https://resend.com
- **Cost**: Free 3,000 emails/month
- **Why**: Developer-friendly, React Email templates

### SendGrid
- **URL**: https://sendgrid.com
- **Cost**: Free 100 emails/day

---

## MAINTENANCE ADVICE

### Weekly
- Check Vercel/Netlify deploy logs for any failed builds
- Review admin Moderation tab for flagged content
- Monitor Firebase/Supabase usage dashboard

### Monthly
- Update npm packages: `npm outdated` then `npm update`
- Check OpenSea API changelog for breaking changes
- Back up your Firestore data (export via Firebase console)
- Review MTN MoMo transaction logs for failed payments

### Before major updates
- Test locally with `npm start` first
- Deploy to a preview branch in Vercel before merging to main
- Keep a CHANGELOG.md (already included in this project)

### Security
- Never commit `.env` files to GitHub
- Rotate API keys every 6 months
- Enable 2FA on all service accounts (Vercel, Firebase, OpenSea)
- Add `Content-Security-Policy` headers in Vercel config for production

### Performance
- Keep images under 200KB (use Cloudinary's auto-compression)
- Lazy-load pages (already done with React.lazy in App.jsx)
- Enable Vercel Analytics (free) to monitor real user performance
- Test on low-end Android devices — your primary African audience uses them

### Backups
- Firestore: Schedule weekly exports to Cloud Storage (free)
- Code: GitHub is your backup — push every change
- Domain: Set to auto-renew; losing a domain is catastrophic

---

## ESTIMATED MONTHLY COSTS AT SCALE

| Users   | Hosting | Database | Storage | Auth/Wallets | Total    |
|---------|---------|----------|---------|--------------|----------|
| 0–1K    | Free    | Free     | Free    | Free         | ~$10/mo  |
| 1K–10K  | Free    | Free     | $5      | $50          | ~$55/mo  |
| 10K–50K | $20     | $25      | $20     | $250         | ~$315/mo |
| 50K+    | $50+    | $100+    | $50+    | Custom       | ~$500+/mo|

At 10K+ users, optimise wallet costs by batching wallet creation
and using Privy's volume pricing.

