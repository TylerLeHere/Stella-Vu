# Mai's personal website

## Current stage

The Astro foundation, personal content layer, homepage, and reusable photo tilt are implemented. Fine hover-capable pointers get subtle tilt, lift, reflection, and directional depth; touch and reduced motion retain native full-size image links without spatial effects. The layout is preserved. Entrance animations and the gallery overlay await a later step. Do not publish or configure hosting without a later user instruction.

## Project instructions

- Read `DESIGN.md` before proposing or changing UI. It records the approved direction.
- Use the project-scoped Taste skill at `.agents/skills/design-taste-frontend/SKILL.md` for frontend work, subject to the project exceptions below.
- Apply the relevant framework-independent guidance from https://vercel.com/design/guidelines. Vercel's branding and copywriting preferences do not define this site's visual identity.
- This is a personal website for Quynh Mai Vu, made as a gift. Keep the experience centered on her introduction, photographs, interests, and contact links.
- Her supplied interests are fashion, travel, and photography. Do not invent biographical details, work experience, projects, relationships, destinations, or contact information.
- Use the current approved interactive prototype as the visual reference, rather than earlier magazine, portfolio, or romantic-letter drafts. Its local location is recorded in `DESIGN.md`.

## Explicit Taste exceptions

These exceptions reflect the user's approved design and take precedence over conflicting Taste defaults. Keep the upstream skill unchanged.

- Cursor-following photo tilt, a soft reflection, and click-to-open photos are intentional features. Do not remove tilt because the skill prohibits it.
- Personal captions under photos are allowed and encouraged when supplied.
- Sections follow their content and may share a viewport. Do not enforce full-screen sections or stretch the page to meet the skill's screen-height rules.
- Preserve the approved palette and typography; do not randomly deal replacements.
- Do not classify Mai as a company, fabricate a commercial offer, or add marketing sections to satisfy the skill's business categories.
- Do not add Work, Journal, Places, Style, a resume timeline, testimonials, or conversion CTAs unless the user later requests them.
- Use Astro as requested, rather than the skill's default HTML starter. Scaffold the future application at the repository root; use `design-reference/approved-prototype.html` as a design reference, not production source.
- Use project-appropriate browser checks. If an upstream checker flags an explicit exception, report or document it rather than changing the approved design to satisfy the checker. Never conceal genuine failures.
- Claude-specific hooks bundled with Taste are not assumed to execute in Codex. Run applicable validation explicitly and report what actually ran.

## Architecture direction

The foundation uses Astro static output, strict TypeScript, scoped CSS with shared tokens, and npm with one committed `package-lock.json`. Version one content lives in local files maintained through Git; no CMS, database, authentication, or backend is included. Astro image processing and the native photo-tilt module are implemented. PhotoSwipe remains planned for a later step; install additional dependencies only when needed. Hosting is deferred and must be confirmed before publication.

Keep profile data, photo metadata, composition, and motion behavior separate. Add frameworks, services, and libraries only when they solve a concrete requirement.

## Verification

When implementation begins, check the build and types. Inspect desktop and mobile layouts, keyboard navigation, photo opening/closing, focus restoration, touch behavior, and reduced motion. Check Safari when available. Clearly state any verification limits; never claim screenshots or checks that were not performed.

## Agent portability

`AGENTS.md` is the canonical development instruction file and `DESIGN.md` is the canonical visual specification. Do not create a second divergent rule set in `CODEX.md` or `CLAUDE.md`. If Claude compatibility is needed, a root `CLAUDE.md` can import this file with `@AGENTS.md`; retain this file for Codex.

## Commit messages

Keep commit messages to one short, descriptive line (about 2–6 words), with no body.
Name the thing that changed, e.g. "Add vec3 class", "Antialiasing for smooth edges", "Bug fix".
Make small, frequent commits: one per feature or step.
Write them the way a person would, casual and natural.
Don't add a Co-Authored-By line or any other AI attribution to commits or PRs.
