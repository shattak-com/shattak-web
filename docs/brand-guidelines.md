# Shattak Style Guide

This document is the visual reference for the current Shattak website.  
Use it when creating new pages, design explorations, ad creatives, or social posts so the brand stays visually consistent.

## 1. Brand Colors

### Primary Brand Color

- **Coral**: `#FF6B57`
  Use for primary CTAs, active pills, important highlights, and strong emphasis.

### Supporting Brand Color

- **Soft Coral**: `#FF8A7A`
  Use in gradients, softer highlights, and supporting accents.

### Accent Color

- **Blue**: `#4E78FF`
  Use as a secondary accent only. It supports the coral system and should not become the dominant brand color.

### Neutral Text Colors

- **Primary text**: `#111111`
- **Deep dark**: `#0F0F0F`
- Secondary text in UI is usually a softer gray rather than pure black.

### Surface Colors

- **Main canvas**: white
- **Soft neutral surface**: `#F9FAFB`
- **Warm surface**: `#FFF6F3`
- **Light blue surface**: `#F3F7FF`
- **Light green support surface**: `#F5FFF3`
- **Soft lavender surface**: `#F2F4FF`

### Utility Colors

- **WhatsApp green**: `#25D366`
- **Warm highlight / warning**: `#FFB347`

### Color Rule

- Coral leads
- Blue supports
- White and soft surfaces create breathing room
- Dark backgrounds are used selectively, mostly in the footer and dark mode states

## 2. Gradients

### Primary CTA Gradient

- `linear-gradient(135deg, #FF6B57 0%, #FF8A7A 100%)`

Use for:

- Primary CTA buttons
- Coral-led highlights

### Brand Accent Gradient

- `linear-gradient(135deg, #FF6B57 0%, #4E78FF 100%)`

Use for:

- Decorative highlights
- Badge and glow treatments
- Social creative accents

### Section Surface Gradient

- `linear-gradient(135deg, #F2F4FF 0%, #FFF6F3 100%)`

Use for:

- CTA blocks
- Feature callout sections
- Instructor and promotional surfaces

### Orb / Glow Direction

The design uses soft radial glows:

- warm coral glow
- cool blue glow

These should feel subtle and atmospheric, not loud or neon.

## 3. Typography

### Heading Font

- **Bricolage Grotesque**

Use for:

- Main page headings
- Section headings
- Key statements

### Body Font

- **Plus Jakarta Sans**

Use for:

- Paragraphs
- UI copy
- Buttons
- Labels
- Social captions

### Display Usage

The design system also uses a display stack:

- **Google Sans fallback + body font**

This is mainly used in the main hero-style headings for a more polished marketing feel.

## 4. Type Scale In Practice

These are the most common sizes used in the current UI.

### Hero Headlines

- Home hero: about `2.4rem` on mobile to `3.6rem` on larger screens
- Course hero: `2xl` to `4xl`
- About hero: `2xl` to `4xl`

Use for:

- Main H1 only

### Section Headings

- `xl` on mobile
- `2xl` on tablet/desktop

This is the standard pattern for section headers across course and about sections.

### Card / Subsection Headings

- `md`
- `lg`
- sometimes `xl` for split content blocks

### Lead Paragraphs

- `md` to `lg`

Use for:

- Hero support copy
- Intro text under large headings

### Body Copy

- `sm` to `md`

Use for:

- General paragraphs
- Card descriptions
- Supporting text

### Meta / Small Copy

- `xs` to `sm`

Use for:

- Badges
- Secondary labels
- Course metadata
- Footer links

## 5. Font Weight And Rhythm

### Font Weights

- Regular: `400`
- Medium: `500`
- Semibold: `600`
- Bold: `700`

### Line Heights

- Display: `1.15`
- Title: `1.2`
- Compact: `1.35`
- Banner: `1.4`
- Body: `1.6`
- Relaxed: `1.7`

### Letter Spacing

- Tight: `-0.5px`
- Subtle: `-0.01em`

Use tighter tracking for headings only.  
Keep body copy neutral and easy to read.

## 6. Layout Widths

### Standard Container Width

- `6xl`

Used on:

- Header
- Footer
- Home sections
- About sections

### Wider Content Widths

- `7xl` for most course detail sections
- `8xl` for the course hero

### Narrower Content Widths

- `4xl` to `5xl` for forms, booking, admin, and tighter utility screens

## 7. Spacing System

These are the current spacing patterns used repeatedly in the interface.

### Major Section Spacing

- Hero sections: `py { base: 14, md: 20 }`
- Standard marketing sections: `py { base: 12, md: 16 }`
- Dense course content sections: `py { base: 10, md: 14 }`
- Compact grid sections: `py { base: 8, md: 10 }`

### Header And Footer

- Header vertical padding: `3` to `4`
- Footer vertical padding: `12` to `16`

### Common Card Padding

- Small card padding: `4`
- Standard card padding: `5` to `6`
- Large CTA / content card padding: `6` to `8`
- Large feature / promo blocks sometimes go up to `10`

### Common Gaps

- Tight text stacks: `2`
- Standard content stacks: `3` to `4`
- Section content stacks: `6` to `8`
- Large grid gaps: `10` to `14`

### Spacing Rule

The site uses generous vertical space and soft breathing room.  
Avoid cramped layouts, especially in landing sections and promotional blocks.

## 8. Border Radius

These are the named radius values in the current design system.

- **Soft**: `12px`
- **Tile**: `16px`
- **Panel**: `20px`
- **Card**: `24px`
- **Surface**: `32px`
- **Full**: pill / circular elements

### Usage

- Buttons: `full`
- Tags / pills / badges: `full`
- Small icon tiles: `tile`
- Inner panels and media wrappers: `panel`
- Main cards: `card`
- Large hero or CTA surfaces: `surface`

## 9. Borders

### Default Border Style

- `1px solid`

### Common Border Usage

- Cards usually have a light neutral border
- Hover states often shift to a soft coral border
- Accent blocks use soft blue borders
- Glass or overlay surfaces use subtle translucent borders

### Border Feel

Borders are soft and supportive.  
Avoid harsh dark outlines or heavy strokes.

## 10. Shadows

These are the main shadow styles in the current design system.

### Card Shadow

- `0 16px 36px rgba(15, 23, 42, 0.12)`

### Soft Shadow

- `0 8px 20px rgba(15, 23, 42, 0.14)`

### Elevated Shadow

- `0 22px 48px rgba(15, 23, 42, 0.12)`

### Float Shadow

- `0 10px 30px rgba(0, 0, 0, 0.16)`

### Hero Shadow

- `0 36px 72px rgba(17, 24, 39, 0.18)`

### CTA / Accent Shadows

- Primary: coral-led glow
- Neutral: soft dark shadow
- Accent soft: blue-led soft shadow
- Brand soft: coral-led soft shadow

### Shadow Rule

Shadows are used to create soft elevation, not hard drama.  
Keep them airy and modern.

## 11. Buttons

### Primary Button Style

- Coral or coral gradient background
- White text
- Full pill radius
- Soft shadow
- Slight lift on hover

### Secondary Button Style

- Light or white background
- Dark text
- Full pill radius
- 1px to 2px border
- Neutral shadow

### Button Padding

Most primary CTA buttons use:

- horizontal padding around `4` on mobile
- horizontal padding around `7` on desktop

## 12. Cards And Surfaces

### Core Card Style

- White or soft background
- `card` radius
- 1px subtle border
- card or soft shadow

### Promotional Surface Style

- large rounded surface
- warm/cool gradient background
- elevated shadow
- soft decorative glow or orb treatment

### Badge Style

- Pill shape
- dark or brand-filled background
- small text
- compact padding

## 13. Motion Style

The current site uses motion, but it stays soft.

Use:

- subtle reveals
- light hover lift
- soft floating glows
- smooth transitions

Avoid:

- aggressive bounce
- fast spinning effects
- heavy zoom transitions
- visually noisy motion

## 14. Social Creative Styling

If a social post should feel like the website, use this direction:

- Coral as the first emphasis color
- Blue as the supporting accent
- White or soft warm backgrounds
- Bold heading in Bricolage Grotesque
- Body/support text in Plus Jakarta Sans
- Rounded cards and pill CTA chips
- Soft glow or gradient accents
- Clean spacing and uncluttered compositions

## 15. Quick Reference

### Use This Look

- coral-first
- blue-supporting
- rounded
- clean
- soft elevated
- modern and human

### Avoid This Look

- sharp corners everywhere
- flat generic blocks
- purple-led palettes
- neon styling
- overly dark and heavy compositions
- cramped text layouts

## 16. Design Rule Of Thumb

If a new design looks clean, rounded, coral-led, softly elevated, and spacious, it is likely aligned with the current Shattak system.
