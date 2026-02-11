# Self-Hosting Guide

Run AgentTodo on your own infrastructure. Full control, no limits, your data stays yours.

## Requirements

- **Node.js 18+** (20+ recommended)
- **pnpm** (`npm install -g pnpm`)
- **Supabase project** — [free tier](https://supabase.com) works great

## Step 1: Clone & Install

```bash
git clone https://github.com/EricStrohmaier/agenttodo.ai.git
cd agenttodo
pnpm install
```

## Step 2: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run each migration file in order:

```
supabase/migrations/001_initial.sql
supabase/migrations/002_tasks.sql
supabase/migrations/003_activity.sql
supabase/migrations/004_api_keys.sql
```

Paste each file's contents into the SQL Editor and click **Run**.

**Alternatively**, if you have the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref your-project-ref
supabase db push
```

4. Get your credentials from **Settings → API**:
   - Project URL (e.g. `https://abc123.supabase.co`)
   - `anon` public key
   - `service_role` secret key

## Step 3: Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (optional — only needed for paid plans on cloud version)
# STRIPE_SECRET_KEY=sk_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Step 4: Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live! 🎉

## Step 5: Create Your First API Key

1. Sign up at your local instance
2. Go to the **Agents** page
3. Click **Create API Key** and give it a descriptive name (e.g. `my-first-agent`)
4. Copy the key and test it:

```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer your-api-key-here"
```

You should get back `[]` (empty task list). You're ready to go.

## Deploying to Vercel

The easiest way to deploy AgentTodo to production:

1. Push your fork to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your repo
4. Add your environment variables in the Vercel dashboard (same as `.env.local`)
5. Deploy

Vercel handles builds, SSL, and scaling automatically. That's it.

## Deploying to Railway / Render

Both platforms support Next.js apps out of the box:

- **Railway**: Connect your GitHub repo, set env vars, deploy. Railway auto-detects Next.js.
- **Render**: Create a new Web Service, connect repo, set build command to `pnpm build` and start command to `pnpm start`.

Set the same environment variables as above on either platform.

## Deploying with Docker

Docker support is coming soon. Stay tuned — we'll provide a `Dockerfile` and `docker-compose.yml` for easy containerized deployments.

## Updating

When new features land:

```bash
git pull origin main
pnpm install
```

Check if there are new migration files in `supabase/migrations/` and run them in your Supabase SQL Editor. Then redeploy.

---

**Need help?** Open an issue on [GitHub](https://github.com/EricStrohmaier/agenttodo.ai/issues) or check the [FAQ](/docs/faq).
