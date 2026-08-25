import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const RESTING_POINTER = { x: 0.5, y: 0.5 }

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const LIQUID_GLASS_FRAG = /* glsl */ `
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uScene;
uniform float uProfile;
uniform float uRim;
uniform float uThickness;
uniform float uFrost;
uniform float uAberration;
uniform float uRadius;

varying vec2 vUv;

const float PI = 3.14159265;
/* Golden angle: successive taps land on a spiral that never repeats a spoke. */
const float GOLDEN_ANGLE = 2.39996323;
const int FROST_TAPS = 10;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), f.x),
    mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + vec2(13.7, 5.1);
    amplitude *= 0.5;
  }
  return value;
}

/* A framed image on a pale page: the frame's hard border is what makes the
   rim distortion legible, and the flowing bands give the interior detail. */
vec3 sceneBlueFlow(vec2 uv) {
  vec3 page = vec3(0.784, 0.792, 0.976);
  vec2 frameHalf = vec2(0.34, 0.30);
  vec2 q = abs(uv - 0.5) - frameHalf;
  float inRect = step(max(q.x, q.y), 0.0);

  vec2 local = (uv - (0.5 - frameHalf)) / (frameHalf * 2.0);
  float drift = uTime * 0.05;
  float warp = fbm(vec2(local.x * 1.8, local.y * 0.9 + drift)) - 0.5;
  float ribbon = local.x * 7.0 + warp * 5.2 + local.y * 0.6;
  float band = 0.5 + 0.5 * sin(ribbon * PI);

  vec3 img = mix(
    vec3(0.043, 0.055, 0.286),
    vec3(0.243, 0.235, 0.909),
    smoothstep(0.1, 0.75, band)
  );
  img = mix(img, vec3(0.639, 0.678, 1.0), pow(smoothstep(0.6, 1.0, band), 2.4) * 0.8);
  img = mix(img, vec3(0.016, 0.020, 0.062), smoothstep(0.74, 1.02, local.x));

  return mix(page, img, inRect);
}

/* Hard, regular, high-frequency: magnification and compression are countable
   here in a way they never are over a photograph. */
vec3 sceneRuleGrid(vec2 uv) {
  vec3 paper = vec3(0.925, 0.918, 0.882);
  vec2 cell = uv * vec2(34.0, 22.0);
  vec2 line = abs(fract(cell) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.08, min(line.x, line.y));
  vec2 major = abs(fract(cell / 6.0) - 0.5);
  float heavy = 1.0 - smoothstep(0.0, 0.02, min(major.x, major.y));
  vec3 color = mix(paper, vec3(0.086, 0.098, 0.129), grid * 0.5);
  color = mix(color, vec3(0.788, 0.204, 0.184), heavy * 0.85);
  return color;
}

/* Deliberately smooth: a gradient has almost no detail for a lens to move, so
   the glass nearly vanishes. Useful as a negative control. */
vec3 sceneWarmField(vec2 uv) {
  float glow = 1.0 - length((uv - vec2(0.68, 0.74)) * vec2(1.1, 1.35));
  vec3 color = mix(
    vec3(0.180, 0.086, 0.192),
    vec3(0.918, 0.435, 0.220),
    smoothstep(-0.1, 0.95, glow)
  );
  color = mix(color, vec3(1.0, 0.941, 0.804), pow(max(glow, 0.0), 4.0));
  return color;
}

vec3 scene(vec2 uv) {
  if (uScene < 0.5) return sceneBlueFlow(uv);
  if (uScene < 1.5) return sceneRuleGrid(uv);
  return sceneWarmField(uv);
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r;
}

/* Central differences rather than fwidth: the gradient of a distance field is
   unit length almost everywhere, so this returns a usable outward normal even
   where the field is nearly flat. */
vec2 sdfNormal(vec2 p, vec2 b, float r) {
  vec2 e = vec2(0.0012, 0.0);
  float dx = sdRoundedBox(p + e.xy, b, r) - sdRoundedBox(p - e.xy, b, r);
  float dy = sdRoundedBox(p + e.yx, b, r) - sdRoundedBox(p - e.yx, b, r);
  vec2 g = vec2(dx, dy);
  float len = length(g);
  return len > 1e-6 ? g / len : vec2(0.0, 1.0);
}

/* The slope of the bevel's height profile, which is the only part of the
   profile refraction can see. Height itself never enters the sample offset. */
float bevelSlope(float t) {
  if (uProfile < 0.5) {
    /* Circular bead: slope diverges at the outer wall, so it is clamped to keep
       the offset finite within one pixel of the silhouette. */
    return min(t / sqrt(max(1.0 - t * t, 1e-4)), 6.0);
  }
  if (uProfile < 1.5) return 1.0;
  if (uProfile < 2.5) return 6.0 * t * (1.0 - t);
  return 2.0 * t;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 toAspect = vec2(aspect, 1.0);

  vec2 p = (uv - 0.5) * toAspect;
  vec2 center = (uPointer - 0.5) * toAspect;
  vec2 local = p - center;

  vec2 boxHalf = vec2(0.30, 0.30);
  float radius = uRadius * min(boxHalf.x, boxHalf.y);
  float d = sdRoundedBox(local, boxHalf, radius);

  vec3 backdrop = scene(uv);

  /* Contact shadow: the same field, pushed down and read from outside. */
  float dShadow = sdRoundedBox(local - vec2(0.0, -0.022), boxHalf, radius);
  float shadow = smoothstep(0.055, 0.0, dShadow);

  /* Antialias the silhouette from the distance field's own screen derivative.
     fwidth must be evaluated before any early return, while the whole 2x2 quad
     is still running. */
  float aa = max(fwidth(d), 1e-5);

  /* Everything below only contributes where the slab covers the fragment, so
     fragments strictly outside skip the taps entirely. The branch is coherent:
     whole quads are inside or outside except along the silhouette. */
  if (d > aa) {
    gl_FragColor = vec4(backdrop * (1.0 - shadow * 0.28), 1.0);
    return;
  }

  float rim = max(uRim, 1e-4);
  /* Zero deep inside the slab, one at the silhouette. */
  float t = clamp(1.0 + d / rim, 0.0, 1.0);
  vec2 normal = sdfNormal(local, boxHalf, radius);
  /* Profiles that flatten on their own reach zero slope at t = 0; the linear
     chamfer does not, so the band gate is what keeps its interior undisplaced —
     and what leaves a crease exactly where its slope drops. */
  float slope = bevelSlope(t) * step(-rim, d);

  /* The offset vanishes wherever the bevel is flat, which is why the interior
     stays honest and every chromatic fringe lands on the rim by construction. */
  vec2 offset = normal * slope * uThickness * 0.05;
  vec2 offsetUv = offset / toAspect;

  /* Frost scales with the bevel slope: thicker glass scatters more. */
  float frostRadius = uFrost * (0.006 + 0.03 * slope);
  vec3 frosted = vec3(0.0);
  for (int i = 0; i < FROST_TAPS; i++) {
    float fi = float(i);
    float angle = fi * GOLDEN_ANGLE;
    float r = sqrt((fi + 0.5) / float(FROST_TAPS)) * frostRadius;
    frosted += scene(uv + offsetUv + vec2(cos(angle), sin(angle)) * r / toAspect);
  }
  frosted /= float(FROST_TAPS);

  /* One offset, three lengths: dispersion is a scale on the vector the bevel
     already produced, not three independent directions. */
  float spread = uAberration * 0.35;
  vec3 fringe = vec3(
    scene(uv + offsetUv * (1.0 - spread)).r,
    scene(uv + offsetUv).g,
    scene(uv + offsetUv * (1.0 + spread)).b
  );

  vec3 refracted = mix(fringe, frosted, smoothstep(0.0, 0.35, uFrost));

  /* An art-directed normal: the 2D gradient tilted by the bevel slope, with a
     unit vertical component standing in for the face of the slab. */
  vec3 n3 = normalize(vec3(normal * slope * 0.8, 1.0));
  vec3 lightDir = normalize(vec3(-0.45, 0.65, 0.62));
  float spec = pow(max(dot(n3, lightDir), 0.0), 26.0);
  float sheen = pow(max(dot(n3, normalize(vec3(0.3, -0.8, 0.5))), 0.0), 12.0);

  vec3 glass = refracted;
  glass += vec3(1.0, 0.99, 0.96) * spec * 0.75;
  glass += vec3(0.86, 0.90, 1.0) * sheen * 0.22;
  /* Fresnel-ish lift confined to the bevel band. */
  glass += vec3(0.72, 0.78, 1.0) * pow(t, 3.5) * 0.16;
  glass *= 1.0 - 0.10 * pow(t, 6.0);

  float inside = 1.0 - smoothstep(-aa, aa, d);

  vec3 color = backdrop * (1.0 - shadow * 0.28 * (1.0 - inside));
  color = mix(color, glass, inside);

  gl_FragColor = vec4(color, 1.0);
}
`

type PointerState = {
  x: number
  y: number
  active: boolean
}

type LiquidGlassControls = {
  scene: number
  profile: number
  rim: number
  thickness: number
  frost: number
  aberration: number
  radius: number
  reduced: boolean
}

function LiquidGlassMesh({
  controls,
  pointerRef,
}: {
  controls: LiquidGlassControls
  pointerRef: RefObject<PointerState>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const pointer = useRef({ ...RESTING_POINTER })
  const clock = useRef(0)
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(RESTING_POINTER.x, RESTING_POINTER.y) },
      uTime: { value: 0 },
      uScene: { value: controls.scene },
      uProfile: { value: controls.profile },
      uRim: { value: controls.rim },
      uThickness: { value: controls.thickness },
      uFrost: { value: controls.frost },
      uAberration: { value: controls.aberration },
      uRadius: { value: controls.radius },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useFrame((_, delta) => {
    if (!material.current) return
    const step = Math.min(delta, 0.1)
    const target = pointerRef.current
    const targetX = target?.active ? THREE.MathUtils.clamp(target.x, 0, 1) : 0.5
    const targetY = target?.active ? THREE.MathUtils.clamp(target.y, 0, 1) : 0.5

    if (controls.reduced) {
      pointer.current.x = targetX
      pointer.current.y = targetY
    } else {
      clock.current += step
      pointer.current.x = THREE.MathUtils.damp(pointer.current.x, targetX, 10, step)
      pointer.current.y = THREE.MathUtils.damp(pointer.current.y, targetY, 10, step)
    }

    gl.getDrawingBufferSize(resolution)
    const shader = material.current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uPointer.value.set(pointer.current.x, pointer.current.y)
    shader.uTime.value = controls.reduced ? 0 : clock.current
    shader.uScene.value = controls.scene
    shader.uProfile.value = controls.profile
    shader.uRim.value = controls.rim
    shader.uThickness.value = controls.thickness
    shader.uFrost.value = controls.frost
    shader.uAberration.value = controls.aberration
    shader.uRadius.value = controls.radius
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={LIQUID_GLASS_FRAG}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function RangeRow({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="writing-generative-play-preview__control-value">{display}</span>
    </div>
  )
}

const SCENE_LABELS = ['Framed image', 'Rule grid', 'Warm field']
const PROFILE_LABELS = ['BEAD', 'CHAMFER', 'SMOOTH', 'PARABOLA']

export type WritingLiquidGlassPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingLiquidGlassPreview({
  caption = 'Move the pointer to carry the slab across the backdrop.',
  hint,
  height = 560,
  className = '',
}: WritingLiquidGlassPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ ...RESTING_POINTER, active: false })
  const [scene, setScene] = useState(0)
  const [profile, setProfile] = useState(0)
  const [rim, setRim] = useState(0.09)
  const [thickness, setThickness] = useState(0.55)
  const [frost, setFrost] = useState(0.18)
  const [aberration, setAberration] = useState(0.3)
  const [radius, setRadius] = useState(1)

  const controls: LiquidGlassControls = {
    scene,
    profile,
    rim,
    thickness,
    frost,
    aberration,
    radius,
    reduced,
  }

  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the liquid glass study.
    </p>
  )

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const element = canvasWrapRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    pointerRef.current.x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
    pointerRef.current.y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)
    pointerRef.current.active = true
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerRef.current.active = false
  }, [])

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls caption={caption} hint={hint} label="Liquid glass controls" dense>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-scene`}>Backdrop</label>
          <select
            id={`${uid}-scene`}
            value={scene}
            onChange={(event) => setScene(Number(event.target.value))}
          >
            {SCENE_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
          <span className="writing-generative-play-preview__control-value">
            {scene + 1}/{SCENE_LABELS.length}
          </span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-profile`}>Bevel profile</label>
          <select
            id={`${uid}-profile`}
            value={profile}
            onChange={(event) => setProfile(Number(event.target.value))}
          >
            <option value={0}>Circular bead</option>
            <option value={1}>Linear chamfer</option>
            <option value={2}>Smoothstep</option>
            <option value={3}>Parabola</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {PROFILE_LABELS[profile]}
          </span>
        </div>
        <RangeRow
          id={`${uid}-rim`}
          label="Bevel width"
          min={0.01}
          max={0.3}
          step={0.005}
          value={rim}
          display={rim.toFixed(3)}
          onChange={setRim}
        />
        <RangeRow
          id={`${uid}-thickness`}
          label="Thickness"
          min={0}
          max={2}
          step={0.01}
          value={thickness}
          display={thickness.toFixed(2)}
          onChange={setThickness}
        />
        <RangeRow
          id={`${uid}-frost`}
          label="Frost"
          min={0}
          max={1}
          step={0.01}
          value={frost}
          display={frost.toFixed(2)}
          onChange={setFrost}
        />
        <RangeRow
          id={`${uid}-aberration`}
          label="Aberration"
          min={0}
          max={1}
          step={0.01}
          value={aberration}
          display={aberration.toFixed(2)}
          onChange={setAberration}
        />
        <RangeRow
          id={`${uid}-radius`}
          label="Corner radius"
          min={0}
          max={1}
          step={0.01}
          value={radius}
          display={radius.toFixed(2)}
          onChange={setRadius}
        />
      </WritingPreviewControls>
      <div
        ref={canvasWrapRef}
        className="writing-generative-play-preview__canvas-wrap"
        style={{ height: `${height}px`, cursor: 'crosshair' }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="A rounded slab of glass following the pointer across a framed image, refracting and colour-fringing the backdrop in a narrow band at its edge while its interior stays clear"
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
          >
            <Suspense fallback={null}>
              <LiquidGlassMesh controls={controls} pointerRef={pointerRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
