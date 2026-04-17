## The Brain — Read First
Hawk's central command lives at `~/Claude Cowork/`. Before starting any session, read these three files:

1. `~/Claude Cowork/About Me/memory.md` — The living tracker. All projects, decisions, what's in progress. MOST IMPORTANT FILE.
2. `~/Claude Cowork/About Me/about-me.md` — Who Hawk is, how he works.
3. `~/Claude Cowork/About Me/writingrules.md` — How to write. Follow for ALL written output. Never sound like an AI.

You are one of several agents Hawk works with (Claude Code primary, plus Codex and Antigravity/Gemini). All read from the same brain. Stay consistent with it. Flag useful cross-project insights in STATUS.md. For cross-agent handoffs, drop a ticket in `~/Projects/.dispatch/queue/`.

---

# AGENTS.md — Omega TV

**Project:** Omega TV  
**Owner:** Hawk (Haukur)  
**Architect:** Cowork Claude  
**Repo:** https://github.com/haukur1982/omega-tv.git

## Project Overview

33-year-old Icelandic Christian TV network evolving into a premium streaming platform. Public site (sermons, articles, testimonials, prayer) + admin portal for content management. Mission: transformation through excellent media honoring Jesus Christ.

For detailed vision, see `.agents/VISION.md`.

## Tech Stack

- **Frontend:** Next.js 16.1.0, React 19, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Video:** Bunny Stream (Library ID: 628621)
- **Email:** Resend
- **Styling:** Tailwind 4, Framer Motion, Lucide React
- **Package Manager:** pnpm
- **Hosting:** Vercel (omega-tv-lovat.vercel.app → omega.is)
- **Database ID:** dvzwpwlgucsdyrkhrpah

## Dev Commands

```bash
pnpm install
pnpm dev      # localhost:3000
pnpm build
pnpm test
```

## Design System

- **Dark Theme:** Nordic Charcoal (#1C1C1E)
- **Accent:** Nordic Blue (#5b8abf) — public site, admin, emails
- **Typography:** Inter (UI/body) + Libre Baskerville (headlines)
- **Admin Tokens:** Separate system in `src/styles/admin.css`
- **Rule:** Text on blue should be white, not black

## App Structure

```
src/app/
  admin/          — Series, videos, newsletters, prayers, quotes, subscribers, articles
  sermons/[id]    — Individual sermon pages
  api/            — Auth-protected API routes
  about, live, give — Public pages
  greinar/[slug]  — Articles (editorial)
  baenatorg       — Prayer requests
  vitnisburdur    — Testimonials
  framtid/        — Future plans
  namskeid/       — Courses (hidden, ready to enable)
```

## Coding Standards

- All UI in Icelandic (lang="is")
- Row-level security enabled in Supabase
- Video via Bunny API
- Auth required for admin
- Component library for consistency

## Session Protocol

**Before starting:**
- Check STATUS.md for last update and blockers
- Verify .env.local has Supabase credentials

**During:**
- Test locally before pushing
- Keep design system consistent

**Finish:**
- Update STATUS.md with changes and next steps
- Commit meaningfully to main

## Off Limits

- Do not modify CLAUDE.md
- Do not change database schema without explicit request
- Do not touch Bunny video library settings

## Contacts

- **Hawk:** haukur1982@gmail.com
- **Supabase Dashboard:** dvzwpwlgucsdyrkhrpah project
- **Bunny CDN:** for video monitoring
- **Related Script:** `vod_publish.py` in Azotus project

