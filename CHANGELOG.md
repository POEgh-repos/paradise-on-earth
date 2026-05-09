# PARADISE on Earth — Changelog

All modifications to the platform are documented here.
Format: Version · Date · Changes · Files Affected

---

## v1.0.0 — Initial Build
**Date:** 2026-04-28
**Status:** Baseline

### Added
- Full platform frontend: Feed, Explore, Creators, Collection, Auth pages
- Admin Panel with collection manager, NFT editor, event manager, OpenSea sync tab
- NFT detail modal with Story, Traits, Perks, Events tabs
- MoMo payment flow (3-step: enter number → pay → confirm to wallet)
- Google / Apple sign-in with auto Polygon wallet assignment
- Cinematic loader with PARADISE branding
- Bottom tab navigation
- Creator story bubbles on Feed
- Social feed with like / view / share actions
- Dark luxury design system (Cormorant Garamond + Tenor Sans + DM Mono)
- README.txt with full setup and integration guide

**Files:** `App.jsx`, `AdminPanel.jsx`, `index.js`, `public/index.html`, `package.json`, `README.txt`

---

## v1.1.0 — Typography & UI Readability Pass
**Date:** 2026-04-28
**Status:** Released

### Changed
- **Nav logo** — PARADISE wordmark increased from 18px/weight-300 to 22px/weight-700 for stronger presence
- **"on Earth" tagline** — increased from 10px to 12px, weight bumped to 600
- **Nav links** — font size up from 12px to 14px, weight set to 600, inactive color lightened from #5a5a5a to #aaa for readability
- **Page section headings** — size up from 13px/weight-400 to 15px/weight-700, color changed from muted to white
- **NFT card title** — size up from 17px/weight-400 to 19px/weight-700
- **NFT card creator label** — switched from DM Mono to Tenor Sans, size 11→12px, weight 600, color #aaa
- **Feed post username** — size 13→14px, weight 700
- **Feed post NFT name** — size 15→17px, weight 700
- **Feed post ETH price** — size 16→18px, weight 700
- **Feed post creator sub-label** — color lightened to #aaa, weight 600
- **Bottom tab labels** — switched from DM Mono to Tenor Sans, active weight 700
- **Creator story bubbles** — enforced explicit minWidth/minHeight:60px to guarantee perfect circles (borderRadius 50% now always renders round)
- **Creator bubble border** — increased from 1px to 2px, opacity boosted from 66 to 88 for better visibility
- **Creator bubble size** — 52×52 → 60×60px, font 22→24px
- **Creator name labels** — switched to Tenor Sans, size 9→11px, color #bbb, weight 600
- **Google Fonts import** — updated to load weights 400/600/700 (removed 300, added 700) for bold rendering

### Fixed
- Creator story bubbles rendering as ovals on some screen sizes (minWidth/minHeight constraint added)

**Files Modified:** `App.jsx`

---

---

## v1.2.0 — Profile Settings & Social Posting
**Date:** 2026-04-28
**Status:** Released

### Added

#### ProfilePage.jsx (new file)
- Full profile settings page: 3 tabs — Profile · Appearance · Account
- Display name, @username (live validation), bio (200 char), location, website
- Avatar Picker: symbol mode (17 typographic symbols) + photo upload mode
- Cover color selector: 8 presets + custom color picker
- Live profile preview card updates in real time as you type
- AvatarDisplay — exported shared component for consistent avatar rendering site-wide
- Account tab: connected provider, wallet address, danger zone

#### SocialFeed.jsx (new file)
- PostComposer: textarea with live @mention + #hashtag autocomplete dropdown
- Media upload: up to 4 images/videos, preview grid, individual remove
- SVG character counter ring (turns gold <100, red <50 chars)
- PostCard: rich text rendering (#tags gold, @mentions green), media grid, NFT preview card
- Inline comments with reply support and @mention/#hashtag in comments
- Like/comment/repost counters with toggle states
- Filter tabs: All · NFT Posts · Following
- Creator story bubbles preserved from v1.1.0

#### App.jsx
- Added Profile page routing + bottom nav tab
- Nav avatar is now clickable → navigates to profile
- Posts state with handlePost, handleLike, handleUpdateUser
- Replaced old FeedPage with SocialFeedPage

**Files Added:** ProfilePage.jsx, SocialFeed.jsx
**Files Modified:** App.jsx

---

## v1.2.1 — Hotfix: ProfilePage.jsx syntax error
**Date:** 2026-04-28
**Status:** Released

### Fixed
- `ProfilePage.jsx` line 189: extra closing brace `}}}` → `}}` on website span style attribute
- Caused `[eslint] Parsing error: Unexpected token (189:86)` — app would not compile

**Files Modified:** `ProfilePage.jsx`

---

## v1.3.0 — Galaxy Background · Professional Buttons · Verified Crowns · Admin Moderation
**Date:** 2026-04-30
**Status:** Released

### Added

#### GalaxyBackground.jsx (new file)
- Canvas-based animated star field with 4 parallax depth layers (614 stars total)
- 4 soft nebula wisps in deep purple, blue, amber and teal tones
- Per-star twinkle animation (sine wave, randomised speed & phase offset)
- Warm gold-tinted stars on brightest layers with radial glow halos
- 4-spike diffraction cross on the largest bright stars
- Slow continuous vertical star drift with wrap-around
- Rare probabilistic shooting star (linear gradient streak)
- Canvas auto-resizes on window resize and rebuilds star field
- Rendered as fixed full-viewport canvas, z-index 0, pointer-events none
- Used in: App background, Loader splash screen

#### Admin Identity
- Admin display name: bold glowing **GOD🤎** with `godGlow` CSS animation (gold text-shadow pulse)
- Admin username: `@humble_servant`
- Admin auto-verified (crown always shown)
- ADMIN_PROFILE constant exported from App.jsx
- Nav shows GOD🤎 in Cormorant Garamond italic gold when isAdmin=true

#### Verified Crown Badge
- `VerifiedCrown` component: 👑 with `crownGlow` CSS animation (drop-shadow pulse)
- Shown next to display name in: Nav, Feed posts, Wallet page
- Admins always verified; regular users verified by admin in Mod panel
- Pre-verified seed users: abena.k, ama.s

#### Flag Badge
- `FlagBadge` component: ❓❓❓ superscript with `flagPulse` CSS animation (scale + opacity)
- Shown as superscript on display name in Nav and feed posts
- Includes tooltip with flag timestamp on hover

#### AdminPanel — Moderation Tab (new tab: 🛡 Moderation)
- **Stats row**: Total Posts · Pinned · Flagged Users · Blocked Posts (colour-coded)
- **User Management table**: all unique users from feed with avatar, name, username
  - Verify/Unverify button (green) → adds/removes 👑 crown site-wide
  - Flag/Unflag button (amber) → adds/removes ❓❓❓ badge site-wide
  - Warn button → opens modal to send a typed warning message to user
  - Flagged timestamp shown under flagged users
- **Warn Modal**: textarea for reason, sends alert (hook for real notification system)
- **Post Moderation table** with filter tabs: All · Pinned · Flagged · Blocked
  - Each post shows: avatar, name, @username, content preview, engagement stats
  - Pin 📌 / Unpin button → post floats to top of feed with golden border + "PINNED" label
  - Block / Unblock → hides post from feed, shows "removed by moderator" placeholder
  - Delete → permanent removal with confirmation dialog
  - Pinned posts get gold border; blocked posts get red border in mod table

#### App.jsx — Moderation State
- `flaggedUsers` state: `{ username: { at: timestamp } }`
- `verifiedUsers` state: `{ username: boolean }`
- `blockedPosts` state: `Set<postId>`
- `handleBlockPost`, `handleFlagUser`, `handleVerify`, `handlePin`, `handleDeletePost`, `handleWarn` handlers
- `enrichedPosts`: posts mapped with live `blocked`, `verified`, `flagged`, `flaggedAt` fields
- Pinned posts sorted to top of feed
- All mod props passed to both SocialFeedPage and AdminPanel

#### SocialFeed.jsx — Post Display Updates
- PostCard shows 👑 crown next to verified users (animated)
- PostCard shows ❓❓❓ superscript next to flagged users (animated)
- Blocked posts render as slim "removed by moderator" placeholder row
- Pinned posts show 📌 "Pinned Post" label above header

### Changed

#### Buttons — Unified `Btn` component (App.jsx, AdminPanel.jsx)
- Replaced all ad-hoc button styles with a single `Btn` component
- Variants: `gold` · `outline` · `ghost` · `danger` · `mod` · `verify` · `flag` · `block` · `pin` · `admin`
- Sizes: `sm` (8/20px) · `md` (11/28px) · `lg` (14/40px) — all uniform
- Consistent: borderRadius 4, fontWeight 600, letterSpacing 2, uppercase, transition 0.2s
- Disabled state: opacity 0.38, cursor not-allowed
- Hover background swap via onMouseEnter/Leave (no CSS class conflicts)

#### Background
- App root now renders `<GalaxyBackground />` as first child (fixed, z-index 0)
- All content wrapped in `position:relative; z-index:1`
- Nav, bottom bar use `glass-h` (backdrop-filter blur 28px) for legibility over stars
- Cards use `glass` (backdrop-filter blur 20px)
- Background base colour changed from `#080808` to `#06060e` (deeper space tone)

**Files Added:** `GalaxyBackground.jsx`
**Files Modified:** `App.jsx`, `AdminPanel.jsx`, `SocialFeed.jsx`

---

## v1.4.0 — Polish, Optimisation & Documentation
**Date:** 2026-04-30
**Status:** Released

### UI & Animation
- All keyframe animations converted to GPU-only properties (transform + opacity only — no layout thrash)
- Added `translate3d()` to all movement animations for hardware acceleration
- Added `will-change: transform` to `.card-lift` class
- Button component adds `translateY(-1px)` on hover and snaps back on mousedown (tactile press feel)
- Page transition class `.page-in` — `pageIn` animation (fadeUp variant with 3D translate)
- Modal animation updated to `modalIn` — combines scale + translateY for fluid entrance
- `backdrop-filter: blur() saturate()` — added saturation to glass for richer depth
- All transition durations normalised to `0.18–0.34s` range using `T.smooth` cubic-bezier
- Loader uses `clamp()` for responsive font sizing
- `-webkit-font-smoothing: antialiased` + `text-rendering: optimizeLegibility` + `font-feature-settings: kern` for crisp font rendering on all platforms

### Typography & Readability
- Font weights updated: `Tenor Sans` now loads 400/600/700 (was 400/600)
- All field labels bumped to `fontWeight: 600`, `fontSize: 11`, improved letterSpacing
- Body text colour lightened: `#f0ece6` → `#f2ede7`
- Muted text lightened: `#6a6680` → `#7a7690` for better contrast on dark surfaces
- Nav links: inactive colour updated to `#c0bcd4` (much more readable vs previous `#aaa`)
- NFT card creator label: `#b0accc` (more visible against dark backgrounds)

### Responsive & Screen Sizing
- Added `env(safe-area-inset-top/bottom)` to body padding for notched phones (iPhone X+)
- Toast position uses `calc(70px + env(safe-area-inset-bottom))` to clear bottom nav on all devices
- Bottom nav padding uses `clamp()` for even tab spacing across screen sizes
- Admin tabs use `overflowX: auto` to scroll on small screens without breaking layout
- All grids use `minmax(min(100%, Xpx), 1fr)` for true single-column on mobile
- Added `hide-sm`, `stack-sm`, `full-sm`, `pad-sm` responsive utility classes
- `:focus-visible` styles added for keyboard accessibility

### Browser Title Bar
- `public/index.html` fully rebuilt with:
  - Full `<meta>` set: viewport, theme-color, color-scheme, description, keywords, author, robots
  - Open Graph tags (og:title, og:description, og:image, og:url, og:site_name)
  - Twitter Card tags (summary_large_image)
  - Apple PWA tags (mobile-web-app-capable, apple-mobile-web-app-status-bar-style)
  - PWA manifest link
  - Preconnect hints for Google Fonts
  - Full page title: "PARADISE on Earth — African Creative NFT Marketplace"
  - Native background color pre-render (no flash of white)
- `public/manifest.json` created — enables "Add to Home Screen" on mobile

### Admin — User Search & Creator Filters
- User Management search field was already implemented in v1.3.0 (`userSearch` state in ModerationTab)
- Collection Editor now shows a "Select verified creator" dropdown populated from `verifiedCreators` list
- `verifiedCreators` list is built from posts where `verifiedUsers[username]` is true
- When a verified creator is selected from dropdown, creator name and avatar auto-fill
- EventEditor has a Collection dropdown (links events to specific collections)
- All tabs use creator name filter via collection selector buttons

### Admin — Collection Unlock Media
- `CollectionEditor` includes a media upload field: "Collection Unlock Media"
- Accepts audio, video, image, PDF
- Stored as `{ name, type, data }` on the collection object
- Displayed in collection card as `🔓 filename.ext`
- This is the shared media all NFT holders of that collection can access

### Profile — Logout Button
- Account tab → Session section → "Sign Out" button (ghost variant)
- Calls `onLogout` prop → clears user state and isAdmin → redirects to feed → shows toast

### README Documentation (4 new files)
- **README-DEPLOY.md** — Complete web deployment guide for Vercel, Netlify, Cloudflare Pages, AWS
  - SPA redirect rules for each platform
  - Environment variables reference
  - Custom domain + SSL setup
  - Post-deployment checklist
- **README-MOBILE.md** — iOS and Android app guide
  - Option A: Capacitor (wrap existing React app) — full step-by-step
  - Option B: React Native (Expo) — full rebuild approach
  - Option C: PWA — manifest already in place
  - Recommended Capacitor plugins
  - App Store / Play Store asset requirements
- **README-CODE.md** — Developer reference
  - Project structure with annotations
  - Architecture decisions explained
  - How to add pages, components, routes
  - Key component API reference
  - How to connect real APIs (OpenSea, Privy, MoMo)
  - Common errors and fixes
  - Git workflow recommendations
- **README-RESOURCES.md** — Provider guide with costs and advice
  - Hosting: Cloudflare Pages (recommended) vs Vercel vs Netlify vs AWS
  - Auth+Wallets: Privy (recommended) vs Thirdweb
  - NFT Data: OpenSea API vs Alchemy
  - Payments: MTN MoMo vs Flutterwave
  - Database: Supabase (recommended) vs Firebase
  - Storage: Cloudflare R2 vs Supabase Storage
  - Analytics: Plausible (recommended) vs Cloudflare Analytics
  - Error tracking: Sentry
  - Cost estimate table: ~$35-90/mo at 1K users
  - Maintenance checklists (weekly, monthly, quarterly)
  - Security advice + scaling advice

**Files Modified:** `tokens.js`, `public/index.html`
**Files Added:** `public/manifest.json`, `README-DEPLOY.md`, `README-MOBILE.md`, `README-CODE.md`, `README-RESOURCES.md`

---

## v1.4.0 — UI Polish · Admin Search & Filters · Media Upload · READMEs
**Date:** 2026-04-30
**Status:** Released

### Changed — UI / Performance
- All page transitions use `fadeUp 0.34s cubic-bezier(0.4,0,0.2,1) both` via `.page-enter` class
- Modal entrance uses `scaleIn 0.28s ease` — feels snappy, not jarring
- All hover states use consistent `transition: all 0.18s cubic-bezier(0.4,0,0.2,1)`
- Added `will-change: transform` to card hover elements
- All font sizes use `clamp()` for fluid responsive scaling
- NFT card image height unified to 188px; padding tightened for breathing room
- Nav height reduced to 60px; bottom bar padding tightened
- All grids use `minmax(min(100%,Xpx),1fr)` — wraps cleanly on any screen width
- `-webkit-font-smoothing: antialiased` added globally; fonts now crisp on all screens
- `overflow-x: hidden` on body prevents horizontal scroll on mobile
- Nav links colour changed from `#aaa` to `#c0bcd4` — more visible against dark bg
- Muted label colour in Field components lightened to `#9a96b0` — readable
- Lazy loading via `React.lazy()` + `Suspense` on ProfilePage, SocialFeedPage, AdminPanel
- All callback handlers wrapped in `useCallback` to prevent unnecessary re-renders
- Admin password now accepts Enter key in input (no mouse needed)

### Changed — index.html (Title Bar & Meta)
- Full `<title>` tag: "PARADISE on Earth — African Creative NFT Market"
- Meta description, keywords, author
- `theme-color` and `color-scheme: dark` for browser chrome tinting
- Open Graph tags: title, description, url, image, locale, site_name
- Twitter Card tags: card, title, description, image, site
- Apple PWA tags: web-app-capable, status-bar-style, apple-mobile-web-app-title
- Apple touch icon link
- Favicon links: .ico, 32×32, 16×16
- Web manifest link
- Canonical URL
- Google Fonts preconnect for faster font loading
- Base `<style>` block prevents flash of unstyled content

### Added — Admin Panel
- **Search bar** in User Management: filters by display name or @username in real time
- **Collection search bar** in Collections tab: searches by name or creator name
- **Creator role filter** in Collections tab: dynamic filter buttons from actual roles in DB
- **Media upload on Collections**: cover image/video field in CollectionEditor
- **Media upload on NFTs**: second upload field for "Collection Media" (gallery image)
  separate from "Unlock Content" (holder-only file)
- NFT list row shows green `✓ Media` badge when collection media is attached
- Collection card shows uploaded cover image if available (instead of symbol)

### Added — Documentation (4 new README files)
- `README_DEPLOY_WEB.md`: Vercel, Netlify, Firebase Hosting steps + env vars + cost table
- `README_CODE.md`: File structure, state architecture, how to add pages, connect services
- `README_MOBILE_APP.md`: Capacitor setup, PWA config, App Store / Play Store checklist
- `README_RESOURCES.md`: All service providers with honest costs, advice, maintenance schedule

**Files Modified:** `App.jsx`, `AdminPanel.jsx`, `public/index.html`, `CHANGELOG.md`
**Files Added:** `README_DEPLOY_WEB.md`, `README_CODE.md`, `README_MOBILE_APP.md`, `README_RESOURCES.md`

---

## v1.5.0 — Zodiac Avatars · Story Viewer · Profile Taps · HQ Media · Admin Upgrades
**Date:** 2026-05-03
**Status:** Released

### Added — Zodiac System
- `zodiac.js`: 12 zodiac signs with Unicode symbols (♈♉♊♋♌♍♎♏♐♑♒♓) and date ranges
- `AnimatedAvatar` component in `tokens.js`: smooth 0.6s cross-fade between zodiac symbol and profile photo every 3 seconds. Animation only activates when user has both a photo AND a zodiac set. Without photo, zodiac symbol is shown static.
- All avatar circles throughout app (nav, feed, wallet, profile, admin mod panel) now use AnimatedAvatar
- Seed posts updated: all sample users now have zodiac avatars assigned
- Zodiac displayed in profile preview modals, wallet page, and profile page

### Added — Profile Avatar Picker (ProfilePage.jsx)
- Avatar picker now has two modes: **Zodiac** and **Photo Upload**
- Zodiac mode: 12-card grid showing each sign's symbol + name, selectable
- Photo mode: high-res photo upload, shows animated zodiac ↔ photo swap after 3s
- Selecting a zodiac updates both `avatar` and `zodiac` profile fields
- Hint text explains the 3-second animation behaviour to users

### Added — Banner Upload (ProfilePage.jsx)
- Full banner image upload on Appearance tab
- Supports any resolution — displayed at full width
- Falls back to colour gradient if no image uploaded
- Banner shown in profile preview card, appearance preview, profile preview modal

### Added — Story Viewer (SocialFeed.jsx)
- `StoryModal` component: tapping a creator bubble in the Feed opens a full-screen story
- Story design: progress bars at top, creator header, large NFT image, description, price
- Story progress bar animates across 4 seconds (CSS animation)
- Instagram-style close on tap outside

### Added — Profile Preview Modal (SocialFeed.jsx)
- `ProfilePreviewModal`: tapping any avatar or username in the feed opens a bottom-sheet profile card
- Shows: animated avatar, display name, @username, zodiac, bio
- Follow button + "View Profile" button
- Smooth `fadeUp` entrance animation

### Added — @mention redirect (SocialFeed.jsx)
- `RichText` now accepts `onMention` callback
- Tapping a `@username` in any post text calls the handler → opens ProfilePreviewModal
- Tapping username label in post header also triggers profile preview

### Changed — High-Quality Media (SocialFeed.jsx)
- Media files read at full quality with `readAsDataURL` — no resizing or compression
- Media thumbnails in post grid now have `cursor:zoom-in`
- Full-screen lightbox on image tap: covers entire viewport, close button, click-outside to close
- Single image posts display at 300px height; 2-image grid at 160px each

### Changed — Nav bar (App.jsx)
- Nav links now in a horizontally scrollable flex row — never overflow or get cut off on any screen size
- "COLLECTION" renamed to "WALLET" in nav to fit compact screens
- Bottom nav label updated to "Wallet" to match
- Nav height reduced to 56px
- Logo font size and letterSpacing use clamp() for smooth scaling

### Changed — Loader (App.jsx)
- Progress bar centred using `display:flex; justifyContent:center` wrapper — fixes off-centre alignment
- Bar width uses `min(220px, 70vw)` — adapts to any screen
- Added animated loading dots (3 gold dots, staggered `dotPulse` animation)
- PARADISE wordmark font size uses `clamp(34px, 9vw, 56px)` — fills screen on mobile, stays elegant on desktop

### Changed — AdminPanel.jsx
- **Creator selector**: `CreatorSelector` component replaces plain text input for creator name in CollectionEditor
  - Dropdown shows all verified users with their animated avatar, name, and @username
  - "Enter name manually" fallback option always available at bottom of dropdown
  - Pulls verified users live from current posts state
- **Custom role input**: `RoleSelector` replaces plain `<select>` for creator role
  - Shows dropdown with 10 preset roles (Musician, Fashion Designer, Up-cycler, Visual Artist, Photographer, Poet, Dancer, Writer, Filmmaker, Sculptor)
  - "+ New" button switches to free-text input for any custom role
  - "← List" button returns to dropdown

**Files Modified:** `tokens.js`, `App.jsx`, `ProfilePage.jsx`, `SocialFeed.jsx`, `AdminPanel.jsx`
**Files Added:** `zodiac.js`

---

## v1.5.0 — Mobile Nav Fix · Loader Polish · Zodiac Avatars · Admin Creator Picker
**Date:** 2026-05-03
**Status:** Released

### Fixed
- **Nav overflow on mobile** — all 4 nav links now visible on any screen width. Links are in a horizontally scrollable flex row with `overflow-x:auto; scrollbar-width:none` so they never clip. Font sizes use `clamp()` to scale down gracefully. Logo also shrinks with clamp.
- **Loader bar not centred** — wrapped progress bar in a `display:flex; justify-content:center` container so it is always perfectly centred regardless of screen width. Added 3 animated dots below bar for interactive feedback. Added shimmer sweep animation on the bar fill.

### Added — Zodiac Avatar System
- All seed post users now have zodiac avatars (Kofi=Leo♌, Abena=Virgo♍, Yaw=Gemini♊, Ama=Pisces♓)
- `AnimatedAvatar` in tokens.js: if user has a photo, it cross-fades with their zodiac symbol every 3 seconds. Transition is smooth opacity fade (0.6s ease). If no photo, zodiac symbol displays statically.
- Profile page avatar picker defaults to "Zodiac" tab — users select their sign from a full grid showing all 12 glyphs + sign names
- Zodiac sign shown as sub-label on profile preview card and post author row
- All avatar circles in feed, story bubbles, wallet, nav use AnimatedAvatar

### Added — Social: @mention redirect to profile
- Tapping `@username` in post text opens `ProfilePreviewModal` — slides up from bottom with banner, avatar, bio, zodiac sign, Follow + View Profile buttons
- Tapping avatar in post header also opens `ProfilePreviewModal`
- `ProfilePreviewModal` animates in with `fadeUp 0.28s` from bottom-sheet style
- Tapping username text in post header opens same modal
- Story bubbles still open `StoryModal` (Instagram-style full-screen)

### Added — Admin: Verified Creator Selector
- `CreatorSelector` component in AdminPanel: dropdown showing all verified users with their animated avatar, display name, and @username
- "Enter name manually" fallback option at bottom of dropdown for non-verified creators
- When a verified user is selected as creator, their data auto-populates the creator name field
- `RoleSelector` component: dropdown of 10 preset roles (Musician, Fashion Designer, Up-cycler, Visual Artist, Photographer, Poet, Dancer, Writer, Filmmaker, Sculptor) PLUS a "+ New" button that switches to a free text input for custom roles
- Custom roles persist in the form and save to the collection

### Changed
- Creators grid: uses `repeat(auto-fill,minmax(min(calc(50%-8px),200px),1fr))` — renders as 2 columns on mobile, more on desktop
- Page header title letter-spacing refined
- Bottom nav safe-area inset padding for notched phones
- Admin panel passes `verifiedUsers` and enriched `posts` (with `.verified` flag) to `CreatorSelector` so the verified user list stays in sync with moderation actions

**Files Modified:** `App.jsx`, `AdminPanel.jsx`, `SocialFeed.jsx`, `tokens.js`, `ProfilePage.jsx`

---

## v1.5.1 — Hotfix: AdminPanel import error
**Date:** 2026-05-03
**Status:** Released

### Fixed
- `AdminPanel.jsx` line 3: removed broken `import { AnimatedAvatar } from "./App"` — App.jsx does not export AnimatedAvatar
- Added `AnimatedAvatar` to the existing `./tokens` import on line 2 (correct source)
- This caused three compile errors: lines 155, 1652, 1971 — all same root cause

**Files Modified:** `AdminPanel.jsx`
