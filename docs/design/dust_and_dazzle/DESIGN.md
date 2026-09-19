---
name: Dust and Dazzle
colors:
  surface: '#fff8f5'
  surface-dim: '#efd5c6'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ea'
  surface-container: '#ffeade'
  surface-container-high: '#fee3d4'
  surface-container-highest: '#f8ddcf'
  on-surface: '#261910'
  on-surface-variant: '#55433c'
  inverse-surface: '#3d2d23'
  inverse-on-surface: '#ffede4'
  outline: '#88726b'
  outline-variant: '#dcc1b8'
  surface-tint: '#9a4524'
  primary: '#8a3919'
  on-primary: '#ffffff'
  primary-container: '#a9502e'
  on-primary-container: '#ffe6de'
  inverse-primary: '#ffb59b'
  secondary: '#576248'
  on-secondary: '#ffffff'
  secondary-container: '#dae7c6'
  on-secondary-container: '#5d684e'
  tertiary: '#6e4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#8e6100'
  on-tertiary-container: '#ffe7c8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#7b2e0e'
  secondary-fixed: '#dae7c6'
  secondary-fixed-dim: '#becbac'
  on-secondary-fixed: '#151e0a'
  on-secondary-fixed-variant: '#3f4a32'
  tertiary-fixed: '#ffdead'
  tertiary-fixed-dim: '#f9bc55'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#fff8f5'
  on-background: '#261910'
  surface-variant: '#f8ddcf'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 68px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 46px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 21px
    fontWeight: '500'
    lineHeight: 28px
  body-reading:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.01em
  body-reading-mobile:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-italic:
    fontFamily: Newsreader
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 34px
  label-smallcaps:
    fontFamily: Newsreader
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.15em
  label-caption:
    fontFamily: Newsreader
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 1.5rem
  margin-desktop: 3rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

## Brand & Style

This design system crafts an intimate, quiet, and reflective sanctuary for the literary memoir *"Dust and Dazzle: Tales from a Village and a City"* by Ajeet Kumar Singh. Rooted in the duality of rural earthiness ("Dust") and luminous urban reverie ("Dazzle"), the aesthetic merges physical bookmaking craftsmanship with the quiet simplicity of meditative reading interfaces.

The emotional resonance is warm, candlelit, contemplative, and deeply nostalgic. It evokes aged rag paper, sun-dried earth, fountain pen ink, and the delicate flicker of a diya at dusk. The design philosophy leans on tactile editorial minimalism—avoiding sterile tech patterns in favor of classic print typesetting, balanced negative space, subtle physical metaphors, and restraint. The interface deliberately slows the reader down, inviting lingering attention rather than hasty scanning.

## Colors

The color palette embodies organic physical substances: pressed cotton paper, river clay, deep forest foliage, and burning brass.

- **Primary (`#A9502E` — Clay Terracotta):** Earthy baked soil. Used for primary interactions, key actions, interactive chapter marks, and active navigational moments.
- **Secondary (`#3F4A32` — Banyan Green):** Deep botanical shade derived from ancestral village banyan canopies. Reserved for subtle metadata tags, timestamps, secondary labels, and tranquil accents.
- **Tertiary (`#C9922E` — Diya Gold):** The sacred glow of a clay lamp flame. Used with exquisite restraint: drop capitals, ornamental chapter flourishes, quiet highlights, and hairline divider accents. Never overused as large surface fills.
- **Neutral / Text (`#2B1D14` — Deep Ink Brown):** A vintage sepia-black that softens the stark visual fatigue of pure black on light surfaces, mimicking archival iron gall ink.
- **Backgrounds & Canvas Surfaces:**
  - Base canvas / Canvas paper: `#F5EBDA`
  - Container / Inset parchment: `#EBDDC4`
  - Subtle hairline borders: `#D8C7AA`

## Typography

Typography functions as the primary visual architecture. 

- **Display & Headlines (Playfair Display):** Conveys literary stature, classical grace, and emotional drama. Headings favor normal font weights (`400`) over heavy bolds to retain airiness and delicate stroke contrast.
- **Narrative & Prose (Newsreader):** Set between 18px and 20px with a generous 1.8× line height (`36px` on desktop) for uninterrupted immersion. Optical sizing features and proportional oldstyle figures should be active where supported.
- **Metadata, Subheadings & Labels:** Styled in refined small capitals (`label-smallcaps`) with wide tracking (`0.15em`), evoking traditional book title pages, canto headers, and publication colophons.
- **Drop Caps:** The opening character of essays or chapters spans three lines in Playfair Display, highlighted in `Diya Gold` (`#C9922E`).

## Layout & Spacing

The layout is built upon the rhythm of a physically bound memoir.

- **The Reading Column:** The canonical text container enforces a maximum width of `680px` (`42.5rem`), centering the narrative with expansive negative margins to emulate wide book borders and margins of an artisanal hardbound volume.
- **Section & Editorial Containers:** Broader layout sections (gallery plates, archival photographs, dual city-versus-village maps) expand up to `1040px`, but text commentary within them remains anchored to the 680px reading spine.
- **Vertical Cadence:** Generous vertical breaks (`space-xl` and above) are used between episodic shifts, poetic breaks, and memoirs sections. Thin decorative gold hairlines (`1px` width in `#D8C7AA` with a centered gold emblem or asterisk) provide peaceful closure between passages.
- **Responsive Adaptations:**
  - **Mobile (< 768px):** Outer margin collapses to `1.5rem` (`24px`). Body size tunes down to `18px/32px` to sustain optimal character count per line (45–65 characters).
  - **Desktop (>= 1024px):** Margins expand to `3rem` to `5rem`, keeping the focal reading column uncrowded.

## Elevation & Depth

This design system deliberately eschews digital drop shadows and synthetic elevation layers. Depth is tactile, physical, and warm:

- **Tonal Insets & Layering:** Visual hierarchy is achieved entirely through the interplay between Paper Cream (`#F5EBDA`) base canvas and Deeper Paper (`#EBDDC4`) panels. Cards, excerpts, and archival notes sit softly recessed or gently resting on the canvas without elevation lift.
- **Hairline Framing:** In place of shadows, containers utilize a whisper-thin 1px border in Muted Warm Paper (`#D8C7AA`).
- **Warm Golden Radiance:** For active focus states or highlighted passages, interactive elements emit an ambient, ultra-diffused halo tinted with warm Diya Gold (`rgba(201, 146, 46, 0.18)` blur: 16px, spread: 0px), mimicking the spill of candlelight on aged vellum rather than a directional cast shadow.

## Shapes

The shape vocabulary mirrors trimmed, hand-bound rag paper. Edges are gentle and soft rather than geometric or aggressively rounded:

- Corner radii remain subtle (`0.25rem` to `0.5rem`) to preserve the feeling of cut paper sheets, bookplates, and tipped-in photographic prints.
- Buttons and chips utilize slightly softened corners, strictly avoiding hyper-modern full pill shapes.
- Inset illustration and archival frames use square or minimally softened rectangular contours, occasionally framed with double-hairline rules.

## Components

### Buttons & Interactive Links
- **Primary Buttons:** Solid Terracotta background (`#A9502E`) with Cream text (`#F5EBDA`). Padding: `0.75rem 1.75rem`. Shape: `rounded` (`4px`). Hover brings a gentle deepening to `#8E3E21` accompanied by a soft Diya Gold ambient glow.
- **Secondary / Ghost Buttons:** Transparent surface with 1px border in `#A9502E` or `#D8C7AA`, text in Ink Brown (`#2B1D14`). Hover fills subtly with `#EBDDC4`.
- **Text Links:** Clay Terracotta (`#A9502E`) adorned with an understated dotted underline with a 3px offset, transitioning to solid on hover.

### Cards & Excerpt Vignettes
- **Memoir Cards & Chapter Previews:** Crafted on Deeper Paper (`#EBDDC4`) backgrounds with a 1px `#D8C7AA` border. Padding: `space-lg`. 
- **Deckled / Tipped-in Visual Plates:** Historical photos and sketches are framed in a double-hairline border (`#D8C7AA`), slightly offset from the body text with captions in `label-caption` italicized style.

### Chips & Tags
- **Thematic Badges (e.g., "Village", "City", "1974"):** Rendered in Banyan Green (`#3F4A32`) at 10% opacity for backgrounds, text in solid `#3F4A32` in `label-smallcaps` typography, bounded by soft `0.25rem` corners.

### Form Inputs & Text Fields
- **Fields:** Background of `#EBDDC4`, framed with a 1px border of `#D8C7AA`. Input text in Ink Brown (`#2B1D14`).
- **Focus State:** Border shifts to Terracotta (`#A9502E`) with a soft Diya Gold halo (`box-shadow: 0 0 0 3px rgba(201, 146, 46, 0.2)`). Labels remain floating or static in small-caps.

### Dividers & Ornaments
- **Diya Flourish:** A 1px horizontal line in `#D8C7AA` broken in the center by a diamond or botanical glyph in Diya Gold (`#C9922E`).
- **Pull Quotes:** Left-bordered with a 2px Terracotta rule, set in Newsreader italic with an enlarged font size (`24px`), indented generously from the reading margin.