import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GrowingTree } from "@/components/scene/GrowingTree";
import {
  easeInOutCubic,
  showRuntime,
  tickShow,
} from "@/lib/show-runtime";

function lerpKeyframes(
  g: number,
  keys: { t: number; pos: [number, number, number]; look: [number, number, number] }[],
  outPos: THREE.Vector3,
  outLook: THREE.Vector3,
) {
  const t = Math.min(1, Math.max(0, g));
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (t - a.t) / (b.t - a.t || 1);
  const s = easeInOutCubic(u);
  outPos.set(
    a.pos[0] + (b.pos[0] - a.pos[0]) * s,
    a.pos[1] + (b.pos[1] - a.pos[1]) * s,
    a.pos[2] + (b.pos[2] - a.pos[2]) * s,
  );
  outLook.set(
    a.look[0] + (b.look[0] - a.look[0]) * s,
    a.look[1] + (b.look[1] - a.look[1]) * s,
    a.look[2] + (b.look[2] - a.look[2]) * s,
  );
}

const CAM_KEYS = [
  { t: 0, pos: [2.35, 0.92, 4.35] as [number, number, number], look: [0, 0.22, 0] as [number, number, number] },
  { t: 0.16, pos: [4.0, 2.1, 6.4] as [number, number, number], look: [0, 1.3, 0] as [number, number, number] },
  { t: 0.36, pos: [7.4, 7.2, 10.4] as [number, number, number], look: [0, 6.8, 0] as [number, number, number] },
  { t: 0.58, pos: [12.2, 11.4, 14.2] as [number, number, number], look: [0, 10.4, 0] as [number, number, number] },
  { t: 0.82, pos: [16.2, 12.6, 16.4] as [number, number, number], look: [0, 10.6, 0] as [number, number, number] },
  { t: 1, pos: [17.8, 12.2, 17.6] as [number, number, number], look: [0, 10.2, 0] as [number, number, number] },
];

function CinematicCamera({
  mouse,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => new THREE.Vector3(0, 0.3, 0), []);
  const orbit = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    tickShow(d);
    const g = showRuntime.growth;
    lerpKeyframes(g, CAM_KEYS, desired, look);

    if (g >= 0.995) {
      const ang = showRuntime.idleTime * 0.045;
      const radius = 17.4;
      orbit.set(
        Math.sin(ang) * radius,
        11.2 + Math.sin(showRuntime.clock * 0.18) * 0.45,
        Math.cos(ang) * radius,
      );
      desired.lerp(orbit, Math.min(1, showRuntime.idleTime * 0.15));
      look.set(0, 9.1, 0);
    }

    desired.x += mouse.current.x * 0.9;
    desired.y += mouse.current.y * 0.4;

    const k = 1 - Math.exp(-2.1 * d);
    camera.position.lerp(desired, k);
    currentLook.lerp(look, k);
    camera.lookAt(currentLook);
  });

  return null;
}

function GradientSky() {
  const geo = useMemo(() => new THREE.SphereGeometry(80, 24, 16), []);
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color("#0b1412") },
        mid: { value: new THREE.Color("#15241e") },
        bot: { value: new THREE.Color("#1c1810") },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 mid;
        uniform vec3 bot;
        varying vec3 vPos;
        void main() {
          float h = normalize(vPos).y;
          vec3 col = mix(bot, mid, smoothstep(-0.35, 0.12, h));
          col = mix(col, top, smoothstep(0.12, 0.85, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  return <mesh geometry={geo} material={mat} />;
}

function Ground({ map }: { map: THREE.Texture | null }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[42, 48]} />
      <meshStandardMaterial
        map={map ?? undefined}
        color={map ? "#6d7a62" : "#1c2418"}
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  );
}

function Grass({ compact }: { compact: boolean }) {
  const count = compact ? 0 : 280;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.ConeGeometry(0.035, 0.42, 3), []);

  useEffect(() => {
    const m = mesh.current;
    if (!m || count === 0) return;
    const r = mulberry(9);
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const rad = 2.4 + r() * 14;
      dummy.position.set(Math.sin(a) * rad, 0.18, Math.cos(a) * rad);
      dummy.rotation.set((r() - 0.5) * 0.3, r() * 6, (r() - 0.5) * 0.25);
      dummy.scale.set(1, 0.6 + r() * 1.3, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, new THREE.Color().setHSL(0.28, 0.35, 0.16 + r() * 0.1));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, dummy]);

  useEffect(() => () => geo.dispose(), [geo]);
  if (count === 0) return null;
  return (
    <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
}

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Fireflies({ compact }: { compact: boolean }) {
  const count = compact ? 18 : 36;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    const r = mulberry(3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (r() - 0.5) * 16;
      a[i * 3 + 1] = 1 + r() * 10;
      a[i * 3 + 2] = (r() - 0.5) * 16;
    }
    return a;
  }, [count]);
  const phases = useMemo(() => {
    const r = mulberry(4);
    return Float32Array.from({ length: count }, () => r() * 6);
  }, [count]);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(220,255,190,1)");
    g.addColorStop(0.35, "rgba(160,220,130,0.45)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);

  useFrame(() => {
    const pts = ref.current;
    if (!pts) return;
    const g = showRuntime.growth;
    const appear = THREE.MathUtils.smoothstep(g, 0.55, 0.78);
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = appear * 0.9;
    pts.visible = appear > 0.02;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const t = showRuntime.clock;
    for (let i = 0; i < count; i++) {
      const p = phases[i];
      pos.setY(i, 1.4 + ((Math.sin(t * 0.6 + p) + 1) / 2) * 9);
      pos.setX(i, positions[i * 3] + Math.sin(t * 0.35 + p) * 0.8);
      pos.setZ(i, positions[i * 3 + 2] + Math.cos(t * 0.28 + p) * 0.8);
    }
    pos.needsUpdate = true;
  });

  useEffect(
    () => () => {
      tex?.dispose();
    },
    [tex],
  );

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex ?? undefined}
        color="#d7f0c4"
        size={0.28}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0}
      />
    </points>
  );
}

function Bird({ seed, radius, y }: { seed: number; radius: number; y: number }) {
  const group = useRef<THREE.Group>(null);
  const l = useRef<THREE.Mesh>(null);
  const r = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const g = showRuntime.growth;
    const vis = g > 0.74;
    if (group.current) group.current.visible = vis;
    if (!vis || !group.current) return;
    const t = showRuntime.clock * (0.22 + seed * 0.05) + seed * 10;
    const x = Math.sin(t) * radius;
    const z = Math.cos(t * 0.72) * radius * 0.62;
    group.current.position.set(x, y + Math.sin(t * 2.1) * 0.35, z);
    group.current.lookAt(Math.sin(t + 0.2) * radius, y, Math.cos((t + 0.2) * 0.72) * radius * 0.62);
    const flap = Math.sin(showRuntime.clock * 11 + seed) * 0.55;
    if (l.current) l.current.rotation.z = flap;
    if (r.current) r.current.rotation.z = -flap;
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#1a1a16" />
      </mesh>
      <mesh ref={l} position={[0.04, 0, 0]}>
        <planeGeometry args={[0.28, 0.08]} />
        <meshBasicMaterial color="#222018" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={r} position={[-0.04, 0, 0]}>
        <planeGeometry args={[0.28, 0.08]} />
        <meshBasicMaterial color="#222018" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function KarmaOrbs() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX = 16;
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const now = showRuntime.clock;
    const list = showRuntime.bursts;
    for (let i = 0; i < MAX; i++) {
      const b = list[list.length - 1 - i];
      if (!b) {
        dummy.scale.setScalar(0);
        dummy.position.set(0, -10, 0);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const age = now - b.born;
      const life = 2.8;
      const u = Math.min(1, Math.max(0, age / life));
      dummy.position.set(b.x, 0.2 + u * 11.5, b.z);
      dummy.scale.setScalar((1 - u) * 0.28 + 0.04);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color="#c5e8b4" transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
}

function FallingLeaves({ compact }: { compact: boolean }) {
  const count = compact ? 8 : 18;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const state = useMemo(() => {
    const r = mulberry(21);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * 12,
      y: 6 + r() * 10,
      z: (r() - 0.5) * 12,
      s: 0.35 + r() * 0.4,
      spin: r() * 4,
      fall: 0.35 + r() * 0.55,
      phase: r() * 6,
    }));
  }, [count]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const vis = showRuntime.growth > 0.7;
    m.visible = vis;
    if (!vis) return;
    const d = Math.min(delta, 0.1);
    for (let i = 0; i < count; i++) {
      const s = state[i];
      s.y -= s.fall * d;
      s.x += Math.sin(showRuntime.clock + s.phase) * 0.25 * d;
      if (s.y < 0.1) s.y = 12 + (i % 5);
      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(s.spin + showRuntime.clock, s.phase, s.spin * 0.4);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[0.28, 0.5]} />
      <meshStandardMaterial color="#2f6b42" side={THREE.DoubleSide} roughness={0.8} />
    </instancedMesh>
  );
}

function Mist() {
  const g1 = useRef<THREE.Mesh>(null);
  const g2 = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = showRuntime.clock;
    const appear = THREE.MathUtils.smoothstep(showRuntime.growth, 0.45, 0.75) * 0.035;
    if (g1.current) {
      g1.current.position.x = Math.sin(t * 0.05) * 2.2;
      g1.current.position.z = Math.cos(t * 0.04) * 1.6;
      const mat = g1.current.material as THREE.MeshBasicMaterial;
      mat.opacity = appear;
    }
    if (g2.current) {
      g2.current.position.x = Math.cos(t * 0.03) * 2.8;
      g2.current.position.z = Math.sin(t * 0.045) * 2.1;
      const mat = g2.current.material as THREE.MeshBasicMaterial;
      mat.opacity = appear * 0.7;
    }
  });
  return (
    <>
      <mesh ref={g1} position={[0, 1.1, 2]} scale={[8, 1.1, 8]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#c5d4c8" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={g2} position={[-2, 1.4, -1]} scale={[7, 0.9, 7]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#d7e0d0" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

function GodRay() {
  return (
    <mesh position={[5, 16, 7]} rotation={[0.55, 0.25, 0.05]}>
      <coneGeometry args={[7.5, 30, 20, 1, true]} />
      <meshBasicMaterial
        color="#e4d5b4"
        transparent
        opacity={0.03}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function ForestWorld({
  compact,
  mouse,
}: {
  compact: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const [bark, setBark] = useState<THREE.Texture | null>(null);
  const [ground, setGround] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loaded: THREE.Texture[] = [];
    loader.load("/textures/bark.jpg", (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 4);
      t.colorSpace = THREE.SRGBColorSpace;
      loaded.push(t);
      setBark(t);
    });
    loader.load("/textures/ground.jpg", (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(6, 6);
      t.colorSpace = THREE.SRGBColorSpace;
      loaded.push(t);
      setGround(t);
    });
    return () => {
      for (const t of loaded) t.dispose();
    };
  }, []);

  return (
    <>
      <CinematicCamera mouse={mouse} />
      <GradientSky />
      <fog attach="fog" args={["#0a100e", 16, 52]} />
      <hemisphereLight args={["#c8d4c0", "#1a1810", 0.7]} />
      <ambientLight intensity={0.18} color="#9aa894" />
      <pointLight position={[0, 1.2, 1.6]} intensity={1.4} color="#ffe6b8" distance={8} />
      <spotLight
        position={[3, 7, 5]}
        angle={0.55}
        penumbra={0.85}
        intensity={2.1}
        color="#fff1d6"
        castShadow={!compact}
      />
      <directionalLight
        position={[18, 24, 10]}
        intensity={1.55}
        color="#fff1d6"
        castShadow={!compact}
        shadow-mapSize-width={compact ? 512 : 1024}
        shadow-mapSize-height={compact ? 512 : 1024}
        shadow-camera-near={2}
        shadow-camera-far={60}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <directionalLight position={[-10, 8, -8]} intensity={0.28} color="#7a9a88" />
      <pointLight position={[0, 12, 0]} intensity={0.35} color="#9fbf80" distance={22} />
      <Ground map={ground} />
      <Grass compact={compact} />
      <GrowingTree bark={bark} compact={compact} />
      <Fireflies compact={compact} />
      <FallingLeaves compact={compact} />
      <KarmaOrbs />
      <Mist />
      <GodRay />
      <Bird seed={0.2} radius={7.5} y={11.2} />
      <Bird seed={0.7} radius={9.1} y={10.4} />
      {!compact && <Bird seed={1.3} radius={6.4} y={12.1} />}
      {!compact && <Bird seed={1.9} radius={8.2} y={9.6} /> }
    </>
  );
}

export function ForestCanvas() {
  const mouse = useRef({ x: 0, y: 0 });
  const compact =
    typeof window !== "undefined" &&
    (window.innerWidth < 700 || /Mobi|Android/i.test(navigator.userAgent));

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        shadows={!compact}
        dpr={compact ? [1, 1.25] : [1, 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 42, near: 0.1, far: 140, position: [2.35, 0.92, 4.35] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.06;
          gl.setClearColor("#070a09");
        }}
      >
        <Suspense fallback={null}>
          <ForestWorld compact={compact} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
