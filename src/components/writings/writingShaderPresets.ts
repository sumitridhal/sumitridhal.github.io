import analyticRaySphere from '@/shaders/writing-demos/analytic-ray-sphere.frag?raw'
import asciiGrayscale from '@/shaders/writing-demos/ascii-grayscale.frag?raw'
import chevronGradientBars from '@/shaders/writing-demos/chevron-gradient-bars.frag?raw'
import ditherBanding from '@/shaders/writing-demos/dither-banding.frag?raw'
import fragmentPipelineUv from '@/shaders/writing-demos/fragment-pipeline-uv.frag?raw'
import fullscreenPassVignette from '@/shaders/writing-demos/fullscreen-pass-vignette.frag?raw'
import grayscaleLuma from '@/shaders/writing-demos/grayscale-luma.frag?raw'
import gridTransform2d from '@/shaders/writing-demos/grid-transform-2d.frag?raw'
import halftoneDots from '@/shaders/writing-demos/halftone-dots.frag?raw'
import lightFalloff from '@/shaders/writing-demos/light-falloff.frag?raw'
import paletteMosaicGrid from '@/shaders/writing-demos/palette-mosaic-grid.frag?raw'
import raymarchSphere from '@/shaders/writing-demos/raymarch-sphere.frag?raw'
import sdfPrimitives2d from '@/shaders/writing-demos/sdf-primitives-2d.frag?raw'
import smoothstepDerivatives from '@/shaders/writing-demos/smoothstep-derivatives.frag?raw'
import sobelEdges from '@/shaders/writing-demos/sobel-edges.frag?raw'
import toneQuantize from '@/shaders/writing-demos/tone-quantize.frag?raw'
import valueNoiseFbm from '@/shaders/writing-demos/value-noise-fbm.frag?raw'
import webgpuMentalModel from '@/shaders/writing-demos/webgpu-mental-model.frag?raw'

export const WRITING_SHADER_PRESETS = {
  asciiGrayscale,
  chevronGradientBars,
  ditherBanding,
  grayscaleLuma,
  halftoneDots,
  lightFalloff,
  paletteMosaicGrid,
  sobelEdges,
  fragmentPipelineUv,
  fullscreenPassVignette,
  valueNoiseFbm,
  raymarchSphere,
  sdfPrimitives2d,
  analyticRaySphere,
  smoothstepDerivatives,
  toneQuantize,
  gridTransform2d,
  webgpuMentalModel,
} as const

export type WritingShaderPresetSingle = keyof typeof WRITING_SHADER_PRESETS

export type WritingShaderPreset = WritingShaderPresetSingle | 'pingPongFeedback'

export function getWritingShaderFragmentSource(
  preset: WritingShaderPreset,
): string | null {
  if (preset === 'pingPongFeedback') return null
  return WRITING_SHADER_PRESETS[preset]
}
