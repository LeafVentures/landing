import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { showRuntime } from "@/lib/show-runtime";

type Branch = {
  sx: number;
  sy: number;
  sz: number;
  ex: number;
  ey: number;
  ez: number;
  r0: number;
  r1: number;
  t0: number;
  t1: number;
  leaf: boolean;
};

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
}

function generateBranches(rand: () => number, compact: boolean): Branch[] {
  const branches: Branch[] = [];
  const push = (
    sx: number,
    sy: number,
    sz: number,
    ex: number,
    ey: number,
    ez: number,
    r0: number,
    r1: number,
    t0: number,
    t1: number,
    leaf: boolean,
  ) => {
    branches.push({ sx, sy, sz, ex, ey, ez, r0, r1, t0, t1, leaf });
  };

  const primaries = compact ? 6 : 7;
  for (let i = 0; i < primaries; i++) {
    const h = 8.6 + (i % 3) * 1.55;
    const yaw = (i / primaries) * Math.PI * 2 + rand() * 0.18;
    const len = 5.8 + rand() * 2.2;
    const lift = 0.25 + rand() * 0.9;
    const ox = Math.sin(yaw) * 0.32;
    const oz = Math.cos(yaw) * 0.32;
    const ex = Math.sin(yaw) * len;
    const ez = Math.cos(yaw) * len;
    const ey = h + lift;
    const t0 = 0.34 + (i / primaries) * 0.05;
    push(ox, h, oz, ex, ey, ez, 0.26, 0.1, t0, t0 + 0.14, false);

    const secs = compact ? 2 : 3;
    for (let j = 0; j < secs; j++) {
      const t = 0.42 + j * 0.22;
      const sx = ox + (ex - ox) * t;
      const sy = h + (ey - h) * t;
      const sz = oz + (ez - oz) * t;
      const yaw2 = yaw + (j - 1) * 0.62 + (rand() - 0.5) * 0.45;
      const len2 = 2.1 + rand() * 1.4;
      const ex2 = sx + Math.sin(yaw2) * len2;
      const ez2 = sz + Math.cos(yaw2) * len2;
      const ey2 = sy + 0.15 + rand() * 0.7;
      const t02 = t0 + 0.1 + j * 0.02;
      push(sx, sy, sz, ex2, ey2, ez2, 0.1, 0.04, t02, t02 + 0.1, true);

      const twigs = compact ? 2 : 3;
      for (let k = 0; k < twigs; k++) {
        const u = 0.5 + k * 0.2;
        const tx = sx + (ex2 - sx) * u;
        const ty = sy + (ey2 - sy) * u;
        const tz = sz + (ez2 - sz) * u;
        const yaw3 = yaw2 + (k - 1) * 0.5 + (rand() - 0.5) * 0.6;
        const len3 = 0.9 + rand() * 0.7;
        push(
          tx,
          ty,
          tz,
          tx + Math.sin(yaw3) * len3,
          ty + 0.05 + rand() * 0.35,
          tz + Math.cos(yaw3) * len3,
          0.04,
          0.014,
          t02 + 0.06,
          t02 + 0.14,
          true,
        );
      }
    }
  }

  return branches;
}

function makeLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.16, 0.06, 0.22, 0.42, 0.015, 1.08);
  shape.bezierCurveTo(-0.22, 0.42, -0.16, 0.06, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 6);
  geo.center();
  geo.rotateX(-Math.PI / 2.4);
  return geo;
}

const LEAF_COLORS = [
  new THREE.Color("#1a3d28"),
  new THREE.Color("#245c38"),
  new THREE.Color("#2f6b42"),
  new THREE.Color("#3d7a4a"),
  new THREE.Color("#1e4a30"),
  new THREE.Color("#4a8a55"),
];

type LeafRest = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
  t0: number;
  phase: number;
};

function VineLine({ geometry }: { geometry: THREE.BufferGeometry }) {
  const obj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: 0x1e3a28,
      transparent: true,
      opacity: 0,
    });
    return new THREE.Line(geometry, mat);
  }, [geometry]);
  useEffect(
    () => () => {
      (obj.material as THREE.Material).dispose();
    },
    [obj],
  );
  return <primitive object={obj} />;
}

export function GrowingTree({
  bark,
  compact,
}: {
  bark: THREE.Texture | null;
  compact: boolean;
}) {
  const rand = useMemo(() => mulberry(2026), []);
  const branches = useMemo(() => generateBranches(rand, compact), [rand, compact]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);

  const branchMesh = useRef<THREE.InstancedMesh>(null);
  const leafMesh = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.Mesh>(null);
  const seedRef = useRef<THREE.Mesh>(null);
  const rootsRef = useRef<THREE.Group>(null);
  const vinesRef = useRef<THREE.Group>(null);
  const cracksRef = useRef<THREE.Group>(null);

  const leafGeo = useMemo(() => makeLeafGeometry(), []);
  const cylGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 6, 1), []);

  const leafRests = useMemo(() => {
    const hosts = branches.filter((b) => b.leaf);
    const per = compact ? 10 : 16;
    const list: LeafRest[] = [];
    const r2 = mulberry(88);
    for (const b of hosts) {
      for (let i = 0; i < per; i++) {
        const u = 0.35 + r2() * 0.65;
        list.push({
          x: b.sx + (b.ex - b.sx) * u + (r2() - 0.5) * 0.55,
          y: b.sy + (b.ey - b.sy) * u + (r2() - 0.5) * 0.25,
          z: b.sz + (b.ez - b.sz) * u + (r2() - 0.5) * 0.55,
          rx: (r2() - 0.5) * 1.2,
          ry: r2() * Math.PI * 2,
          rz: (r2() - 0.5) * 0.8,
          s: 1.15 + r2() * 1.35,
          t0: Math.max(0.36, b.t0 + 0.02),
          phase: r2() * Math.PI * 2,
        });
      }
    }
    const tuft = compact ? 28 : 48;
    for (let i = 0; i < tuft; i++) {
      const a = r2() * Math.PI * 2;
      const rad = r2() * 1.6;
      list.push({
        x: Math.sin(a) * rad,
        y: 7.2 + r2() * 3.4,
        z: Math.cos(a) * rad,
        rx: (r2() - 0.5) * 1.1,
        ry: r2() * Math.PI * 2,
        rz: (r2() - 0.5) * 0.7,
        s: 1.3 + r2() * 1.2,
        t0: 0.28 + r2() * 0.08,
        phase: r2() * Math.PI * 2,
      });
    }
    return list;
  }, [branches, compact]);

  const roots = useMemo(() => {
    const r2 = mulberry(11);
    const n = compact ? 5 : 6;
    return Array.from({ length: n }, (_, i) => {
      const yaw = (i / n) * Math.PI * 2 + r2() * 0.08;
      const reach = 2.6 + r2() * 1.1;
      const height = 3.1 + r2() * 0.8;
      const thickness = 0.14 + r2() * 0.06;
      const shape = new THREE.Shape();
      shape.moveTo(0.08, 0);
      shape.lineTo(reach, 0);
      shape.lineTo(reach * 0.9, 0.12);
      shape.bezierCurveTo(reach * 0.42, height * 0.22, reach * 0.14, height * 0.62, 0.16, height);
      shape.lineTo(0.08, height * 0.85);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 1,
      });
      geo.translate(0, 0, -thickness / 2);
      return { geo, yaw };
    });
  }, [compact]);

  const vines = useMemo(() => {
    const r2 = mulberry(42);
    const n = compact ? 6 : 10;
    return Array.from({ length: n }, (_, i) => {
      const yaw = r2() * Math.PI * 2;
      const rad = 2.2 + r2() * 4.5;
      const top = 9.5 + r2() * 4;
      const len = 2.4 + r2() * 3.2;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        pts.push(
          new THREE.Vector3(
            Math.sin(yaw) * rad + Math.sin(k * 0.9 + i) * 0.18,
            top - u * len,
            Math.cos(yaw) * rad + Math.cos(k * 0.7 + i) * 0.16,
          ),
        );
      }
      return {
        geo: new THREE.BufferGeometry().setFromPoints(pts),
        pts,
        phase: r2() * 6,
      };
    });
  }, [compact]);

  useEffect(() => {
    const mesh = leafMesh.current;
    if (!mesh) return;
    const color = new THREE.Color();
    for (let i = 0; i < leafRests.length; i++) {
      color.copy(LEAF_COLORS[i % LEAF_COLORS.length]);
      color.offsetHSL(0, 0, (i % 5) * 0.015 - 0.04);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [leafRests.length]);

  useEffect(() => {
    return () => {
      leafGeo.dispose();
      cylGeo.dispose();
      for (const r of roots) r.geo.dispose();
      for (const v of vines) v.geo.dispose();
    };
  }, [leafGeo, cylGeo, roots, vines]);

  useFrame(() => {
    const g = showRuntime.growth;
    const t = showRuntime.clock;
    const wind = showRuntime.reduced ? 0 : 1;

    if (trunkRef.current) {
      const tg = smoothstep(0.16, 0.5, g);
      trunkRef.current.scale.set(0.85 + 0.15 * tg, Math.max(0.001, tg), 0.85 + 0.15 * tg);
      trunkRef.current.position.y = 7.7 * tg;
      trunkRef.current.visible = tg > 0.01;
    }

    if (seedRef.current) {
      const sg = 1 - smoothstep(0.08, 0.22, g);
      seedRef.current.scale.setScalar(Math.max(0.001, sg));
      seedRef.current.visible = sg > 0.02;
      seedRef.current.rotation.y = t * 0.4;
    }

    if (rootsRef.current) {
      const rg = smoothstep(0.05, 0.28, g);
      rootsRef.current.scale.set(Math.max(0.001, rg), Math.max(0.001, rg), Math.max(0.001, rg));
      rootsRef.current.visible = rg > 0.02;
    }

    if (cracksRef.current) {
      const cg = 0.55 + smoothstep(0.0, 0.2, g) * 1.4;
      const fade = 1 - smoothstep(0.16, 0.4, g);
      cracksRef.current.visible = fade > 0.02;
      cracksRef.current.scale.setScalar(cg);
      cracksRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = fade * (0.45 - i * 0.1);
      });
    }

    if (vinesRef.current) {
      const vg = smoothstep(0.68, 0.88, g);
      vinesRef.current.visible = vg > 0.05;
      vinesRef.current.children.forEach((line, i) => {
        const mat = (line as THREE.Line).material as THREE.LineBasicMaterial;
        if (mat) mat.opacity = vg * 0.55;
        line.rotation.z = Math.sin(t * 0.7 + vines[i]?.phase) * 0.05 * wind;
      });
    }

    const bMesh = branchMesh.current;
    if (bMesh) {
      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        const prog = smoothstep(b.t0, b.t1, g);
        dir.set(b.ex - b.sx, b.ey - b.sy, b.ez - b.sz);
        const len = dir.length();
        if (len < 0.001 || prog < 0.001) {
          dummy.scale.setScalar(0);
          dummy.position.set(b.sx, b.sy, b.sz);
          dummy.updateMatrix();
          bMesh.setMatrixAt(i, dummy.matrix);
          continue;
        }
        dir.multiplyScalar(1 / len);
        mid.set(b.sx, b.sy, b.sz).addScaledVector(dir, (len * prog) / 2);
        quat.setFromUnitVectors(up, dir);
        const radius = THREE.MathUtils.lerp(b.r0, b.r1, prog) * (0.7 + 0.3 * prog);
        dummy.position.copy(mid);
        dummy.quaternion.copy(quat);
        dummy.scale.set(radius, len * prog, radius);
        dummy.updateMatrix();
        bMesh.setMatrixAt(i, dummy.matrix);
      }
      bMesh.instanceMatrix.needsUpdate = true;
    }

    const lMesh = leafMesh.current;
    if (lMesh) {
      for (let i = 0; i < leafRests.length; i++) {
        const L = leafRests[i];
        const appear = smoothstep(L.t0, L.t0 + 0.1, g);
        if (appear < 0.001) {
          dummy.scale.setScalar(0);
          dummy.position.set(L.x, L.y, L.z);
          dummy.updateMatrix();
          lMesh.setMatrixAt(i, dummy.matrix);
          continue;
        }
        const sway = Math.sin(t * 1.15 + L.phase) * 0.12 * wind;
        dummy.position.set(L.x + sway * 0.15, L.y + Math.sin(t * 0.8 + L.phase) * 0.04 * wind, L.z);
        dummy.rotation.set(L.rx, L.ry + sway, L.rz + sway * 0.4);
        dummy.scale.setScalar(L.s * appear);
        dummy.updateMatrix();
        lMesh.setMatrixAt(i, dummy.matrix);
      }
      lMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={seedRef} position={[0, 0.16, 0]} castShadow>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial
          color="#6b4a2a"
          emissive="#7d9a72"
          emissiveIntensity={0.55}
          roughness={0.7}
        />
      </mesh>

      <group ref={cracksRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        {[0.55, 1.05, 1.65].map((r) => (
          <mesh key={r}>
            <ringGeometry args={[r, r + 0.045, 48]} />
            <meshBasicMaterial color="#9fb896" transparent opacity={0.25} depthWrite={false} />
          </mesh>
        ))}
      </group>

      <mesh ref={trunkRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 1.15, 15.4, 14]} />
        <meshStandardMaterial
          map={bark ?? undefined}
          color={bark ? "#d2c0a4" : "#4a3728"}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      <group ref={rootsRef}>
        {roots.map((r, i) => (
          <mesh key={i} geometry={r.geo} rotation={[0, r.yaw, 0]} castShadow>
            <meshStandardMaterial
              map={bark ?? undefined}
              color={bark ? "#c4b08e" : "#3d2c20"}
              roughness={0.95}
            />
          </mesh>
        ))}
      </group>

      <instancedMesh
        ref={branchMesh}
        args={[cylGeo, undefined, branches.length]}
        castShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          map={bark ?? undefined}
          color={bark ? "#cbb89a" : "#4a3728"}
          roughness={0.9}
        />
      </instancedMesh>

      <instancedMesh
        ref={leafMesh}
        args={[leafGeo, undefined, leafRests.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          roughness={0.78}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <group ref={vinesRef}>
        {vines.map((v, i) => (
          <VineLine key={i} geometry={v.geo} />
        ))}
      </group>
    </group>
  );
}
