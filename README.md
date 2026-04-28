# Last One Standing — Setup Guide

## What you have
5 files that together make a complete loyalty system:
- `checkin.html` — customers land here after scanning a QR code
- `leaderboard.html` — live public leaderboard (put this on a TV)
- `my-points.html` — players check their score and history
- `admin.html` — you create events, generate QRs, award bonus points
- `schema.sql` — your database schema (run once in Supabase)

---

## Step 1 — Create your Supabase project (free)

1. Go to https://supabase.com and create a free account
2. Click **New project**, name it (e.g. "last-one-standing"), set a DB password
3. Wait ~2 minutes for it to provision
4. Go to **SQL Editor** (left sidebar)
5. Paste the entire contents of `schema.sql` and click **Run**

---
 
## Step 2 — Get your Supabase credentials

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## Step 3 — Add your credentials

Open `js/config.js` and replace the placeholders:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // ← paste here
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';             // ← paste here
const ADMIN_PASSWORD = 'changeme123';                         // ← change this!
```

---

## Step 4 — Deploy to Vercel (free)

### Option A: Drag and drop (easiest, no account needed for preview)
1. Go to https://vercel.com and sign up free
2. Click **Add New → Project**
3. Drag your entire project folder onto the upload area
4. Click **Deploy** — done in ~30 seconds
5. You'll get a URL like `https://last-one-standing-xyz.vercel.app`

### Option B: Via GitHub (recommended for updates)
1. Push this folder to a GitHub repo
2. In Vercel, connect your GitHub account and import the repo
3. Every time you push a change, Vercel auto-redeploys

---

## Step 5 — Test it

1. Go to `your-url.vercel.app/admin.html`
2. Log in with your admin password
3. Create an event (e.g. "Thursday Trivia") → a QR code appears
4. Download or screenshot the QR
5. Scan it with your phone
6. Check in as a new player
7. Visit `your-url.vercel.app/leaderboard.html` — you should see yourself

---

## How the scan limits work

- **Max 1 scan per event**: enforced by a unique database constraint on (player_id, event_id). The same player physically cannot scan the same event twice — Supabase rejects the duplicate.

- **Max 3 scans per 8-hour window**: on every check-in, the app counts how many scans the player has made in the last 8 hours. If it's already 3, they see a "come back later" screen. This resets automatically — no manual intervention needed.

Example: Player scans Trivia at 7pm, Darts at 8pm, Bingo at 9pm → 3/3 used. They try to scan Live Music at 10pm → blocked. At 3am their window resets and they can scan again the next night.

---

## Adding bonus points (for wins)

1. Go to `admin.html → Award Bonus` tab
2. Enter the player's phone number → click Find Player
3. Set points + reason (e.g. "Won darts tournament")
4. Hit Award — it shows up in their history immediately

---

## Displaying the leaderboard on a TV

Open `leaderboard.html` on any browser and put it fullscreen. It auto-refreshes every 30 seconds. You can filter by "This week" / "This month" / "All time".

---

## Folder structure

```
last-one-standing/
├── checkin.html        ← QR scan destination
├── leaderboard.html    ← Public live rankings
├── my-points.html      ← Player's personal score
├── admin.html          ← Staff panel
├── schema.sql          ← Run once in Supabase
├── css/
│   └── style.css       ← All shared styles
└── js/
    └── config.js       ← Your credentials go here
```

---

## Free tier limits (more than enough for MVP)

| Service | Free limit | What it means |
|---------|-----------|---------------|
| Supabase | 500MB DB, 2GB bandwidth | ~100k check-ins, no problem |
| Vercel | 100GB bandwidth, unlimited deploys | No limits for this use case |

You won't need to pay anything until you're well past validation.
