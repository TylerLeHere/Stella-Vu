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

The Astro application has not been scaffolded. There is no root `package.json`, app dependency installation, or production build yet. Scaffold the future application at the repository root. The earlier static draft has been removed; the approved design reference remains in `design-reference/`.

## Recommended stack

These are the recommended implementation decisions. Dependencies are not installed yet, and hosting/account choices require confirmation before publication.

| Concern | Recommendation | Reason |
| --- | --- | --- |
| Framework | Stable Astro, static output | Simple fast page with targeted browser interactions |
| Language | TypeScript, strict configuration | Typed photo data and maintainable interactions |
| Runtime | Latest Node 24 LTS patch | Supported even-numbered runtime; `.nvmrc` selects this major |
| Package manager | npm and committed `package-lock.json` | One familiar dependency workflow |
| Styling | Scoped CSS and shared custom properties | Precise control of the approved composition |
| Tilt | Small TypeScript module plus CSS transforms | Direct pointer response without a framework runtime |
| Gallery | PhotoSwipe, loaded on demand | Mature expanded-photo behavior |
| Images | Astro `Image` / `Picture`, local source assets | Responsive sizes and build-time optimization |
| Fonts | Locally hosted licensed font files | Predictable loading and consistent typography |
| Content | Typed local profile/photo files | Easy edits without adding an admin application |
| Icons | Lucide, only required icons | Consistent familiar controls |
| Validation | Astro check, production build, Playwright | Verify types, output, and actual interactions |
| Formatting | Prettier plus Astro plugin | Consistent formatting from editor and CLI |
| Source control | Git, private GitHub repository when configured | Small commits and recoverable history |
| Hosting | Cloudflare Workers static assets | Serve Astro's static output; account and domain still to confirm |

Use the stable package versions selected at scaffold time and keep the lockfile. Treat the template as scaffolding, not the site's visual design.

The first version uses local content files maintained through Git. If Mai needs to upload and edit without touching files, decide that before implementation; a CMS would change the authoring and image workflow. It is not included in this baseline.

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

## Proposed application structure

Scaffold at the repository root when implementation is authorized. The structure below does not exist yet.

```text
src/
  pages/index.astro
  layouts/BaseLayout.astro
  components/
    Header.astro
    Introduction.astro
    PhotoComposition.astro
    TiltPhoto.astro
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

1. **Gather content:** start with 3 good original photos, a short introduction, 1 About paragraph, and verified links. Collect 6–12 photos if a larger viewer collection is wanted. Confirm whether the site will be public.
2. **Environment:** select Node 24 LTS, open VS Code, enable the recommended extensions, and confirm who maintains the content and which hosting account to use.
3. **Scaffold:** create the Astro application at the root, use strict TypeScript, set up formatting and ignore generated output, and commit the dependency lockfile. Preserve the existing design files and installed skill.
4. **Static design:** implement the composition, typography, images, and mobile flow with no motion first. Match the selected reference.
5. **Interactions:** implement reusable tilt with stable hit areas and idle cleanup; integrate the production photo viewer and reduced-motion behavior.
6. **Finish:** add real content, favicon, page metadata, and a social sharing image. Review copy and visual balance.
7. **Validate:** build and check types; test keyboard, touch, reduced motion, long captions, image loading, and layouts at 320/390/768/1024/1440px. Inspect Safari and a real phone when available.
8. **Publish:** after explicit publication instruction, configure the chosen provider and domain, inspect the deployed version, and verify links and metadata.

Target repository scripts after scaffolding:

```text
npm run dev        # local development
npm run check      # Astro and TypeScript diagnostics
npm run build      # production output
npm run preview    # inspect production output locally
npm run test:e2e   # focused browser interaction tests
npm run format:check
```

These scripts do not work yet; no `package.json` has been created.

## First Codex prompt in VS Code

```text
Read AGENTS.md, DESIGN.md, and README.md. Inspect
design-reference/approved-prototype.html and use the installed Taste skill
with the explicit project exceptions. Keep the personal photo-tilt design.
First verify the Node version and propose the exact scaffold plan. Do not
start implementation or deploy until I approve starting the build.
```

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
