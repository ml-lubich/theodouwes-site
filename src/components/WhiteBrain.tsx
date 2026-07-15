"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { loadBrainGeometry } from "@/lib/brain-geometry";

function WhiteBrainMesh({
  geometry,
  backdrop,
}: {
  readonly geometry: THREE.BufferGeometry;
  readonly backdrop: boolean;
}) {
  const materials = useMemo(
    () => ({
      core: new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: backdrop ? 0.7 : 0.72,
        depthWrite: false,
      }),
      glow: new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: backdrop ? 0.28 : 0.18,
        depthWrite: false,
      }),
    }),
    [backdrop],
  );

  /* Keep the backdrop compact enough to support the hero without overwhelming it. */
  return (
    <group scale={backdrop ? 0.62 : 1.15} rotation={[0, Math.PI * 0.5, 0]}>
      <group rotation={[-Math.PI * 0.42, 0, 0]}>
        <lineSegments geometry={geometry} material={materials.glow} scale={1.03} />
        <lineSegments geometry={geometry} material={materials.core} />
      </group>
    </group>
  );
}

function BrainScene({ backdrop }: { readonly backdrop: boolean }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loaded: THREE.BufferGeometry | null = null;
    loadBrainGeometry()
      .then((geo) => {
        if (cancelled) {
          geo.dispose();
          return;
        }
        loaded = geo;
        setGeometry(geo);
      })
      .catch(() => {
        /* keep empty stage */
      });
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, []);

  if (!geometry) return null;
  return <WhiteBrainMesh geometry={geometry} backdrop={backdrop} />;
}

interface WhiteBrainProps {
  readonly className?: string;
  /** Bright wireframe for text-backdrop usage */
  readonly backdrop?: boolean;
}

export function WhiteBrain({ className = "", backdrop = false }: WhiteBrainProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`brain-stage${ready ? " is-ready" : ""}${backdrop ? " is-backdrop" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      {!backdrop ? <div className="brain-skeleton shimmer" /> : null}
      <Canvas
        camera={{ position: [0, 0, backdrop ? 2.8 : 2.05], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <BrainScene backdrop={backdrop} />
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.45}
          enableZoom={false}
          enablePan={false}
          enableRotate
          enableDamping
          dampingFactor={0.12}
          rotateSpeed={0.9}
          // Keep whole brain in view while dragging
          minPolarAngle={0.55}
          maxPolarAngle={Math.PI - 0.55}
        />
      </Canvas>
    </div>
  );
}
