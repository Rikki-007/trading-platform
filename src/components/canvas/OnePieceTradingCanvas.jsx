"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CompassRig from "./CompassRig";
import VoidField from "./VoidField";
import CameraRig from "./CameraRig";
import { useLiveInputRef } from "@/lib/MarketProvider";

const COLOR_SHALLOW = new THREE.Color("#0891a8");
const COLOR_DEEP = new THREE.Color("#0b0f19");
const COLOR_TREASURE = new THREE.Color("#241a0c");
const scratchColor = new THREE.Color();

function DepthFog({ liveInputRef }) {
  const { scene } = useThree();

  useEffect(() => {
    // `scene` is three.js's own mutable scene graph, not React state — this
    // is the standard, safe way to attach fog in R3F, so it's exempt from
    // the hook-immutability rule that (correctly) polices actual React state.
    // eslint-disable-next-line react-hooks/immutability
    scene.fog = new THREE.FogExp2(COLOR_DEEP.getHex(), 0.045);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    if (!scene.fog) return;
    const p = liveInputRef.current?.scrollProgress ?? 0;
    if (p < 0.55) {
      scratchColor.copy(COLOR_SHALLOW).lerp(COLOR_DEEP, THREE.MathUtils.smoothstep(p, 0, 0.55));
    } else {
      scratchColor.copy(COLOR_DEEP).lerp(COLOR_TREASURE, THREE.MathUtils.smoothstep(p, 0.55, 1));
    }
    scene.fog.color.lerp(scratchColor, 0.05);
  });

  return null;
}

function Scene({ liveInputRef, reducedMotion }) {
  return (
    <>
      <color attach="background" args={["#0b0f19"]} />
      <DepthFog liveInputRef={liveInputRef} />
      <ambientLight intensity={0.25} />
      <CompassRig liveInputRef={liveInputRef} reducedMotion={reducedMotion} />
      <VoidField liveInputRef={liveInputRef} reducedMotion={reducedMotion} />
      <CameraRig liveInputRef={liveInputRef} reducedMotion={reducedMotion} />
    </>
  );
}

/**
 * Fixed, full-viewport 3D backdrop. Sits behind all page content (z-index
 * handled by the caller) and never intercepts pointer events — it's
 * atmosphere, not UI.
 */
export default function OnePieceTradingCanvas() {
  const liveInputRef = useLiveInputRef();
  // Lazy initializer reads the real value on first render (this component is
  // only ever mounted client-side, via a ssr:false dynamic import, so
  // `window` is always available here) — the effect below then only has to
  // subscribe to *changes*, rather than also setting the initial value.
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 50, near: 0.1, far: 60 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene liveInputRef={liveInputRef} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
      {/* Soft DOM-layer glow to fake bloom around the compass without a
          postprocessing pipeline — cheap, and looks right at every zoom. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(0,240,255,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_50%_42%,rgba(245,158,11,0.08),transparent_65%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-void-deep/60 via-transparent to-void" />
    </div>
  );
}
