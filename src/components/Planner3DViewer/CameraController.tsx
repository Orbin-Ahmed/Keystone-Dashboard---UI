import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { CameraControllerProps } from "@/types";

const CameraController: React.FC<CameraControllerProps> = ({
  activeTourPoint,
  isAutoRotating,
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());

  // Constants
  const ROTATION_RADIUS = 50;
  const ROTATION_SPEED = 0.3; // Adjusted for smoother rotation
  const EYE_LEVEL = 70;

  useFrame((state) => {
    if (!activeTourPoint || !isAutoRotating) return;

    const targetX = activeTourPoint.position[0];
    const targetZ = activeTourPoint.position[2];

    // Use elapsed time for consistent rotation
    const elapsedTime = state.clock.getElapsedTime();
    const angle = elapsedTime * ROTATION_SPEED;

    // Calculate target positions
    targetPosition.current.set(
      targetX + Math.sin(angle) * ROTATION_RADIUS,
      EYE_LEVEL,
      targetZ + Math.cos(angle) * ROTATION_RADIUS,
    );
    targetLookAt.current.set(targetX, EYE_LEVEL, targetZ);

    // Smoothly interpolate camera position
    camera.position.lerp(targetPosition.current, 0.1);

    // Update camera lookAt
    camera.lookAt(targetLookAt.current);
  });

  return !activeTourPoint ? (
    <OrbitControls
      enableZoom={true}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0.1}
      maxDistance={1000}
    />
  ) : null;
};

export default CameraController;
