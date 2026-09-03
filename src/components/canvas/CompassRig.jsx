"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A stylized navigation instrument — three nested rings on independent axes
 * around a pulsing core, standing in for a compass/log rather than any
 * literal grid or logo. Reacts to scroll depth (rotation speed + core
 * intensity ramp up as you descend the page) so it reads as instrumentation
 * that's alive, not decoration.
 */
export default function CompassRig({ liveInputRef, reducedMotion }) {
  const groupRef = useRef(null);
  const outerRing = useRef(null);
  const midRing = useRef(null);
  const innerRing = useRef(null);
  const core = useRef(null);
  const coreLight = useRef(null);

  useFrame((state, delta) => {
    const scrollProgress = liveInputRef.current?.scrollProgress ?? 0;
    const speedMul = reducedMotion ? 0.15 : 1;

    if (outerRing.current) {
      outerRing.current.rotation.z += delta * 0.06 * speedMul;
      outerRing.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.15;
    }
    if (midRing.current) {
      midRing.current.rotation.x += delta * -0.09 * speedMul;
      midRing.current.rotation.y += delta * 0.04 * speedMul;
    }
    if (innerRing.current) {
      innerRing.current.rotation.y += delta * 0.16 * speedMul * (1 + scrollProgress);
      innerRing.current.rotation.z += delta * -0.05 * speedMul;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * (reducedMotion ? 0.4 : 1.4)) * 0.06;
      core.current.scale.setScalar(pulse * (1 + scrollProgress * 0.35));
    }
    if (coreLight.current) {
      coreLight.current.intensity = 2.2 + scrollProgress * 3.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
    if (groupRef.current) {
      // sink slightly and tilt as the page descends, like the instrument is
      // dropping deeper into the void with the reader
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -scrollProgress * 2.2, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, scrollProgress * 0.25, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -4]}>
      <mesh ref={outerRing}>
        <torusGeometry args={[3.1, 0.02, 16, 128]} />
        <meshStandardMaterial
          color="#0b0f19"
          emissive="#00f0ff"
          emissiveIntensity={0.9}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      <mesh ref={midRing} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[2.3, 0.015, 16, 128]} />
        <meshStandardMaterial
          color="#0b0f19"
          emissive="#f59e0b"
          emissiveIntensity={0.7}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh ref={innerRing} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <torusGeometry args={[1.5, 0.012, 16, 128]} />
        <meshStandardMaterial
          color="#0b0f19"
          emissive="#00f0ff"
          emissiveIntensity={1.1}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial
          color="#1a2333"
          emissive="#f59e0b"
          emissiveIntensity={1.6}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      <pointLight ref={coreLight} color="#f59e0b" distance={9} decay={2} intensity={2.2} />
      <pointLight color="#00f0ff" position={[0, 0, 2]} distance={7} decay={2} intensity={1.1} />
    </group>
  );
}
