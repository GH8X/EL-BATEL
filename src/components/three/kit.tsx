import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Shared kit for the EL BATEL 3D scenes. Every scene is a dark stage with a
 * single red accent, so the lighting, particles and device rules live here
 * instead of being re-invented per scene.
 */

/** WebGL capability probe — scenes degrade to typography, never a dead canvas. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export type SceneEnv = {
  /** False until the client has measured the device (first paint stays static). */
  ready: boolean;
  mobile: boolean;
  reduced: boolean;
  webgl: boolean;
};

/** Device + accessibility profile every scene shares. */
export function useSceneEnv(): SceneEnv {
  const [env, setEnv] = useState<SceneEnv>({
    ready: false,
    mobile: false,
    reduced: false,
    webgl: true,
  });

  useEffect(() => {
    setEnv({
      ready: true,
      mobile: window.innerWidth < 900,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      webgl: hasWebGL(),
    });
  }, []);

  return env;
}

/** Smoothed, normalised pointer (-1 → 1) shared by every scene. */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /** Call inside useFrame: returns the eased pointer for this frame. */
  const ease = (delta: number, damp = 2.6) => {
    smoothed.current.x += (pointer.current.x - smoothed.current.x) * Math.min(1, delta * damp);
    smoothed.current.y += (pointer.current.y - smoothed.current.y) * Math.min(1, delta * damp);
    return smoothed.current;
  };

  return ease;
}

/* ------------------------------------------------------------------ pieces */

function useParticleGeometry(count: number, spreadX: number, spreadY: number, spreadZ: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ - 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count, spreadX, spreadY, spreadZ]);
}

/** Slow dust field that gives the black stage depth. */
export function Particles({
  count,
  speed = 0.06,
  spreadX = 14,
  spreadY = 11,
  spreadZ = 8,
  size = 0.028,
  opacity = 0.55,
}: {
  count: number;
  speed?: number;
  spreadX?: number;
  spreadY?: number;
  spreadZ?: number;
  size?: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useParticleGeometry(count, spreadX, spreadY, spreadZ);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed;
    ref.current.position.y = Math.sin(Date.now() * 0.00012) * 0.25;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={size}
        color="#ffffff"
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------------------------------------------------------- geometry */

type RoundedRectOptions = {
  width: number;
  height: number;
  radius: number;
  /** Punch (or punch-like) hole, used by the hanging collector tag. */
  hole?: { x?: number; y: number; radius: number };
};

/** Rounded rectangle path used as the base silhouette of tags and packages. */
export function roundedRectShape({ width, height, radius, hole }: RoundedRectOptions) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2 + radius, -height / 2);
  shape.lineTo(width / 2 - radius, -height / 2);
  shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
  shape.lineTo(width / 2, height / 2 - radius);
  shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  shape.lineTo(-width / 2 + radius, height / 2);
  shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
  shape.lineTo(-width / 2, -height / 2 + radius);
  shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

  if (hole) {
    const path = new THREE.Path();
    path.absarc(hole.x ?? 0, hole.y, hole.radius, 0, Math.PI * 2, true);
    shape.holes.push(path);
  }
  return shape;
}
