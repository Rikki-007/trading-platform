"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// A field of soft, drifting motes standing in for stars/plankton in the
// void — density and color temperature shift with scroll depth, giving the
// page a sense of descending through water rather than just scrolling text.
const VoidMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorShallow: new THREE.Color("#0891a8"), // cyan-teal, near the surface
    uColorDeep: new THREE.Color("#151b2c"), // deep navy void
    uColorTreasure: new THREE.Color("#b7760a"), // gold, near the treasure section
    uScrollProgress: 0,
    uPixelRatio: 1,
  },
  /* glsl */ `
    uniform float uTime;
    uniform float uScrollProgress;
    uniform float uPixelRatio;
    attribute float aRandom;
    attribute float aLayer; // 0 = far background, 1 = near foreground
    varying float vLayer;
    varying float vRandom;

    void main() {
      vLayer = aLayer;
      vRandom = aRandom;

      vec3 pos = position;
      float driftPhase = uTime * 0.15 + aRandom * 6.2831853;
      pos.y += sin(driftPhase) * (0.6 + aLayer * 0.8);
      pos.x += cos(driftPhase * 0.7) * (0.35 + aLayer * 0.5);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float size = (10.0 + aRandom * 22.0) * (0.4 + aLayer);
      gl_PointSize = size * uPixelRatio * (1.0 / -mvPosition.z);
    }
  `,
  /* glsl */ `
    uniform vec3 uColorShallow;
    uniform vec3 uColorDeep;
    uniform vec3 uColorTreasure;
    uniform float uScrollProgress;
    varying float vLayer;
    varying float vRandom;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float dist = length(uv);
      float alpha = smoothstep(0.5, 0.0, dist);
      alpha *= alpha; // soften falloff further

      float depthFade = mix(0.25, 1.0, vLayer);

      vec3 color;
      if (uScrollProgress < 0.55) {
        color = mix(uColorShallow, uColorDeep, smoothstep(0.0, 0.55, uScrollProgress));
      } else {
        color = mix(uColorDeep, uColorTreasure, smoothstep(0.55, 1.0, uScrollProgress));
      }

      float twinkle = 0.75 + 0.25 * sin(vRandom * 40.0 + uScrollProgress * 12.0);

      gl_FragColor = vec4(color, alpha * depthFade * twinkle * 0.85);
    }
  `
);

extend({ VoidMaterial });

const COUNT = 1400;

function buildAttributes() {
  const positions = new Float32Array(COUNT * 3);
  const randoms = new Float32Array(COUNT);
  const layers = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const layer = Math.random(); // 0 far, 1 near
    const radius = 8 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 26;

    positions[i * 3 + 0] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius - 6 - layer * 10;

    randoms[i] = Math.random();
    layers[i] = layer;
  }

  return { positions, randoms, layers };
}

export default function VoidField({ liveInputRef, reducedMotion }) {
  const materialRef = useRef(null);
  const { positions, randoms, layers } = useMemo(() => buildAttributes(), []);
  const pointsRef = useRef(null);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const scrollProgress = liveInputRef.current?.scrollProgress ?? 0;

    if (!reducedMotion) {
      materialRef.current.uTime += delta;
    }
    materialRef.current.uScrollProgress = THREE.MathUtils.lerp(
      materialRef.current.uScrollProgress,
      scrollProgress,
      0.06
    );
    materialRef.current.uPixelRatio = state.viewport.dpr ?? 1;

    if (pointsRef.current && !reducedMotion) {
      pointsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={COUNT} array={randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aLayer" count={COUNT} array={layers} itemSize={1} />
      </bufferGeometry>
      <voidMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
