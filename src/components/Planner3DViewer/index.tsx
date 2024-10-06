import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { LineData, ShapeData } from '@/types';
import Wall3D from './Wall3D';
import Shape3D from './Shape3D';

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
}

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({ lines, shapes }) => {
    return (
      <Canvas camera={{ position: [0, 200, 400], fov: 50 }}>
        {/* Ambient Light */}
        <ambientLight intensity={0.3} />
        {/* Directional Light */}
        <directionalLight position={[100, 200, 100]} intensity={0.8} castShadow />
        {/* Hemisphere Light */}
        <hemisphereLight skyColor="#ffffff" groundColor="#b0b0b0" intensity={0.5} />
  
        {/* Environment */}
        <Environment preset="sunset" />
  
        {/* Walls */}
        {lines.map((line, index) => (
          <Wall3D key={index} line={line} />
        ))}
  
        {/* Doors and Windows */}
        {shapes.map((shape, index) => (
          <Shape3D key={index} shape={shape} />
        ))}
  
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
  
        {/* Orbit Controls */}
        <OrbitControls />
      </Canvas>
    );
  };

export default Plan3DViewer;
