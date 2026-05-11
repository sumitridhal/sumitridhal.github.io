export type ExperimentKind = 'gsap' | 'three' | 'shader'

export type ExperimentItem = {
  id: string
  kind: ExperimentKind
  title: string
  blurb: string
  coverSrc: string
}

export const experimentKinds: ExperimentKind[] = ['gsap', 'three', 'shader']

export const experiments: ExperimentItem[] = [
  {
    id: 'gsap-scroll-choreo',
    kind: 'gsap',
    title: 'Scroll-linked choreography',
    blurb: 'Section reveals and scrubbed timelines tied to scroll position.',
    coverSrc: 'https://picsum.photos/seed/exp-gsap-scroll/960/600',
  },
  {
    id: 'gsap-svg-morph',
    kind: 'gsap',
    title: 'SVG morph study',
    blurb: 'Shape morphing and path-driven motion for interface transitions.',
    coverSrc: 'https://picsum.photos/seed/exp-gsap-svg/960/600',
  },
  {
    id: 'gsap-stagger-grid',
    kind: 'gsap',
    title: 'Staggered grid entrance',
    blurb: 'Procedural delays and ease curves over a responsive card grid.',
    coverSrc: 'https://picsum.photos/seed/exp-gsap-stagger/960/600',
  },
  {
    id: 'three-orbit-field',
    kind: 'three',
    title: 'Orbital instancing',
    blurb: 'Instanced meshes with subtle noise offset in WebGL space.',
    coverSrc: 'https://picsum.photos/seed/exp-three-orbit/960/600',
  },
  {
    id: 'three-post-stack',
    kind: 'three',
    title: 'Post stack exploration',
    blurb: 'Bloom, grain, and color grading passes composed in order.',
    coverSrc: 'https://picsum.photos/seed/exp-three-post/960/600',
  },
  {
    id: 'three-environment-map',
    kind: 'three',
    title: 'HDR environment probe',
    blurb: 'PBR materials reacting to a small studio HDRI.',
    coverSrc: 'https://picsum.photos/seed/exp-three-hdri/960/600',
  },
  {
    id: 'shader-noise-warp',
    kind: 'shader',
    title: 'Noise warp field',
    blurb: '2D value noise displacing UVs for a liquid poster effect.',
    coverSrc: 'https://picsum.photos/seed/exp-shader-warp/960/600',
  },
  {
    id: 'shader-raymarch-sdf',
    kind: 'shader',
    title: 'Ray-marched SDF sketch',
    blurb: 'Signed distance primitives blended in a single fragment pass.',
    coverSrc: 'https://picsum.photos/seed/exp-shader-sdf/960/600',
  },
  {
    id: 'shader-gradient-dither',
    kind: 'shader',
    title: 'Gradient dither',
    blurb: 'Ordered dither between two ramps for a print-like look.',
    coverSrc: 'https://picsum.photos/seed/exp-shader-dither/960/600',
  },
]

export function experimentsForKind(kind: ExperimentKind): ExperimentItem[] {
  return experiments.filter((e) => e.kind === kind)
}

export function teaserCoverForKind(kind: ExperimentKind): string {
  const first = experimentsForKind(kind)[0]
  return first?.coverSrc ?? 'https://picsum.photos/seed/exp-teaser-fallback/640/400'
}
