import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { CameraControllerProps } from "@/types";

const CameraController: React.FC<CameraControllerProps> = ({
  activeTourPoint,
  isAutoRotating,
  disableControls = false,
  setIsAutoRotating,
  cameraHeight,
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const controlsRef = useRef<any>();

  const ROTATION_RADIUS = 50;
  const ROTATION_SPEED = 0.2;

  useFrame((state) => {
    if (!activeTourPoint) return;

    if (isAutoRotating) {
      const targetX = activeTourPoint.position[0];
      const targetZ = activeTourPoint.position[2];
      const elapsedTime = state.clock.getElapsedTime();
      const angle = elapsedTime * ROTATION_SPEED;
      targetPosition.current.set(
        targetX + Math.sin(angle) * ROTATION_RADIUS,
        cameraHeight,
        targetZ + Math.cos(angle) * ROTATION_RADIUS,
      );

      camera.position.lerp(targetPosition.current, 0.1);
      camera.lookAt(targetX, cameraHeight, targetZ);
    }
  });

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !disableControls;
      if (activeTourPoint) {
        controlsRef.current.target.set(
          activeTourPoint.position[0],
          cameraHeight,
          activeTourPoint.position[2],
        );
      } else {
        controlsRef.current.target.set(0, 0, 0);
      }
    }
  }, [disableControls, activeTourPoint, cameraHeight]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      maxDistance={1000}
      enabled={!disableControls}
      enablePan={false}
      onStart={() => {
        if (isAutoRotating) {
          setIsAutoRotating(false);
        }
      }}
    />
  );
};

export default CameraController;
