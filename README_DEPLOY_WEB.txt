# PARADISE on Earth — Web Deployment Guide

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- A GitHub account (free)
- 10 minutes

---

## Step 1 — Run Locally First

```bash
cd paradise
npm install
npm start
# Opens at http://localhost:3000
```

---

## Option A — Deploy to Vercel (Recommended · Free)

Vercel is the fastest and most reliable option for React apps.

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/paradise-nft.git
   git push -u origin main
   ```

2. Go to https://vercel.com → Sign up with GitHub

3. Click **Add New Project** → Import your GitHub repo

4. Leave all settings as default → Click **Deploy**

5. Your site is live at `https://your-project.vercel.app` in ~60 seconds

6. **Custom domain**: In Vercel → Settings → Domains → Add `paradiseonearth.io`

---

## Option B — Deploy to Netlify (Free)

1. Build the app:
   ```bash
   npm run build
   ```

2. Go to https://netlify.com → Sign up

3. Drag and drop the `/build` folder onto the Netlify dashboard

4. Done — live in seconds at a `.netlify.app` URL

5. **Custom domain**: Site Settings → Domain Management → Add custom domain

---

## Option C — Deploy to Firebase Hosting (Google · Free tier)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select: build folder, SPA: yes, overwrite index.html: no
npm run build
firebase deploy
```

---

## Environment Variables

Create a `.env` file in the project root (never commit this):

```
REACT_APP_OPENSEA_API_KEY=your_opensea_key
REACT_APP_PRIVY_APP_ID=your_privy_app_id
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
REACT_APP_MOMO_SUBSCRIPTION_KEY=your_momo_key
```

In Vercel/Netlify, add these under **Project Settings → Environment Variables**.

---

## Custom Domain Setup

1. Buy a domain at https://namecheap.com or https://porkbun.com (~$10/year)
2. In your DNS provider, add:
   - `A` record → Vercel/Netlify IP (shown in their dashboard)
   - `CNAME` record → `www` → your vercel/netlify URL
3. SSL is automatic (free) on Vercel and Netlify

---

## Performance Checklist Before Going Live

- [ ] Add real favicon files to `/public` (favicon.ico, favicon-32x32.png, apple-touch-icon.png)
- [ ] Create `/public/og-image.png` (1200×630px) for social sharing
- [ ] Create `/public/manifest.json` for PWA support
- [ ] Set real `REACT_APP_*` environment variables
- [ ] Update `og:url` and `canonical` in `index.html` to your real domain
- [ ] Test on mobile (Chrome DevTools → Toggle device toolbar)

---

## Estimated Costs (going live)

| Service         | Cost      | What for                     |
|-----------------|-----------|------------------------------|
| Vercel          | Free      | Hosting                      |
| Domain name     | ~$10/yr   | paradiseonearth.io           |
| OpenSea API     | Free      | NFT data fetching            |
| Firebase        | Free tier | Auth + database (up to 50k users) |
| Privy.io        | Free tier | Embedded wallets (up to 1k MAU) |
| MTN MoMo API    | Free      | Payment processing           |

