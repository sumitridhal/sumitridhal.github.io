import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const PHOTO_SRC = '/media/writings/burn-dissolve/card.png'
const PHOTO_ASPECT = 751 / 1024
const RESTING_ORIGIN = { x: 0.5, y: 0.56 }
const MAX_RADIUS = 2
const RESET_DELAY_SECONDS = 0.9

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const BURN_DISSOLVE_FRAG = /* glsl */ `
uniform sampler2D uPhoto;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform vec3 uBurnColor;
uniform float uPhotoAspect;
uniform float uRadius;
uniform float uBorderWidth;
uniform float uNoiseAmount;
uniform float uSoftness;
uniform float uAspectCorrect;

varying vec2 vUv;

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
  float amplitude = 0.55;
  for (int octave = 0; octave < 4; octave++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + vec2(17.1, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

float insideThreshold(float distanceValue, float thresholdValue) {
  if (uSoftness < 0.0001) {
    return 1.0 - step(thresholdValue, distanceValue);
  }
  return 1.0 - smoothstep(
    thresholdValue - uSoftness,
    thresholdValue + uSoftness,
    distanceValue
  );
}

vec2 containUv(vec2 uv, out float inside) {
  float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 scale = canvasAspect > uPhotoAspect
    ? vec2(canvasAspect / uPhotoAspect, 1.0)
    : vec2(1.0, uPhotoAspect / canvasAspect);
  vec2 photoUv = (uv - 0.5) * scale + 0.5;
  inside =
    step(0.0, photoUv.x) *
    step(photoUv.x, 1.0) *
    step(0.0, photoUv.y) *
    step(photoUv.y, 1.0);
  return clamp(photoUv, 0.002, 0.998);
}

void main() {
  vec2 delta = vUv - uOrigin;
  vec2 pixelAspect = uResolution / max(min(uResolution.x, uResolution.y), 1.0);
  delta *= mix(vec2(1.0), pixelAspect, uAspectCorrect);

  float noise = fbm(vUv * 9.0 + vec2(4.7, 12.3));
  float distanceValue = length(delta) + noise * uNoiseAmount;
  float burned = insideThreshold(distanceValue, uRadius);
  float border = insideThreshold(distanceValue, uRadius + uBorderWidth);
  float burnEdge = max(border - burned, 0.0);

  float photoInside;
  vec2 photoUv = containUv(vUv, photoInside);
  burned *= photoInside;
  burnEdge *= photoInside;
  vec3 photo = texture2D(uPhoto, photoUv).rgb;
  vec3 ember = mix(uBurnColor * 0.42, uBurnColor * 1.55, burnEdge);
  vec3 color = mix(photo, ember, burnEdge);
  float alpha = photoInside * (1.0 - burned);

  gl_FragColor = vec4(color, alpha);
}
`

type BurnColor = 'ember' | 'cyan' | 'bone'

const BURN_COLORS: Record<BurnColor, THREE.Color> = {
  ember: new THREE.Color('#ff6a1a'),
  cyan: new THREE.Color('#42d9e8'),
  bone: new THREE.Color('#e8ddc2'),
}

type BurnControls = {
  borderWidth: number
  noiseAmount: number
  softness: number
  duration: number
  burnColor: BurnColor
  aspectCorrect: boolean
  reduced: boolean
  restartToken: number
}

function BurnDissolveMesh({
  controls,
  originRef,
}: {
  controls: BurnControls
  originRef: RefObject<{ x: number; y: number }>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const animation = useRef<{
    elapsed: number
    restartToken: number
    phase: 'ready' | 'burning' | 'burned'
  }>({
    elapsed: 0,
    restartToken: controls.restartToken,
    phase: 'ready',
  })
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const loadedPhoto = useLoader(THREE.TextureLoader, PHOTO_SRC)
  const photo = useMemo(() => {
    const texture = loadedPhoto.clone()
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [loadedPhoto])
  const uniforms = useMemo(
    () => ({
      uPhoto: { value: photo },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uOrigin: { value: new THREE.Vector2(RESTING_ORIGIN.x, RESTING_ORIGIN.y) },
      uBurnColor: { value: BURN_COLORS.ember.clone() },
      uPhotoAspect: { value: PHOTO_ASPECT },
      uRadius: { value: 0 },
      uBorderWidth: { value: controls.borderWidth },
      uNoiseAmount: { value: controls.noiseAmount },
      uSoftness: { value: controls.softness },
      uAspectCorrect: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Uniform identity must stay stable.
    [],
  )

  useEffect(
    () => () => {
      photo.dispose()
    },
    [photo],
  )

  useFrame((_, delta) => {
    const current = material.current
    const origin = originRef.current
    if (!current || !origin) return

    if (animation.current.restartToken !== controls.restartToken) {
      animation.current.restartToken = controls.restartToken
      animation.current.elapsed = 0
      animation.current.phase = 'burning'
    }

    gl.getDrawingBufferSize(resolution)
    const shader = current.uniforms
    shader.uResolution.value.copy(resolution)
    shader.uOrigin.value.set(origin.x, origin.y)
    shader.uBurnColor.value.copy(BURN_COLORS[controls.burnColor])
    shader.uBorderWidth.value = controls.borderWidth
    shader.uNoiseAmount.value = controls.noiseAmount
    shader.uSoftness.value = controls.softness
    shader.uAspectCorrect.value = controls.aspectCorrect ? 1 : 0

    if (animation.current.phase === 'ready') {
      shader.uRadius.value = 0
      return
    }

    if (animation.current.phase === 'burned') {
      shader.uRadius.value = MAX_RADIUS
      animation.current.elapsed += Math.min(delta, 0.1)
      if (animation.current.elapsed >= RESET_DELAY_SECONDS) {
        animation.current.elapsed = 0
        animation.current.phase = 'ready'
        shader.uRadius.value = 0
      }
      return
    }

    if (controls.reduced) {
      shader.uRadius.value = 0.52
      animation.current.elapsed += Math.min(delta, 0.1)
      if (animation.current.elapsed >= RESET_DELAY_SECONDS) {
        animation.current.elapsed = 0
        animation.current.phase = 'ready'
        shader.uRadius.value = 0
      }
      return
    }

    animation.current.elapsed = Math.min(
      animation.current.elapsed + Math.min(delta, 0.1),
      controls.duration,
    )
    const progress = animation.current.elapsed / Math.max(controls.duration, 0.1)
    shader.uRadius.value = THREE.MathUtils.smoothstep(progress, 0, 1) * MAX_RADIUS
    if (progress >= 1) {
      animation.current.elapsed = 0
      animation.current.phase = 'burned'
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={BURN_DISSOLVE_FRAG}
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

export type WritingBurnDissolvePreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingBurnDissolvePreview({
  caption = 'Click the card to set a new burn origin.',
  hint = 'Click or tap the card to set a UV origin and restart the burn. One noisy distance field drives both the hole and its colored border.',
  height = 520,
  className = '',
}: WritingBurnDissolvePreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const originRef = useRef({ ...RESTING_ORIGIN })
  const [borderWidth, setBorderWidth] = useState(0.035)
  const [noiseAmount, setNoiseAmount] = useState(0.135)
  const [softness, setSoftness] = useState(0.006)
  const [duration, setDuration] = useState(1.5)
  const [burnColor, setBurnColor] = useState<BurnColor>('ember')
  const [aspectCorrect, setAspectCorrect] = useState(true)
  const [restartToken, setRestartToken] = useState(0)
  const controls: BurnControls = {
    borderWidth,
    noiseAmount,
    softness,
    duration,
    burnColor,
    aspectCorrect,
    reduced,
    restartToken,
  }
  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the burn/dissolve study.
    </p>
  )

  const restart = useCallback(() => {
    setRestartToken((value) => value + 1)
  }, [])

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const element = canvasWrapRef.current
      if (!element) return
      const bounds = element.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1)
      const canvasAspect = bounds.width / Math.max(bounds.height, 1)
      const photoWidth = Math.min(1, PHOTO_ASPECT / canvasAspect)
      const photoHeight = Math.min(1, canvasAspect / PHOTO_ASPECT)
      const left = (1 - photoWidth) / 2
      const top = (1 - photoHeight) / 2
      const isOnCard =
        x >= left &&
        x <= left + photoWidth &&
        y >= top &&
        y <= top + photoHeight
      if (!isOnCard) return

      originRef.current.x = THREE.MathUtils.clamp(x, 0, 1)
      originRef.current.y = THREE.MathUtils.clamp(1 - y, 0, 1)
      restart()
    },
    [restart],
  )

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Burn/dissolve controls"
        dense
      >
        <RangeRow
          id={`${uid}-border`}
          label="Border width"
          min={0.005}
          max={0.12}
          step={0.005}
          value={borderWidth}
          display={borderWidth.toFixed(3)}
          onChange={setBorderWidth}
        />
        <RangeRow
          id={`${uid}-noise`}
          label="Noise amount"
          min={0}
          max={0.3}
          step={0.005}
          value={noiseAmount}
          display={noiseAmount.toFixed(3)}
          onChange={setNoiseAmount}
        />
        <RangeRow
          id={`${uid}-softness`}
          label="Edge softness"
          min={0}
          max={0.03}
          step={0.001}
          value={softness}
          display={softness.toFixed(3)}
          onChange={setSoftness}
        />
        <RangeRow
          id={`${uid}-duration`}
          label="Duration"
          min={0.5}
          max={4}
          step={0.1}
          value={duration}
          display={`${duration.toFixed(1)}s`}
          onChange={setDuration}
        />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-color`}>Burn color</label>
          <select
            id={`${uid}-color`}
            value={burnColor}
            onChange={(event) => setBurnColor(event.target.value as BurnColor)}
          >
            <option value="ember">Ember</option>
            <option value="cyan">Cyan</option>
            <option value="bone">Bone</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {burnColor.toUpperCase()}
          </span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-aspect`}>Aspect correct</label>
          <input
            id={`${uid}-aspect`}
            type="checkbox"
            checked={aspectCorrect}
            onChange={(event) => setAspectCorrect(event.target.checked)}
          />
          <span className="writing-generative-play-preview__control-value">
            {aspectCorrect ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="writing-generative-play-preview__control-row">
          <span aria-hidden="true">Origin</span>
          <button type="button" onClick={restart}>
            Burn again
          </button>
          <span className="writing-generative-play-preview__control-value">
            {reduced ? 'STILL' : 'PLAY'}
          </span>
        </div>
      </WritingPreviewControls>
      <div
        ref={canvasWrapRef}
        className="writing-generative-play-preview__canvas-wrap"
        style={
          {
            '--preview-h': `${height}px`,
            cursor: 'crosshair',
          } as CSSProperties
        }
        onPointerDown={onPointerDown}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Canvas
            className="writing-generative-play-preview__canvas"
            role="img"
            aria-label="Interactive pixel-art card that burns away from the point you click or tap"
            style={{ background: '#0070FF' }}
            dpr={[1, 2]}
            gl={{
              antialias: false,
              alpha: true,
              premultipliedAlpha: false,
              powerPreference: 'high-performance',
            }}
            camera={{ position: [0, 0, 1] }}
            onCreated={({ gl }) => {
              gl.domElement.style.backgroundColor = '#0070FF'
            }}
          >
            <Suspense fallback={null}>
              <BurnDissolveMesh controls={controls} originRef={originRef} />
            </Suspense>
          </Canvas>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
