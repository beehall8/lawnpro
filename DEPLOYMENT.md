# 🚀 Lawn Pro - Deployment Guide

Step-by-step deployment for the recommended stack: **Railway (backend + PostgreSQL) + Vercel (frontend)**.

---

## Prerequisites

- [x] GitHub repo pushed: https://github.com/beehall8/lawnpro
- [ ] Railway account: https://railway.app
- [ ] Vercel account: https://vercel.com
- [ ] Google Cloud account (for Maps API)
- [ ] Stripe account (for payments)
- [ ] All values from `ENV_VARIABLES.md` gathered

---

## Phase 1: Backend + Database (Railway)

### 1.1 Create Prisma schema (REQUIRED FIRST)

`src/backend/prisma/schema.prisma` doesn't exist yet. Create it with at least these models: `User`, `Vendor`, `Property`, `Order`, `Review`. See `docs/TECHNICAL_ARCHITECTURE.md` for field-level guidance.

Then locally:
```bash
cd src/backend
npx prisma generate
```

### 1.2 Deploy to Railway

1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo** → select `beehall8/lawnpro`
2. Railway detects Node.js. Set:
   - **Root Directory:** `src/backend`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
3. **Add PostgreSQL:** Project → **New** → **Database** → **PostgreSQL**
4. **Link database:** In backend service → **Variables** → **Add Reference** → select `DATABASE_URL` from Postgres
5. Add remaining env vars from `ENV_VARIABLES.md` (JWT_SECRET, STRIPE_SECRET_KEY, etc.)
6. Deploy. Copy the generated URL (e.g. `https://lawnpro-production.up.railway.app`)

### 1.3 Run migrations

Railway service → **Settings** → run one-off command:
```bash
npx prisma migrate deploy
```

### 1.4 Verify

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/health
# Expect: {"status":"ok","timestamp":"..."}
```

---

## Phase 2: Frontend (Vercel)

### 2.1 Deploy

1. https://vercel.com → **Add New Project** → import `beehall8/lawnpro`
2. Set:
   - **Root Directory:** `src/frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Add env var:
   - `VITE_API_URL` = your Railway backend URL from Phase 1.2
   - `VITE_GOOGLE_MAPS_API_KEY` = from Google Cloud
4. Deploy. Copy generated URL (e.g. `https://lawnpro.vercel.app`)

### 2.2 Update backend CORS

Add the Vercel URL to `CORS_ORIGIN` in Railway env vars, then redeploy backend.

---

## Phase 3: Third-Party Integrations

### 3.1 Google Maps Platform
1. https://console.cloud.google.com → new project **lawn-pro**
2. Enable APIs: **Maps JavaScript API**, **Geocoding API**, **Static Maps API**, **Geometry Library**
3. **Credentials** → **Create API Key**
4. Restrict key: HTTP referrers = your Vercel URL + `localhost:5173`
5. Add to Vercel as `VITE_GOOGLE_MAPS_API_KEY`, redeploy

### 3.2 Stripe
1. https://dashboard.stripe.com → **Developers** → **API Keys** → copy **Publishable** + **Secret** (test mode)
2. **Webhooks** → **Add endpoint** → `https://YOUR-RAILWAY-URL/api/v1/webhooks/stripe` → events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
3. Copy signing secret (`whsec_...`)
4. Add to Railway: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
5. Add to Vercel: `VITE_STRIPE_PUBLISHABLE_KEY`
6. Redeploy both

### 3.3 File Storage (Cloudinary)
1. https://cloudinary.com → sign up → Dashboard shows Cloud Name / API Key / Secret
2. Add all three to Railway env vars

### 3.4 Email (Resend)
1. https://resend.com → sign up → **API Keys** → create
2. Add to Railway: `RESEND_API_KEY`, `FROM_EMAIL`
3. Verify domain if using custom sender

---

## Phase 4: Post-Deploy Checklist

- [ ] `GET /health` returns 200 on Railway
- [ ] Vercel frontend loads
- [ ] Signup → login round-trip works (JWT returned)
- [ ] Google Maps renders on booking page
- [ ] Stripe test card `4242 4242 4242 4242` completes checkout
- [ ] Webhook shows delivery success in Stripe dashboard
- [ ] Image upload lands in Cloudinary
- [ ] Test email arrives
- [ ] Submit a vendor application and confirm it appears at `/admin/vendors`
- [ ] Approve the application and confirm the vendor can sign in at `/vendor/login`

See `VENDOR_APPROVAL_SETUP.md` for the Firebase-backed approval queue and first-admin setup.

---

## Custom Domain (Optional)

**Frontend (`lawnpro.com`):** Vercel → Settings → Domains → add → point CNAME to `cname.vercel-dns.com`

**Backend (`api.lawnpro.com`):** Railway → service → Settings → Custom Domain → point CNAME to Railway target

Then update `CORS_ORIGIN` and `VITE_API_URL` and redeploy.

---

## Rollback

- **Backend:** Railway → service → Deployments → click prior deploy → **Redeploy**
- **Frontend:** Vercel → Deployments → prior deploy → **Promote to Production**
- **Database:** Restore from Railway Postgres backup (Settings → Backups)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend won't start | Check Railway logs; usually missing env var or bad Prisma schema |
| CORS error in browser | Add Vercel URL to `CORS_ORIGIN` in Railway, redeploy |
| `Prisma Client not generated` | Add `npx prisma generate` to build command |
| Vercel build fails on `vite: command not found` | Confirm root dir is `src/frontend` |
| Stripe webhook 400 | Check `STRIPE_WEBHOOK_SECRET` matches the endpoint's secret |
| Maps grey/blank | API key restrictions too tight, or APIs not enabled |

---

## Cost Estimate (MVP)

| Service | Free Tier | Est. Paid |
|---|---|---|
| Railway | $5 credit/mo | ~$10-20/mo |
| Vercel | Hobby free | $0 (until commercial) |
| Postgres | Included in Railway | — |
| Google Maps | $200 credit/mo | ~$50-100/mo at 1K quotes |
| Stripe | Free | 2.9% + $0.30/txn |
| Cloudinary | 25GB free | $0-89/mo |
| Resend | 3K emails/mo free | $20/mo at scale |

**Total MVP:** ~$10-30/mo until traction, then $100-300/mo.
