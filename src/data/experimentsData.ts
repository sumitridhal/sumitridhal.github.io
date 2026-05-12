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
    coverSrc: '/experiments/gsap/gsap-cover-01.png',
  },
  {
    id: 'gsap-svg-morph',
    kind: 'gsap',
    title: 'SVG morph study',
    blurb: 'Shape morphing and path-driven motion for interface transitions.',
    coverSrc: '/experiments/gsap/gsap-cover-02.png',
  },
  {
    id: 'gsap-stagger-grid',
    kind: 'gsap',
    title: 'Staggered grid entrance',
    blurb: 'Procedural delays and ease curves over a responsive card grid.',
    coverSrc: '/experiments/gsap/gsap-cover-03.png',
  },
  {
    id: 'gsap-flow-pulse',
    kind: 'gsap',
    title: 'Flow pulse along paths',
    blurb: 'Motion along SVG or motion paths with eased intensity waves.',
    coverSrc: '/experiments/gsap/gsap-cover-04.png',
  },
  {
    id: 'gsap-nested-parallax',
    kind: 'gsap',
    title: 'Nested parallax orbits',
    blurb: 'Layered transforms at different rates for depth without WebGL.',
    coverSrc: '/experiments/gsap/gsap-cover-05.png',
  },
  {
    id: 'three-orbit-field',
    kind: 'three',
    title: 'Orbital instancing',
    blurb: 'Instanced meshes with subtle noise offset in WebGL space.',
    coverSrc: '/writings/threejs-webglrendertarget-minimal-flow.png',
  },
  {
    id: 'three-post-stack',
    kind: 'three',
    title: 'Post stack exploration',
    blurb: 'Bloom, grain, and color grading passes composed in order.',
    coverSrc: '/writings/fullscreen-passes-as-design.png',
  },
  {
    id: 'three-environment-map',
    kind: 'three',
    title: 'HDR environment probe',
    blurb: 'PBR materials reacting to a small studio HDRI.',
    coverSrc: '/writings/falloff-vocabulary-for-lights.png',
  },
  {
    id: 'shader-noise-warp',
    kind: 'shader',
    title: 'Noise warp field',
    blurb: '2D value noise displacing UVs for a liquid poster effect.',
    coverSrc: '/writings/noise-in-creative-coding.png',
  },
  {
    id: 'shader-raymarch-sdf',
    kind: 'shader',
    title: 'Ray-marched SDF sketch',
    blurb: 'Signed distance primitives blended in a single fragment pass.',
    coverSrc: '/writings/raymarch-distance-fields-nutshell.png',
  },
  {
    id: 'shader-gradient-dither',
    kind: 'shader',
    title: 'Gradient dither',
    blurb: 'Ordered dither between two ramps for a print-like look.',
    coverSrc: '/writings/dither-against-banding.png',
  },
]

export function experimentsForKind(kind: ExperimentKind): ExperimentItem[] {
  return experiments.filter((e) => e.kind === kind)
}

export function teaserCoverForKind(kind: ExperimentKind): string {
  const first = experimentsForKind(kind)[0]
  return first?.coverSrc ?? 'https://picsum.photos/seed/exp-teaser-fallback/640/400'
}
