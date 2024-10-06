import { LineData } from '@/types';
import React from 'react';
import * as THREE from 'three';

interface Wall3DProps {
    line: LineData;
  }
  
  const Wall3D: React.FC<Wall3DProps> = ({ line }) => {
    const [x1, y1, x2, y2] = line.points;
    const wallHeight = 100;
    const wallThickness = 10;
    const wallLength = Math.hypot(x2 - x1, y2 - y1);
    const angle = -Math.atan2(y2 - y1, x2 - x1);
  
    const position = [(x1 + x2) / 2, wallHeight / 2, (y1 + y2) / 2];
  
    // Wall geometry
    const geometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
  
    // Materials for inside and outside
    const outsideMaterial = new THREE.MeshStandardMaterial({ color: '#f0f0f0' });
    const insideMaterial = new THREE.MeshStandardMaterial({ color: '#f0f0f0' });
    const materials = [outsideMaterial, insideMaterial];
  
    // Assign materials to faces
    geometry.groups.forEach((group, idx) => {
      // Front and back faces
      if (idx === 4 || idx === 5) {
        group.materialIndex = 0; // Outside material
      } else {
        group.materialIndex = 1; // Inside material
      }
    });
  
    return (
      <mesh
        geometry={geometry}
        position={position}
        rotation={[0, angle, 0]}
        castShadow
        receiveShadow
      >
        {materials.map((material, idx) => (
          <primitive attach={`material-${idx}`} object={material} key={idx} />
        ))}
      </mesh>
    );
  };

  export default Wall3D;
  