# Closer - Project Masterplan

## 30-second elevator pitch

A warm, mobile-first web app that helps you call friends around the world. It respects time zones, ranks who's "due," and shows the best call windows this week—then opens WhatsApp in one tap.

## Problem & mission

### Problem

- Friends live in different time zones.
- "Just call" fails often.
- Coordinating a time is friction.

### Mission

Make staying close feel effortless: clear best times + gentle nudges + one-tap calling.

## Target audience

- People with close relationships spread across countries (5–30 contacts).
- Busy, calendar-driven folks who still value slow, intentional connection.

## Product principles

### Don't make me think

Show top answers. Hide the math.

### Warm, not utilitarian

Calm wellness vibe. Soft transparency. Gentle language.

### Tiny actions

- Add friend in under 60 seconds.
- Call in 1 tap.

## Core features

### MVP (shareable today, no login)

**Friends list**

- Name, WhatsApp number, city/timezone.
- Cadence: weekly / monthly / quarterly / yearly.
- Priority (simple: high/medium/low).

**Friend preferred call hours**

- Weekdays window + weekends window (in friend local time).

**Your availability (today MVP)**

- Manual "busy blocks" for this week (fast to enter).

**Best times this week**

- For each priority friend: top 1–3 call slots this week.
- Home shows top 3 across all friends.

**WhatsApp launch**

- Tap "Open WhatsApp" from a suggestion card.

**Important dates**

- Friend birthday + kids birthdays (month/day + label).
- Shows "Upcoming" list (next 30 days).

### Post-MVP (to validate appetite)

**Supabase-backed shared app**

- Friends can set their own preferred hours and birthdays.

**Your calendar integration**

- Google Calendar Free/Busy to avoid meetings automatically.

**Gentle reminders**

- Web push / PWA notifications, quiet hours.

## High-level tech stack

### Today MVP (fastest path)

- Next.js + Tailwind (mobile-first, quick UI iteration)
- LocalStorage (store friends, hours, busy blocks)
- Timezone conversion using IANA timezone IDs (city → timezone)

### After validation

**Supabase**

- Postgres + Auth + RLS + Edge Functions
- Enables "friends edit their own hours" safely

**Google Calendar Free/Busy**

- Avoid reading event titles; protect privacy

## Conceptual data model (simple ERD in words)

### Today (local-only)

**Friend**

- name, phone, timezone, cadence, priority, last_called_at
- preferred_hours_weekday (start/end), preferred_hours_weekend (start/end)
- important_dates (birthday + kids)

**BusyBlock**

- day, start, end (your local time)

**CallLog**

- friend_id, timestamp, note (optional)

### Later (Supabase)

- users, profiles
- connections (you ↔ friend)
- availability_windows (per user)
- important_dates (per user)
- call_logs (per connection)

## Weekly "best time" logic (MVP-grade)

1. Generate 30-min slots for next 7 days.
2. Keep a slot if:
   - You are not busy (manual blocks today; calendar later).
   - Slot falls within friend preferred hours (friend local time).
   - Friend local time is within 08:00–22:00 guardrails.
3. Score slots by:
   - Overdue (cadence vs last called)
   - Convenience (evening hours preferred)
   - Sooner (earlier in week wins)
4. Show:
   - Top 1 "Best time" per friend
   - Top 3 across all friends on Home

## Security & privacy notes

- Today MVP stores data locally on-device only.
- Later:
  - Supabase RLS for strict data separation.
  - Calendar integration uses Free/Busy only.
  - Minimal personal data stored (no unnecessary fields).

## Phased roadmap

**Today MVP**

Warm UI + friends + preferred hours + your busy blocks + weekly best times + WhatsApp.

**V1**

Supabase + invites; friends manage their own availability and birthdays.

**V2**

Google Calendar Free/Busy; web push nudges; contact import and dedupe.

## Risks & mitigations

**Timezone confusion**

- Always show friend current local time.
- Store IANA timezone, not offsets.

**Too much setup**

- Weekday/weekend templates; sensible defaults.

**Notification fatigue (later)**

- Quiet hours + easy snooze + "less often" control.

---

# Implementation Plan

## Goal

Ship a link today that proves: "This week's best time to call my priority friends" works.

## Constraints (by design)

- No login, no backend, no invites.
- Mobile-first web app.
- LocalStorage persistence.

## Same-day build checklist

### 1) Skeleton + deploy (30 min)

- Create Next.js app.
- Add global layout + bottom nav.
- Deploy immediately (so you can test on phone early).

**Checkpoint:** link opens smoothly on mobile.

### 2) Global styling foundations (45 min)

- Set warm gradient background.
- Build glass surfaces (blur + transparency).
- Define typography scale (H1–H4 + body).
- Create two button styles:
  - Primary glass pill
  - Secondary subtle glass

**Checkpoint:** empty UI already feels "calm wellness".

### 3) Local data layer (30 min)

- Create LocalStorage store:
  - friends[]
  - busyBlocks[]
  - callLogs[]
- Add "Load sample data" button (optional but helpful for demos).

**Checkpoint:** refresh keeps everything.

### 4) Friends screen (60–90 min)

**Friends list cards show:**

- name
- friend local time
- cadence + priority badge
- edit

**Add/edit friend form:**

- name, phone, city/timezone
- cadence (default monthly)
- priority (default medium)
- preferred hours:
  - weekdays start/end
  - weekends start/end
- birthdays:
  - friend birthday
  - kids birthdays (label + month/day, repeatable)

**Checkpoint:** add 3 friends in 2 minutes.

### 5) Your busy blocks editor (45–60 min)

**Simple UI:**

- Add block: day + start + end
- List blocks grouped by day
- Optional "weekday busy template" shortcut:
  - "Mon–Fri 9–5 busy" adds 5 blocks

**Checkpoint:** editing blocks visibly changes results later.

### 6) Weekly best-times engine (60–90 min)

- Generate 30-min slots for next 7 days.
- Validate slot vs:
  - your busy blocks
  - friend preferred hours (convert to friend local time)
  - 08:00–22:00 friend local guardrails
- Score:
  - overdue weight (cadence vs last_called_at)
  - convenience (friend evening + your reasonable hours)
  - sooner bonus
- Return:
  - per friend: top 3 slots
  - global: top 3 slots across priority friends

**Checkpoint:** Home shows believable "Best time this week" results.

### 7) Home screen (60–90 min)

**Sections:**

- **This week's best calls** (top 3 cards)
  - friend name
  - "Your time" + "Their time"
  - reason label ("Overdue + overlaps their evening window")
- **All friends**
  - each friend: best time + 2 alternates (expand/collapse)
- **Upcoming birthdays** (30 days)

**Checkpoint:** a friend understands it with no explanation.

### 8) WhatsApp action + call logging (20–30 min)

- CTA opens WhatsApp link.
- After tap:
  - update last_called_at
  - append call log entry

**Checkpoint:** the app "learns" from your calls.

### 9) Demo polish (30–45 min)

- Empty states:
  - "Add your first friend"
  - "No overlaps this week" + suggestion ("widen preferred hours")
- Gentle microcopy (no guilt).
- Reduce clutter: 1–3 primary choices only.

**Checkpoint:** feels warm and finished enough to share.

## What to build next (after appetite)

**Supabase:**

- users, connections, availability_windows, important_dates, call_logs
- invite flow so friends can set their own hours

**Google Calendar Free/Busy:**

- replace manual busy blocks

**Notifications:**

- PWA web push with quiet hours
