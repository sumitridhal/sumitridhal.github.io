/**
 * Square (1:1) GIFs for the home “Experiments” catalog strip.
 */
export type HomeExperiment = {
  id: string
  title: string
  mediaSrc: string
  alt: string
  /** Shown as a second mono line (e.g. “GSAP”, “SHADER”). */
  tag?: string
  /** Optional link — e.g. a related writing or demo repo. */
  href?: string
}

const MEDIA = '/media/experiments'

export const homeExperiments: HomeExperiment[] = [
  {
    id: 'gsap-1',
    title: 'GSAP Study 1',
    tag: 'GSAP',
    mediaSrc: `${MEDIA}/gsap-1.gif`,
    alt: 'GSAP motion study 1',
  },
  {
    id: 'gsap-2',
    title: 'GSAP Study 2',
    tag: 'GSAP',
    mediaSrc: `${MEDIA}/gsap-2.gif`,
    alt: 'GSAP motion study 2',
  },
  {
    id: 'gsap-3',
    title: 'GSAP Study 3',
    tag: 'GSAP',
    mediaSrc: `${MEDIA}/gsap-3.gif`,
    alt: 'GSAP motion study 3',
  },
  {
    id: 'motion-path',
    title: 'Motion Path',
    tag: 'GSAP',
    mediaSrc: `${MEDIA}/motion-path.gif`,
    alt: 'Motion along SVG paths',
  },
  {
    id: 'reveal',
    title: 'Reveal',
    tag: 'GSAP',
    mediaSrc: `${MEDIA}/reveal.gif`,
    alt: 'Scroll-linked reveal choreography',
  },
  {
    id: 'svg-mask',
    title: 'SVG Mask',
    tag: 'GSAP',
    mediaSrc: `${MEDIA}/svg-mask.gif`,
    alt: 'SVG mask transition study',
  },
  {
    id: 'gradient',
    title: 'Gradient',
    tag: 'SHADER',
    mediaSrc: `${MEDIA}/gradient.gif`,
    alt: 'Animated gradient shader',
  },
  {
    id: 'fractal',
    title: 'Fractal',
    tag: 'SHADER',
    mediaSrc: `${MEDIA}/fractal.gif`,
    alt: 'Fractal field shader',
  },
  {
    id: 'mosaic',
    title: 'Mosaic',
    tag: 'SHADER',
    mediaSrc: `${MEDIA}/mosaic.gif`,
    alt: 'Palette mosaic tiles shader',
  },
  {
    id: 'simplex-1',
    title: 'Simplex Noise',
    tag: 'SHADER',
    mediaSrc: `${MEDIA}/simplex-1.gif`,
    alt: 'Simplex noise displacement study',
  },
  {
    id: 'alpha',
    title: 'Alpha',
    tag: 'SHADER',
    mediaSrc: `${MEDIA}/alpha.gif`,
    alt: 'Alpha compositing shader study',
  },
  {
    id: 'ascii-1',
    title: 'ASCII Field',
    tag: 'ASCII',
    mediaSrc: `${MEDIA}/ascii-1.gif`,
    alt: 'ASCII character field animation',
  },
  {
    id: 'web-gpu',
    title: 'WebGPU',
    tag: 'WEBGPU',
    mediaSrc: `${MEDIA}/web-gpu.gif`,
    alt: 'WebGPU compute and render study',
  },
]
