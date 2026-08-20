export type HomeExperiment = {
  id: string;
  title: string;
  mediaKind: "video";
  mediaSrc: string;
  webmSrc: string;
  posterSrc: string;
  alt: string;
  /** Shown as a second mono line (e.g. “GSAP”, “SHADER”). */
  tag?: string;
  /** Optional link — e.g. a related writing or demo repo. */
  href?: string;
  source?: "motion-forge";
  shader?: string;
  look?: string;
};

const MEDIA = "/media/experiments";

function experimentVideo(stem: string) {
  return {
    mediaKind: "video" as const,
    mediaSrc: `${MEDIA}/${stem}.mp4`,
    webmSrc: `${MEDIA}/${stem}.webm`,
    posterSrc: `${MEDIA}/${stem}-poster.webp`,
  };
}

export const homeExperiments: HomeExperiment[] = [
  {
    id: "gsap-1",
    title: "GSAP Study 1",
    tag: "GSAP",
    ...experimentVideo("gsap-1"),
    alt: "GSAP motion study 1",
  },
  {
    id: "gsap-2",
    title: "GSAP Study 2",
    tag: "GSAP",
    ...experimentVideo("gsap-2"),
    alt: "GSAP motion study 2",
  },
  {
    id: "gsap-3",
    title: "GSAP Study 3",
    tag: "GSAP",
    ...experimentVideo("gsap-3"),
    alt: "GSAP motion study 3",
  },
  {
    id: "gasp-4",
    title: "GSAP Study 4",
    tag: "GSAP",
    ...experimentVideo("gasp-4"),
    alt: "GSAP motion study 4",
  },

  {
    id: "reveal",
    title: "Reveal",
    tag: "GSAP, SHADER",
    ...experimentVideo("reveal"),
    alt: "Scroll-linked reveal choreography",
  },
  {
    id: "svg-mask",
    title: "SVG Mask",
    tag: "SVG, GSAP",
    ...experimentVideo("svg-mask"),
    alt: "SVG mask transition study",
  },
  {
    id: "gradient",
    title: "Gradient",
    tag: "SHADER",
    ...experimentVideo("gradient"),
    alt: "Animated gradient shader",
  },

  {
    id: "mosaic",
    title: "Mosaic",
    tag: "SHADER",
    ...experimentVideo("mosaic"),
    alt: "Palette mosaic tiles shader",
  },

  {
    id: "alpha",
    title: "Alpha",
    tag: "SHADER",
    ...experimentVideo("alpha"),
    alt: "Alpha compositing shader study",
  },
  {
    id: "ascii-1",
    title: "ASCII Field",
    tag: "ASCII",
    ...experimentVideo("ascii-1"),
    alt: "ASCII character field animation",
  },
  {
    id: "simplex-1",
    title: "Simplex Noise",
    tag: "SHADER",
    ...experimentVideo("simplex-1"),
    alt: "Simplex noise displacement study",
  },
  {
    id: "invader",
    title: "Invader Fractal",
    tag: "SHADER",
    ...experimentVideo("invader"),
    alt: "Fractal field shader",
  },
  {
    id: "motion-path",
    title: "Motion Path",
    tag: "GSAP",
    ...experimentVideo("motion-path"),
    alt: "Motion along SVG paths",
  },
  {
    id: "web-gpu",
    title: "WebGPU",
    tag: "WEBGPU",
    ...experimentVideo("web-gpu"),
    alt: "WebGPU compute and render study",
  },
  {
    id: "mf-mesh-gradient",
    title: "Mesh Gradient",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "mesh-gradient",
    ...experimentVideo("mf-mesh-gradient"),
    alt: "Mesh Gradient motion study",
  },
  {
    id: "mf-god-rays",
    title: "God Rays",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "god-rays",
    ...experimentVideo("mf-god-rays"),
    alt: "God Rays motion study",
  },
  {
    id: "mf-metaballs",
    title: "Metaballs",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "metaballs",
    ...experimentVideo("mf-metaballs"),
    alt: "Metaballs motion study",
  },
  {
    id: "mf-smoke-ring",
    title: "Smoke Ring",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "smoke-ring",
    ...experimentVideo("mf-smoke-ring"),
    alt: "Smoke Ring motion study",
  },
  {
    id: "mf-swirl",
    title: "Swirl",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "swirl",
    ...experimentVideo("mf-swirl"),
    alt: "Swirl motion study",
  },
  {
    id: "mf-dithering",
    title: "Adaptive Dithering",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "dithering",
    ...experimentVideo("mf-dithering"),
    alt: "Adaptive Dithering motion study",
  },
  {
    id: "mf-grain-gradient",
    title: "Grain Gradient",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "grain-gradient",
    ...experimentVideo("mf-grain-gradient"),
    alt: "Grain Gradient motion study",
  },
  {
    id: "mf-liquid-metal",
    title: "Liquid Metal",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "liquid-metal",
    ...experimentVideo("mf-liquid-metal"),
    alt: "Liquid Metal motion study",
  },
  {
    id: "mf-fluid-gradient",
    title: "Fluid Gradient",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "fluid-gradient",
    ...experimentVideo("mf-fluid-gradient"),
    alt: "Fluid Gradient motion study",
  },
  {
    id: "mf-inward-echoes",
    title: "Inward Echoes",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "inward-echoes",
    ...experimentVideo("mf-inward-echoes"),
    alt: "Inward Echoes motion study",
  },
  {
    id: "mf-radial-repeat-blur",
    title: "Radial Repeat",
    tag: "MOTION FORGE",
    source: "motion-forge",
    shader: "radial-repeat-blur",
    ...experimentVideo("mf-radial-repeat-blur"),
    alt: "Radial Repeat motion study",
  },
  {
    id: "mf-prismatic-noise",
    title: "Prismatic Noise",
    tag: "MOTION FORGE",
    source: "motion-forge",
    look: "Prismatic Noise",
    ...experimentVideo("mf-prismatic-noise"),
    alt: "Prismatic Noise motion study",
  },
  {
    id: "mf-halftone-mesh",
    title: "Halftone Mesh",
    tag: "MOTION FORGE",
    source: "motion-forge",
    look: "Halftone Mesh",
    ...experimentVideo("mf-halftone-mesh"),
    alt: "Halftone Mesh motion study",
  },
];
