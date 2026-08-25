/* eslint-disable react-hooks/immutability -- Three.js uniforms and render targets are mutated inside useFrame. */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const BACKDROP_LAYERS = 1 << 0
const ALL_LAYERS = (1 << 0) | (1 << 1)
const LENS_RADIUS = 0.82
const TEXTURE_ASPECT = 1024 / 640

const BACKDROP_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

const BACKDROP_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uResolution;
uniform float uTextureAspect;
uniform float uDark;

varying vec2 vUv;

void main() {
  vec2 uv = vUv - 0.5;
  float viewportAspect = uResolution.x / max(uResolution.y, 1.0);
  if (viewportAspect > uTextureAspect) {
    uv.y *= uTextureAspect / viewportAspect;
  } else {
    uv.x *= viewportAspect / uTextureAspect;
  }
  vec3 ink = texture2D(uMap, uv + 0.5).rgb;
  vec3 color = mix(1.0 - ink, ink, uDark);
  gl_FragColor = vec4(color, 1.0);
}
`

const GLASS_VERT = /* glsl */ `
varying vec3 vNormalView;
varying vec3 vViewPosition;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

const GLASS_FRAG = /* glsl */ `
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uIor;
uniform float uDispersion;
uniform float uTintAmount;
uniform float uThickness;
uniform float uDark;
uniform vec2 uLight;

varying vec3 vNormalView;
varying vec3 vViewPosition;

vec3 hardLight(vec3 base, vec3 blend) {
  vec3 low = 2.0 * base * blend;
  vec3 high = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
  return mix(low, high, step(vec3(0.5), blend));
}

vec3 spectrumWeight(float t) {
  return vec3(
    clamp(1.5 - abs(4.0 * t - 3.0), 0.0, 1.0),
    clamp(1.5 - abs(4.0 * t - 2.0), 0.0, 1.0),
    clamp(1.5 - abs(4.0 * t - 1.0), 0.0, 1.0)
  );
}

void main() {
  vec2 screenUv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
  vec3 normal = normalize(vNormalView);
  vec3 viewDir = normalize(vViewPosition);
  vec3 incident = -viewDir;
  vec3 sum = vec3(0.0);
  vec3 weightSum = vec3(0.0);
  const int SAMPLES = 12;

  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1);
    float sampleIor = max(1.001, mix(uIor - uDispersion, uIor + uDispersion, t));
    vec3 ray = refract(incident, normal, 1.0 / sampleIor);
    vec3 weight = spectrumWeight(t);
    vec2 sampleUv = screenUv + ray.xy * (0.14 * uThickness);
    sum += texture2D(uScene, clamp(sampleUv, 0.001, 0.999)).rgb * weight;
    weightSum += weight;
  }
  vec3 refracted = sum / max(weightSum, vec3(0.0001));

  vec3 tint = vec3(0.34, 0.78, 0.96);
  vec3 transmittance = pow(tint, vec3(max(uThickness, 0.01)));
  vec3 beerColor = mix(refracted, refracted * transmittance, uTintAmount);
  vec3 hardColor = mix(refracted, hardLight(clamp(refracted, 0.0, 1.0), tint), uTintAmount);
  vec3 color = mix(beerColor, hardColor, uDark);

  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.15);
  vec3 lightDir = normalize(vec3(uLight, 2.2));
  float rim = pow(max(dot(normal, lightDir), 0.0), 20.0);
  color += vec3(1.0) * fresnel * 0.78;
  color += vec3(1.0, 0.78, 0.42) * rim * 0.7;

  gl_FragColor = vec4(color, 1.0);
}
`

type GlassControls = {
  ior: number
  dispersion: number
  tint: number
  thickness: number
  dark: boolean
}

function makeTextTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create the glass text texture')

  context.fillStyle = '#050608'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.textBaseline = 'middle'
  const rows = [
    { text: 'Forget Everything and Remember', y: 62, alpha: 0.28, size: 38, offset: -90 },
    { text: 'Remember Everything and Forget', y: 134, alpha: 0.92, size: 44, offset: -20 },
    { text: 'Forget Everything and Remember', y: 210, alpha: 0.34, size: 42, offset: -120 },
    { text: 'Remember Everything and Forget', y: 294, alpha: 0.88, size: 48, offset: -62 },
    { text: 'Forget Everything and Remember', y: 382, alpha: 0.3, size: 41, offset: -105 },
    { text: 'Remember Everything and Forget', y: 472, alpha: 0.94, size: 46, offset: -35 },
    { text: 'Forget Everything and Remember', y: 560, alpha: 0.26, size: 40, offset: -82 },
  ]

  rows.forEach((row) => {
    context.font = `500 ${row.size}px Georgia, "Times New Roman", serif`
    context.fillStyle = `rgba(248, 246, 240, ${row.alpha})`
    const width = context.measureText(`${row.text}  `).width
    for (let x = row.offset; x < canvas.width + width; x += width) {
      context.fillText(`${row.text}  `, x, row.y)
    }
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function TextBackdrop({ dark }: { dark: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const texture = useMemo(() => makeTextTexture(), [])
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTextureAspect: { value: TEXTURE_ASPECT },
      uDark: { value: dark ? 1 : 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Three uniform map identity is stable.
    [],
  )

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    if (!material.current) return
    gl.getDrawingBufferSize(resolution)
    material.current.uniforms.uResolution.value.copy(resolution)
    material.current.uniforms.uDark.value = dark ? 1 : 0
  })

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={BACKDROP_VERT}
        fragmentShader={BACKDROP_FRAG}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function GlassObject({ controls, reduced }: { controls: GlassControls; reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const { camera, gl, pointer, scene, size } = useThree()
  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: true,
      }),
    [],
  )
  const resolution = useMemo(() => new THREE.Vector2(1, 1), [])
  const defaultAngle = Math.atan2(0.9, 0.45)
  const targetAngle = useRef(defaultAngle)
  const currentAngle = useRef(defaultAngle)
  const previousPosition = useRef(new THREE.Vector2())
  const targetPosition = useMemo(() => new THREE.Vector2(), [])
  const velocity = useMemo(() => new THREE.Vector2(), [])
  const radius = 1.4

  const uniforms = useMemo(
    () => ({
      uScene: { value: target.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIor: { value: controls.ior },
      uDispersion: { value: controls.dispersion },
      uTintAmount: { value: controls.tint },
      uThickness: { value: controls.thickness },
      uDark: { value: controls.dark ? 1 : 0 },
      uLight: { value: new THREE.Vector2(0.6, 1.2) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Three uniform map identity is stable.
    [],
  )

  useEffect(() => {
    const previousMask = camera.layers.mask
    camera.layers.enable(1)
    mesh.current?.layers.set(1)
    return () => {
      camera.layers.mask = previousMask
      target.dispose()
    }
  }, [camera, target])

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    target.setSize(Math.max(1, Math.floor(size.width * dpr)), Math.max(1, Math.floor(size.height * dpr)))
  }, [gl, size.height, size.width, target])

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return
    const mat = material.current
    // Set this before the first framebuffer render as well as in the effect:
    // useEffect can run after R3F has already produced its first frame.
    mesh.current.layers.set(1)

    if (camera instanceof THREE.PerspectiveCamera) {
      const halfHeight =
        Math.tan((camera.fov * THREE.MathUtils.DEG2RAD) / 2) *
        Math.abs(camera.position.z - mesh.current.position.z)
      const halfWidth = halfHeight * (size.width / Math.max(size.height, 1))
      targetPosition.set(
        pointer.x * Math.max(0, halfWidth - LENS_RADIUS),
        pointer.y * Math.max(0, halfHeight - LENS_RADIUS),
      )
    }

    previousPosition.current.set(mesh.current.position.x, mesh.current.position.y)
    if (reduced) {
      mesh.current.position.x = targetPosition.x
      mesh.current.position.y = targetPosition.y
    } else {
      mesh.current.position.x = THREE.MathUtils.damp(
        mesh.current.position.x,
        targetPosition.x,
        8,
        Math.min(delta, 0.1),
      )
      mesh.current.position.y = THREE.MathUtils.damp(
        mesh.current.position.y,
        targetPosition.y,
        8,
        Math.min(delta, 0.1),
      )
    }

    velocity.set(
      mesh.current.position.x - previousPosition.current.x,
      mesh.current.position.y - previousPosition.current.y,
    )
    if (velocity.lengthSq() > 0.000001) {
      targetAngle.current = Math.atan2(velocity.y, velocity.x)
    }
    const shortest = Math.atan2(
      Math.sin(targetAngle.current - currentAngle.current),
      Math.cos(targetAngle.current - currentAngle.current),
    )
    currentAngle.current = reduced
      ? targetAngle.current
      : currentAngle.current + shortest * (1 - Math.exp(-6 * Math.min(delta, 0.1)))

    mat.uniforms.uIor.value = controls.ior
    mat.uniforms.uDispersion.value = controls.dispersion
    mat.uniforms.uTintAmount.value = controls.tint
    mat.uniforms.uThickness.value = controls.thickness
    mat.uniforms.uDark.value = controls.dark ? 1 : 0
    mat.uniforms.uLight.value.set(
      radius * Math.cos(currentAngle.current),
      radius * Math.sin(currentAngle.current),
    )
    gl.getDrawingBufferSize(resolution)
    mat.uniforms.uResolution.value.copy(resolution)

    const oldTarget = gl.getRenderTarget()
    camera.layers.mask = BACKDROP_LAYERS
    gl.setRenderTarget(target)
    gl.clear()
    gl.render(scene, camera)
    gl.setRenderTarget(oldTarget)
    camera.layers.mask = ALL_LAYERS
    gl.render(scene, camera)
  }, 1)

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[LENS_RADIUS, 96, 64]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={GLASS_VERT}
        fragmentShader={GLASS_FRAG}
      />
    </mesh>
  )
}

function GlassScene({ controls, reduced }: { controls: GlassControls; reduced: boolean }) {
  return (
    <>
      <color attach="background" args={[controls.dark ? '#06070a' : '#e9eef4']} />
      <TextBackdrop dark={controls.dark} />
      <GlassObject controls={controls} reduced={reduced} />
    </>
  )
}

function RangeRow({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="writing-generative-play-preview__control-value">{value.toFixed(2)}</span>
    </div>
  )
}

export type WritingGlassRefractionPreviewProps = {
  caption?: string
  height?: number
  className?: string
}

export function WritingGlassRefractionPreview({
  caption = 'Drag the lens across the type.',
  height = 330,
  className = '',
}: WritingGlassRefractionPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [ior, setIor] = useState(1.42)
  const [dispersion, setDispersion] = useState(0.09)
  const [tint, setTint] = useState(0.08)
  const [thickness, setThickness] = useState(0.85)
  const [dark, setDark] = useState(true)
  const controls = { ior, dispersion, tint, thickness, dark }
  const fallback = <p className="writing-generative-play-preview__fallback">WebGL could not initialize the two-pass glass preview.</p>

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls caption={caption} label="Glass refraction controls">
        <RangeRow id={`${uid}-ior`} label="IOR" min={1} max={1.8} step={0.01} value={ior} onChange={setIor} />
        <RangeRow id={`${uid}-dispersion`} label="Dispersion" min={0} max={0.22} step={0.005} value={dispersion} onChange={setDispersion} />
        <RangeRow id={`${uid}-tint`} label="Tint" min={0} max={1} step={0.02} value={tint} onChange={setTint} />
        <RangeRow id={`${uid}-thickness`} label="Thickness" min={0.1} max={2} step={0.05} value={thickness} onChange={setThickness} />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-theme`}>Dark-mode blend</label>
          <input id={`${uid}-theme`} type="checkbox" checked={dark} onChange={(event) => setDark(event.target.checked)} />
          <span className="writing-generative-play-preview__control-value">{dark ? 'Hard' : 'Beer'}</span>
        </div>
      </WritingPreviewControls>
      <div className="writing-generative-play-preview__canvas-wrap" style={{ height: `${height}px` }}>
        <WritingPlayWebglBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <Canvas
              className="writing-generative-play-preview__canvas"
              role="img"
              aria-label="Interactive two-pass glass refraction and chromatic dispersion demo"
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              camera={{ position: [0, 0, 3.5], fov: 42, near: 0.1, far: 20 }}
            >
              <GlassScene controls={controls} reduced={reduced} />
            </Canvas>
          </Suspense>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
