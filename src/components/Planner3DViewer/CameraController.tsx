import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { CameraControllerProps } from "@/types";

const CameraController: React.FC<CameraControllerProps> = ({
  activeTourPoint,
  isAutoRotating,
  disableControls = false,
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const controlsRef = useRef<any>();

  const ROTATION_RADIUS = 50;
  const ROTATION_SPEED = 0.2;
  const EYE_LEVEL = 60;

  useFrame((state) => {
    if (!activeTourPoint || !isAutoRotating) return;

    const targetX = activeTourPoint.position[0];
    const targetZ = activeTourPoint.position[2];

    const elapsedTime = state.clock.getElapsedTime();
    const angle = elapsedTime * ROTATION_SPEED;
    targetPosition.current.set(
      targetX + Math.sin(angle) * ROTATION_RADIUS,
      EYE_LEVEL,
      targetZ + Math.cos(angle) * ROTATION_RADIUS,
    );
    targetLookAt.current.set(targetX, EYE_LEVEL, targetZ);

    camera.position.lerp(targetPosition.current, 0.1);
    camera.lookAt(targetLookAt.current);
  });

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !disableControls;
    }
  }, [disableControls]);

  return !activeTourPoint ? (
    <OrbitControls
      enableZoom={true}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0.1}
      maxDistance={1000}
      enabled={!disableControls}
    />
  ) : null;
};

export default CameraController;
