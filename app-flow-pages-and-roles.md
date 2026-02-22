# App Flow, Pages, and Roles

## Site map (top-level pages)

- **Home**
- **Friends**
- **(Optionally later)**
  - History
  - Settings

## Purpose of each page

### Home

Show the best call windows this week and the top priority suggestions.

### Friends

Add/edit friends, preferred hours, cadences, birthdays, and your busy blocks.

## User roles and access levels

### Today MVP (no login)

**Single local user**

- All data stored on device.

### Later (Supabase)

**User**

- Manages their own profile, availability, important dates.

**Connected friend**

- Can update their own preferred hours and important dates (shared relationship context via connections).

## Primary user journeys (3 steps max)

### 1) Add a priority friend

Friends → Add friend → Save

### 2) Enter your busy time

Friends → Busy blocks → Add block

### 3) Find the best time this week and call

Home → Tap suggested friend card → Open WhatsApp

### 4) Add a kid's birthday

Friends → Edit friend → Add kid birthday → Save
