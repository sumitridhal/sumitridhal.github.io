import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useId, useMemo, useRef, useState, type ElementRef } from 'react'
import * as THREE from 'three'

import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const KALEI_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const KALEI_FRAG = /* glsl */ `
uniform float uFolds;
uniform float uSpin;
uniform float uScale;
uniform float uTime;
uniform float uPattern;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.2 * uScale;
  float a = atan(uv.y, uv.x) + uSpin + uTime * 0.12;
  float r = length(uv);
  float n = max(3.0, floor(uFolds + 0.5));
  float wedge = 6.2831853 / n;
  a = mod(a + wedge * 0.5, wedge) - wedge * 0.5;
  if (a < 0.0) a = -a;
  vec2 q = vec2(cos(a), sin(a)) * r;
  float m = sin(uPattern * length(q) + 5.0 * fbm(q * 2.8 + uTime * 0.08));
  vec3 ca = vec3(0.12, 0.06, 0.18);
  vec3 cb = vec3(0.92, 0.72, 0.22);
  vec3 cc = vec3(0.25, 0.55, 0.82);
  float t = 0.5 + 0.5 * m;
  vec3 col = mix(ca, mix(cb, cc, fbm(q * 1.7)), t);
  gl_FragColor = vec4(col, 1.0);
}
`

function KaleidoMesh({
  folds,
  spin,
  scale,
  pattern,
  animate,
}: {
  folds: number
  spin: number
  scale: number
  pattern: number
  animate: boolean
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const clock = useThree((s) => s.clock)

  const uniforms = useMemo(
    () => ({
      uFolds: { value: folds },
      uSpin: { value: spin },
      uScale: { value: scale },
      uPattern: { value: pattern },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Three uniform map identity is stable
    [],
  )

  useFrame(() => {
    const m = mat.current
    if (!m) return
    m.uniforms.uFolds.value = folds
    m.uniforms.uSpin.value = spin
    m.uniforms.uScale.value = scale
    m.uniforms.uPattern.value = pattern
    m.uniforms.uTime.value = animate ? clock.getElapsedTime() : 0
  })

  return (
    <mesh>
      <planeGeometry args={[2.4, 2.4, 1, 1]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={KALEI_VERT} fragmentShader={KALEI_FRAG} />
    </mesh>
  )
}

function KaleidoScene({
  folds,
  spin,
  scale,
  pattern,
  animate,
}: {
  folds: number
  spin: number
  scale: number
  pattern: number
  animate: boolean
}) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 1.65)
    const c = controlsRef.current
    if (c?.target) {
      c.target.set(0, 0, 0)
      c.update?.()
    }
  }, [camera])

  return (
    <>
      <color attach="background" args={['#050608']} />
      <KaleidoMesh folds={folds} spin={spin} scale={scale} pattern={pattern} animate={animate} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableZoom
        enableRotate
        minDistance={0.85}
        maxDistance={4}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI - 0.35}
        dampingFactor={0.07}
        enableDamping
      />
    </>
  )
}

function RangeRow({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  decimals = 2,
}: {
  id: string
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  decimals?: number
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
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="writing-generative-play-preview__control-value">{value.toFixed(decimals)}</span>
    </div>
  )
}

export type WritingKaleidoscopeR3fPreviewProps = {
  caption?: string
  height?: number
  className?: string
}

export function WritingKaleidoscopeR3fPreview({
  caption = 'Orbit the plane: polar fold in the fragment shader, sliders for folds, spin, scale, and pattern density.',
  height = 300,
  className = '',
}: WritingKaleidoscopeR3fPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [folds, setFolds] = useState(7)
  const [spin, setSpin] = useState(0.4)
  const [scale, setScale] = useState(1.15)
  const [pattern, setPattern] = useState(9)
  const [webglFailed, setWebglFailed] = useState(false)

  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not be initialized in this browser (Three.js / react-three-fiber).
    </p>
  )

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-generative-play-preview__caption">{caption}</figcaption> : null}
      <div className="writing-generative-play-preview__hud">
        <RangeRow
          id={`${uid}-folds`}
          label="Folds N"
          min={3}
          max={14}
          step={1}
          value={folds}
          onChange={setFolds}
          decimals={0}
        />
        <RangeRow id={`${uid}-spin`} label="Spin (rad)" min={0} max={6.28} step={0.05} value={spin} onChange={setSpin} />
        <RangeRow id={`${uid}-scale`} label="Scale" min={0.55} max={2.2} step={0.02} value={scale} onChange={setScale} />
        <RangeRow
          id={`${uid}-pattern`}
          label="Pattern"
          min={4}
          max={22}
          step={0.5}
          value={pattern}
          onChange={setPattern}
        />
      </div>
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        {webglFailed ? fallback : null}
        {!webglFailed ? (
          <WritingPlayWebglBoundary fallback={fallback}>
            <Suspense fallback={null}>
              <Canvas
                className="writing-generative-play-preview__canvas"
                aria-label="Kaleidoscope fragment demo with orbit controls and parameter sliders"
                role="img"
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                frameloop="always"
                camera={{ fov: 42, near: 0.05, far: 20 }}
                onCreated={() => {
                  queueMicrotask(() => setWebglFailed(false))
                }}
              >
                <KaleidoScene
                  folds={folds}
                  spin={spin}
                  scale={scale}
                  pattern={pattern}
                  animate={!reduced}
                />
              </Canvas>
            </Suspense>
          </WritingPlayWebglBoundary>
        ) : null}
      </div>
    </figure>
  )
}
