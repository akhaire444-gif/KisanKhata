# KisanKhata Glassy / Watery Design System ("Clear Water on a Green Field")

## 1. Overview & Philosophy
The **KisanKhata Glassy / Watery Design System** bridges high-end modern glassmorphism (macOS / Liquid Glass aesthetics) with rural agricultural utility. The design metaphor is **"Clear Water on a Green Field"** (खेतातील स्वच्छ पाणी):
- Crisp, hyper-clear translucency with high-fidelity refraction borders.
- Calm, refreshing water gradients with slow-drifting living-water orbs and subtle caustic patterns.
- High-contrast, legible typography preserving 100% WCAG AA compliance for daylight outdoor farm use.
- Interactive 3D micro-animations (perspective tilt, specular reflections, dynamic WebGL hero scene) while strictly preserving zero-overhead performance and accessibility defaults (`prefers-reduced-motion`).

---

## 2. Color Palette & Atmospheric Tokens

| Token Name | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-deep-forest` | `#012d1d` | Primary brand green, high-contrast headings, active dark accents |
| `--color-emerald-deep` | `#116c4a` | Primary CTA gradients, action icons, active states |
| `--color-emerald-light` | `#1b4332` | Secondary CTA hover surfaces, dark glass tints |
| `--color-mint-bright` | `#a1f4c8` | Highlighting, positive badges, water-light reflections |
| `--color-mint-soft` | `#c1ecd4` | Subtle chips, badge backgrounds, table tag accents |
| `--color-sunlit-soil` | `#ffdcc3` | Warm earth accents, warning/pending highlights |
| `--color-text-main` | `#111c2d` | High-contrast body text (meets WCAG AA > 7:1) |
| `--color-text-muted` | `#414844` | Secondary descriptions, timestamps, subtitles |
| `--water-grad-start` | `#eaf6f0` | Living water background ambient gradient stop 1 |
| `--water-grad-mid` | `#e3f1f4` | Living water background ambient gradient stop 2 |
| `--water-grad-end` | `#f4f8ff` | Living water background ambient gradient stop 3 |

---

## 3. Glass Utility Classes & Composition

Defined in `frontend/src/index.css`:

### 3.1 Base Glass (`.glass`)
Used for primary cards, feature grids, preview modules, and table containers.
- **Background:** `rgba(255, 255, 255, 0.72)`
- **Backdrop Filter:** `blur(18px) saturate(160%)`
- **Border:** `1px solid rgba(255, 255, 255, 0.82)`
- **Box Shadow:** `0 12px 36px -6px rgba(1, 45, 29, 0.08), 0 4px 16px -2px rgba(1, 45, 29, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)`

### 3.2 Strong Glass (`.glass-strong`)
Used for top navigation bar (`Header`), dialogs, and modals (`AuthModals`, `ExpenseModal`, `CropModal`, `WorkerModal`, etc.).
- **Background:** `rgba(255, 255, 255, 0.88)`
- **Backdrop Filter:** `blur(24px) saturate(180%)`
- **Border:** `1px solid rgba(255, 255, 255, 0.95)`
- **Box Shadow:** `0 24px 64px -12px rgba(1, 45, 29, 0.16), 0 8px 24px -4px rgba(1, 45, 29, 0.06), inset 0 1px 2px 0 rgba(255, 255, 255, 1)`

### 3.3 Subtle Glass (`.glass-subtle`)
Used for nested cards, table rows, filter toolbars, and inactive button badges.
- **Background:** `rgba(255, 255, 255, 0.52)`
- **Backdrop Filter:** `blur(12px) saturate(140%)`
- **Border:** `1px solid rgba(255, 255, 255, 0.65)`
- **Box Shadow:** `0 4px 16px -2px rgba(1, 45, 29, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)`

### 3.4 Dark Glass (`.glass-dark`)
Used for high-priority hero KPI cards (e.g., Total Recorded Expenses) for dramatic visual contrast.
- **Background:** `linear-gradient(135deg, rgba(1, 45, 29, 0.92) 0%, rgba(17, 108, 74, 0.85) 100%)`
- **Backdrop Filter:** `blur(20px) saturate(170%)`
- **Border:** `1px solid rgba(161, 244, 200, 0.35)`
- **Box Shadow:** `0 20px 48px -8px rgba(1, 45, 29, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)`

### 3.5 Glass Form Inputs (`.glass-input`)
Used for text fields, number inputs, date selectors, and dropdowns.
- **Background:** `rgba(255, 255, 255, 0.75)`
- **Backdrop Filter:** `blur(10px)`
- **Border:** `1px solid rgba(1, 45, 29, 0.15)`
- **Focus State:** `ring-2 ring-[#116c4a]/30 border-[#116c4a] bg-white/95`

### 3.6 Glass Buttons & Interactive Controls
- **`.glass-btn-primary`:** Linear gradient `rgba(1, 45, 29, 0.95)` to `rgba(17, 108, 74, 0.90)` with specular inset highlight and hover lift.
- **`.glass-btn-secondary`:** Neutral frosted translucent button with border hover brightening.
- **`.water-shimmer`:** Smooth animated 45-degree diagonal light sweep across buttons on hover.

---

## 4. 3D & Micro-Interaction Architecture

### 4.1 3D Living Farm & Animated Farmer Scene (`FarmHeroScene.tsx`)
- **Technology:** `@react-three/fiber` + `@react-three/drei` with Three.js.
- **Code Splitting & Performance:** Dynamically loaded via React `lazy()` and `Suspense` with `StaticHeroFallback.tsx`. Completely isolated into its own lazy chunk (`FarmHeroScene-*.js`), keeping the initial entry bundle light (~394 kB).
- **Scene Elements:**
  - **Procedural 3D Indian Farmer:**
    - Stylized low-poly farmer wearing cotton kurta, traditional dhoti, green sash, and saffron gamcha/pagri (turban).
    - Holding wooden and iron farming hoe (pawda/khurpi).
    - Procedural natural animation loop in `useFrame`: gentle rhythmic bending to inspect soil/crops, arm swinging with farming tool, head tilting, breathing weight shift.
  - **Agricultural Crop Rows & Furrows:**
    - Raised soil ridges (`#45260e`) with orderly rows of crops.
    - Foliage plants swaying gently in the breeze using trigonometric phase offsets.
  - **Irrigation Water Canal:**
    - Water canal running alongside the crop rows with `MeshPhysicalMaterial` (`ior: 1.333`, `transmission: 0.85`, translucent aqua tint).
  - **Environment & Horizon:**
    - Distant green rolling hills and layered low-poly pine/shade trees.
    - Soft, drifting fluffy white clouds on the horizon.
    - Directional sunlight casting warm natural morning rays across the fields.
  - **Damped Parallax:** Subtle mouse coordinate tracking with smoothed spring damping.
- **Battery & Performance Protections:**
  - `IntersectionObserver`: Pauses rendering loop when scrolled out of viewport.
  - Page Visibility API: Pauses rendering when browser tab is inactive.
  - WebGL Capability Check: Silently renders `StaticHeroFallback` on browsers/devices without WebGL support.
  - Pointer events disabled on canvas layer so hero text, buttons, and Google sign-in are 100% accessible and click-through.

### 4.2 TiltCard Component (`TiltCard.tsx`)
- Pure CSS 3D perspective transform (`perspective: 1000px`, `rotateX`, `rotateY`).
- Dynamic specular glare layer that tracks cursor movement across the card.
- Automatically disabled on touch screens and when `prefers-reduced-motion` is detected.

### 4.3 CountUp Component (`CountUp.tsx`)
- Smooth animated numerical counting using cubic ease-out bezier.
- Formats currency into Indian Rupee (`₹XX,XX,XXX`) notation seamlessly.
- Instantly renders final value if reduced-motion is requested.

### 4.4 Living Water Atmospheric Background
- **Base Gradient:** 3-stop living water gradient (`#eaf6f0` → `#e3f1f4` → `#f4f8ff`).
- **Floating Orbs:** 4 distinct large blurred radial orbs (`.animate-orb-1` through `.animate-orb-4`) rotating and drifting on 22s-36s infinite paths.
- **Caustic SVG:** Ultra-subtle SVG caustic light overlay at 12% opacity fixed in background.

---

## 5. Category-Based Crop Selection Architecture (`cropCatalogue.ts` & `CropCategorySelector.tsx`)

### 5.1 Context-Aware Interaction Flow
When a farmer registers a crop or edits an existing crop in `CropModal`:
1. **Category Selection:** Choosing a category (Fruits, Vegetables, Cereals & Grains, Pulses & Dal, Cash Crops, Spices & Herbs) dynamically refreshes the available crops.
2. **Vernacular & English Display:** Crops display both their standard English agronomic name and familiar vernacular Hindi/Marathi terms (e.g., `अनार (भगवा डाळिंब)`, `टमाटर (टोमॅटो)`, `गेहूं (गहू)`).
3. **Autofill Defaults:** Selecting any crop card auto-fills the crop name and provides a sensible default harvest cycle duration (e.g. 120 days for Tomato, 180 days for Pomegranate, 365 days for Sugarcane).
4. **Category Search & Custom Mode:** Allows rapid in-category text search and supports custom local varieties for unique regional cultivars.
5. **Dashboard Filtering:** The Crops Management tab supports instant tabbed filtering by category with item count chips and full-text search.

---

## 6. Accessibility & Device Adaptability

1. **WCAG AA Compliance:** All text tokens maintain contrast ratios exceeding 4.5:1 for body and 3:1 for large headers against all glass backgrounds.
2. **`prefers-reduced-motion` Support:** Disables 3D tilt, stops background orb oscillations, disables button shimmers, and skips numerical count-up animations.
3. **No-Backdrop-Filter Fallback:** Automatically provides opaque white backgrounds (`rgba(255, 255, 255, 0.96)`) when CSS `@supports not (backdrop-filter: blur(1px))` fires.
4. **Mobile Optimization (< 768px):** Reduces blur radii to conserve GPU battery life and memory, ensures min 44x44px touch targets.
5. **Print Stylesheet (`@media print`):** Completely strips all glassmorphism, background colors, orbs, blurs, and shadows. Resets all text to solid black on pure white paper for pristine A4 bank audits and Kisan Credit Card (KCC) documentation.

