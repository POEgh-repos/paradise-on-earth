# PARADISE on Earth — Web Deployment Guide

## Overview
PARADISE on Earth is a React single-page application (SPA).
This guide covers deploying it to production on the web.

---

## Prerequisites
- Node.js 18+ → https://nodejs.org
- Git → https://git-scm.com
- A domain name (recommended: Namecheap, Google Domains, or Cloudflare Registrar)

---

## 1. Build the App

```bash
cd paradise
npm install
npm run build
```

This creates a `/build` folder — everything you need to deploy.

---

## 2. Deploy Options (Recommended Platforms)

### Option A — Vercel (Best for React, Free Tier Available)
**URL:** https://vercel.com

1. Push your project to GitHub:
   ```bash
   git init && git add . && git commit -m "initial"
   git remote add origin https://github.com/YOU/paradise.git
   git push -u origin main
   ```
2. Go to https://vercel.com → New Project → Import from GitHub
3. Set framework preset: **Create React App**
4. Add environment variables (see Section 4 below)
5. Click Deploy — live in ~60 seconds
6. Connect your custom domain in Project Settings → Domains

**Cost:** Free for personal projects. Pro ($20/mo) for commercial use with custom domains.

---

### Option B — Netlify (Simple drag-and-drop)
**URL:** https://netlify.com

1. Run `npm run build`
2. Go to https://netlify.com → Sites → Drag & Drop `/build` folder
3. Or: Connect GitHub for auto-deploys on push
4. Add environment variables in Site Settings → Environment Variables
5. Connect custom domain in Domain Management

**Cost:** Free tier available. Pro ($19/mo) for commercial use.

---

### Option C — Cloudflare Pages (Best Performance, Free CDN)
**URL:** https://pages.cloudflare.com

1. Connect your GitHub repo
2. Build command: `npm run build`
3. Build output directory: `build`
4. Add environment variables in Settings → Environment Variables
5. Custom domain setup in Workers & Pages → Custom Domains

**Cost:** Free. Unlimited bandwidth. Global CDN included.

---

### Option D — AWS S3 + CloudFront (Enterprise Scale)
1. `npm run build`
2. Create S3 bucket → enable static website hosting
3. Upload `/build` contents to bucket
4. Create CloudFront distribution pointing to S3
5. Add SSL certificate via AWS Certificate Manager (free)
6. Point your domain via Route 53

**Cost:** ~$1-5/month for low traffic. Scales with usage.

---

## 3. Redirect Rules (Required for SPA Routing)

React Router needs all paths to redirect to `index.html`.

**Vercel** — create `vercel.json` in project root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** — create `public/_redirects`:
```
/* /index.html 200
```

**Cloudflare Pages** — create `public/_redirects`:
```
/* /index.html 200
```

**Nginx** — add to server block:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 4. Environment Variables

Create a `.env` file in the project root (never commit this):
```bash
# OpenSea API
REACT_APP_OPENSEA_API_KEY=your_opensea_api_key

# Privy (wallet creation)
REACT_APP_PRIVY_APP_ID=your_privy_app_id

# MTN MoMo
REACT_APP_MOMO_API_KEY=your_momo_api_key
REACT_APP_MOMO_ENV=production   # or sandbox

# Firebase (optional, for persistent data)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_APP_ID=...

# App
REACT_APP_ADMIN_PASSWORD=your_secure_admin_password
```

---

## 5. Custom Domain + SSL

All recommended platforms provide free SSL via Let's Encrypt automatically.

1. Buy domain (Cloudflare Registrar is cheapest: ~$9/yr for .io)
2. In your platform dashboard, add custom domain
3. Update DNS records as instructed (usually add CNAME or A record)
4. SSL certificate is provisioned automatically within minutes

---

## 6. Post-Deployment Checklist

- [ ] Site loads at custom domain with HTTPS
- [ ] All 5 pages navigate correctly (Feed, Explore, Creators, Collection, Profile)
- [ ] Galaxy background renders on desktop and mobile
- [ ] Sign In flow works
- [ ] Admin login works (password: set in env var)
- [ ] NFT modal opens and MoMo flow displays
- [ ] No console errors in browser DevTools
- [ ] Lighthouse score > 85 on Performance

---

## 7. Continuous Deployment

With Vercel or Netlify connected to GitHub:
- Every push to `main` auto-deploys to production
- Pull requests get preview URLs automatically
- Rollback to any previous deploy in one click

---

## Support
Anthropic Claude was used to build this app.
Return to your Claude conversation for any changes.
