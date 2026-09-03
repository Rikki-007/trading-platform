"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const lookTarget = new THREE.Vector3();

/**
 * Moves the camera instead of the scene: a gentle parallax tilt toward the
 * cursor (damped so it never feels twitchy), plus a slow dolly-in as the
 * page scrolls, so descending the page reads as descending into the scene.
 * Both the camera's *position* and where it's *looking* react to the cursor
 * — position alone reads as a translate; the look-target offset makes it
 * read as the camera turning toward the cursor. Tuned to be a graceful,
 * ambient reaction rather than something that competes for attention with
 * the foreground content — see CompassRig for the matching restraint on the
 * instrument's own tilt.
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

    const targetX = pointer.x * 1.3 * parallax;
    const targetY = -pointer.y * 0.8 * parallax + scrollProgress * 0.4;
    const targetZ = 11 - scrollProgress * 4.5;

    const damp = 1 - Math.pow(0.0006, delta);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, damp);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, damp);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, damp * 0.6);

    lookTarget.set(pointer.x * 1.1 * parallax, -scrollProgress * 1.2 - pointer.y * 0.65 * parallax, -4);
    camera.lookAt(lookTarget);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}
