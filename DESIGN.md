# Mai — soft summer, personal depth

Status: approved direction, proposed production specification. Implementation has not started. Numerical tokens below are a baseline for refinement, not additional user-approved requirements.

## 1. Visual theme and atmosphere

A small personal corner of the internet for Quynh Mai Vu. Warm summer light, muted colors, beautiful photography, a friendly introduction, and a restrained tactile interaction. The page should feel inviting and individual.

The user's preferred concept is the interactive photo-tilt prototype: a simple introduction above three slightly rotated photos, short personal captions, a little about her, and a quiet contact link. Keep one coherent visual language throughout.

Portable reference prototype: `design-reference/approved-prototype.html`. Open this exported standalone page in a browser to review the approved composition and interactions. It includes the illustrative images; fonts and icon resources may require network access. It is a design reference, not a production application or a verified replacement for the final gallery.

The original editable conversation fragment remains at `/Users/tylerle/.codex/visualizations/2026/11/08/01a1b87a-a8bd-7520-9da4-9dda1b35fd9c/mai-summer-depth.html` on the originating machine.

Its photos and copy are illustrative placeholders. Generated people are not Mai's likeness. The final site needs user-approved photographs and writing.

Seven user-supplied original photographs are now available in `src/assets/photos/`; see `manifest.json` for filenames, dimensions, and descriptive alt text. These are the real source assets for the future site. Captions and the opening selection are not finalized. The reference prototype retains its illustrative photos until explicitly updated.

## 2. Palette and semantic roles

| Token | Value | Role |
| --- | --- | --- |
| `canvas` | `#F1E9E5` | Continuous pale rose background |
| `photo-paper` | `#FCFAF7` | Thin photograph borders and caption strip |
| `ink` | `#39463E` | Main text and controls |
| `accent` | `#93616D` | Restrained rose accent and handwritten details |
| `sage` | `#DDE3D9` | Optional quiet supporting surface |
| `sea` | `#CBD8DF` | Optional supporting color, used sparingly |

Use semantic CSS custom properties rather than repeated literals. Use ink for essential text; verify every text/background pairing before release. Pale supporting colors do not become separate colored sections by default.

No neon, electric accents, bright yellow/coral backgrounds, purple gradients, or decorative glowing orbs. Warmth comes primarily from photographs and light.

## 3. Typography

| Role | Proposed family | Desktop | Mobile | Weight |
| --- | --- | --- | --- | --- |
| Introduction | DM Serif Display | 72px | 48px | 400 |
| Section heading | DM Serif Display | 28px | 26px | 400 |
| Body | DM Sans | 16px | 16px | 400 |
| Navigation | DM Sans | 14px | 14px | 400–500 |
| Photo caption | Caveat | 22px | 20px | 400 |

Use discrete responsive type steps, not viewport-width font scaling. Letter spacing is zero. Aim for body line height around 1.65 and short comfortable paragraphs. Handwriting is limited to captions and one small personal detail. Long names must wrap naturally. Use appropriate licensed fonts and fallbacks; include Vietnamese characters if the approved content needs them.

## 4. Page composition and component states

- Header: small `mai.` wordmark, a short About link, and verified contact/social links. Keep navigation minimal.
- Introduction: her name or "Hi, I'm Mai", one short sentence, and enough breathing room to make the photo composition the main visual event. Wording remains editable.
- Photo composition: initially three framed photographs, slightly staggered and rotated. Favor distinct fashion, travel, and everyday subjects only when her supplied photos support them.
- About: one compact, natural introduction. Professional background may be a sentence if she supplies it.
- Footer: a short personal detail and real contact/social links. Omit unavailable destinations instead of shipping dead links.

Use unframed sections. Only photographs and the viewer need a framed treatment. Photo corners stay around 2–4px. Avoid decorative cards, app chrome, dashboards, storefront patterns, marketing CTAs, and extra navigation categories.

Photo states: resting, hovered, keyboard-focused, pressed, opening, expanded, returning, image unavailable. A broken image must leave a usable caption or fallback. Expanded content preserves image proportions; page thumbnails may use deliberate subject-aware crops.

## 5. Layout and responsive behavior

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Content maximum: approximately 1100px; horizontal padding 20px on phones, 32px on tablets, 48px on larger screens.
- Use intrinsic Grid/Flex layouts with reserved image aspect ratios. Section heights follow content.
- Desktop: three-photo composition with modest rotations and clear stable hit areas. Decorative overlap must not obscure captions, faces, focus, or nearby controls.
- Mobile: rearrange into a tidy flow with usable photo sizes; switch to a vertical composition when three columns become too narrow. Keep DOM, reading, and keyboard order logical.
- The introduction and some photography should be visible together where the viewport permits. Do not force a full-screen hero or fixed page height.
- Verify 320, 390, 768, 1024, and 1440px widths, long names/captions, and zoom. No horizontal overflow.

## 6. Depth, motion, and photo interaction

The signature is subtle cursor-following depth, comparable to a tactile photo resting on paper. Preserve this deliberately requested behavior when applying third-party skills.

| Property | Baseline |
| --- | --- |
| Resting rotation | About -6, +2, +6 degrees across the composition |
| Pointer tilt | Maximum approximately 8 degrees per axis |
| Lift | Approximately 8px |
| Follow behavior | Smooth, input-driven; stop work when idle |
| Return | Approximately 450ms with a gentle settling ease |
| Viewer transition | Approximately 250–350ms, interruptible |

Measure pointer position relative to an untransformed wrapper to prevent feedback and jitter. Batch layout reads and schedule transform updates with `requestAnimationFrame`. The image, frame, and caption move as one object; keep the surrounding layout stable.

Use a subtle localized reflection, not a bright rainbow shine. Ambient and directional shadow layers create depth; animate an overlay's opacity or transform where practical rather than repeatedly painting large blurs. Only the active photograph rises above its neighbors.

Enable tilt for fine hover-capable pointers. Touch uses tap-to-open; no device-motion permission or gyroscope interaction. Reduced motion removes tilt, tracking reflection, and spatial expansion while preserving photo viewing. Keyboard users receive visible focus and every photo action.

Viewer: close, previous/next, captions, Escape, keyboard navigation, focus containment and return. Gestures supplement explicit controls. Keep visible navigation and text comfortably readable on phones. Use a mature viewer such as PhotoSwipe rather than expanding the prototype's simplified viewer into production by hand.

## 7. Interaction quality and performance

Adapted from Vercel's framework-independent guidance:

- Use native links and buttons with accessible names and visible focus.
- Provide keyboard access, restore focus after overlays, and offer alternatives to gestures.
- Keep touch targets at least 44px; preserve browser zoom.
- Respect reduced motion, use interruptible transitions, favor transform/opacity, and list transition properties explicitly.
- Reserve image space, load appropriate image sizes, prioritize essential opening images, and defer later media.
- Avoid layout thrashing; verify touch layouts and Safari when available.
- Check readable contrast and prevent focused controls from being obscured.

Use Astro image processing for source photographs. Self-host the small set of required font files with appropriate licenses. Keep decorative motion scoped to the photo composition. Useful content and image links remain available when scripting is unavailable.

## 8. Do and don't

Do preserve the chosen photo-tilt direction, keep copy personal, use supplied facts, and let Mai's own images define the final crops and color balance.

Do not turn the site into a portfolio/journal hybrid, introduce business sections, invent experiences, copy a brand's visual identity, force random palette/layout selections, or add effects to every element.

## 9. Agent workflow and references

For future frontend work: read `AGENTS.md` and this file, inspect the approved prototype, then use Taste as supporting design guidance with the explicit project exceptions. Review the result against this specification and test actual interactions. Report unavailable checks honestly.

This specification uses the document organization of Awesome DESIGN.md; its tokens and behavior are tailored to this project's approved prototype. The collection's brand analyses are references, not official brand specifications or imported themes.

- Format and examples: https://github.com/VoltAgent/awesome-design-md
- Taste workflow: https://github.com/Leonxlnx/taste-skill
- Interface review: https://vercel.com/design/guidelines

Before implementation, settle final photographs/copy, who edits content, and hosting. Keep proposed refinements separate from user-approved decisions. No implementation or deployment is authorized by this specification alone.
