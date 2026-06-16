# DexLedger

**Track Inventory. Manage Credit. Get Paid Faster.**

A production-ready multi-tenant SaaS for local businesses — pharmacies, grocery stores, hardware shops, distributors, and more.

## Tech Stack
- **Next.js 15** (App Router + Server Components + Server Actions)
- **TypeScript**
- **Tailwind CSS v4** + custom shadcn/ui primitives
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Vercel** (deployment)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 3. Run the database migration
In the Supabase SQL Editor, run the contents of:
```
supabase/migrations/0001_init.sql
```

### 4. Start the dev server
```bash
npm run dev
```

## Environment Variables
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Optional | Meta WhatsApp Cloud API |
| `META_WHATSAPP_ACCESS_TOKEN` | Optional | Meta WhatsApp Cloud API |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio |
| `TWILIO_WHATSAPP_FROM` | Optional | Twilio sender |
| `INTERAKT_API_KEY` | Optional | Interakt |

See README for full documentation.
