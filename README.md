# Mai's personal website

A simple personal homepage for Quynh Mai Vu, centered on a friendly introduction, favorite photographs, a little about her, and contact links. The visual direction is soft summer light, muted rose and green, and photographs with subtle cursor-following depth.

## Start here in VS Code

This repository is already on your Mac at `/Users/tylerle/Developer/Stella-Vu`. Open the same directory in VS Code; no code transfer is needed.

```sh
code /Users/tylerle/Developer/Stella-Vu/Stella-Vu.code-workspace
```

Alternatively, use File > Open Folder in VS Code and choose the repository directory. The workspace recommends the official Astro and OpenAI Codex extensions; recommendations do not install them automatically.

Read `AGENTS.md` and `DESIGN.md`, then open `design-reference/approved-prototype.html` in your browser. Start any new Codex chat with those files and this README as context. The files preserve decisions without requiring the originating chat history.

## What is ready

- `AGENTS.md`: project workflow, content boundaries, commit conventions, and explicit exceptions to Taste's defaults.
- `DESIGN.md`: the approved visual direction and proposed production tokens and behaviors.
- `.agents/skills/design-taste-frontend/`: project-scoped Taste Skill, installed from upstream.
- `design-reference/approved-prototype.html`: portable export of the photo-tilt design the user preferred.
- `Stella-Vu.code-workspace`: VS Code entry point and extension recommendations.
- `.nvmrc`: recommended Node 24 major version for development.
- `THIRD_PARTY_NOTICES.md`: installed skill's license and asset provenance notes.
- `src/assets/photos/`: seven user-supplied original JPEG photographs, with descriptive filenames and a `manifest.json` index.

The Astro foundation is implemented at the repository root with static output, strict TypeScript, shared CSS tokens, and Prettier with Astro support. The static homepage renders the header, introduction, three-photo composition, About section, and footer using the local content layer. DM Serif Display and DM Sans are self-hosted, and Astro builds responsive WebP thumbnails. Photos retain their resting rotations and native links to full-size JPEGs. Fine hover-capable pointers add gentle tilt, lift, reflection, and directional depth. Touch and reduced motion disable the spatial effects. The on-demand PhotoSwipe viewer contains all seven photographs with keyboard/touch navigation, focus containment and restoration, and scroll locking. Native image links remain the fallback. The approved design reference remains in `design-reference/`; `DESIGN.md` records the visual specification written before scaffolding.

## Supplied photographs

All seven attachments are saved under `src/assets/photos/`. The copies preserve the original file contents, resolution, and metadata; they have not been cropped, retouched, or recompressed. These durable project copies do not depend on the temporary Photos attachment paths.

| Project filename           | Original filename                                      | Visible subject                    |
| -------------------------- | ------------------------------------------------------ | ---------------------------------- |
| `mai-cafe-cake.jpeg`       | `IMG_1442.jpeg`                                        | Café portrait beside a cake        |
| `mai-garden-portrait.jpeg` | `IMG_1815.jpeg`                                        | White blouse and green foliage     |
| `mai-pink-pajamas.jpeg`    | `IMG_1886.jpeg`                                        | Pink striped pajamas               |
| `mai-graduation.jpeg`      | `IMG_1885.jpeg`                                        | Graduation cap, gown, and flowers  |
| `mai-sunglasses.jpeg`      | `IMG_1948.jpeg`                                        | Sunglasses and patterned cover-up  |
| `mai-seaside-camera.jpeg`  | `att.onzMZkvtRQhuwCpG2TJE56FfYa4wDfcmo_xhik0ga7E.jpeg` | Sunhat and camera at a rocky shore |
| `mai-blue-outfit.jpeg`     | `att.DttTtUrfEzaPoZPHu8wY4vSRrRmsOqd8iIGmebQkJ1A.jpeg` | Light blue outfit beneath a tree   |

`manifest.json` records the filenames, image dimensions, orientation metadata, file sizes, SHA-256 checksums, and descriptive alt text. Captions are intentionally unset until supplied. Dimensions are stored-image dimensions; preserve orientation correctly when processing images. Use these originals as Astro image inputs when implementation begins. The reference prototype still uses generated stand-ins and has not been changed to use these photos yet.

## Editing personal content

Edit `src/data/profile.ts` for Mai’s name, draft introduction, About text, and verified links. The current copy uses only her supplied interests: fashion, travel, and photography. LinkedIn is the only supplied destination; add other links only when their real URLs are provided. The homepage components read these fields directly.

Edit `src/data/photos.ts` for each photo’s descriptive `alt`, optional `caption`, provisional `crop`, and `restingRotation` (degrees). All captions are `null`; replace one with a supplied caption when available. Alt text describes the visible image and is separate from a personal caption. Shared content shapes live in `src/data/types.ts`. No caption is currently rendered, so Caveat is not downloaded or loaded; add its licensed local font when actual caption content is supplied. The handwriting token already includes local fallbacks.

- `openingOrder` controls the opening selection and its left-to-right/reading order. It provisionally lists garden portrait, seaside camera, then blue outfit. Reorder or replace IDs to change the selection.
- `galleryOrder` controls the expanded gallery order independently. Keep each of the seven photo IDs exactly once to retain the complete gallery.
- `openingPhotos` and `galleryPhotos` resolve these lists to photo records with local Astro-compatible image imports.
- `crop.fit: 'contain'` preserves the full frame. All seven sources are 3:4 portraits. `crop.position` uses CSS percentage coordinates, initially `50% 50%`. Any future `cover` crop needs review at its actual rendered size to keep faces and important details visible. These settings never modify the source file.
- `restingRotation` starts at -6, +2, and +6 degrees for the opening photos; the other photos start at zero. Adjust it on the photo record if you change the composition. It is independent of EXIF orientation.

Source filenames, original attachment names, and stored pixel dimensions come from the unchanged `manifest.json`. EXIF orientation was checked directly in the JPEGs: café, garden, pajamas, graduation, and sunglasses are `1` (upright); seaside and blue outfit have no orientation tag (`null`). The manifest’s original `<nil>` markers did not distinguish these cases; `source.orientation` in the content layer records the observed values. Use the imported `image` metadata with Astro image processing; retain `source` as provenance rather than overriding processed-image dimensions.

Keep original JPEGs unchanged. When editing content, run `npm run check`, `npm run build`, and `npm run format:check`, review the diff, and commit the content files through Git. No extra dependencies are needed for this content layer.

## Stack and planned additions

Installed dependencies: Astro, PhotoSwipe, `@astrojs/check`, TypeScript, Prettier, and `prettier-plugin-astro`. Exact resolved versions are recorded in the single root `package-lock.json`. PhotoSwipe is installed for the gallery; icon and additional browser-test tooling below remain future additions, installed only when needed. Hosting is deferred; no provider is configured.

| Concern         | Recommendation                                 | Reason                                                           |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Framework       | Stable Astro, static output                    | Simple fast page with targeted browser interactions              |
| Language        | TypeScript, strict configuration               | Typed photo data and maintainable interactions                   |
| Runtime         | Latest Node 24 LTS patch                       | Supported even-numbered runtime; `.nvmrc` selects this major     |
| Package manager | npm and committed `package-lock.json`          | One familiar dependency workflow                                 |
| Styling         | Scoped CSS and shared custom properties        | Precise control of the approved composition                      |
| Tilt            | Small TypeScript module plus CSS transforms    | Direct pointer response without a framework runtime              |
| Gallery         | PhotoSwipe, loaded on demand                   | Mature expanded-photo behavior                                   |
| Images          | Astro `Image` / `Picture`, local source assets | Responsive sizes and build-time optimization                     |
| Fonts           | Locally hosted licensed font files             | Predictable loading and consistent typography                    |
| Content         | Typed local profile/photo files                | Easy edits without adding an admin application                   |
| Icons           | Lucide, only required icons                    | Consistent familiar controls                                     |
| Validation      | Astro check, production build, Playwright      | Verify types, output, and actual interactions                    |
| Formatting      | Prettier plus Astro plugin                     | Consistent formatting from editor and CLI                        |
| Source control  | Git, private GitHub repository when configured | Small commits and recoverable history                            |
| Hosting         | Cloudflare Workers static assets               | Serve Astro's static output; account and domain still to confirm |

Use the stable package versions selected at scaffold time and keep the lockfile. Treat the template as scaffolding, not the site's visual design.

The first version uses local content files maintained through Git. A CMS, database, authentication, and backend are outside this baseline.

## Design tools and their roles

- Taste is the chosen design skill. Keep it upstream; project-specific exceptions live in `AGENTS.md`.
- Awesome DESIGN.md supplies the specification format. Our own `DESIGN.md` defines Mai's identity; brand examples do not supply her theme.
- Vercel's interface guidance informs interaction quality, accessibility, and performance. It does not prescribe her colors, typography, copywriting voice, or hosting provider.
- Codex reads `AGENTS.md`; it is the canonical project instruction file. A separate `CODEX.md` is unnecessary.
- For Claude later, keep these files and add a root `CLAUDE.md` containing `@AGENTS.md`.

## Version one scope

One homepage:

1. A small header and minimal navigation.
2. Her name and a concise introduction.
3. Three favorite photographs with subtle resting rotations and optional supplied captions.
4. A compact About section.
5. Real social/contact links.

Pointer interaction tilts and lifts the selected photo with a soft moving reflection. Leaving it returns the photo smoothly. Clicking opens the gallery. Phone users tap to open, with explicit navigation as well as swipe. Keyboard users can open, move through, and close photos. Reduced motion retains functionality while removing spatial effects.

A login system, database, CMS, dashboard, contact-form service, work portfolio, and journal are outside this first version. Revisit them only for an actual need.

## Application structure

The current foundation contains `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/tokens.css`, the content files in `src/data/`, and the original `src/assets/photos/`. Major section components and `src/styles/global.css` are also implemented. Photo interactions and the viewer are implemented; favicon and Playwright test files below remain proposed for subsequent steps.

```text
src/
  pages/index.astro
  layouts/BaseLayout.astro
  components/
    Header.astro
    Introduction.astro
    PhotoComposition.astro
    PhotoFrame.astro
    TiltPhoto.astro
    PhotoViewer.astro
    About.astro
    Footer.astro
  interactions/
    photo-tilt.ts
    photo-viewer.ts
  data/
    profile.ts
    photos.ts
  assets/photos/
  styles/
    tokens.css
    global.css
public/
  fonts/
  favicon.svg
tests/
  homepage.spec.ts
```

Profile data contains the approved name, introduction, About text, and real contact links. Photo data contains image imports, alt text, captions, order, crop preferences, and resting rotation. Content edits should not require changing interaction code.

## Build sequence

1. **Gather content:** seven original photos are ready in `src/assets/photos/`. The provisional opening selection and draft introduction/About text live in `src/data/`; LinkedIn is supplied. Review the selection and draft copy, and supply any personal captions or additional verified links. Confirm whether the site will be public.
2. **Environment (complete):** Node 24 is selected by `.nvmrc`; content is maintained in local files through Git. Hosting remains deferred.
3. **Scaffold (complete):** root Astro application, strict TypeScript, formatting, generated-output ignores, shared tokens, minimal page/layout, and committed dependency lockfile. Existing design files, original photos, installed skill, and Git history are preserved.
4. **Static design (ready for review):** reusable section components, local licensed fonts, responsive Astro images, mobile photo reflow, static rotations, visible focus, and native full-size image links. See `docs/static-review.md` for checks and Taste exceptions.
5. **Interactions (tilt ready for review):** `TiltPhoto.astro` provides stable links around `PhotoFrame.astro`; `src/interactions/photo-tilt.ts` batches pointer updates and geometry reads in requestAnimationFrame, stops when idle, and cleans up on navigation/HMR. Touch and reduced motion retain native image navigation. The on-demand PhotoSwipe viewer is implemented with all seven photos, native image fallback, reduced motion, keyboard/touch navigation, and focus/scroll restoration.
6. **Finish:** add real content, favicon, page metadata, and a social sharing image. Review copy and visual balance.
7. **Validate:** build and check types; test keyboard, touch, reduced motion, long captions, image loading, and layouts at 320/390/768/1024/1440px. Inspect Safari and a real phone when available.
8. **Publish:** after explicit publication instruction, configure the chosen provider and domain, inspect the deployed version, and verify links and metadata.

## Local development

Use Node 24 and npm from the repository root. With nvm installed:

```sh
nvm install 24 # first time only, if Node 24 is missing
nvm use
npm ci
npm run dev
```

Node 24 was installed alongside the existing Node 25 installation; the default nvm alias was preserved. Run `nvm use` in each development shell. The package engine range requires Node 24.

| Command                | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Start the local development server (default `http://localhost:4321`) |
| `npm run check`        | Generate Astro types and run Astro/TypeScript diagnostics            |
| `npm run build`        | Generate the static site in `dist/`                                  |
| `npm run preview`      | Preview `dist/` locally after building                               |
| `npm run format:check` | Check formatting of maintained project files                         |

Use `npx prettier --write <file>` to format an edited file. Formatting excludes the installed Taste skill, approved prototype, original photo metadata, existing VS Code workspace, and preserved design/provenance documents. Type checking covers application source and Astro configuration, excluding the reference and skill. Generated output and dependencies are ignored by Git.

In a restricted shell that cannot write Astro’s user preferences directory, set `ASTRO_TELEMETRY_DISABLED=1` before running Astro commands. Foundation checks were run with this environment variable.

The check, build, and formatting commands validate the implementation. The static design was reviewed using Taste’s headless Chrome screenshots and responsive layout checker; results and limits are in `docs/static-review.md`. The commercial-page finish gate is not a compatible acceptance gate for this personal, content-sized page. No `test:e2e` script or browser-test dependency is installed yet.

No hosting, deployment, CMS, database, authentication, or backend is configured.

## References

- Astro setup: https://docs.astro.build/en/install-and-setup/
- Astro images: https://docs.astro.build/en/guides/images/
- PhotoSwipe: https://photoswipe.com/getting-started/
- Cloudflare deployment: https://docs.astro.build/en/guides/deploy/cloudflare/
- Taste: https://github.com/Leonxlnx/taste-skill
- Awesome DESIGN.md: https://github.com/VoltAgent/awesome-design-md
- Interface quality: https://vercel.com/design/guidelines
- Codex instructions: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex in VS Code: https://learn.chatgpt.com/docs/codex/ide

## Checking photo tilt

With the local server running and Node 24 selected:

```sh
node scripts/check-photo-tilt.mjs http://127.0.0.1:4321/
```

This dependency-free browser check starts its own isolated headless Chrome profile. It defaults to macOS Google Chrome; set `CHROME_PATH` to another compatible Chrome/Chromium executable when needed. To test production assets, first run `npm run build`, start `npm run preview -- --port 4322`, then pass `http://127.0.0.1:4322/` to the checker. The checker closes its own browser and writes an ignored active-tilt screenshot under `.taste-skill/shots/`.

Checks cover pointer entry/movement/exit, tilt bounds, lift, reflection, fixed wrapper geometry, frame batching, idle cleanup, rapid neighbor switching, keyboard focus, live reduced-motion changes, hybrid and touch-only behavior, native tap/click navigation, lifecycle disposal, and restoration. These are emulated Chrome checks; Safari and a physical touch device remain unverified. The earlier static review in `docs/static-review.md` records the pre-motion baseline.

## Checking the photo viewer

After `npm run build`, start `npm run preview -- --port 4322`, then run:

```sh
node scripts/check-photo-viewer.mjs http://127.0.0.1:4322/
```

The viewer suite checks that the core is not fetched before opening; each homepage photo opens at its ID’s position in `galleryOrder`; all seven images load with responsive sources; and close/reopen, arrows, keyboard, focus trapping/restoration, scroll locking/restoration, reduced motion, touch swipe/buttons, and JavaScript-disabled fallback work. It also uses a synthetic caption fixture to check plain-text rendering and checks disposal/restoration of an open viewer. Screenshots are ignored QA artifacts under `.taste-skill/shots/`. Safari and physical touch-device testing remain unperformed.

`PhotoViewer.astro` serializes build-time responsive image data from `galleryPhotos`; `photo-viewer.ts` loads PhotoSwipe core and its site-specific CSS only on the first ordinary photo click. Modified clicks keep their native link behavior. A failed viewer download falls back to the original image. Opening and closing use a 280ms fade to avoid animating from rotated/tilted thumbnail bounds; reduced motion disables the transition. The tilt pauses while the modal is open.

Captions use only `caption` from the centralized photo record. They remain hidden when unset and are rendered as text, never HTML. Keep supplied captions concise; long captions can scroll in a keyboard-focusable caption area. All seven records currently have captions unset. The existing tilt checker isolates the tilt behavior and native links; this viewer checker verifies the combined interaction. Both share an isolated Chrome harness and add no test dependencies.

Official integration references: https://photoswipe.com/getting-started/, https://photoswipe.com/data-sources/, https://photoswipe.com/options/, https://photoswipe.com/caption/, and https://photoswipe.com/opening-or-closing-transition/.
