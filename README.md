# 🍽️ Meet Me Cafe & Restaurant • Project Documentation & Technical Journey

> **Location**: Kalyani, West Bengal  
> **Aesthetic Theme**: Youthful Gen-Z Pop (Electric Lavender, Matcha Neon, Midnight Black & Lavender Base)  
> **Key Libraries**: Vanilla HTML5/CSS3, JavaScript (ES6+), GSAP 3, ScrollTrigger

---

## 📖 1. Project Overview & Vision

**Meet Me Cafe & Restaurant** is a vibrant, youth-forward dining destination in Kalyani, West Bengal, renowned for its sizzling Indo-Chinese appetizers, Continental burgers, hand-rolled momos, ceremonial matcha brews, and multi-person combo feasts.

The goal of this project was to elevate the cafe's web presence from a standard restaurant page into a **high-end, interactive digital experience**. Inspired by modern brutalist pop art, Apple-style scroll kinematics, and McDonald's fluid mobile UI, the website combines cinematic video motion, fine-grained halftone print textures, and instantaneous client-side menu exploration.

---

## 🎨 2. Design System & Aesthetics

The interface strictly adheres to a tailored **Youthful Gen-Z Pop** visual language:

### Color Palette Tokens

| Token                              | Hex Code  | Semantic Role                                                               |
| :--------------------------------- | :-------- | :-------------------------------------------------------------------------- |
| `--color-bg-base`                  | `#F0E7F2` | Warm lavender mist base canvas for cards and background                     |
| `--color-accent-electric-lavender` | `#A259FF` | Primary interactive buttons, active category pill state, glowing highlights |
| `--color-pop-matcha-neon`          | `#C2EB12` | Neon sticker badges, pulsing indicators, dietary pop accents, price tags    |
| `--color-text-midnight-black`      | `#12131A` | High-contrast typography, deep shadows, and halftone ink mask dots          |
| `--color-text-hero-primary`        | `#FFFFFF` | Display headlines and text on top of the dark video overlay                 |

### Typography

- **Headlines & Display (`--font-primary`)**: `Outfit` (weights: 600, 700, 800, 900) — Bold, geometric, and punchy.
- **Body, UI & Meta (`--font-secondary`)**: `Plus Jakarta Sans` (weights: 400, 500, 600, 700) — Ultra-clean readability on mobile screens.

### Frosted Glassmorphism

- Navbars and badges utilize dynamic multi-layer backdrop blur:
  ```css
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(18, 19, 26, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 4px 20px rgba(18, 19, 26, 0.04);
  ```

---

## 🎬 3. Hero Section & Halftone Dotted Video Masking

### The Technical Challenge

The hero background utilizes `download.mp4` (~5.85 MB). The source video had lower resolution and digital compression artifacts (macroblocking, pixelation, and motion blur) that were visible on modern desktop and retina screens.

### The Solution: 45° Staggered Halftone Dotted Texture

To disguise pixelation without blurring the video, we overlaid a mathematical **offset halftone micro-dot pattern**:

```css
.hero-halftone-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  background-image:
    radial-gradient(
      circle at 1.25px 1.25px,
      rgba(18, 19, 26, 0.82) 1.1px,
      transparent 1.15px
    ),
    radial-gradient(
      circle at 3.75px 3.75px,
      rgba(18, 19, 26, 0.82) 1.1px,
      transparent 1.15px
    );
  background-size: 5px 5px;
  background-repeat: repeat;
  backdrop-filter: contrast(118%) brightness(96%);
}
```

- **Why this works**: The human visual system locks onto the razor-sharp geometric perimeter of the micro-dots (1.1px radius on a 5px offset grid). Any compression noise in the underlying video is perceived as intentional depth, luminance, and shading behind a high-res graphic screen-print mesh (similar to CRT monitors and offset printing plates).

### Gradient Calibration & Vignette (Elimination of White Fog)

- An initial prototype had a gradient that dissolved into `--color-bg-base` at the bottom (`rgba(240, 231, 242, 0.88)`), which created a cloudy/whitish fog over the food.
- **Resolution**: We eliminated all white overlays. The gradient was rewritten with a pure dark vignette at the top (`rgba(18, 19, 26, 0.7)`) for navbar legibility, leaving the entire center and bottom crystal-clear (`transparent` with subtle `0.25` edge framing), giving the dishes 100% color punch and deep shadows.

---

## ⚡ 4. Scroll-Triggered Hero Interaction Architecture

### The User Experience Flow

1. **Initial Page Load**:
   - The user lands on `#page1` (full-height hero).
   - Video is paused at frame 0.
   - Hero headline (`Where Flavors Meet Good Times`) and CTA buttons enter with a smooth `gsap.to` animation (0.2s stagger between title and buttons).
2. **Scroll Gesture Interception**:
   - When the user scrolls down (via mouse wheel, touch swipe, or down arrow key), the scroll event is **intercepted and locked in place** (`preventDefault()`, `overflow = 'hidden'`). The page **does not prematurely move**.
3. **In-Place Hero Sequence**:
   - Video playback accelerates to **`4.8x` speed** (`heroVideo.playbackRate = 4.8; heroVideo.play();`).
   - `gsap.to` animates the headline up and out (`y: -60, opacity: 0`).
   - `gsap.to` animates the CTA button group up and out with a staggered delay.
   - The fast video is showcased in full view for a calibrated **`1s` hold**.
4. **Scroll Activation & Menu Arrival**:
   - **Only after the animation ends**, page scrolling is unlocked (`overflow = ''`).
   - The page smoothly glides down into the menu section (`#page3`).
   - `#page2:empty { display: none; height: 0; }` was implemented to eradicate a 50vh dead blank void, making the camera glide directly from the video into the dishes.
5. **Menu Entrance (`gsap.fromTo` on Y-Axis)**:
   - At 260ms into the smooth scroll, `triggerMenuEntranceAnimation()` fires:
     - `.menu-categories-nav`: Rises from `y: 50, opacity: 0` to `y: 0, opacity: 1` (`0.8s`, `power3.out`).
     - `.menu-sections-wrapper`: Rises from `y: 75, opacity: 0` to `y: 0, opacity: 1` (`0.95s`, `delay: 0.12s`, `power3.out`).
6. **Smooth Rewind to Top**:
   - Scrolling back to `scrollY <= 10` resets the sequence: rewinds the video to 0, brings the title and buttons back in with stagger, and arms the scroll trigger for the next interaction.

---

## 📋 5. Menu Architecture & Categorization

### In-Place Menu Tab Switcher (No Page Reload)

- Previously, clicking category tabs redirected the user to `menu.html`.
- **Transformation**: Implemented an in-place tab replacement system inside `.menu-sections-wrapper`:
  ```javascript
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      // Active pill state
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      pill.scrollIntoView({ behavior: "smooth", inline: "center" });
      // In-place section replacement with fade-in animation
      landingCategorySections.forEach((section) => {
        section.classList.toggle("active", section.id === targetId);
      });
    });
  });
  ```

### Structural Cleanup: Eradication of "Section 1" / "Section 2"

- Removed all arbitrary `<span class="category-section-tag">Section 1</span>` and `<span class="category-section-tag">Section 2</span>` badges.
- **Restored Clear Diet Separations**: Grouped items cleanly within `.category-diet-block` containers with `.diet-badge.non-veg-badge` (Red/Rose) and `.diet-badge.veg-badge` (Emerald Green) headers.

### Supported Menu Categories (100+ Total Items)

1. **All Specials** (Chef's picks: Chicken Strips, Kurkure Momos, Kolkata Fish Fry, Honey Chilli Potatoes)
2. **Appetizers** (Dry Chili Chicken, Lollipop, Crispy Chili Babycorn, Dry Chili Mushroom)
3. **Continental** (Handcrafted Burgers, Grilled Sandwiches, Stuffed Wraps, Loaded Peri Peri Fries)
4. **Beverages** (Cold Brews, Bubble Teas, Ceremonial Japanese Matcha, Artisanal Mojitos)
5. **Shakes** (Nutella Crunch, Belgian Chocolate, Alphonso Mango, Strawberry Cream)
6. **Desserts** (Belgian Waffles, Sizzling Brownies with Ice Cream)
7. **Combos** (Couple Combos, Student Budget Feasts, Meet Me Grand Feast for 6)

---

## 📂 6. Detailed File-by-File Breakdown

```
c:\Users\PC\Websites\Meet me\
├── index.html            # Primary landing page (Hero, In-Place Menu, Navigation, Footer)
├── menu.html             # Full standalone catalog page with search & comprehensive categories
├── style.css             # Unified CSS design system, tokens, halftone textures, animations
├── script.js             # GSAP timelines, scroll-lock engine, video fast-playback, in-place tabs
├── menu_schema.csv       # Normalized tabular menu dataset extracted from physical menu
├── download.mp4          # Hero background video asset
├── images/               # High-res photography of signature dishes
└── README.md             # This comprehensive project documentation
```

### 1. `index.html`

- **Navigation (`#nav`)**: Frosted glass top bar fixed at `top: 0` with dynamic corner overflow geometry.
- **Hero Scroll Track (`#hero-scroll-track`)**: Container housing `#page1.hero-section`.
  - `<video class="hero-bg-video" muted playsinline preload="auto">`
  - `<div class="hero-halftone-overlay">`: Screen-print micro-dot matrix.
  - `<div class="hero-gradient-overlay">`: Dark vignette and optical clarity filter.
  - `.hero-content`: Headline with gradient text highlight, CTA group (`Explore Menu` & `Full Menu Catalog`), and mouse scroll indicator.
- **Page 2 (`#page2.reviews-section`)**: Continuous infinite horizontal marquee powered by GSAP displaying authentic Google Reviews (5.0 rating, avatars, ratings, timestamps, and customer feedback). Proportionately fits the 50vh section height with edge-fade masks and hover-pause interactivity.
- **Menu Section (`#page3`)**:
  - `#section-0.mobile-section-0`: Mobile-only 2-column visual category grid (hidden on desktop) displaying 6 boilerplate skeleton cards with an alternating X-axis staggered entrance.
  - `.menu-categories-nav`: Horizontally scrollable sticky pill tab list (`role="tablist"`).
  - `.menu-sections-wrapper`: Houses category blocks (`#section-all-specials`, `#section-appetizers`, etc.) toggled in-place.
  - Each item card (`.menu-item-card`) contains food imagery, title, price, description, portion size, and add-to-order button.
  - Bottom banner card linking to `menu.html` for complete 100+ item catalog.
- **Script Tags**: GSAP `3.12.5`, GSAP `ScrollTrigger`, and `script.js`.

### 2. `menu.html`

- Standalone, dedicated catalog page designed for deep menu browsing.
- Includes complete category sections, grand feast combo breakdowns, and quick-order interaction parity.
- Synchronized styling sharing `style.css` design tokens.

### 3. `style.css`

- **Root Tokens (`:root`)**: Complete typography definitions and HSL/HEX color tokens.
- **Halftone Texture Rules**: `.hero-halftone-overlay` with dual offset radial gradients and contrast/brightness filters.
- **Menu Card Styles**: Card borders (`rgba(18, 19, 26, 0.08)`), hover translations (`translateY(-4px)`), and badge pill styles.
- **Sticky Tab Styling**: `.category-pill.active` highlighted in Electric Lavender with soft glow shadows.
- **Toast Styles**: Custom floating pill toast notification with matcha green `ADDED` badge.
- **Responsive Media Queries (`@media (max-width: 768px)`)**: Touch optimizations, adjusted font sizes (`clamp`), horizontal scroll snapping for category tabs, and full mobile safe-area padding (`env(safe-area-inset)`).

### 4. `script.js`

- **Logo Reveal**: GSAP from animation on Y-axis with a 0.5s delay.
- **Hero Entrance**: GSAP `set` and `to` stagger between headline and CTA buttons.
- **Scroll Lock Engine**: `wheel`, `touchmove`, and `keydown` interception at `window.scrollY <= 15`.
- **Hero Timeline (`triggerHeroSequence`)**:
  - Sets video `playbackRate = 4.8` and plays.
  - Animates headline out (`y: -60`), buttons out.
  - Holds for **`1s`** to showcase video motion.
  - Unlocks scroll on completion and smoothly scrolls to `#page3`.
- **Section 0 Mobile Entrance Timeline**:
  - Independent GSAP timeline on `#section-0` (ScrollTrigger `start: 'top 85%'`, `toggleActions: 'play none none none'`).
  - Alternating zigzag cascade (`0.08s` stagger, `0.95s` duration, `power4.out`): left cards slide in from `x: -80px`, right cards slide in from `x: +80px`.
- **Menu Parallax & Direction-Reactive Scroll Retreat**:
  - Independent ScrollTrigger timelines on `.category-header`, `.category-diet-block` (headers and dish cards), and `.menu-view-all-banner`.
  - When scrolling down (`direction === 1`): items smoothly animate upward into place (`y: 0`).
  - When scrolling up (`direction === -1`): items smoothly reverse downward in a retreat animation (`y: +95px` / `+50px`), maintaining full opacity.
  - Recalibrates triggers dynamically via `ScrollTrigger.refresh()` upon tab switching.
- **In-Place Tab Switcher**: Manages `.active` classes on pills and menu sections, centering active pill via `scrollIntoView`.
- **Toast Feedback**: Dynamic DOM toast creation on item add button clicks with 2.6s auto-dismiss.

### 5. `menu_schema.csv`

- Tabular schema containing every dish:
  - Fields: `Category`, `Subcategory`, `Item Name`, `Price (INR)`, `Portion`, `Dietary Flag (Veg/Non-Veg)`, `Ingredients/Flavor Notes`.

---

## 🛠️ 7. Local Development & Verification

### Running the Project

1. Open the project folder in **VS Code**.
2. Start **Live Server** on port `5500`:
   - URL: `http://127.0.0.1:5500/index.html`
3. Alternatively, open `index.html` directly in any modern browser (Chrome, Edge, Safari, Firefox).

### Browser Compatibility

- **Desktop**: Chrome, Edge, Safari, Firefox (Tested with hardware acceleration and high-DPI displays).
- **Mobile**: iOS Safari and Android Chrome (Muted inline video autoplay, touch gesture cancellation, and safe-area insets).

---

## 💡 8. Key Learnings & Engineering Takeaways

1. **Halftone Masking Over Video**: Overcoming low-resolution video artifacts with CSS procedural radial dot patterns is significantly lighter and more performant than heavy video upscaling models or massive 4K asset downloads.
2. **Scroll Lock vs. Native Scrolling**: Relying on pure CSS scroll scrubbing can cause fatigue on long tracks. Intercepting the initial scroll event, locking the hero during an animated sequence, and then smoothly delegating to native scroll provides the best of both worlds: cinematic immersion without scroll hijacking frustration.
3. **GSAP `fromTo` vs. `from`**: When elements are animated upon reaching a section, using `fromTo` with explicit initial and terminal values avoids CSS state caching bugs that can occur with simple `from` tweens during dynamic scroll transitions.
