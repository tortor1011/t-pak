# Design System Document

## 1. Overview & Creative North Star: "The Distilled Authority"

This design system is built upon the principle of **Distilled Authority**. For senior building owners, "modern" should not mean "complex." It means a layout so intentional and clear that it feels inevitable. 

We are moving away from the "Dashboard-in-a-Box" aesthetic. Our North Star is an **Editorial SaaS** experience—utilizing massive, confident typography and a "No-Line" philosophy. By replacing thin, cluttered borders with tonal layering and expansive whitespace, we create a sense of calm and institutional trust. The interface doesn't just manage data; it curates it into a readable, high-contrast narrative that respects the user's vision and cognitive load.

---

## 2. Color Philosophy: Depth Through Tone

We do not use lines to separate ideas; we use light and shadow. The palette is rooted in high-contrast stability, ensuring accessibility is baked into the aesthetic, not added as an afterthought.

### The "No-Line" Rule
Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. 
*   **Action:** A `surface-container-low` card sitting on a `surface` background provides all the definition needed. If you feel the urge to add a border, increase the spacing instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
*   **Lowest (`#ffffff`):** Reserved for the most critical interactive cards (e.g., a specific Tenant's Invoice).
*   **Surface / Low:** The "ground" or canvas of the application.
*   **High / Highest:** Use for secondary utility panels or "tucked away" information.

### The "Glass & Gradient" Rule
To elevate the "Blue/Green" SaaS trope, we use **Signature Textures**:
*   **CTAs:** Do not use flat `#2563eb`. Use a subtle vertical gradient from `primary` to `primary_container`.
*   **Floating Navigation:** Use Glassmorphism for mobile bottom bars. Utilize a semi-transparent `surface` with a `backdrop-blur-md` to allow dormitory status colors to bleed through softly, grounding the navigation in the content.

---

## 3. Typography: The Editorial Scale

We use **Public Sans** for its exceptional legibility and neutral, authoritative stance. For an older demographic, typography is the primary UI element, not just a label.

*   **Display & Headline:** Used for high-level summaries (e.g., "Total Revenue"). These should be bold and unapologetically large.
*   **Body-LG (16px/1rem):** This is our **minimum** for any meaningful content. We never sacrifice the readability of a lease agreement for "aesthetic" small text.
*   **Label-MD/SM:** Reserved strictly for metadata (timestamps, version numbers).

**The Hierarchy Rule:** Brand identity is conveyed through the contrast between `display-md` headers and generous `body-lg` leading. We want the app to feel like a high-end financial broadsheet, not a crowded spreadsheet.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows and borders create visual "noise" that can confuse senior users. We use **Tonal Layering** to create a mental map of the interface.

*   **The Layering Principle:** Stack `surface-container-lowest` on top of `surface-container-low` to create a soft, natural lift. 
*   **Ambient Shadows:** If a floating action button (FAB) or modal requires a shadow, use a "Tinted Ambient" approach:
    *   `shadow-[0_20px_50px_rgba(18,28,40,0.05)]` — The shadow is a low-opacity version of `on_surface`, creating a soft glow rather than a harsh drop.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in high-glare environments, use `outline_variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components: Intentional Interaction

### Buttons (The "Touch-First" Standard)
All buttons must have a minimum height of **56px** to accommodate senior dexterity and mobile-first usage.
*   **Primary:** `bg-gradient-to-b from-primary to-primary_container` | `text-on_primary`. High-contrast, rounded-xl.
*   **Secondary:** `bg-secondary_container` | `text-on_secondary_container`. Used for "Add Tenant" or "Generate Report."
*   **Tertiary:** Clear text with a `label-md` bold weight. No container.

### Status Badges (Cognitive Signifiers)
Avoid small dots. Use large, pill-shaped badges with high-contrast text:
*   **Unbilled:** `bg-surface_variant` | `text-on_surface_variant` (Gray)
*   **Pending:** `bg-tertiary_container` | `text-on_tertiary_container` (Warm Yellow/Red tones for urgency)
*   **Paid:** `bg-secondary_container` | `text-on_secondary_container` (Deep Green)

### Cards & Lists: The "Wall of Text" Antidote
*   **Forbid Dividers:** Use `mb-6` or `mb-8` from the spacing scale to separate list items. 
*   **Visual Grouping:** Use a subtle background shift (`hover:bg-surface_container_low`) to indicate interactivity rather than a checkbox alone.

### Input Fields
*   **Scale:** Massive touch targets. Labels are always `title-sm` and permanently visible (no floating labels that disappear).
*   **Error State:** Use `error` (#ba1a1a) for the border and `error_container` for a subtle background wash within the field.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a functional tool. If the screen feels "empty," you are doing it right.
*   **DO** use `xl` (12px) roundedness for cards to make the software feel approachable and "soft."
*   **DO** ensure all icons are accompanied by text labels. Icons alone are an accessibility risk for senior users.

### Don't:
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#121c28) to reduce eye strain.
*   **DON'T** use "Gray on Gray" for secondary information. Maintain a minimum 4.5:1 contrast ratio even for "minor" details.
*   **DON'T** use nested scrolling areas. On mobile, the entire page should scroll as one cohesive piece of paper.

---

## 7. Tailwind Configuration Reference