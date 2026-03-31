# Omega TV — Christian Television Network

## What this is
Icelandic Christian TV streaming platform. Admin portal for managing sermons, series, newsletters, prayer requests, and video content.

## Stack
- Next.js 16.1.0, React 19, TypeScript
- Supabase (auth, database, storage)
- Tailwind CSS 4, Framer Motion, Lucide React
- Resend (email)
- pnpm

## Key URLs
- Production: TODO
- Repo: https://github.com/haukur1982/omega-tv
- Supabase dashboard: TODO

## Service IDs
- Supabase project: TODO (no .env.local yet — needs setup)
- Vercel project: TODO

## Important commands
- Dev: `pnpm dev`
- Build: `pnpm build`

## App structure
```
src/app/
  admin/          — Admin panel (series, videos, newsletters, prayers, quotes, subscribers)
  sermons/[id]    — Individual sermon pages
  api/            — API routes (schedule, admin)
  about, live, give, frettabref — Public pages
  baenatorg       — Prayer requests
  vitnisburdur    — Testimonials
  framtid/        — Future plans (naesta-kynslod, taekjabunadur, dagskrargerd)
```

## Notes
- Dark theme, primary color #0B0F19
- Inter + Libre Baskerville fonts
- Missing .env.local — needs Supabase project connected
