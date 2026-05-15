/**
 * Square (1:1) stills for the home “Experiments” catalog strip.
 */
export type HomeExperiment = {
  id: string
  title: string
  mediaSrc: string
  alt: string
  /** Shown as a second mono line (e.g. “ALUMINUM”, “WHITE”). */
  tag?: string
  /** Optional link — e.g. a related writing or demo repo. */
  href?: string
}

const FRAMER_BASE = 'https://framerusercontent.com/images'

export const homeExperiments: HomeExperiment[] = [
  {
    id: 'cm-15-aluminum',
    title: 'CM-15',
    tag: 'ALUMINUM',
    mediaSrc: `${FRAMER_BASE}/Xfva43ze3HHzHf20xwAkRLO5GA.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'CM-15 ALUMINUM product study',
  },
  {
    id: 'tx-6-aluminum',
    title: 'TX-6',
    tag: 'ALUMINUM',
    mediaSrc: `${FRAMER_BASE}/xTNCf2p2zoCDWpZ1NxcyldQ0Ml8.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'TX-6 ALUMINUM product study',
  },
  {
    id: 'ob-4-white',
    title: 'OB-4',
    tag: 'WHITE',
    mediaSrc: `${FRAMER_BASE}/UtCWlH6iWI2bYxwvhuwOG9VEChw.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'OB-4 WHITE product study',
  },
  {
    id: 'cm-15-black',
    title: 'CM-15',
    tag: 'BLACK',
    mediaSrc: `${FRAMER_BASE}/wnMcsvCQwbGe4EwRuYvFCH7Do.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'CM-15 BLACK product study',
  },
  {
    id: 'tx-6-black',
    title: 'TX-6',
    tag: 'BLACK',
    mediaSrc: `${FRAMER_BASE}/rzbvprj9ituawGOofkrgK9K5Y.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'TX-6 BLACK product study',
  },
  {
    id: 'ob-4-black',
    title: 'OB-4',
    tag: 'BLACK',
    mediaSrc: `${FRAMER_BASE}/mwYJAhxg6vEZG1VWCaGYLZFlr8.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'OB-4 BLACK product study',
  },
  {
    id: 'tp-7-white',
    title: 'TP-7',
    tag: 'WHITE',
    mediaSrc: `${FRAMER_BASE}/wcZoDYV2m12sDwr0Ei9Ic5VoQkY.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'TP-7 WHITE product study',
  },
  {
    id: 'tp-7-black',
    title: 'TP-7',
    tag: 'BLACK',
    mediaSrc: `${FRAMER_BASE}/LvpuZV8ce8UqufvZiHDo7DlGMM.webp?scale-down-to=2048&width=4096&height=4096`,
    alt: 'TP-7 BLACK product study',
  },
]
