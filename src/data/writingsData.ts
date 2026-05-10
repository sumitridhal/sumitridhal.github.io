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
  title: string
  date: string
  category: string
  /** Hero / card image (footer teaser, Open Graph, etc.). */
  coverSrc?: string
  bodyParagraphs: string[]
  /** Two-line hero title; falls back to a single line from `title`. */
  titleLines?: string[]
  /** Right-column technical aside (accent monospace). */
  asideParagraphs?: string[]
  /** Rows of figure cells (e.g. 4 per row). */
  figureRows?: WritingFigureVariant[][]
}

export const writings: WritingItem[] = [
  {
    id: 'fragment-shader-in-the-graphics-pipeline',
    title: 'Where the fragment shader sits in the graphics pipeline',
    titleLines: ['Where the fragment shader', 'sits in the pipeline'],
    date: '16/05',
    category: 'Graphics',
    bodyParagraphs: [
      'Geometry stages turn mesh data into clip-space vertices; rasterization then walks the triangles and asks, for each covered sample, what colour and depth to contribute. The fragment shader is that per-sample programme: it receives interpolated varyings built from vertex outputs, runs in parallel across thousands of pixels, and hands back values the fixed-function back end blends into the render target.',
      'Uniforms and bound resources are shared across invocations; varyings differ per pixel because they are the result of perspective-correct interpolation across the primitive. That split is why you push bone matrices as uniforms but pass UVs or normals as varyings, and why a bug in one vertex attribute shows up as a smooth gradient of wrong instead of a single wrong constant.',
      'Fixed-function pieces still matter around the shader: depth tests and early depth rejection, multisample coverage, and blend equations all run after your outputs are defined. A discard or a write to depth can interact with early-z; compute passes, in contrast, have no rasterizer at all—useful when you need scatter writes, but a different contract than the graphics pipeline sketched in a first mental model for WebGPU in the browser.',
    ],
    asideParagraphs: [
      'MSAA runs coverage at higher resolution than your shader may execute; understand whether your target API invokes the fragment shader once per sample or per pixel for edge pixels.',
      'Blending reads the destination colour your shader just wrote—ordering passes still matters for transparency even when each pass is “just” a fullscreen triangle.',
    ],
  },
  {
    id: 'shader-builtins-from-interpolation-to-derivatives',
    title: 'Shader built-ins from interpolation to derivatives',
    titleLines: ['Shader built-ins', 'from interpolation to derivatives'],
    date: '15/05',
    category: 'Graphics',
    bodyParagraphs: [
      'Most fragment work is built from a small toolbox: remap ranges with mix and smoothstep, clamp into valid intervals, normalize directions before dot products, and raise cosines to a power when you need a tight specular lobe—the same vocabulary behind falloff, rim, and sharpness as a lighting vocabulary, without turning this note into another lighting tutorial.',
      'Texture builtins sample filtered texels; explicit LOD or gradient hints control which mip level you hit. That matters the moment you threshold a smooth field into a screen pattern, because the same UV field can alias or shimmer if mips are chosen inconsistently—ideas that sit next to halftone and sampling pieces without repeating their whole compositional story.',
      'Derivative builtins expose how a quantity changes across the 2x2 pixel quad your invocation belongs to; they drive automatic mip selection and cheap edge-aware effects. Names differ across GLSL, HLSL, and WGSL, but the concepts—filter width, implicit gradients, textureGather—port cleanly once you stop spelling the API and start naming the signal processing.',
    ],
    asideParagraphs: [
      'Derivatives are undefined inside non-uniform control flow in many profiles; branch per pixel first, then sample, or hoist texture reads.',
      'smoothstep is Hermite edge softening; repeated smoothsteps are a cheap tone-shape language before you reach for a full LUT.',
    ],
  },
  {
    id: 'vector-matrix-spaces-for-fragment-shaders',
    title: 'Vector, matrix, and coordinate spaces for fragment shaders',
    titleLines: ['Vectors, matrices, and', 'spaces in fragment shaders'],
    date: '14/05',
    category: 'Creative code',
    coverSrc: 'https://picsum.photos/seed/vector-matrix-spaces-for-fragment-shaders/960/720',
    figureRows: [['mesh', 'warp', 'flow', 'grad']],
    bodyParagraphs: [
      'GPUs habitually use column vectors and multiply on the left: p_clip = P * V * M * p_object. Each matrix encodes a change of basis—translation, rotation, scale, projection—so debugging is often asking “which space is this vector in right now?” rather than hunting a typo in a trig identity.',
      'Normals transform by the inverse-transpose of the upper 3x3 when you allow non-uniform scale; tangents and bitangents follow the same linear part. Fragment code that lights surfaces needs everything in a common space, usually world or view, even when the artistic idea started in object units or in a UV chart.',
      'UV coordinates are a 2D parameterization of the mesh, not a guarantee of orthogonality or uniform scale; aspect and stretching show up directly in procedural stripes and noise fields. Sampling noise in tangent space when warping meshes so lighting stays coherent is the same discipline: pick the space first, then write the math, as in the noise-in-creative-coding note on fields and continuity.',
    ],
    asideParagraphs: [
      'NDC spans roughly −1 to 1 before the viewport transform; remember perspective divide w when reconstructing view rays from depth.',
      'A row-vector convention flips multiplication order; shader snippets pasted from papers need one conscious transpose pass.',
    ],
  },
  {
    id: 'rays-sdf-and-analytic-hits-in-shaders',
    title: 'Rays, SDFs, and analytic hits in shaders',
    titleLines: ['Rays, SDFs, and', 'analytic hits in shaders'],
    date: '13/05',
    category: 'Creative code',
    bodyParagraphs: [
      'A ray is an origin plus a direction, r(t) = o + t d with t ≥ 0. Analytic tests solve for t in closed form: a sphere reduces to a quadratic, an axis-aligned box to slab intersections, a plane to a single division. Those hits are cheap, deterministic, and easy to reason about in a fragment or compute shader when your scene is really a handful of primitives.',
      'A signed distance field returns the shortest distance to a surface, negative inside and positive outside. You combine fields with min for unions, max for intersections, and smooth blends for fillets; the gradient of the field points toward the nearest surface, so a central difference on six taps gives a normal without storing mesh topology.',
      'Raymarching steps along the ray using the SDF value as a conservative stride; the companion piece on raymarching signed distance fields without the hype owns iteration caps, grazing angles, and production shortcuts. Here the takeaway is definitions—what distance means—and how analytic hits and SDFs share the same ray parameter t even when the search strategy differs.',
    ],
    asideParagraphs: [
      'SDFs from triangle soups are expensive to evaluate; primitives and blends are the teaching path, not the CAD import path.',
      'Do not confuse sphere tracing the SDF with intersecting an analytic sphere; same word “sphere,” different algorithm.',
    ],
  },
  {
    id: 'fragment-kernels-blur-and-edges',
    title: 'Fragment kernels for blur, sharpen, and edges',
    titleLines: ['Fragment kernels', 'for blur and edges'],
    date: '12/05',
    category: 'Graphics',
    bodyParagraphs: [
      'Many image operations are local: each output pixel is a weighted sum of neighbours in a kernel. A Gaussian blur is separable, meaning two 1D passes with a small tap count approximate a fat 2D convolution with far fewer texture reads—exactly the kind of pass budgeting full-screen passes as a design language encourages when a chain is getting heavy.',
      'Box filters are fewer taps but ring in frequency space; Gaussians cost more but decay smoothly. Sobel and unsharp masks are the same machinery with different weights: one estimates gradients for edges, the other adds a high-pass residual back onto the image for crispness.',
      'When a pass must read its own freshly written pixels in the same frame—iterative blur radius, some solvers—you pair surfaces and swap; ping-pong buffers and why GPUs like pairs is the longer story on naming read versus write and precision. For a single separable blur you usually only need two passes and no feedback loop.',
    ],
    asideParagraphs: [
      'Kernel radius times resolution is work; widen blur by downsampling half-res first, then upsample with a small filter.',
      'Linear sampling can fuse two taps when weights align with texel spacing; profile before micro-optimizing.',
    ],
  },
  {
    id: 'tone-quantization-and-fragment-output',
    title: 'Tone, quantization, and the last mile to the screen',
    titleLines: ['Tone, quantization, and', 'the last mile to the screen'],
    date: '11/05',
    category: 'Graphics',
    bodyParagraphs: [
      'Linear light is where physically plausible adds and lighting accumulations behave; display encoding—sRGB or PQ—is where human contrast perception is honoured. Doing heavy grading in the wrong space creates muddy shadows or neon highs; the fragment shader is often where you apply a filmic curve or shoulder before the values hit an 8-bit swap chain.',
      'Bit depth sets how many distinct steps exist between black and white. Gentle slopes survive quantization; aggressive lifts on a vignette or sky reveal stair steps that no amount of artistic intent can hide. Fix the curve or widen the buffer before you reach for texture-space rescue.',
      'Dither spreads quantization error into high-frequency noise the eye integrates away—that whole vocabulary lives in when dithering rescues an 8-bit gradient. Halftone rhythm and dot screens are the story in dots, halftone, and the print room in a fragment shader. Here the focus is where in the chain you quantize, with what buffer precision, and whether the stairs came from the grade or from the display path.',
    ],
    asideParagraphs: [
      'sRGB framebuffers apply roughly gamma 2.2 on write; linear HDR targets need different monitoring assumptions.',
      'A final +1/255 hash is not a substitute for understanding whether banding came from the grade or from display pipeline dithering.',
    ],
  },
  {
    id: 'dots-and-halftone-in-fragments',
    title: 'Dots, halftone, and the print room in a fragment shader',
    titleLines: ['Dots, halftone, and', 'the print room in a shader'],
    date: '09/05',
    category: 'Creative code',
    coverSrc: 'https://picsum.photos/seed/dots-and-halftone-in-fragments/960/720',
    figureRows: [
      ['grain', 'cloud', 'flow', 'branch'],
      ['grad', 'glow', 'warp', 'mesh'],
    ],
    bodyParagraphs: [
      'Print halftone is really a sampling problem: you have a continuous tone image and a binary medium, so you trade spatial resolution for perceived grey. In a fragment shader the medium is not paper but pixels, yet the same idea applies when you threshold a smooth field with a rotating dot screen or ordered Bayer matrix.',
      'The compositional win is rhythm. A good screen reads as texture up close and as tone from a distance, which is why newsprint and manga screentone feel alive compared with a flat blur. In real time work you usually drive the screen frequency from UV scale or camera distance so the pattern does not shimmer when the view moves.',
      'Keep one eye on contrast. Aggressive screens crush mid-tones and can moiré against fine geometry. Treat angle, cell size, and threshold curve as slow knobs you tune in context rather than constants you copy once from a reference.',
    ],
    asideParagraphs: [
      'Ordered dither uses a small repeating threshold map; error diffusion spreads quantization error to neighbours. Shaders more often use rotated grids or blue-noise textures because they parallelize cleanly and stay stable under mipmaps.',
      'If you need motion, animate phase along a direction vector in UV space rather than re-seeding random noise every frame, or the screen will crawl.',
    ],
  },
  {
    id: 'webgpu-first-mental-model',
    title: 'A first mental model for WebGPU in the browser',
    titleLines: ['A first mental model', 'for WebGPU in the browser'],
    date: '02/05',
    category: 'Graphics',
    bodyParagraphs: [
      'WebGPU asks you to think in explicit queues, bind groups, and pipelines instead of the implicit state machine many of us grew up with in immediate-mode GL. That verbosity is the contract: the driver gets a smaller decision surface, which tends to mean more predictable performance on integrated GPUs and laptops.',
      'A tiny ergonomic layer on top—typed shader nodes, macro helpers, or a scene graph that emits pipelines—can buy readability without hiding the two things that still matter: how often you switch pipelines and how wide your memory barriers are. Abstractions that obscure those two knobs eventually show up as jank.',
      'Reach for WebGPU when you need compute shaders beside graphics, large structured buffers, or tighter control over multi-pass rendering. Stay on WebGL when your asset is stable, your audience still includes older Safari constraints, or the port cost outweighs a single fullscreen effect.',
    ],
    asideParagraphs: [
      'Pipeline layout mismatch is the new “wrong uniform slot”: always validate bind group indices against the shader during CI, not only at author time.',
      'Prefer explicit `copyBufferToTexture` staging for uploads you do once; stream uploads only when profiling proves you need them.',
    ],
  },
  {
    id: 'falloff-vocabulary-for-lights',
    title: 'Falloff, rim, and sharpness as a lighting vocabulary',
    titleLines: ['Falloff, rim, and sharpness', 'as a lighting vocabulary'],
    date: '24/04',
    category: 'Creative code',
    bodyParagraphs: [
      'Most readable lighting in fragments is a handful of terms multiplied together: a diffuse lobe that respects normals, a specular highlight with a tunable power, and edge terms like Fresnel or rim that stop materials from turning into plastic soup.',
      'Falloff is where you sell scale. A hard inverse square reads physically grounded until your units are wrong and everything blows out. Inverse square with a small offset, smooth minimums, or artist-authored curves are all acceptable if the image holds together under animation.',
      'Name your knobs for the art director, not the paper: “edge glow” beats “Schlick approximation” in a UI even when the implementation is standard. The shader is done when someone can iterate mood without reading vector math.',
    ],
  },
  {
    id: 'fullscreen-passes-as-design',
    title: 'Full-screen passes as a design language, not decoration',
    titleLines: ['Full-screen passes', 'as a design language'],
    date: '17/04',
    category: 'Graphics',
    bodyParagraphs: [
      'A post chain is a sequence of transforms on an image: blur, threshold, color grade, vignette. Treat that chain like typography for motion—order matters, and the same operator early versus late reads completely different.',
      'Design-oriented passes answer layout questions: separation of foreground and background, guiding attention with localized contrast, or unifying disparate UI layers under one filmic curve. Decoration answers none of those; it only proves you know how to import a bloom sample.',
      'Budget passes the way you budget components. Each fullscreen draw has a fixed overhead; batch parameters into one pass when effects always ship together, and split only when you need different resolution scales or different temporal filters.',
    ],
  },
  {
    id: 'dither-against-banding',
    title: 'When dithering rescues an 8-bit gradient',
    titleLines: ['When dithering rescues', 'an 8-bit gradient'],
    date: '09/04',
    category: 'Creative code',
    bodyParagraphs: [
      'Banding shows up when smooth ramps get quantized to too few levels. The eye is excellent at spotting steps in skies, shadows, and vignettes. Dithering spreads that quantization error into high-frequency noise the visual system happily integrates away at normal viewing distance.',
      'Blue-noise screens are popular in games because they lack the directional crawl of ordered Bayer grids, though they cost a texture lookup and care with tiling. Sometimes a tiny ordered pattern is exactly the retro signal you want—choose for the story, not the trend.',
      'If you can fix banding upstream with a higher precision buffer or a gentler grade, do that first. Dithering is a bandage, not a nutrition plan; it hides stairs but adds grain that may fight film grain or sharpening later in the chain.',
    ],
  },
  {
    id: 'raymarch-distance-fields-nutshell',
    title: 'Raymarching signed distance fields without the hype',
    titleLines: ['Raymarching signed', 'distance fields, plainly'],
    date: '01/04',
    category: 'Creative code',
    figureRows: [['grain', 'cloud', 'flow', 'branch']],
    bodyParagraphs: [
      'A signed distance field answers one question: how far am I from the nearest surface, signed so the inside is negative and the outside is positive. March a ray in steps no larger than that distance and you rarely tunnel through thin geometry, which is why the technique loves organic shapes.',
      'The cost is iterations. Empty space is cheap; grazing angles and fine filigree are not. Caps on maximum steps, minimum step sizes, and relaxed spheres for shadows are where production shaders spend their complexity budget.',
      'Start with a single primitive—sphere or box—then compose with unions, smooth unions, and domain repetition. Composition is the skill; the march loop is mostly bookkeeping once intuition clicks.',
    ],
    asideParagraphs: [
      'Sphere tracing is the common name for stepping by the SDF value; do not confuse it with analytic sphere intersection in classic ray tracing.',
      'Normal vectors come from sampling the SDF six times on a small epsilon offset; cache those samples if you also need ambient occlusion nearby.',
    ],
  },
  {
    id: 'ping-pong-buffers-explained',
    title: 'Ping-pong buffers and why GPUs like pairs',
    titleLines: ['Ping-pong buffers', 'and why GPUs like pairs'],
    date: '25/03',
    category: 'Graphics',
    bodyParagraphs: [
      'Many effects need the previous frame as input: motion blur trails, fluid advection, reaction-diffusion, or cheap temporal blur. You cannot read and write the same texture safely in one pass, so you maintain two surfaces and swap which is source and destination each frame.',
      'The API details differ—FBO attachments in WebGL, render textures in engines—but the mental model is identical. Odd frames write A while sampling B; even frames flip. Your bug class shifts from math mistakes to index mistakes, so name variables `read` and `write` instead of `tex0` and `tex1`.',
      'Watch precision and edge modes. Low bit depth feedback loops amplify noise; linear filtering on a simulation grid smears intent. Match filter and format to the phenomenon you are approximating, not whatever the template project shipped with.',
    ],
  },
  {
    id: 'layout-motion-with-budgets',
    title: 'Layout-driven motion and knowing when to stop',
    titleLines: ['Layout-driven motion', 'and knowing when to stop'],
    date: '18/03',
    category: 'UI',
    bodyParagraphs: [
      'Layout-driven animation means the transition follows real geometry changes—width, position, flex distribution—not a hand-authored keyframe that drifts out of sync when copy changes. Libraries that measure DOM boxes and interpolate FLIP-style transforms excel at dashboards and responsive cards.',
      'The failure mode is everything moving at once. Give hierarchy: one primary transition per gesture, secondary motion at lower amplitude, and respect reduced-motion settings with cross-fades or instant swaps instead of parallax.',
      'Ship a motion budget the same way you ship performance budgets: count simultaneous animated properties, cap duration, and test on low-end hardware. Delight is subtractive; the best interface motion is often the motion you delete after recording yourself using the flow twice.',
    ],
  },
  {
    id: 'noise-in-creative-coding',
    title: 'Noise in Creative Coding',
    titleLines: ['Noise in', 'Creative Coding'],
    date: '10/05',
    category: 'Creative code',
    coverSrc: 'https://picsum.photos/seed/noise-in-creative-coding/960/720',
    figureRows: [
      ['grain', 'cloud', 'flow', 'branch'],
      ['grad', 'glow', 'warp', 'mesh'],
    ],
    bodyParagraphs: [
      'Noise is an indispensable tool for creative coding. We use it to generate all kinds of organic effects like clouds, landscapes, and contours. Or to move and distort objects with a more lifelike behaviour than easing alone can suggest.',
      'The trick is choosing a field that reads well at the scale of your canvas: value noise for grit, gradient noise when you need continuity, and layered octaves when you want detail without a single harsh frequency dominating the frame.',
      'When you map noise to colour or displacement, keep a slow control surface—amplitude, rotation, seed—so the piece stays tunable in performance. The goal is not randomness for its own sake but a controlled distribution that still surprises on every run.',
    ],
    asideParagraphs: [
      "Simplest way is 'fractal Brownian motion' or basic octave summation. Start with one layer that has a particular frequency or amplitude, then double the frequency and halve the amplitude as you go. The halving and doubling are often called persistence and lacunarity.",
      'In shaders, sample your noise in tangent space when warping meshes so lighting stays coherent. On the CPU, prefer precomputed tables or tileable textures if you need thousands of agents reading the same field each frame.',
    ],
  },
  {
    id: 'making-claude-code-shareable',
    title: 'Making Claude Code sessions shareable',
    titleLines: ['Making Claude Code', 'sessions shareable'],
    date: '16/02',
    category: 'Dev',
    bodyParagraphs: [
      'Pairing on a hard problem is easier when someone can see the same transcript, file picks, and tool output you do. The friction is rarely the model; it is packaging context so another engineer—or your future self—can replay the reasoning without re-asking half the questions.',
      'Start by treating the session as an artifact: a short README in the repo that links to the branch, lists the key decisions, and points to any scripts or env vars that matter. If you use Claude Code in the terminal, capture the high-signal turns (plan, diff summary, test commands) in commit messages or a changelog entry instead of pasting the entire log.',
      'When you need a literal handoff, export the smallest slice that still tells the story: the final patch, the failing test name, and one paragraph on what you tried that did not work. Shareable sessions are curated, not raw dumps—and that curation is what makes them useful across teams and time zones.',
    ],
  },
  {
    id: 'claude-code-bash-mode',
    title: 'Claude Code bash mode',
    titleLines: ['Claude Code', 'bash mode'],
    date: '20/01',
    category: 'TIL',
    bodyParagraphs: [
      'Bash mode is the moment you stop treating the agent as a chat surface and let it drive the shell the same way you would: chained commands, pipes, and exit codes that either unblock the next step or surface a real failure.',
      'The habit that saves the most time is naming intent before mechanics. Ask for a dry run or `echo` plan when the command touches production data, then widen permissions once the shape of the change is obvious. The model is fast; your filesystem permissions are not.',
      'When something goes sideways, capture stderr verbatim. It is the fastest signal for both the model and humans about whether you are fighting PATH issues, missing binaries, or a subtle quoting bug—three different fixes, one shared symptom.',
    ],
  },
  {
    id: 'vibe-coding-bookshelf',
    title: 'Vibe coding a bookshelf with Claude Code',
    titleLines: ['Vibe coding a bookshelf', 'with Claude Code'],
    date: '27/12',
    category: 'Dev',
    bodyParagraphs: [
      'A bookshelf UI sounds decorative until you need believable spines, varied thickness, and lighting that does not flatten everything into a texture atlas. The fun part is iterating on feel: density of titles, how much jitter to allow per book, and whether hover states should tilt or only glow.',
      'Claude Code shines when you keep the feedback loop tight: tweak SCSS, reload, paste a screenshot or describe what still feels off. Let the model propose structure—CSS grid tracks, custom properties for spine width—while you hold the art direction (contrast, rhythm, restraint).',
      'Ship a vertical slice first: five books with hard-coded data and one interaction. Once motion and hierarchy read well, swap in real data and worry about horizontal scroll or virtualization. Vibe coding is not skipping engineering; it is letting polish lead as long as the foundations stay boring and testable.',
    ],
  },
]

export function getWritingBySlug(slug: string | undefined): WritingItem | undefined {
  if (!slug) return undefined
  return writings.find((w) => w.id === slug)
}

export function paragraphsForWriting(item: WritingItem): string[] {
  return item.bodyParagraphs
}

export function titleLinesForWriting(item: WritingItem): string[] {
  const lines = item.titleLines
  if (lines && lines.length > 0) return lines
  return [writingTitle(item)]
}

export function asideParagraphsForWriting(item: WritingItem): string[] {
  return item.asideParagraphs ?? []
}

export function writingTitle(item: WritingItem): string {
  return item.title
}

export function excerptFromWriting(item: WritingItem): string {
  const p = paragraphsForWriting(item)[0] ?? ''
  if (!p) return ''
  const max = 220
  if (p.length <= max) return p
  const slice = p.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > 80 ? slice.slice(0, lastSpace) : slice
  return `${cut.trimEnd()}…`
}
