# Work case studies (`/work/:slug`)

MDX case studies live in [`src/content/work/`](../src/content/work/). Vite loads them eagerly via [`src/data/workRegistry.ts`](../src/data/workRegistry.ts). The catalog merges MDX projects with legacy TypeScript entries in [`src/data/projectsData.ts`](../src/data/projectsData.ts). [`ProjectPage`](../src/pages/ProjectPage.tsx) prefers an MDX body when present and falls back to [`projectDetails.ts`](../src/data/projectDetails.ts) for Western Union pages.

## Add a case study

1. Scaffold (optional):

```bash
node scripts/scaffold-case-study.mjs my-project --title "My Project"
```

2. Or copy the template below into `src/content/work/<slug>.mdx`.

3. Add cover art under `public/media/projects/` and matching keys in:

   - `src/data/image-dimensions.json`
   - `src/data/lqip-data.json`

4. Keep `workMeta.id` equal to the filename stem (route becomes `/work/<id>`).

5. Verify:

```bash
npm run build
npm run preview
# open /work/<slug>
```

## Template (`workMeta` + narrative)

Required narrative sections for consistency: **Problem**, **Approach**, **Tech stack**, **Demo**.

```mdx
export const workMeta = {
  id: 'example-slug',
  order: 10,
  title: 'Example',
  tagline: 'One sentence for cards and the page hero.',
  category: 'Category',
  role: 'Product engineering',
  year: '2026',
  stack: 'Short stack line for the meta row',
  techStack: ['React', 'Vite'],
  coverSrc: '/media/projects/example-cover.png',
  imageKey: 'project-example',
  demoUrl: 'http://localhost:3000',
  repoPath: '~/git/example',
  highlights: ['Ship-facing bullet one.', 'Ship-facing bullet two.'],
  gallery: [
    {
      src: '/media/projects/example-cover.png',
      alt: 'Example product screenshot',
      width: 1024,
      height: 640,
    },
  ],
}

Opening paragraph — what it is and why it exists.

## Problem

Who hurts and what breaks without this.

## Approach

How the system is shaped (architecture, constraints, gates).

## Tech stack

Repeat or refine the stack in prose if needed.

## Demo

\`\`\`bash
# runnable commands only
\`\`\`

Sources: repo README path, brain page slug.
```

## Source of truth rules

- Pull facts from the project README, ADRs, and brain `projects/*` pages.
- Prefer shipped behavior over roadmap language.
- Label stand-in visuals clearly in `alt` text when real screenshots are missing.
- Do not duplicate Western Union narratives into MDX while `projectDetails.ts` remains authoritative for those slugs.

## Current MDX case studies

| Slug | Title |
|------|-------|
| `argus` | Argus |
| `motion-forge` | Motion Forge |
| `synvix` | Synvix |
| `signal` | Signal |
| `talos` | Talos |
