import { ShapeData } from '@/types';
import React from 'react';
import * as THREE from 'three';

interface Shape3DProps {
    shape: ShapeData;
  }
  
  const Shape3D: React.FC<Shape3DProps> = ({ shape }) => {
    const { x, y, width, height, rotation, type } = shape;
  
    // For simplicity, represent windows and doors as boxes
    const geometry = new THREE.BoxGeometry(width, height, 10);
    const material = new THREE.MeshStandardMaterial({
      color: type === 'window' ? '#a0c0ff' : '#8b4513', // Blueish for windows, brownish for doors
      opacity: type === 'window' ? 0.6 : 1,
      transparent: type === 'window',
    });
  
    const position = [x, height / 2, y];
    const angle = -(rotation || 0) * (Math.PI / 180);
  
    return (
      <mesh
        geometry={geometry}
        material={material}
        position={position}
        rotation={[0, angle, 0]}
        castShadow
        receiveShadow
      />
    );
  };

  export default Shape3D;
  