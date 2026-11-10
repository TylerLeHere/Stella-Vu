# Static homepage review

The homepage is ready for visual review. It uses the approved pale rose canvas, green text, serif headings, sans-serif body, three resting photo rotations, and content-sized sections. The garden, seaside, and blue-outfit photographs remain uncropped at their native 3:4 proportions. All seven original JPEG checksums match the source manifest. The content layer, approved reference, design specification, and installed Taste skill are unchanged.

## Checks performed

- `npm run check`: no errors, warnings, or hints.
- `npm run build`: one static page and twelve responsive WebP derivatives.
- `npm run format:check` and `git diff --check`.
- Headless Chrome screenshots of the approved reference, desktop at 1440px, and mobile at 390px. The phone uses a vertical photo flow in logical reading order.
- Taste layout checker at 1440, 1024, 768, 390, and 320px: no horizontal overflow. The only finding categories were `screen-short`, `screen-height`, `neighbour`, and `hero-fold`. All four enforce full-screen sections or an isolated first-screen hero, contrary to the explicit project exceptions in `AGENTS.md`. The checker therefore exits with findings; this is not an unqualified Taste pass. The upstream checker was not modified.
- Taste performance checker at 1440 and 390px: zero failures, zero broken requests, zero layout shift in the sampled runs, two local font files, and no application JavaScript. One warning remains: the second and third photos are lazy-loaded despite appearing above the desktop fold. This intentionally lets those same photos defer in the vertical phone layout; all three were visible in the desktop screenshot.
- Text contrast against the canvas: green ink is approximately 8.27:1. Rose accent is approximately 4.20:1, so it is used for the decorative rule and focus outlines rather than small text.
- Local dev URL returned HTTP 200 at `http://127.0.0.1:4321/`.

Screenshots and raw layout reports are local, ignored QA files under `.taste-skill/`. The original reference export itself logs an embedded visualization script error during screenshot capture; the reference still rendered, and its scripts were not copied into production.

## Scope and verification limits

The browser pane connection was unavailable. Rendering review used the installed Taste headless Chrome tools. Safari, a physical phone, touch input, actual keyboard traversal, browser zoom, and image-link Back navigation have not been manually exercised. Native links, a skip link, visible focus outlines, reserved image dimensions, and at least 44px navigation targets are implemented. Further interaction checks belong to the next step.

The commercial-page finish gate, randomized visual deals, hero entrances, and dealt motion moments are not applied: the user requested the approved personal composition and a static review before motion. No gallery overlay, pointer tilt, tracking reflection, entrance animation, or hosting is included.

Only Latin normal weight 400 for DM Serif Display and DM Sans is loaded, under their included SIL OFL licenses. There are no supplied captions, so no caption font is loaded. Add a licensed local Caveat file when captions are supplied and appropriate language subsets if future copy needs them.

## Homepage detail refinement

After tilt and PhotoSwipe were integrated, the actual production homepage was reviewed against the prototype at 320, 390, 768, 1024, and 1440px. The photographic framing, resting rotations, shadows, type sizes, and palette were retained. The observed issues and small changes were:

- Desktop/tablet spacing separated the introduction, photos, About, and footer more than the reference. Three 16px spacing reductions reconnect those sections. Mobile photo spacing is retained.
- Long unbroken footer text overflowed at 320–1024px. Footer text now wraps, and navigation can shrink and wrap without splitting the wordmark.
- The About hit area was approximately 40px wide. Navigation links now have a 44px minimum in both dimensions.
- The upright photo focus outline crossed the rotated photograph’s edges. The visible outline now follows the entire rotated frame, including any caption, while the link and pointer measurement area remain stable.
- Links and photos lacked distinct pressed feedback. Links gain a thicker underline on press; the complete photo frame darkens slightly while pressed. No animation system or transform behavior was added.

Before/after screenshots and synthetic long-text/caption cases were reviewed. Final measurements found no horizontal overflow at all five widths, including the stress cases. All homepage controls met the 44px minimum without overlapping hit areas. All three photo focus outlines stayed within the viewport with no clipping ancestors. The 720px CSS viewport used to simulate 1440px at 200% reflow had no overflow; emulated pinch zoom reached a visual viewport scale of 2. Actual browser-toolbar zoom was not manually tested.

Astro type checking, production build, formatting, and both tilt/viewer browser regression suites passed. The tilt focus assertion was updated to inspect the outline on the frame. Original photographs, content, interactions, and dependencies were preserved. This review used isolated headless Chrome; Safari, a physical phone, and assistive technology remain unverified. QA screenshots and measurement scripts remain ignored under `.taste-skill/`.
