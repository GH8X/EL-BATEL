import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Particles, roundedRectShape, usePointer, useSceneEnv } from "./kit";

/**
 * The sealed drop package: the piece as it leaves the studio — black box,
 * brushed metal strap, one red laser seam. It leans toward the cursor, and
 * when a numbered run is selected in the list below it tightens and glows.
 */

function useBoxGeometry() {
  return useMemo(() => {
    const shape = roundedRectShape({ width: 1.34, height: 1.34, radius: 0.14 });
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.48,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geometry.center();
    return geometry;
  }, []);
}

function Package({ emphasis, reduced }: { emphasis: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const seam = useRef<THREE.Mesh>(null);
  const orbitWhite = useRef<THREE.Mesh>(null);
  const orbitRed = useRef<THREE.Mesh>(null);
  const geometry = useBoxGeometry();
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 24), [geometry]);
  const pointer = usePointer();

  useFrame((state, delta) => {
    if (!group.current) return;
    const ease = pointer(delta, reduced ? 3 : 2.6);
    const t = state.clock.elapsedTime;
    const boost = emphasis ? 1 : 0;

    group.current.rotation.y = Math.sin(t * 0.2) * 0.26 + ease.x * (0.46 + boost * 0.24);
    group.current.rotation.x = -ease.y * (0.2 + boost * 0.1) + Math.sin(t * 0.17) * 0.05;
    group.current.rotation.z = Math.sin(t * 0.13) * 0.04 + boost * 0.06;
    group.current.position.y = Math.sin(t * 0.46) * 0.07;
    const scale = 1 + boost * 0.035;
    group.current.scale.setScalar(group.current.scale.x + (scale - group.current.scale.x) * Math.min(1, delta * 3));

    if (seam.current) {
      const material = seam.current.material as THREE.MeshStandardMaterial;
      const target = emphasis ? 3.8 : 1.5;
      material.emissiveIntensity += (target - material.emissiveIntensity) * Math.min(1, delta * 4);
    }
    if (orbitWhite.current) {
      orbitWhite.current.rotation.z += delta * (0.24 + boost * 0.4);
      orbitWhite.current.rotation.x += delta * 0.06;
    }
    if (orbitRed.current) {
      orbitRed.current.rotation.z -= delta * (0.34 + boost * 0.5);
    }
  });

  return (
    <group ref={group}>
      {/* the piece, boxed */}
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.35} roughness={0.68} />
      </mesh>

      {/* technical edge read */}
      <lineSegments geometry={edges} position={[0, 0, 0]}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.16} />
      </lineSegments>

      {/* brushed metal strap that seals the box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.42, 0.22, 0.58]} />
        <meshStandardMaterial color="#cfcfcf" metalness={0.95} roughness={0.28} />
      </mesh>

      {/* red laser seam — the only colour */}
      <mesh ref={seam} position={[0, 0, 0.3]}>
        <boxGeometry args={[1.44, 0.014, 0.02]} />
        <meshStandardMaterial
          color="#E10600"
          emissive="#E10600"
          emissiveIntensity={1.5}
          metalness={0.4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* orbiting edition rings */}
      <mesh ref={orbitWhite} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.06, 0.005, 6, 120]} />
        <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={orbitRed} rotation={[Math.PI / 1.7, 0.5, 0]}>
        <torusGeometry args={[0.9, 0.007, 6, 120]} />
        <meshStandardMaterial
          color="#E10600"
          emissive="#E10600"
          emissiveIntensity={0.9}
          metalness={0.5}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function DropRig({ emphasis, reduced, mobile }: { emphasis: boolean; reduced: boolean; mobile: boolean }) {
  const { camera } = useThree();
  const scroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scroll.current = window.scrollY / Math.max(1, window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    const push = Math.min(scroll.current, 1.6);
    const targetZ = 5.4 + push * 0.8;
    const targetY = push * 0.3;
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, delta * 1.6);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 1.6);
    camera.position.x +=
      ((emphasis ? 0.35 : Math.sin(state.clock.elapsedTime * 0.3) * 0.1) - camera.position.x) *
      Math.min(1, delta * 1.6);
    camera.lookAt(0, push * 0.18, 0);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[-4, 6, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[5, -3, -4]} intensity={0.7} color="#8fa3b0" />
      <pointLight
        position={[0, -2.2, 1.8]}
        intensity={emphasis ? 14 : 5}
        distance={7}
        color="#E10600"
      />
      <Package emphasis={emphasis} reduced={reduced} />
      <Particles count={mobile ? 80 : 260} spreadX={12} spreadY={10} spreadZ={7} speed={0.05} />
    </>
  );
}

type DropSceneProps = {
  /** True while a numbered run is selected in the list below the scene. */
  emphasis?: boolean;
  className?: string;
};

export default function DropScene({ emphasis = false, className }: DropSceneProps) {
  const { ready, mobile, reduced, webgl } = useSceneEnv();

  if (ready && !webgl) {
    // Fallback: the sealed box drawn in pure CSS, same silhouette and seam.
    return (
      <div className={className}>
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative h-44 w-44 border border-white/15">
            <div className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 border-y border-white/20" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-red-batel" />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              SEALED
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Canvas
        dpr={mobile ? [1, 1.2] : [1, 1.6]}
        camera={{ position: [0, 0, 5.4], fov: mobile ? 54 : 44 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <DropRig emphasis={emphasis} reduced={reduced} mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
