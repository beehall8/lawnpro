# 🔐 Lawn Pro - Environment Variables Reference

All environment variables needed for local dev and production deployment.

**⚠️ NEVER commit `.env` files to git.** They're already in `.gitignore`.

---

## Backend (`src/backend/.env`)

```env
# ==============================
# Server
# ==============================
NODE_ENV=development                    # development | production
PORT=5000                               # Backend listens on this port
CORS_ORIGIN=http://localhost:5173       # Frontend URL (comma-separated for multiple)

# ==============================
# Database (PostgreSQL via Prisma)
# ==============================
# Local: postgres://user:pass@localhost:5432/lawnpro
# Railway: Auto-injected as reference from Postgres addon
DATABASE_URL=postgresql://user:password@host:5432/lawnpro

# Protects /admin/vendors API requests. Use a long, unique passcode.
VENDOR_ADMIN_KEY=<generate-with-openssl-rand-hex-32>

# ==============================
# Authentication
# ==============================
JWT_SECRET=<generate-with-openssl-rand-hex-32>       # 32+ char random string
JWT_EXPIRES_IN=7d                                    # Token lifetime
JWT_REFRESH_SECRET=<different-32-char-random>        # Refresh token secret
JWT_REFRESH_EXPIRES_IN=30d

# ==============================
# Stripe (Payments)
# ==============================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...                        # sk_live_ in production
STRIPE_WEBHOOK_SECRET=whsec_...                      # From webhook endpoint config

# ==============================
# Google Maps (Server-side)
# ==============================
# Same key as frontend, but restricted to server IPs
GOOGLE_MAPS_API_KEY=AIza...

# ==============================
# File Storage (Cloudinary)
# ==============================
# Get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc...

# ==============================
# Email (Resend)
# ==============================
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@lawnpro.com                       # Verified domain sender

# ==============================
# SMS (Twilio - Optional)
# ==============================
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15551234567

# ==============================
# Redis (Optional - for caching/rate limiting)
# ==============================
REDIS_URL=redis://localhost:6379                     # Railway: auto-injected

# ==============================
# Monitoring (Optional)
# ==============================
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info                                       # debug | info | warn | error
```

---

## Frontend (`src/frontend/.env`)

**⚠️ All frontend vars MUST start with `VITE_`** to be exposed to the browser.
**⚠️ Never put secret keys here** - they end up in the JS bundle and are public.

```env
# ==============================
# API
# ==============================
VITE_API_URL=http://localhost:5000                   # Backend URL
VITE_API_VERSION=v1                                  # /api/v1/...

# ==============================
# Google Maps (Client-side)
# ==============================
# Same key as backend, but restricted to HTTP referrers (Vercel URL + localhost)
VITE_GOOGLE_MAPS_API_KEY=AIza...

# ==============================
# Stripe (Publishable key ONLY)
# ==============================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...              # pk_live_ in production

# ==============================
# Feature Flags (Optional)
# ==============================
VITE_ENABLE_SATELLITE_ESTIMATION=true
VITE_ENABLE_REVIEWS=true

# ==============================
# Analytics (Optional)
# ==============================
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX                  # Google Analytics
VITE_SENTRY_DSN=https://...@sentry.io/...
```

---

## How to Generate Secrets

```bash
# JWT secrets (run twice for JWT_SECRET and JWT_REFRESH_SECRET)
openssl rand -hex 32

# Or with Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Where to Get Each Key

| Variable | Where |
|---|---|
| `DATABASE_URL` | Railway Postgres addon → Variables tab |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Generate locally with `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → your endpoint |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Same page as secret key |
| `GOOGLE_MAPS_API_KEY` | https://console.cloud.google.com/apis/credentials |
| `CLOUDINARY_*` | https://cloudinary.com/console (Dashboard) |
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `TWILIO_*` | https://console.twilio.com |
| `SENTRY_DSN` | https://sentry.io → your project → Settings → Client Keys |

---

## Setting Env Vars in Production

### Railway (Backend)
1. Project → your service → **Variables** tab
2. Click **+ New Variable** → paste name and value
3. For `DATABASE_URL`: click **Add Reference** → select from Postgres addon
4. Redeploy after adding vars

### Vercel (Frontend)
1. Project → **Settings** → **Environment Variables**
2. Add each `VITE_*` variable
3. Choose environments: **Production**, **Preview**, **Development**
4. Redeploy for changes to take effect

---

## Sanity Check Before Deploy

Run this locally to verify all required vars are set:

```bash
cd src/backend
node -e "
const required = [
  'DATABASE_URL','JWT_SECRET','JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY','GOOGLE_MAPS_API_KEY'
];
require('dotenv').config();
const missing = required.filter(k => !process.env[k]);
if (missing.length) { console.error('❌ Missing:', missing); process.exit(1); }
console.log('✅ All required env vars set');
"
```
