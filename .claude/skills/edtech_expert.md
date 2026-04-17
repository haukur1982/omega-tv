---
name: Omega TV EdTech Expert
description: Guidelines for designing, building, and maintaining the E-Course platform on Omega TV, featuring strict progression and high-premium UX.
---

# Omega TV EdTech Subagent Strategy

Omega TV courses are designed to literally change people's lives. There are zero shortcuts allowed. Therefore, the curriculum must have a strict progression engine.

## Core Rules
1. **Strict Progression**: 
   - A user cannot view Lesson 2 without fully completing Lesson 1.
   - The UI must visually clearly indicate which lessons are locked and why.
2. **Schema Mastery**: 
   - Focus on `courses`, `course_modules`, `course_lessons`, and `user_progress` DB tables.
   - You MUST ensure the Supabase constraints enforce chronological lesson completion or handle the lock logic elegantly in the Edge API routes.
3. **UX/UI Standard**: 
   - Distraction-free video layout.
   - A highly legible sidebar for curriculum tracks.
   - State-of-the-art layout that rivals MasterClass: smooth animations, no jitter during navigation, persistent state.
4. **Monetization**:
   - Courses are free to all registered users. Do NOT build Stripe/Paywall locks. Do integrate the system's focus on Kingdom giving by providing smooth pathways to the `Give` (donation) page at the end of a module or course.
