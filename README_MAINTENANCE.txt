╔══════════════════════════════════════════════════════╗
║     PARADISE on Earth — Maintenance Guide            ║
╚══════════════════════════════════════════════════════╝
Version: 1.6.0 | Last updated: May 2026

SERVICE PROVIDERS
─────────────────
Hosting:      vercel.com            (Free hobby plan)
Database:     Firebase Firestore    (Spark plan — free)
Auth:         Firebase Auth         (Free)
Storage:      Firebase Storage      (Free tier: 1GB)
DNS/Domain:   namecheap.com         (if custom domain added)
Repo:         github.com/POEgh-repos/paradise-on-earth

FREE TIER LIMITS (Firebase Spark)
──────────────────────────────────
Firestore reads:    50,000/day
Firestore writes:   20,000/day
Firestore deletes:  20,000/day
Storage:            1 GB total
Auth:               10,000/month
Hosting:            10 GB transfer (Vercel free)

ACTION: Upgrade to Firebase Blaze (pay-as-you-go) when:
- Daily active users exceed ~200
- Posts/day exceed 500
- Media uploads are enabled

MONTHLY MAINTENANCE TASKS
──────────────────────────
1. Check Firebase console for quota warnings
2. Review flagged users in Admin → Moderation
3. Check Vercel deployment logs for errors
4. Test Google login on iPhone Safari
5. Verify Firestore rules haven't expired (test mode = 30 days)
6. Backup Firestore data (export to GCS in Firebase console)

FIRESTORE RULES — CRITICAL
───────────────────────────
Test mode rules expire after 30 days.
Go to Firebase → Firestore → Rules and set:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
    }
    // Posts — anyone reads, auth users write
    match /posts/{id} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.uid;
    }
    // Notifications — own only
    match /notifications/{uid}/items/{nid} {
      allow read, write: if request.auth.uid == uid;
    }
    // Collections — public read, admin write only
    match /collections/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Flagged users — admin only (for now open)
    match /flaggedUsers/{uid} {
      allow read, write: if request.auth != null;
    }
  }
}

SECURITY CHECKLIST
───────────────────
[ ] Never commit real API keys to public GitHub
    (Firebase keys are safe to expose — security is in Rules)
[ ] Admin password "admin123" — change before going public
    File: src/App.jsx → AuthPage → doAdmin()
[ ] Set proper Firestore Rules before launch (see above)
[ ] Remove node_modules from GitHub (add to .gitignore)
[ ] Review Firebase authorized domains list monthly

ADDING node_modules to .gitignore
───────────────────────────────────
Create file .gitignore in project root:
  node_modules/
  .env
  .env.local
  build/
  .DS_Store

BACKUPS
────────
Firebase Console → Firestore → Import/Export → Export to Cloud Storage
Do this monthly. Free GCS bucket is sufficient for early stage.

UPDATING THE SITE
──────────────────
1. Edit files locally in paradise folder
2. GitHub Desktop → see changes → commit → push
3. Vercel auto-deploys in ~60 seconds
4. Test on phone at paradise-on-earth.vercel.app

TROUBLESHOOTING
────────────────
Site not updating:
  → Check Vercel → Deployments tab for build errors
  → Look for red "X" on latest deployment

Google login not working:
  → Firebase → Authentication → Authorized domains
  → Make sure paradise-on-earth.vercel.app is listed

Firestore not loading data:
  → Firebase → Firestore → Rules → check they're not expired
  → Firebase → Usage tab → check quota not exceeded

Site looks broken on phone:
  → Hard refresh: hold reload button on Safari
  → Clear cache and website data in Safari settings

Firebase 400 error:
  → Check authDomain in firebase.js matches exactly:
    paradise-on-earth-db8a3.firebaseapp.com

SCALING PATH
─────────────
Stage 1 (0-500 users):  Current setup — free
Stage 2 (500-5K users): Upgrade Firebase to Blaze, ~$0-20/month
Stage 3 (5K+ users):    Add Redis cache, CDN for media,
                         consider Supabase or Planetscale for DB
Stage 4 (50K+ users):   Dedicated server, custom CDN, Firebase Functions

COST PROJECTIONS
─────────────────
0-500 users:   $0/month (all free tiers)
500-2K users:  $5-15/month (Firebase Blaze + Vercel Pro optional)
2K-10K users:  $20-80/month
10K+ users:    $100+/month → consider revenue model

CONTACT / ESCALATION
──────────────────────
Platform owner: POEgh-repos (GitHub)
Firebase:       console.firebase.google.com
Vercel:         vercel.com/support
GitHub:         github.com/support
