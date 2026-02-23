# Design Guidelines

This is the visual and emotional blueprint for Closer—a playful, hand-drawn, human-first design system.

## Emotional tone

Feels like a friend's sketch on a napkin—warm, playful, imperfect, and deeply human.

**Design intent:**

- Friendly and approachable, never sterile or corporate
- Hand-drawn charm with visible "human" imperfection
- Gentle humor and whimsy (croissants as call buttons!)
- Connection-first, celebrating togetherness

## Visual system

### Typography

Use a rounded, friendly sans-serif that feels warm but not childish.

**Primary:** Rounded system font (SF Rounded, Nunito, DM Sans, or similar)

**Fallbacks:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

**Hierarchy (mobile-first):**

- H1: 32px / 700 / 1.2 (bold, friendly, could have slight curve/bounce)
- H2: 24px / 700 / 1.3
- H3: 18px / 600 / 1.4
- H4: 16px / 600 / 1.4
- Body: 16px / 400–500 / 1.6
- Caption: 14px / 400 / 1.5

**Rules:**

- Titles should feel conversational ("Who's free this week?")
- Use color on headlines for playfulness
- Keep line-height comfortable and airy
- No all-caps (too formal)

### Color system

Mood: playful, hand-drawn, like a sketchbook with favorite markers.

**Background:**

- Primary: Bone white `#FAF7F4` or `#F5F1ED` (soft, not stark)
- Alternative: Cream `#FFFEF9`
- Paper texture overlay (optional, subtle): 2-3% noise

**Illustration & accent colors:**

Use these as single colors for icons, buttons, illustrations—not in gradients.

- Tomato red: `#E63946`
- Warm orange: `#F77F00`
- Marigold: `#F4A261`
- Cobalt blue: `#457B9D`
- Navy: `#1D3557`
- Magenta pink: `#E76F9B`
- Burgundy: `#A63446`
- Sage green: `#8CB369`

**Text:**

- Primary: `#1D1D1D` (near black, soft)
- Secondary: `#6B6B6B`
- Tertiary: `#999999`

**State colors:**

- Success: Sage green `#8CB369`
- Warning: Marigold `#F4A261`
- Error: Tomato red `#E63946`

**Usage rules:**

- Headlines can use accent colors (rotate for variety)
- Icons/illustrations use one color each (no multi-color fills)
- Buttons have hand-drawn outline in accent color
- Keep high contrast for accessibility (AA minimum)

### Spacing & layout

**12pt grid** (feels more organic than 8pt).

**Card padding:**

- Small: 16
- Medium: 20
- Large: 24–28

**Corner radius:**

- Cards: 16–20 (soft but not pill)
- Buttons: 24–28 (rounded but still recognizable as rectangles)
- Illustrations: no radius, hand-drawn edges

**Layout:**

- Single column, thumb-friendly
- Generous whitespace
- Floating elements okay (sparkles, little doodles)

### Hand-drawn style rules

**This is the signature of the design.**

**Outlines:**

- 2–3px thick, wobbly strokes
- Not perfectly round or straight
- Use SVG paths with slight irregularity
- Can be single continuous line OR closed shapes with fills

**Buttons:**

- Outline-first design (border is the hero)
- Hand-drawn border with slight wobble
- Fill can be transparent or solid color
- Example: `border: 2.5px solid #E63946; border-radius: 28px` + SVG overlay for wobble

**Icons:**

- Simple line drawings (like the illustrations you shared)
- Single color, thick strokes
- Playful metaphors encouraged:
  - Call button: croissant or phone with arms
  - Calendar: hand holding flower
  - Friends: two hands waving
  - Heart: literal heart with legs

**Illustrations:**

- Use throughout the interface
- Hands, faces, simple objects
- Can be decorative (sparkles, flowers) or functional (icons)
- Each illustration uses one or two colors max

### Motion & interaction

**Tone:** playful bounce, not slick animations.

**Duration:**

- 200–300ms for taps/presses
- 250–350ms for page transitions
- 150ms for micro-interactions

**Easing:**

- Slight spring/bounce (cubic-bezier(0.34, 1.56, 0.64, 1))
- Nothing linear or robotic

**Microinteractions:**

- Button press: slight squish (scale 0.96) + color shift
- Success: gentle bounce + sparkle illustration
- Error: small shake (2-3px)
- Loading: hand-drawn spinner or playful animation

**Personality:**

- Add tiny surprises (croissant wiggles on tap)
- Celebratory moments (confetti sketches, little stars)

## Voice & tone

**Keywords:** friendly, warm, playful, conversational, gently funny.

**Microcopy examples:**

- **Onboarding empty state:**
  "Add someone you'd love to call. We'll find when you're both free."

- **Success:**
  "Perfect! You're both free Tuesday at 7pm."

- **Call button:**
  "Call now" or "Ring them!" (with croissant icon)

- **Error:**
  "Oops, that time's a bit tight. Want to try another?"

- **No calls available:**
  "No overlap this week—but next week looks promising!"

## Iconography & illustrations

**Style guide:**

- Hand-drawn, thick outlines (2-3px)
- Imperfect circles, wobbly lines
- Single continuous line OR filled shapes with outlines
- Playful anthropomorphization (objects with faces, limbs)

**Examples to create:**

- **Call button:** Croissant with a smile, or vintage phone with arms
- **Friends list:** Two hands waving or holding
- **Calendar:** Hand holding a flower or simple calendar with face
- **Time zone:** Sun and moon with faces
- **Add contact:** Plus sign made of two hands
- **Settings:** Gear made with loops (like the line-drawing hands)

**Color usage:**

- Rotate accent colors for visual interest
- Group related icons by color
- Don't use all colors on one screen

## System consistency

**Recurring metaphors:**

- "Call windows" not "availability slots"
- "Best times" not "optimal schedule"
- "Your people" not "contacts"
- Relationship-first language

**Style anchors:**

- Hand-drawn everything (buttons, icons, dividers)
- Bone white background, pops of single bold colors
- Playful but never childish
- Human connection as visual theme (hands, hugs, faces)

## Accessibility

**Contrast:**

- All text must meet WCAG AA (4.5:1 minimum)
- Accent colors on white backgrounds tested for readability
- Don't rely on color alone (use icons + text)

**Touch targets:**

- Minimum 44×44px for all interactive elements
- Hand-drawn buttons can be larger for friendliness

**Screen readers:**

- Alt text for all illustrations ("Two hands hugging")
- Semantic HTML (buttons, headings, lists)

**Reduced motion:**

- Respect prefers-reduced-motion
- Fade instead of bounce/spring

**Keyboard navigation:**

- Visible focus states (hand-drawn outline glow)

## Emotional audit checklist

- Does this feel like a friend made it?
- Would someone smile when they see it?
- Is there unnecessary polish that makes it feel corporate?
- Are the hand-drawn elements actually imperfect, or too clean?
- Does the color choice feel intuitive and warm?

## Technical QA checklist

- Hand-drawn outlines have visible wobble/texture
- Colors match the exact hex codes
- Typography is rounded and friendly
- Touch targets are ≥44px
- Animations have spring/bounce easing
- Illustrations use single colors (no gradients)
- Background is bone white, not stark white

## Design snapshot output

**Emotional thesis:**
A warm, playful, hand-drawn interface that feels like a friend's sketchbook—imperfect, human, and full of gentle humor.

**Palette**

```
Background Bone:     #FAF7F4
Background Cream:    #F5F1ED
Tomato Red:          #E63946
Warm Orange:         #F77F00
Marigold:            #F4A261
Cobalt Blue:         #457B9D
Navy:                #1D3557
Magenta Pink:        #E76F9B
Burgundy:            #A63446
Sage Green:          #8CB369
Text Primary:        #1D1D1D
Text Secondary:      #6B6B6B
```

**Type scale**

```
H1 32/700
H2 24/700
H3 18/600
H4 16/600
Body 16/400–500
Caption 14/400
```

**Spacing system**

```
12pt grid
Card padding 16–28
Card radius 16–20
Button radius 24–28
Outline stroke 2–3px
```

**Illustration style**

```
Hand-drawn, wobbly lines
Single colors, thick strokes
Playful metaphors (croissant phone!)
Imperfect edges, visible humanity
```

## Design Integrity Review

The hand-drawn, playful aesthetic makes Closer feel warm and approachable—never sterile or productivity-focused. The biggest risk is overdoing the whimsy (too many colors, too many illustrations). Keep it balanced: mostly clean bone white space with pops of color and strategic playful moments.

**Key principles:**

1. Imperfection is the feature (wobbly lines = human)
2. Single colors, not gradients
3. Playful metaphors over generic icons
4. Whitespace lets the playfulness breathe
5. Connection is the visual theme (hands, hugs, togetherness)
