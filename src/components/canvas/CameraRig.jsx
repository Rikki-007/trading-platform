"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const lookTarget = new THREE.Vector3();

/**
 * Moves the camera instead of the scene: a gentle parallax tilt toward the
 * cursor (damped so it never feels twitchy), plus a slow dolly-in as the
 * page scrolls, so descending the page reads as descending into the scene.
 */
export default function CameraRig({ liveInputRef, reducedMotion }) {
  const { camera } = useThree();

  /* eslint-disable react-hooks/immutability --
     Mutating `camera.position` every frame (rather than replacing it) is the
     standard, recommended R3F pattern — it's three.js's own imperative scene
     graph, not React state, so it's exempt from the hook-immutability rule
     that (correctly) polices actual React-managed values. */
  useFrame((_, delta) => {
    const { pointer, scrollProgress } = liveInputRef.current ?? { pointer: { x: 0, y: 0 }, scrollProgress: 0 };
    const parallax = reducedMotion ? 0.15 : 1;

    const targetX = pointer.x * 1.1 * parallax;
    const targetY = -pointer.y * 0.6 * parallax + scrollProgress * 0.4;
    const targetZ = 11 - scrollProgress * 4.5;

    const damp = 1 - Math.pow(0.001, delta);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, damp);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, damp);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, damp * 0.6);

    lookTarget.set(0, -scrollProgress * 1.2, -4);
    camera.lookAt(lookTarget);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}
