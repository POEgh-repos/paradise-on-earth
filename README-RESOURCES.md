# PARADISE on Earth — Resources, Providers & Maintenance Guide

---

## 1. Hosting & Deployment

### Recommendation: Cloudflare Pages + Cloudflare Registrar
**Why:** Best performance globally (CDN in 200+ cities), free bandwidth, DDoS protection included,
cheapest domain prices (~$9-12/yr for .io, .com), free SSL, unlimited deploys.

| Platform | Free Tier | Paid | Best For |
|----------|-----------|------|----------|
| Cloudflare Pages | ✓ Unlimited bandwidth | Free | Primary recommendation |
| Vercel | 100GB bandwidth | $20/mo Pro | Developer DX |
| Netlify | 100GB bandwidth | $19/mo Pro | Simple setup |
| AWS S3 + CloudFront | Pay-per-use | ~$5-20/mo | Enterprise |

**Steps:**
1. Register domain → https://cloudflare.com/products/registrar
2. Deploy → https://pages.cloudflare.com
3. Connect domain → automatic SSL

---

## 2. Authentication & Wallets

### Recommendation: Privy
**URL:** https://privy.io
**Why:** Purpose-built for Web3 + social login. One SDK handles Google, Apple, email, wallet connect.
Auto-creates Polygon/ETH wallets for social logins (embedded wallets).

```bash
npm install @privy-io/react-auth
```

**Pricing:** Free up to 1,000 monthly active users. Then $0.05/MAU.
At 10,000 users: ~$450/mo.

**Alternative: Thirdweb**
**URL:** https://thirdweb.com
More NFT-focused features, similar pricing. Good if you need deep NFT contract management.

**Setup steps:**
1. Create account at privy.io
2. Create app → copy App ID
3. Add `REACT_APP_PRIVY_APP_ID=your_id` to `.env`
4. Wrap `<App />` with `<PrivyProvider appId={...}>`
5. Replace mock auth in `AuthPage` with `const { login } = usePrivy()`

---

## 3. NFT Data

### Recommendation: OpenSea API
**URL:** https://docs.opensea.io/reference
**Why:** Largest NFT marketplace. Direct API to fetch your minted collections.

**Pricing:** Free for basic access (rate limited). Contact OpenSea for higher limits.

**Alternative: Alchemy NFT API**
**URL:** https://www.alchemy.com/nft
Better rate limits, free tier available. Good for querying wallet NFT holdings.

**Steps:**
1. Mint your collections on OpenSea (Polygon network — lowest fees)
2. Get API key from OpenSea developer portal
3. Fetch collection: `GET https://api.opensea.io/api/v2/collection/{slug}/nfts`
4. Replace mock `setTimeout` in `AdminPanel.jsx → fetchOS()`

---

## 4. Payments (MoMo)

### Recommendation: MTN MoMo API
**URL:** https://momodeveloper.mtn.com
**Why:** Most widely used mobile money in Ghana, Nigeria, and across West/Central Africa.

**Products needed:**
- **Collections API** — for receiving payments from users
- **Disbursements API** — for paying out to creators (optional)

**Steps:**
1. Register at momodeveloper.mtn.com
2. Subscribe to Collections product
3. Create API user and API key in sandbox
4. Test in sandbox environment
5. Submit for production approval (takes 5-15 business days)
6. Build backend endpoint (Node.js):
   - `POST /api/pay` → calls MTN `requesttopay`
   - Webhook endpoint → receives payment confirmation
   - On confirmation → transfer NFT to buyer's wallet

**Alternative: Flutterwave**
**URL:** https://flutterwave.com
Supports MoMo, card, bank transfer across 34 African countries. Simpler API.
Easier to get approved. Takes 1-3% per transaction.

**Flutterwave setup:**
```javascript
import { FlutterWaveButton } from "flutterwave-react-v3";
// Accepts MoMo, Visa, local bank transfer
```

---

## 5. Database & Backend

### Recommendation: Supabase (Free Tier Generous)
**URL:** https://supabase.com
**Why:** PostgreSQL-based, built-in auth, real-time subscriptions, file storage.
Free tier: 500MB database, 1GB file storage, 50,000 monthly active users.

What to store:
- User profiles (displayName, username, bio, avatar)
- Post data (text, media URLs, likes, comments)
- Owned NFTs per wallet
- Flagged/verified user statuses
- Pinned post IDs

**Alternative: Firebase (Google)**
**URL:** https://firebase.google.com
More documentation and examples. NoSQL (Firestore). Free tier: 1GB storage, 50K reads/day.

**Setup (Supabase):**
```bash
npm install @supabase/supabase-js
```
```javascript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Replace all useState with Supabase queries
```

---

## 6. File Storage (NFT Unlock Content)

### Recommendation: Cloudflare R2 (cheapest)
**URL:** https://cloudflare.com/developer-platform/r2
**Why:** Zero egress fees (unlike AWS S3 which charges for downloads). S3-compatible API.
**Cost:** Free up to 10GB/month. Then $0.015/GB stored.

**Alternative: Supabase Storage**
Included in your Supabase plan. Simple SDK. Good for moderate file sizes.

**For large media files (audio, video):**
Cloudflare Stream → video hosting with adaptive bitrate streaming.
$5/1,000 minutes stored + $1/1,000 minutes delivered.

---

## 7. Email & Notifications

### Recommendation: Resend (Developer-friendly)
**URL:** https://resend.com
**Why:** Simple API, generous free tier (3,000 emails/month free).
Use for: welcome emails, MoMo payment confirmations, new NFT alerts.

```bash
npm install resend
```

**Alternative: SendGrid**
More enterprise features. Free tier: 100 emails/day.

---

## 8. Analytics

### Recommendation: Plausible Analytics (Privacy-first)
**URL:** https://plausible.io
**Why:** GDPR compliant, no cookies, lightweight (<1KB script). Shows page views, countries, referrers.
**Cost:** $9/mo for up to 10K monthly pageviews.

**Alternative: Cloudflare Web Analytics**
Free. Basic metrics. No cookie banner needed.

**Avoid:** Google Analytics — requires cookie consent banner, heavy script, data shared with Google.

---

## 9. Monitoring & Error Tracking

### Recommendation: Sentry (Free tier available)
**URL:** https://sentry.io
**Why:** Catches JavaScript errors in production and sends you alerts.
**Cost:** Free for 5,000 errors/month.

```bash
npm install @sentry/react
```
```javascript
Sentry.init({ dsn: "YOUR_DSN" });
```

---

## 10. Blockchain & NFT Infrastructure

### Recommendation: Polygon (for minting)
**Why:** Low gas fees (~$0.001 per transaction vs $5-50 on Ethereum mainnet).
OpenSea supports Polygon. Your users pay in MoMo → backend converts to MATIC.

**Alchemy** (Polygon RPC provider) → https://www.alchemy.com
Free tier: 300M compute units/month. Use for reading blockchain data.

**Thirdweb SDK** → https://thirdweb.com
Handles NFT contract deployment, minting, and transfers with simple SDK.

---

## Monthly Cost Estimate

| Service | Free Tier | Est. Cost at 1K Users |
|---------|-----------|----------------------|
| Cloudflare Pages | Free | $0 |
| Domain (.io) | — | $1/mo |
| Privy (auth + wallets) | 1K MAU free | $0-50 |
| OpenSea API | Free | $0 |
| Supabase | 500MB free | $25/mo (Pro) |
| Cloudflare R2 (storage) | 10GB free | $0-5 |
| Resend (email) | 3K/mo free | $0 |
| Plausible (analytics) | — | $9/mo |
| Sentry (errors) | 5K/mo free | $0 |
| MTN MoMo | Rev share | 1-2% per tx |
| **Total** | | **~$35-90/mo** |

At 10K users: ~$200-400/mo depending on storage and transaction volume.

---

## Maintenance Checklist

### Weekly
- [ ] Check Sentry for any new errors
- [ ] Review MoMo transaction success rate
- [ ] Monitor Supabase storage usage

### Monthly
- [ ] Update npm dependencies: `npm update`
- [ ] Check for security advisories: `npm audit`
- [ ] Review user reports and flag queue in Admin Panel
- [ ] Back up Supabase database (automatic on Pro plan)

### Quarterly
- [ ] Renew domain if auto-renewal is off
- [ ] Review and rotate API keys (MoMo, OpenSea, Privy)
- [ ] Test sign-in flows end-to-end
- [ ] Review analytics — which pages get most traffic
- [ ] Update app store listings if you have mobile apps

---

## Security Advice

1. **Never commit `.env` files** to Git. Add `.env` to `.gitignore`.
2. **Rotate API keys** every 6 months or immediately if exposed.
3. **Admin password** should be strong (20+ chars) and stored in environment variable, not hardcoded.
4. **Rate limit your MoMo endpoint** — prevent abuse with express-rate-limit.
5. **Validate all user input** before storing to database.
6. **Use HTTPS everywhere** — all recommended platforms provide this automatically.
7. **Content Security Policy** — add CSP headers via Cloudflare to block XSS.
8. **Keep Privy/Thirdweb SDK updated** — security patches are critical for wallet code.

---

## Scaling Advice

When you reach 10K+ users:
- Move from Supabase free to Supabase Pro ($25/mo) for no pausing
- Enable Cloudflare's edge caching for OpenSea API responses
- Add CDN for NFT images (Cloudflare Images)
- Consider Redis for caching feed data (Upstash Redis — serverless, free tier)
- Add a search engine (Algolia) for NFT discovery — free up to 10K records

---

Built with Claude (Anthropic) · claude.ai
