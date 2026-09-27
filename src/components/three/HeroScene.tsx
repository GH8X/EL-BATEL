import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Particles, roundedRectShape, usePointer, useSceneEnv } from "./kit";

/* --------------------------------------------------------------- geometry */

/** The hanging collector tag — the brand's physical signature, in metal. */
function useTagGeometry() {
  return useMemo(() => {
    const shape = roundedRectShape({
      width: 1.5,
      height: 2.15,
      radius: 0.26,
      hole: { y: 2.15 / 2 - 0.36, radius: 0.13 },
    });
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
      curveSegments: 14,
    });
    geometry.center();
    return geometry;
  }, []);
}

/* ------------------------------------------------------------------ pieces */

type EmblemProps = {
  engaged: boolean;
  reduced: boolean;
};

function Emblem({ engaged, reduced }: EmblemProps) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const redRing = useRef<THREE.Mesh>(null);
  const pointer = usePointer();
  const geometry = useTagGeometry();

  useFrame((state, delta) => {
    if (!group.current) return;
    const ease = pointer(delta, reduced ? 3 : 2.6);

    const t = state.clock.elapsedTime;
    const engageBoost = engaged ? 1 : 0;

    group.current.rotation.y = Math.sin(t * 0.22) * 0.22 + ease.x * (0.5 + engageBoost * 0.35);
    group.current.rotation.x = -ease.y * (0.26 + engageBoost * 0.14) + Math.sin(t * 0.18) * 0.06;
    group.current.rotation.z = Math.sin(t * 0.14) * 0.05;
    group.current.position.y = Math.sin(t * 0.5) * 0.09 + 0.05;
    group.current.position.x = Math.sin(t * 0.28) * 0.06;

    if (ring.current) {
      ring.current.rotation.z += delta * (0.35 + engageBoost * 0.5);
      const scale = 1 + Math.sin(t * 1.6) * 0.012 + engageBoost * 0.03;
      ring.current.scale.setScalar(scale);
    }
    if (redRing.current) {
      const material = redRing.current.material as THREE.MeshStandardMaterial;
      const target = engaged ? 3.4 : 1.1;
      material.emissiveIntensity += (target - material.emissiveIntensity) * Math.min(1, delta * 4);
      redRing.current.rotation.z -= delta * 0.5;
    }
  });

  return (
    <group ref={group}>
      {/* matte black backing plate */}
      <mesh position={[0, 0, -0.09]} geometry={geometry}>
        <meshStandardMaterial color="#080808" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* brushed metal collector tag */}
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#c9c9c9" metalness={0.96} roughness={0.24} />
      </mesh>

      {/* white wire ring, the "closed edition" loop */}
      <mesh ref={ring} position={[0, 0, 0.06]}>
        <torusGeometry args={[0.92, 0.006, 8, 128]} />
        <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* red accent ring — the only colour in the scene */}
      <mesh ref={redRing} position={[0, 0, 0.075]}>
        <torusGeometry args={[0.72, 0.008, 8, 128]} />
        <meshStandardMaterial
          color="#E10600"
          emissive="#E10600"
          emissiveIntensity={1.1}
          metalness={0.5}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SceneRig({ engaged, reduced, mobile }: { engaged: boolean; reduced: boolean; mobile: boolean }) {
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
    const targetZ = 6 + Math.min(scroll.current, 2) * 0.9;
    const targetY = Math.min(scroll.current, 2) * 0.35;
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, delta * 1.6);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 1.6);
    camera.lookAt(0, scroll.current * 0.2, 0);
    if (engaged) {
      camera.position.x +=
        (Math.sin(state.clock.elapsedTime * 0.4) * 0.16 - camera.position.x) * Math.min(1, delta * 2);
    } else {
      camera.position.x += (0 - camera.position.x) * Math.min(1, delta * 2);
    }
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[-4, 6, 5]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[5, -3, -4]} intensity={0.75} color="#8fa3b0" />
      <pointLight position={[0, -2.4, 1.6]} intensity={engaged ? 12 : 6} distance={7} color="#E10600" />
      <Emblem engaged={engaged} reduced={reduced} />
      <Particles count={mobile ? 90 : 320} />
    </>
  );
}

/* --------------------------------------------------------------- exported */

type HeroSceneProps = {
  engaged?: boolean;
  className?: string;
};

export default function HeroScene({ engaged = false, className }: HeroSceneProps) {
  const { ready, mobile, reduced, webgl } = useSceneEnv();

  if (ready && !webgl) {
    // Graceful degradation: the brand mark instead of a dead canvas.
    return (
      <div className={className}>
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative h-56 w-56 rounded-full border border-white/15">
            <div className="absolute inset-6 rounded-full border border-red-batel/70" />
            <div className="absolute inset-0 flex items-center justify-center font-display text-5xl text-white/80">
              EB
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.7]}
        camera={{ position: [0, 0, 6], fov: mobile ? 52 : 42 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <SceneRig engaged={engaged} reduced={reduced} mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
