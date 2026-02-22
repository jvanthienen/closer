# Design Guidelines

This is the visual and emotional blueprint for the product, informed by design-tips.md.

## Emotional tone

Feels like a warm studio at golden hour—calm, kind, and gently inviting.

**Design intent:**

- Soft confidence, not productivity pressure.
- Comfort-first surfaces (glass + warmth).
- Quiet delight (subtle motion, supportive copy).

## Visual system

### Typography

Use a clean system font stack that matches iOS warmth.

**Primary:** SF Pro Display (via system stack)

**Fallbacks:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

**Hierarchy (mobile-first):**

- H1: 28px / 700 / 1.2
- H2: 20px / 600 / 1.3
- H3: 16px / 600 / 1.4
- H4: 14px / 600 / 1.4
- Body: 16px / 450–500 / 1.6
- Caption: 13px / 450 / 1.4

**Rules:**

- Keep line-height ≥ 1.5 for body.
- Titles short, scannable ("Best this week", "Upcoming birthdays").

### Color system

Mood: warm, sandy, sunlit, with cool translucent glass.

**Base palette (light mode):**

- Background warm sand: `#F4E7D7`
- Background peach glow: `#F2C9A0`
- Background dusk tint: `#E9D7F2`
- Surface glass (light): `rgba(255,255,255,0.18)`
- Border glass: `rgba(255,255,255,0.28)`
- Primary text: `#1E1A16`
- Secondary text: `#5B524A`
- Accent (warm): `#E79B6B`
- Accent (soft rose): `#D88EA3`
- Success: `#2E7D32`
- Warning: `#B26A00`
- Error: `#B3261E`

**Dark mode (optional later):**

- Keep warmth by using deep browns/purples, not pure black.

**Contrast:**

- Ensure text on surfaces meets WCAG AA (≥ 4.5:1).
- If glass reduces contrast, increase surface opacity behind text.

### Spacing & layout

**8pt grid everywhere.**

**Card padding:**

- Small: 12–16
- Medium: 16–20
- Large: 20–24

**Corner radius:**

- Cards: 20–24
- Buttons: 999 (pill)

**Layout:**

- Single column, thumb-friendly.
- Max width on desktop, but always "mobile-first".

### Glass / transparency rules

**Goal:** "warm glass," not cold sci-fi.

**Use:**

- backdrop blur (subtle)
- translucent white tint
- soft border

**Avoid:**

- harsh shadows
- high-contrast outlines

**Depth:**

- one gentle shadow layer only
- prefer glow gradients behind cards vs heavy drop shadows

### Motion & interaction

**Tone:** gentle celebration.

**Duration:**

- 150–250ms for taps/transitions
- 200–300ms for modals/sheets

**Easing:**

- smooth, slightly springy (no aggressive bounce)

**Microinteractions:**

- Button press: slight scale down + opacity shift
- Card hover (desktop): minimal lift
- Expand/collapse: smooth height transition

## Voice & tone

**Keywords:** warm, supportive, unhurried, quietly optimistic.

**Microcopy examples:**

- **Onboarding empty state:**
  "Add someone you miss. We'll find the gentle overlap."

- **Success:**
  "Nice. You're in their evening window."

- **Error:**
  "That time looks tight. Try widening the call hours a little."

## System consistency

**Recurring metaphors:**

- "Windows" not "schedules"
- "Best this week" not "optimize"
- Relationship-first, not task-first

**Style anchors:**

- Soft wellness minimalism + iOS polish
- Rounded cards, glass buttons, warm gradient backdrop

## Accessibility

**Keyboard navigation (desktop):**

- visible focus ring on all interactive elements

**Semantic structure:**

- One H1 per page
- Lists for suggestion cards

**Tap targets:**

- Minimum 44×44px for all interactive elements

**Reduced motion:**

- Respect prefers-reduced-motion (fade instead of slide)

## Emotional audit checklist

- Does Home feel calming, not demanding?
- Are suggestions phrased as invitations, not guilt?
- Do empty states feel supportive?
- Does the glass effect stay readable?

## Technical QA checklist

- Typography matches scale + line-height rules.
- Glass surfaces don't harm contrast.
- Interactive states are distinct (default/hover/pressed/disabled).
- Motion durations are within 150–300ms.

## Adaptive system memory

If you have other apps you want to match, reuse:

- the warm gradient
- pill glass buttons
- card radius and spacing rhythm

## Design snapshot output

**Emotional thesis:**
Feels like a warm studio at golden hour—calm, kind, and gently inviting.

**Palette**

```
BG Sand:        #F4E7D7
BG Peach Glow:  #F2C9A0
BG Dusk Tint:   #E9D7F2
Text Primary:   #1E1A16
Text Secondary: #5B524A
Accent Warm:    #E79B6B
Accent Rose:    #D88EA3
Glass Surface:  rgba(255,255,255,0.18)
Glass Border:   rgba(255,255,255,0.28)
```

**Type scale**

```
H1 28/700
H2 20/600
H3 16/600
H4 14/600
Body 16/450–500
Caption 13/450
```

**Spacing system**

```
8pt grid
Card padding 16–24
Card radius 20–24
Pill buttons radius 999
```

## Design Integrity Review

The warm palette + glass surfaces support a gentle, relationship-first vibe. The biggest risk is readability on translucent cards—raise surface opacity behind text whenever contrast dips.
