"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { loadBrainGeometry } from "@/lib/brain-geometry";
import { useTheme } from "@/components/ThemeProvider";

function WhiteBrainMesh({
  geometry,
  backdrop,
  color,
}: {
  readonly geometry: THREE.BufferGeometry;
  readonly backdrop: boolean;
  readonly color: string;
}) {
  const materials = useMemo(
    () => ({
      core: new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: backdrop ? 0.55 : 0.72,
        depthWrite: false,
      }),
      glow: new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: backdrop ? 0.2 : 0.18,
        depthWrite: false,
      }),
    }),
    [backdrop, color],
  );

  useEffect(() => {
    return () => {
      materials.core.dispose();
      materials.glow.dispose();
    };
  }, [materials]);

  /* ~25% quieter than prior backdrop so it stays atmospheric. */
  return (
    <group scale={backdrop ? 0.58 : 1.15} rotation={[0, Math.PI * 0.5, 0]}>
      <group rotation={[-Math.PI * 0.42, 0, 0]}>
        <lineSegments geometry={geometry} material={materials.glow} scale={1.03} />
        <lineSegments geometry={geometry} material={materials.core} />
      </group>
    </group>
  );
}

function BrainScene({
  backdrop,
  color,
}: {
  readonly backdrop: boolean;
  readonly color: string;
}) {
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
        geo.center();
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
  return (
    <WhiteBrainMesh geometry={geometry} backdrop={backdrop} color={color} />
  );
}

interface WhiteBrainProps {
  readonly className?: string;
  /** Bright wireframe for text-backdrop usage */
  readonly backdrop?: boolean;
}

export function WhiteBrain({ className = "", backdrop = false }: WhiteBrainProps) {
  const [ready, setReady] = useState(false);
  const { brainColor, theme } = useTheme();

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`brain-stage${ready ? " is-ready" : ""}${backdrop ? " is-backdrop" : ""} ${className}`.trim()}
      aria-hidden="true"
      data-theme={theme}
      data-brain-color={brainColor}
    >
      {!backdrop ? <div className="brain-skeleton shimmer" /> : null}
      <Canvas
        camera={{ position: [0, 0, backdrop ? 3.15 : 2.05], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <BrainScene backdrop={backdrop} color={brainColor} />
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
          minPolarAngle={0.55}
          maxPolarAngle={Math.PI - 0.55}
        />
      </Canvas>
    </div>
  );
}
