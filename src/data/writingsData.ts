import type { Locale } from '@/i18n/routes'

/** CSS-only thumbnails for the writing article figure grid. */
export type WritingFigureVariant =
  | 'grain'
  | 'cloud'
  | 'flow'
  | 'branch'
  | 'grad'
  | 'glow'
  | 'warp'
  | 'mesh'

export type WritingItem = {
  id: string
  title: Record<Locale, string>
  date: string
  category: string
  bodyParagraphs: Record<Locale, string[]>
  /** Two-line hero title; falls back to a single line from `title`. */
  titleLines?: Record<Locale, string[]>
  /** Right-column technical aside (accent monospace). */
  asideParagraphs?: Record<Locale, string[]>
  /** Rows of figure cells (e.g. 4 per row). */
  figureRows?: WritingFigureVariant[][]
}

export const writings: WritingItem[] = [
  {
    id: 'noise-in-creative-coding',
    title: {
      en: 'Noise in Creative Coding',
      de: 'Rauschen im Creative Coding',
      fr: 'Le bruit en creative coding',
      hi: 'क्रिएटिव कोडिंग में नॉइज़',
    },
    titleLines: {
      en: ['Noise in', 'Creative Coding'],
      de: ['Rauschen im', 'Creative Coding'],
      fr: ['Le bruit en', 'creative coding'],
      hi: ['क्रिएटिव कोडिंग में', 'नॉइज़'],
    },
    date: '10/05',
    category: 'Creative code',
    figureRows: [
      ['grain', 'cloud', 'flow', 'branch'],
      ['grad', 'glow', 'warp', 'mesh'],
    ],
    bodyParagraphs: {
      en: [
        'Noise is an indispensable tool for creative coding. We use it to generate all kinds of organic effects like clouds, landscapes, and contours. Or to move and distort objects with a more lifelike behaviour than easing alone can suggest.',
        'The trick is choosing a field that reads well at the scale of your canvas: value noise for grit, gradient noise when you need continuity, and layered octaves when you want detail without a single harsh frequency dominating the frame.',
        'When you map noise to colour or displacement, keep a slow control surface—amplitude, rotation, seed—so the piece stays tunable in performance. The goal is not randomness for its own sake but a controlled distribution that still surprises on every run.',
      ],
      de: [],
      fr: [],
      hi: [],
    },
    asideParagraphs: {
      en: [
        "Simplest way is 'fractal Brownian motion' or basic octave summation. Start with one layer that has a particular frequency or amplitude, then double the frequency and halve the amplitude as you go. The halving and doubling are often called persistence and lacunarity.",
        'In shaders, sample your noise in tangent space when warping meshes so lighting stays coherent. On the CPU, prefer precomputed tables or tileable textures if you need thousands of agents reading the same field each frame.',
      ],
      de: [],
      fr: [],
      hi: [],
    },
  },
  {
    id: 'making-claude-code-shareable',
    title: {
      en: 'Making Claude Code sessions shareable',
      de: 'Claude-Code-Sitzungen teilbar machen',
      fr: 'Rendre les sessions Claude Code partageables',
      hi: 'Claude Code सत्र साझा करने योग्य बनाना',
    },
    titleLines: {
      en: ['Making Claude Code', 'sessions shareable'],
      de: ['Claude-Code-Sitzungen', 'teilbar machen'],
      fr: ['Sessions Claude Code', 'partageables'],
      hi: ['Claude Code सत्र', 'साझा करने योग्य'],
    },
    date: '16/02',
    category: 'Dev',
    bodyParagraphs: {
      en: [
        'Pairing on a hard problem is easier when someone can see the same transcript, file picks, and tool output you do. The friction is rarely the model; it is packaging context so another engineer—or your future self—can replay the reasoning without re-asking half the questions.',
        'Start by treating the session as an artifact: a short README in the repo that links to the branch, lists the key decisions, and points to any scripts or env vars that matter. If you use Claude Code in the terminal, capture the high-signal turns (plan, diff summary, test commands) in commit messages or a changelog entry instead of pasting the entire log.',
        'When you need a literal handoff, export the smallest slice that still tells the story: the final patch, the failing test name, and one paragraph on what you tried that did not work. Shareable sessions are curated, not raw dumps—and that curation is what makes them useful across teams and time zones.',
      ],
      de: [],
      fr: [],
      hi: [],
    },
  },
  {
    id: 'claude-code-bash-mode',
    title: {
      en: 'Claude Code bash mode',
      de: 'Claude-Code-Bash-Modus',
      fr: 'Mode bash Claude Code',
      hi: 'Claude Code बैश मोड',
    },
    titleLines: {
      en: ['Claude Code', 'bash mode'],
      de: ['Claude-Code-', 'Bash-Modus'],
      fr: ['Mode bash', 'Claude Code'],
      hi: ['Claude Code', 'बैश मोड'],
    },
    date: '20/01',
    category: 'TIL',
    bodyParagraphs: {
      en: [
        'Bash mode is the moment you stop treating the agent as a chat surface and let it drive the shell the same way you would: chained commands, pipes, and exit codes that either unblock the next step or surface a real failure.',
        'The habit that saves the most time is naming intent before mechanics. Ask for a dry run or `echo` plan when the command touches production data, then widen permissions once the shape of the change is obvious. The model is fast; your filesystem permissions are not.',
        'When something goes sideways, capture stderr verbatim. It is the fastest signal for both the model and humans about whether you are fighting PATH issues, missing binaries, or a subtle quoting bug—three different fixes, one shared symptom.',
      ],
      de: [],
      fr: [],
      hi: [],
    },
  },
  {
    id: 'vibe-coding-bookshelf',
    title: {
      en: 'Vibe coding a bookshelf with Claude Code',
      de: 'Ein Buecherregal mit Claude Code bauen',
      fr: 'Coder une bibliotheque avec Claude Code',
      hi: 'Claude Code के साथ वाइब कोडिंग बुकशेल्फ',
    },
    titleLines: {
      en: ['Vibe coding a bookshelf', 'with Claude Code'],
      de: ['Ein Buecherregal', 'mit Claude Code bauen'],
      fr: ['Coder une bibliotheque', 'avec Claude Code'],
      hi: ['Claude Code के साथ', 'वाइब कोडिंग बुकशेल्फ'],
    },
    date: '27/12',
    category: 'Dev',
    bodyParagraphs: {
      en: [
        'A bookshelf UI sounds decorative until you need believable spines, varied thickness, and lighting that does not flatten everything into a texture atlas. The fun part is iterating on feel: density of titles, how much jitter to allow per book, and whether hover states should tilt or only glow.',
        'Claude Code shines when you keep the feedback loop tight: tweak SCSS, reload, paste a screenshot or describe what still feels off. Let the model propose structure—CSS grid tracks, custom properties for spine width—while you hold the art direction (contrast, rhythm, restraint).',
        'Ship a vertical slice first: five books with hard-coded data and one interaction. Once motion and hierarchy read well, swap in real data and worry about horizontal scroll or virtualization. Vibe coding is not skipping engineering; it is letting polish lead as long as the foundations stay boring and testable.',
      ],
      de: [],
      fr: [],
      hi: [],
    },
  },
]

export function getWritingBySlug(slug: string | undefined): WritingItem | undefined {
  if (!slug) return undefined
  return writings.find((w) => w.id === slug)
}

export function paragraphsForWriting(item: WritingItem, locale: Locale): string[] {
  const localized = item.bodyParagraphs[locale]
  if (localized.length > 0) return localized
  return item.bodyParagraphs.en
}

export function titleLinesForWriting(item: WritingItem, locale: Locale): string[] {
  const localized = item.titleLines?.[locale]
  if (localized && localized.length > 0) return localized
  const enLines = item.titleLines?.en
  if (enLines && enLines.length > 0) return enLines
  return [writingTitle(item, locale)]
}

export function asideParagraphsForWriting(item: WritingItem, locale: Locale): string[] {
  const localized = item.asideParagraphs?.[locale]
  if (localized && localized.length > 0) return localized
  const enAside = item.asideParagraphs?.en
  return enAside && enAside.length > 0 ? enAside : []
}

export function writingTitle(item: WritingItem, locale: Locale): string {
  const localized = item.title[locale]
  if (localized.trim()) return localized
  return item.title.en
}

export function excerptFromWriting(item: WritingItem, locale: Locale): string {
  const p = paragraphsForWriting(item, locale)[0] ?? ''
  if (!p) return ''
  const max = 220
  if (p.length <= max) return p
  const slice = p.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > 80 ? slice.slice(0, lastSpace) : slice
  return `${cut.trimEnd()}…`
}
