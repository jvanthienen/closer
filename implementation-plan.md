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
  - friend birthday (month/day)
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

**Checkpoint:** Home shows believable results.

### 7) Home screen (60–90 min)

**Sections:**

- **This week's best calls** (top 3 cards)
  - friend name
  - "Your time" + "Their time"
  - reason label ("Overdue + overlaps their evening window")
  - CTA: "Open WhatsApp"
- **Priority friends**
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
