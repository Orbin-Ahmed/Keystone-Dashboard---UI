// import React, { useEffect } from "react";
// import { useGLTF } from "@react-three/drei";
// import { Box3, Vector3 } from "three";

// interface ModelProps {
//   path: string;
//   position: [number, number, number];
//   rotation: [number, number, number];
//   scale?: [number, number, number];
//   onLoaded?: (modelData: {
//     dimensions: { width: number; height: number; depth: number };
//     center: Vector3;
//   }) => void;
// }

// const Model = ({ path, position, rotation, scale, onLoaded }: ModelProps) => {
//   const { scene } = useGLTF(`/models/${path}`);

//   useEffect(() => {
//     if (scene && onLoaded) {
//       // Calculate dimensions and center
//       const bbox = new Box3().setFromObject(scene);
//       const size = new Vector3();
//       bbox.getSize(size);
//       const center = new Vector3();
//       bbox.getCenter(center);

//       onLoaded({
//         dimensions: { width: size.x, height: size.y, depth: size.z },
//         center,
//       });
//     }
//     // return () => {
//     //   scene.traverse((object) => {
//     //     if (object instanceof Mesh) {
//     //       if (object.geometry) object.geometry.dispose();
//     //       if (object.material) {
//     //         if (Array.isArray(object.material)) {
//     //           object.material.forEach((material) => material.dispose());
//     //         } else {
//     //           object.material.dispose();
//     //         }
//     //       }
//     //     }
//     //   });
//     // };
//   }, [scene, onLoaded]);

//   return (
//     <primitive
//       object={scene.clone()}
//       position={position}
//       rotation={rotation}
//       scale={scale}
//     />
//   );
// };

// export default Model;

import React from "react";
import { useGLTF } from "@react-three/drei";

interface ModelProps {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

const Model = ({ path, position, rotation }: ModelProps) => {
  const { scene } = useGLTF(`/models/${path}`);

  return <primitive object={scene} position={position} rotation={rotation} />;
};

export default Model;
