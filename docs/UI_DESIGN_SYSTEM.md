# KisanKhata 3D Agricultural UI Design System

## Overview

KisanKhata features a full-fidelity, immersive **3D Agricultural Interface** tailored specifically for Indian farmers and farmlands. The design blends procedural Three.js WebGL rendering, realistic materials, and an Apple/macOS-inspired liquid glassmorphism design system in KisanKhata's brand palette (`#012D1D` deep forest green, `#116C4A` emerald green, `#A1F4C8` fresh mint, and `#FFDCC3` warm earth).

---

## 1. 3D Architectural Scene & Models

### A. Procedural Indian Farmer Model (`FarmerCharacter.tsx`)
- **Proportions & Anatomy:** Anatomically structured mesh hierarchy featuring head with facial details, neat mustache, skin tone (`#B3764D`), articulated arms, legs, and traditional attire.
- **Traditional Attire:**
  - **Pagri / Safa (Turban):** Multi-layered wrapped cloth rings with crest pleats and hanging fabric tail (`pallu`) in saffron (`#E67E22`).
  - **Kurta:** Khadi cotton tunic with collar and chest crease shading (`#F5EEDB`).
  - **Dhoti:** Draped pleats with folded volume (`#EDE6D6`).
  - **Gamcha:** Diagonal shoulder scarf (`#D35400`).
  - **Sandals (Chappals):** Dark leather soles and foot straps.
- **Agricultural Tool:** Wooden handle hoe (`kudal` / `phawra`) with metallic steel blade and socket rivets.
- **Animation States:**
  - `farming`: Rhythmic tilling cycle with downward swing, torso lean, and ground strike.
  - `waving`: Friendly right-hand wave greeting visitors.
  - `idle`: Natural breathing chest oscillation and field inspection.
  - `auto`: Autonomous multi-state cyclical blending.

### B. Detailed Indian Agricultural Tractor (`Tractor3DModel.tsx`)
- **Body & Chassis:** Heavy steel spine frame with front and rear axle housings.
- **Bonnet & Grille:** Sculpted engine hood in Indian agricultural red (`#C0392B`) with chrome side trim, radiator grille with horizontal cooling slats, dual headlights with warm emissive glow (`#FFF2A8`), and brand emblem.
- **Mechanicals:** Engine block, side air cleaner snorkel canister with cyclone bowl, and vertical exhaust stack with animated hinged rain flap.
- **Operator Cabin:** Textured footboards, suspension farmer seat, angled steering column with 3-spoke wheel, instrument dashboard, arched mudguards with tail reflectors, and rear 3-point hitch.
- **Wheels & Cleats:** Large rear drive wheels with radial chevron V-groove lugs (treads) in rubber black (`#1A1A1A`) and agricultural yellow dishes (`#FBC02D`); front ribbed steering tires.

### C. Indian Crop & Produce Models (`Crop3DModels.tsx`)
Contains procedural PBR 3D models for all major agricultural crops and equipment:
- **Fruits:** Alphonso/Kesar Mango, Robusta Banana bunch, Nasik Grape cluster, Bhagwa Pomegranate with calyx crown, Nagpur Orange, Guava, Papaya, Watermelon with dark stripes.
- **Vegetables:** Plump Tomato with 5-point star calyx, layered Onion with roots, Potato with dimpled eyes, glossy Brinjal (Eggplant), curved Chilli pepper, Cabbage with ruffled leaves, 5-fluted Okra (Bhindi).
- **Grains & Cereals:** Whisker-awned Wheat stalk, Rice panicle, Golden Maize cob with husks and silk tassel.
- **Pulses & Cash Crops:** Green Pulse pod with seeds, segmented Sugarcane stalks with nodes, Cotton boll with fluffy white puffs.
- **Farm Equipment:** Stenciled NPK Fertilizer sack, Knapsack crop sprayer tank with pump wand.

---

## 2. Interactive Components

| Component | File Path | Functionality |
| :--- | :--- | :--- |
| `FarmHeroScene` | `frontend/src/components/three/FarmHeroScene.tsx` | Main interactive homepage 3D farm scene (farmer + crops + tractor + canal + orchard + hills + clouds). Includes damped camera parallax. |
| `StaticHeroFallback` | `frontend/src/components/three/StaticHeroFallback.tsx` | Pure SVG/CSS agricultural landscape illustration for instant loading, non-WebGL environments, and `prefers-reduced-motion`. |
| `MiniFarmCanvas` | `frontend/src/components/three/MiniFarmCanvas.tsx` | Compact, lightweight 3D farm viewport for the Farmer Dashboard welcome header. |
| `Crop3DSelector` | `frontend/src/components/Crop3DSelector.tsx` | Category-aware visual crop picker with interactive 3D model preview, search, category tabs, and duration autofill. |
| `TiltCard` | `frontend/src/components/TiltCard.tsx` | Reusable 3D perspective hover card with dynamic specular light glare. |
| `CountUp` | `frontend/src/components/CountUp.tsx` | Smooth easeOutCubic animated numeral counter with Indian Rupee formatting. |

---

## 3. Glassmorphism Tokens (`index.css`)

- `.glass`: Multi-layer blur (`backdrop-filter: blur(20px) saturate(175%)`), 1px white border, soft drop shadow.
- `.glass-strong`: High-spec modal window glass (`blur(28px) saturate(190%)`).
- `.glass-subtle`: Gentle translucent panels (`blur(10px)`).
- `.glass-dark`: Deep forest green glass overlay (`rgba(1, 45, 29, 0.85)`).
- `.water-shimmer`: Animated cyan/emerald gradient simulating clear water irrigation flow.
- `@media print`: Clean white-paper mode that removes glass/canvas effects and resets colors to high-contrast ink-friendly black on white paper.

---

## 4. Performance & Reliability Guarantees

1. **Lazy Loading & Chunk Splitting:** Three.js and `@react-three` are isolated into a `vendor-three` bundle (~246 kB gzip); `FarmHeroScene` is loaded asynchronously via `React.lazy()` and `Suspense`.
2. **DPR Capping:** Device Pixel Ratio is clamped to `[1, 1.5]` to avoid GPU throttling on 3x/4x mobile screens.
3. **Visibility & Scroll Pausing:** `IntersectionObserver` and `document.visibilityState` automatically pause rendering when the canvas is off-screen or the browser tab is hidden.
4. **Accessibility:** Automatically switches to `StaticHeroFallback` when `prefers-reduced-motion: reduce` is enabled.

