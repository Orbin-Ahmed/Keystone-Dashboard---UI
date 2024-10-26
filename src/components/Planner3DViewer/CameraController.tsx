import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CameraControllerProps } from "@/types";

const CameraController: React.FC<CameraControllerProps> = ({
  activeTourPoint,
  isAutoRotating,
}) => {
  const { camera } = useThree();
  const rotationAngle = useRef(0);

  // Constants
  const ROTATION_RADIUS = 50;
  const ROTATION_SPEED = 0.2;
  const EYE_LEVEL = 70;

  useFrame((_, delta) => {
    if (!activeTourPoint || !isAutoRotating) return;

    const targetX = activeTourPoint.position[0];
    const targetZ = activeTourPoint.position[2];

    // Simple rotation without transition
    rotationAngle.current += ROTATION_SPEED * delta;

    camera.position.set(
      targetX + Math.sin(rotationAngle.current) * ROTATION_RADIUS,
      EYE_LEVEL,
      targetZ + Math.cos(rotationAngle.current) * ROTATION_RADIUS,
    );
    camera.lookAt(targetX, EYE_LEVEL, targetZ);
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
