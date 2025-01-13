import { useGLTF } from "@react-three/drei";
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
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ glbUrl }) => {
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
    </>
  );
};
