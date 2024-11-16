import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import { Vector3 } from "three";

const RoomLabelComponent = ({
  position,
  name,
}: {
  position: [number, number, number];
  name: string;
}) => {
  const labelRef = useRef<any>();
  const { camera } = useThree();
  const labelPosition = useMemo(() => new Vector3(...position), [position]);

  useFrame(() => {
    if (labelRef.current) {
      const distance = camera.position.distanceTo(labelPosition);
      labelRef.current.visible = distance < 1000;
    }
  });

  return (
    <Text
      ref={labelRef}
      position={[position[0], 1, position[2]]}
      fontSize={14}
      color="black"
      anchorX="center"
      anchorY="bottom"
      rotation={[-Math.PI / 2, 0, 0]}
      frustumCulled={true}
    >
      {name}
    </Text>
  );
};

const RoomLabel = React.memo(RoomLabelComponent);

export default RoomLabel;
