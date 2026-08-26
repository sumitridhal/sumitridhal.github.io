import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPlayWebglBoundary } from '@/components/writings/writingPlayWebglBoundary'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const CAMERA_POSITION: [number, number, number] = [0, 0.08, 3.7]
const CAMERA_TARGET: [number, number, number] = [0, 0, 0]

const GEM_VERT = /* glsl */ `
attribute vec4 tangent;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vViewNormal;
varying vec3 vViewTangent;
varying vec3 vViewBinormal;

void main() {
  vUv = uv;

  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vec3 normalVS = normalize(normalMatrix * normal);
  vec3 tangentVS = normalize(normalMatrix * tangent.xyz);
  tangentVS = normalize(tangentVS - normalVS * dot(normalVS, tangentVS));

  vViewPosition = viewPosition.xyz;
  vViewNormal = normalVS;
  vViewTangent = tangentVS;
  vViewBinormal = normalize(cross(normalVS, tangentVS) * tangent.w);

  gl_Position = projectionMatrix * viewPosition;
}
`

const GEM_FRAG = /* glsl */ `
uniform float uOffset;
uniform float uPinAmount;
uniform float uRimStrength;
uniform vec3 uBaseColor;
uniform vec3 uMidColor;
uniform vec3 uHighColor;
uniform float uAsWrittenUv;
uniform float uAsWrittenPin;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vViewNormal;
varying vec3 vViewTangent;
varying vec3 vViewBinormal;

const float PI = 3.14159265359;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 kaleidoscope(vec2 p, float folds) {
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float wedge = 2.0 * PI / folds;
  angle = mod(angle + wedge * 0.5, wedge) - wedge * 0.5;
  angle = abs(angle);
  return vec2(cos(angle), sin(angle)) * radius;
}

vec3 gemPattern(vec2 uv) {
  vec2 cell = fract(uv) - 0.5;
  vec2 p = kaleidoscope(cell, 10.0);
  float radius = length(cell);
  float angle = atan(cell.y, cell.x);

  float shardA = sin(p.x * 46.0 - p.y * 17.0);
  float shardB = sin(p.x * 29.0 + p.y * 53.0);
  float rings = sin(radius * 84.0 - angle * 6.0);
  float cells = hash21(floor((p + 0.55) * 15.0));

  vec3 pattern = vec3(
    shardA * 0.5 + 0.5,
    shardB * 0.5 + 0.5,
    rings * 0.5 + 0.5
  );
  pattern = mix(pattern, pattern.yzx, step(0.54, cells) * 0.72);

  float seam = smoothstep(0.018, 0.0, abs(shardA - shardB) * 0.07);
  pattern += seam * vec3(0.44, 0.72, 1.0);
  return clamp(pattern, 0.0, 1.0);
}

vec3 pinLightAsWritten(vec3 base, vec3 blend) {
  vec3 check = step(0.5, blend);
  vec3 highBranch = check * max(2.0 * (base - 0.5), blend);
  vec3 lowBranch = (1.0 - check) * min(2.0 * base, blend);
  return highBranch + lowBranch;
}

vec3 pinLightCanonical(vec3 base, vec3 blend) {
  vec3 check = step(0.5, blend);
  vec3 highBranch = check * max(base, 2.0 * (blend - 0.5));
  vec3 lowBranch = (1.0 - check) * min(base, 2.0 * blend);
  return highBranch + lowBranch;
}

void main() {
  vec3 normalVS = normalize(vViewNormal);
  vec3 viewVS = normalize(-vViewPosition);

  vec3 viewTS = normalize(vec3(
    dot(-normalize(vViewTangent), viewVS),
    dot(normalize(vViewBinormal), viewVS),
    dot(normalVS, viewVS)
  ));

  vec2 uvTangentOffset = viewTS.xy * uOffset;
  vec2 uvPinOffset = viewTS.xy * uOffset * 0.5;

  float t = gemPattern(vUv + uvTangentOffset).r;
  vec2 correctedUv = vUv - uvTangentOffset;
  vec2 asWrittenUv = vec2(t) - uvTangentOffset;
  vec2 distortedUv = mix(correctedUv, asWrittenUv, uAsWrittenUv);
  vec3 albedo = gemPattern(distortedUv);

  float tAB = clamp(t, 0.0, 0.5) * 2.0;
  float tBC = (clamp(t, 0.5, 1.0) - 0.5) * 2.0;
  vec3 colorAB = mix(uBaseColor, uMidColor, tAB);
  vec3 colorBC = mix(colorAB, uHighColor, tBC);
  albedo *= colorBC;

  vec3 pinPattern = gemPattern(vUv + uvPinOffset);
  vec3 pinColor = 1.0 - abs(fract(pinPattern + viewTS) * 2.0 - 1.0);
  pinColor *= uPinAmount;

  vec3 writtenBlend = pinLightAsWritten(albedo, pinColor);
  vec3 canonicalBlend = pinLightCanonical(albedo, pinColor);
  vec3 surface = mix(canonicalBlend, writtenBlend, uAsWrittenPin);

  vec3 lightVS = normalize(vec3(-0.45, 0.7, 0.65));
  float ndotl = max(dot(normalVS, lightVS), 0.0);
  float toon = 0.28 + 0.72 * smoothstep(0.24, 0.31, ndotl);

  vec3 halfVector = normalize(lightVS + viewVS);
  float specular = pow(max(dot(normalVS, halfVector), 0.0), 32.0);
  float fresnel = pow(1.0 - max(dot(normalVS, viewVS), 0.0), 3.0);
  vec3 rim = vec3(1.0) * min(fresnel * uRimStrength, 1.4);

  vec3 color = surface * toon + specular * 0.58 + rim;
  gl_FragColor = vec4(color, 1.0);
}
`

function buildGemGeometry(): THREE.BufferGeometry {
  const source = new THREE.IcosahedronGeometry(1, 2)
  const indexed = mergeVertices(source)
  source.dispose()
  indexed.computeTangents()
  const faceted = indexed.toNonIndexed()
  faceted.computeVertexNormals()
  indexed.dispose()
  return faceted
}

type GemControls = {
  offset: number
  pinAmount: number
  rimStrength: number
  baseColor: string
  midColor: string
  highColor: string
  asWrittenUv: boolean
  asWrittenPin: boolean
  autoOrbit: boolean
  reduced: boolean
}

function Gem({ controls }: { controls: GemControls }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildGemGeometry(), [])
  const uniforms = useMemo(
    () => ({
      uOffset: { value: controls.offset },
      uPinAmount: { value: controls.pinAmount },
      uRimStrength: { value: controls.rimStrength },
      uBaseColor: { value: new THREE.Color(controls.baseColor) },
      uMidColor: { value: new THREE.Color(controls.midColor) },
      uHighColor: { value: new THREE.Color(controls.highColor) },
      uAsWrittenUv: { value: controls.asWrittenUv ? 1 : 0 },
      uAsWrittenPin: { value: controls.asWrittenPin ? 1 : 0 },
    }),
    // Uniform identity stays stable; values are updated in the frame loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    const shader = material.current?.uniforms
    if (!shader) return

    shader.uOffset.value = controls.offset
    shader.uPinAmount.value = controls.pinAmount
    shader.uRimStrength.value = controls.rimStrength
    shader.uBaseColor.value.set(controls.baseColor)
    shader.uMidColor.value.set(controls.midColor)
    shader.uHighColor.value.set(controls.highColor)
    shader.uAsWrittenUv.value = controls.asWrittenUv ? 1 : 0
    shader.uAsWrittenPin.value = controls.asWrittenPin ? 1 : 0

    if (mesh.current && controls.autoOrbit && !controls.reduced) {
      mesh.current.rotation.y += Math.min(delta, 0.1) * 0.18
      mesh.current.rotation.x = Math.sin(mesh.current.rotation.y * 0.7) * 0.08
    }
  })

  return (
    <mesh ref={mesh} geometry={geometry} rotation={[0.06, -0.35, -0.08]}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={GEM_VERT}
        fragmentShader={GEM_FRAG}
      />
    </mesh>
  )
}

function GemScene({ controls }: { controls: GemControls }) {
  return (
    <>
      <color attach="background" args={['#061017']} />
      <Gem controls={controls} />
      <OrbitControls
        makeDefault
        target={CAMERA_TARGET}
        enablePan={false}
        minDistance={2.6}
        maxDistance={5.2}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI - 0.35}
        dampingFactor={0.08}
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
  display,
  onChange,
}: {
  id: string
  label: string
  min: number
  max: number
  step: number
  value: number
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

function ToggleRow({
  id,
  label,
  checked,
  onChange,
  onLabel,
  offLabel,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel: string
  offLabel: string
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="writing-generative-play-preview__control-value">
        {checked ? onLabel : offLabel}
      </span>
    </div>
  )
}

function ColorRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="color"
        value={value}
        aria-label={`${label} colour`}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="writing-generative-play-preview__control-value">{value.toUpperCase()}</span>
    </div>
  )
}

export type WritingGemSurfacePreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingGemSurfacePreview({
  caption = 'Drag to orbit the gem, then compare the shader as written with the corrected operators.',
  hint = 'The offset follows the tangent-space view direction. The two switches expose a scalar-to-vec2 dependent read and the non-commutative layer order inside Pin Light.',
  height = 560,
  className = '',
}: WritingGemSurfacePreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [offset, setOffset] = useState(0.23)
  const [pinAmount, setPinAmount] = useState(0.58)
  const [rimStrength, setRimStrength] = useState(3)
  const [baseColor, setBaseColor] = useState('#1b1727')
  const [midColor, setMidColor] = useState('#26ff39')
  const [highColor, setHighColor] = useState('#ffe927')
  const [asWrittenUv, setAsWrittenUv] = useState(true)
  const [asWrittenPin, setAsWrittenPin] = useState(true)
  const [autoOrbit, setAutoOrbit] = useState(true)

  const controls: GemControls = {
    offset,
    pinAmount,
    rimStrength,
    baseColor,
    midColor,
    highColor,
    asWrittenUv,
    asWrittenPin,
    autoOrbit,
    reduced,
  }

  const fallback = (
    <p className="writing-generative-play-preview__fallback">
      WebGL could not initialize the gem surface study.
    </p>
  )

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="Gem surface shader controls"
        dense
      >
        <RangeRow
          id={`${uid}-offset`}
          label="Offset"
          min={0}
          max={0.5}
          step={0.01}
          value={offset}
          display={offset.toFixed(2)}
          onChange={setOffset}
        />
        <RangeRow
          id={`${uid}-pin`}
          label="Pin amount"
          min={0}
          max={1}
          step={0.01}
          value={pinAmount}
          display={pinAmount.toFixed(2)}
          onChange={setPinAmount}
        />
        <RangeRow
          id={`${uid}-rim`}
          label="Rim strength"
          min={0}
          max={50}
          step={1}
          value={rimStrength}
          display={rimStrength.toFixed(0)}
          onChange={setRimStrength}
        />
        <ColorRow
          id={`${uid}-base`}
          label="Base"
          value={baseColor}
          onChange={setBaseColor}
        />
        <ColorRow id={`${uid}-mid`} label="Mid" value={midColor} onChange={setMidColor} />
        <ColorRow
          id={`${uid}-high`}
          label="High"
          value={highColor}
          onChange={setHighColor}
        />
        <ToggleRow
          id={`${uid}-second-uv`}
          label="Second UV"
          checked={asWrittenUv}
          onChange={setAsWrittenUv}
          onLabel="vec2(t)"
          offLabel="UV"
        />
        <ToggleRow
          id={`${uid}-pin-order`}
          label="Pin Light"
          checked={asWrittenPin}
          onChange={setAsWrittenPin}
          onLabel="AS WRITTEN"
          offLabel="CANONICAL"
        />
        <ToggleRow
          id={`${uid}-orbit`}
          label="Auto orbit"
          checked={autoOrbit}
          onChange={setAutoOrbit}
          onLabel={reduced ? 'REDUCED' : 'ON'}
          offLabel="OFF"
        />
      </WritingPreviewControls>

      <div
        className="writing-generative-play-preview__canvas-wrap"
        style={{ '--preview-h': `${height}px` } as CSSProperties}
      >
        <WritingPlayWebglBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <Canvas
              className="writing-generative-play-preview__canvas"
              role="img"
              aria-label="Interactive faceted gem with a view-dependent kaleidoscopic surface"
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              camera={{ position: CAMERA_POSITION, fov: 38, near: 0.05, far: 30 }}
            >
              <GemScene controls={controls} />
            </Canvas>
          </Suspense>
        </WritingPlayWebglBoundary>
      </div>
    </figure>
  )
}
