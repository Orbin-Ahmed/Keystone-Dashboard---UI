import { useGLTF, Line, Text } from "@react-three/drei";
import { Material, Mesh } from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: Mesh;
  };
  materials: {
    [key: string]: Material;
  };
};

interface ModelViewerProps {
  glbUrl: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

const DimensionMarkers: React.FC<{
  dimensions: { width: number; height: number; depth: number };
}> = ({ dimensions }) => {
  const { width, height, depth } = dimensions;

  return (
    <group>
      <Line
        points={[
          [-width / 200, -height / 200 - 0.1, 0],
          [width / 200, -height / 200 - 0.1, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Text
        position={[0, -height / 200 - 0.3, 0]}
        fontSize={0.2}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        {width} cm
      </Text>

      {/* Height marker (green): drawn along the Y axis at the right side */}
      <Line
        points={[
          [width / 200 + 0.1, -height / 200, 0],
          [width / 200 + 0.1, height / 200, 0],
        ]}
        color="green"
        lineWidth={2}
      />
      <Text
        position={[width / 200 + 0.3, 0, 0]}
        fontSize={0.2}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        {height} cm
      </Text>

      {/* Depth marker (blue): drawn along the Z axis at the bottom-left */}
      <Line
        points={[
          [-width / 200 - 0.1, -height / 200, -depth / 200],
          [-width / 200 - 0.1, -height / 200, depth / 200],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Text
        position={[-width / 200 - 0.3, -height / 200, 0]}
        fontSize={0.2}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        {depth} cm
      </Text>
    </group>
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = ({
  glbUrl,
  dimensions,
}) => {
  const { scene } = useGLTF(glbUrl) as GLTFResult;

  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <directionalLight position={[-5, 5, 5]} intensity={0.8} color="#ffffff" />
      <spotLight
        position={[10, 15, 10]}
        angle={0.3}
        penumbra={0.5}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        position={[-10, 15, -10]}
        angle={0.3}
        penumbra={0.5}
        intensity={1.0}
        color="#ffffff"
      />
      <directionalLight
        position={[0, 10, -10]}
        intensity={0.6}
        color="#ffffff"
      />
      <primitive object={scene} />

      {dimensions && <DimensionMarkers dimensions={dimensions} />}
    </>
  );
};
