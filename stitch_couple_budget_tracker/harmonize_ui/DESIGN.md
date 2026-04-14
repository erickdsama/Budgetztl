# Design System Specification: Editorial Financial Harmony

## 1. Overview & Creative North Star
The "Standard" financial app is a grid of rigid boxes and clinical lines. This design system rejects that. Our Creative North Star is **"The Shared Sanctuary."** 

We are building a digital environment that feels like a high-end, curated physical space—a home office designed for two. To achieve this, we move away from traditional "app" aesthetics toward an **Editorial Modernist** approach. This means prioritizing breathing room (negative space), intentional asymmetry to guide the eye, and a layered depth that suggests quality and permanence. We don't just track numbers; we visualize a couple's shared future with warmth and authority.

---

## 2. Colors & Surface Philosophy
Our palette balances the clinical precision of finance with the emotional warmth of a partnership. 

### The Palette
*   **Primary (Teal):** `#006769` (Primary) to `#79d5d7` (Inverse). These colors represent growth and stability.
*   **Secondary (Warm Gray):** `#576060`. These tones provide the "Editorial" backbone, grounding the more vibrant accents.
*   **Tertiary (Coral):** `#a13a0f`. This is our "Action" energy. Reserved strictly for the "Add" button and critical calls-to-action to ensure it pops against the teal and cream.
*   **Neutral (Parchment & Bone):** Background `#fff8f5`. A warm, off-white base that feels more premium and approachable than a "pure" digital white.

### Surface Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. We define space through color. A `surface-container-low` section sitting on a `surface` background is enough to signify a boundary.
*   **Surface Hierarchy & Nesting:** Use the `surface-container` tiers to create "nested" depth. Treat the UI as stacked sheets of fine paper. 
    *   *Example:* Place a `surface-container-lowest` card on top of a `surface-container-low` background to create a soft, natural lift.
*   **The "Glass & Gradient" Rule:** To avoid a flat, "templated" look, use Glassmorphism for floating elements (e.g., a bottom navigation bar or a modal). Use `surface` colors at 80% opacity with a `20px` backdrop-blur.
*   **Signature Textures:** For main budget cards or hero headers, use a subtle linear gradient transitioning from `primary` (#006769) to `primary_container` (#118184) at a 135-degree angle. This adds a "visual soul" that flat color cannot provide.

---

## 3. Typography: The Editorial Voice
We use a dual-font system to balance character with legibility.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Manrope is modern and geometric but feels human. Use `display-lg` and `headline-md` with generous tracking (-2%) to create a sophisticated, confident header style.
*   **Body & Labels (Inter):** The workhorse. Inter is used for all functional data. It is neutral, allowing the financial figures to be the star without distraction.
*   **Hierarchy Strategy:** Create high contrast between sizes. A large `headline-lg` total balance next to a tiny, all-caps `label-md` "Monthly Spend" creates a premium, magazine-like layout.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often messy. In this design system, we achieve depth through **Ambient Light** and **Tonal Shifts**.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
    *   Base: `surface`
    *   Mid-ground: `surface-container-low`
    *   Foreground: `surface-container-lowest`
*   **Ambient Shadows:** When an element must "float" (like the Coral "Add" button), use an extra-diffused shadow. 
    *   *Shadow Specs:* `0px 12px 32px`, Opacity: `6%`, Color: `#342f2b` (on-surface-variant).
*   **The "Ghost Border" Fallback:** If a container sits on a background of the same color and requires definition, use a "Ghost Border." Apply the `outline-variant` token at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### The "Add" Button (Signature Action)
*   **Color:** Tertiary (`#a13a0f`) Coral.
*   **Shape:** `rounded-full`.
*   **Style:** This is the only element allowed to have a slightly more aggressive shadow to indicate its primary importance in the "Couples" interaction flow.

### Cards & Budget Trackers
*   **Cards:** No dividers. Use `surface-container-highest` for the card body and `xl` (1.5rem) roundedness. 
*   **Progress Bars:** Avoid the "loading bar" look. Use `secondary_container` for the track and `primary` for the fill. The ends must be `rounded-full`. For a premium touch, add a subtle inner shadow to the track to suggest a "carved out" look.
*   **Lists:** Forbid divider lines. Use `1.5rem` of vertical white space to separate items. Information should breathe.

### Input Fields
*   **Style:** Minimalist. No heavy boxes. Use a `surface-variant` background with a `md` (0.75rem) corner radius. 
*   **Active State:** Transition the background to `primary_container` at 10% opacity and change the "Ghost Border" to `primary`.

### Simple Charts
*   **Logic:** Charts should be "glanceable." Use `primary` (Teal) for the main data line and `secondary_fixed_dim` for the grid lines. 
*   **Interactivity:** Use a semi-transparent `primary_fixed` fill under line charts to create a "mountain" silhouette, giving the data visual weight.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use intentional asymmetry. Align a heading to the left and a "Total" to the far right with a significant gap to create an editorial feel.
*   **Do** use `surface-dim` for background areas you want to recede, making the primary content cards feel like they are coming forward.
*   **Do** prioritize "Natural Language" over technical terms (e.g., "Our Shared Wealth" instead of "Total Assets").

### Don't:
*   **Don't** use 1px solid lines to separate content. Use white space or color blocks.
*   **Don't** use standard "Material" blue or generic "Bootstrap" green. Stick strictly to the Teal/Coral/Warm Gray palette.
*   **Don't** crowd the interface. If a screen feels "busy," increase the padding by 1.5x. Financial clarity requires mental space.