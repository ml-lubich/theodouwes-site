"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { loadBrainGeometry } from "@/lib/brain-geometry";

function WhiteBrainMesh({ geometry }: { readonly geometry: THREE.BufferGeometry }) {
  const materials = useMemo(
    () => ({
      core: new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
      glow: new THREE.LineBasicMaterial({
        color: "#f5f5f5",
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    }),
    [],
  );

  return (
    <group scale={1.15} rotation={[0, Math.PI * 0.5, 0]}>
      <group rotation={[-Math.PI * 0.42, 0, 0]}>
        <lineSegments geometry={geometry} material={materials.glow} scale={1.02} />
        <lineSegments geometry={geometry} material={materials.core} />
      </group>
    </group>
  );
}

function BrainScene() {
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
  return <WhiteBrainMesh geometry={geometry} />;
}

interface WhiteBrainProps {
  readonly className?: string;
  /** Softer wireframe for text-backdrop usage */
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
      <div className="brain-skeleton shimmer" />
      <Canvas
        camera={{ position: [0, 0, backdrop ? 2.35 : 2.05], fov: backdrop ? 48 : 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <BrainScene />
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={backdrop ? 0.35 : 0.55}
          enableZoom={false}
          enablePan={false}
          enableRotate
          enableDamping
          dampingFactor={0.12}
          rotateSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}
