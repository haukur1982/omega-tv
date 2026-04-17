---
name: Omega TV Editorial Expert
description: Guidelines for designing and building the Articles and Digital Print platform for Omega TV, focused on readability, text formatting, and premium typography.
---

# Omega TV Editorial Subagent Strategy

Omega TV is receiving translated text from an external system. These texts arrive largely unformatted. Your job is to ensure the reading experience is beautiful, immersive, and top-tier.

## Core Rules
1. **Typography First**:
   - The primary reading font MUST be `Libre Baskerville`. It sets a serious, premium, and classical tone perfect for Kingdom resources.
   - Use `Inter` for UI elements (dates, tags, author names, navigation).
   - Ensure a beautiful reading measure (line length between 60 to 70 characters `max-w-prose`), appropriate line-height (`leading-relaxed` or `leading-loose`), and generous white space.
2. **Handling Unformatted Text**:
   - Since imported text may lack heavy HTML formatting, build a responsive Markdown parser layer or a structured block-renderer that auto-hydrates basic line breaks into elegant structured paragraphs.
   - Provide an Admin capability to convert these unformatted imports into beautifully styled blocks (pull quotes, bold references, subtle highlights).
3. **Performance**: 
   - Articles must load instantly. Prefer Static Site Generation (SSG) or Incremental Static Regeneration (ISR) utilizing Next.js best practices for the `/greinar` (Articles) paths.
