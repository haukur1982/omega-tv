# Omega TV — Christian Television Network

## What this is
Icelandic Christian TV streaming platform. Public website + admin portal for managing sermons, series, newsletters, prayer requests, and video content.

## Stack
- Next.js 16.1.0, React 19, TypeScript
- Supabase (auth, database, storage)
- Tailwind CSS 4, Framer Motion, Lucide React
- Resend (email)
- Bunny.net (video streaming & CDN)
- pnpm

## Services & Accounts

| Service | Purpose | Dashboard | Account |
|---------|---------|-----------|---------|
| Supabase | Database, auth | [Dashboard](https://supabase.com/dashboard/project/dvzwpwlgucsdyrkhrpah) | haukur1982@gmail.com |
| Bunny.net | Video streaming & CDN | [Stream Library](https://dash.bunny.net/stream/628621) | Shared account (also used by subtitle system) |
| Resend | Email (newsletters, welcome) | [Dashboard](https://resend.com) | haukur1982@gmail.com |
| Vercel | Hosting & deployment | TODO | haukur1982@gmail.com |
| GitHub | Source code | [Repo](https://github.com/haukur1982/omega-tv) | haukur1982 |

### Service IDs (quick reference)
- Supabase project ref: `dvzwpwlgucsdyrkhrpah`
- Bunny Stream Library ID: `628621`
- Bunny CDN hostname: `vz-dd90f302-e7e.b-cdn.net`
- Vercel project: TODO

### Env vars needed (all in .env.local)
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
BUNNY_API_KEY, NEXT_PUBLIC_BUNNY_LIBRARY_ID, NEXT_PUBLIC_BUNNY_LIVE_STREAM_ID
RESEND_API_KEY
UNSPLASH_ACCESS_KEY (optional)
```

## Key URLs
- Production: TODO (omega.is)
- Admin: /admin (login with Supabase Auth — haukur1982@gmail.com)

## Important commands
- Dev: `pnpm dev`
- Build: `pnpm build`

## App structure
```
src/app/
  admin/          — Admin panel (series, videos, newsletters, prayers, subscribers)
  sermons/[id]    — Individual sermon pages
  api/            — API routes (schedule, admin)
  about, live, give, frettabref — Public pages
  baenatorg       — Prayer requests
  vitnisburdur    — Testimonials
  framtid/        — Vision/future plans
```

## Notes
- Dark theme, primary color #0B0F19
- Inter + Libre Baskerville fonts
- Icelandic language throughout (lang="is")
- Admin auth via Supabase Auth (email/password)
