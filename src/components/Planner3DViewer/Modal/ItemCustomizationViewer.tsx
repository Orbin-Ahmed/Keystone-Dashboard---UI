import React, { useMemo, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import SceneClickHandler from "../ItemClick/SceneClickHandler";
import ModelViewer from "../ItemClick/ModelViewer";

export interface SelectionType {
  groupName: string;
  meshes: string[];
}

export interface Customization {
  color?: string;
  brightness?: number;
  textureFile?: File;
  textureScale?: number;
  textureRepeat?: { x: number; y: number };
  textureOffset?: { x: number; y: number };
  opacity?: number;
}

export interface ItemCustomizationViewerProps {
  modelPath: string;
  customizations?: Record<string, Customization>;
  selectedGroups?: SelectionType[];
  setSelectedGroups?: React.Dispatch<React.SetStateAction<SelectionType[]>>;
  onApplyCustomizations?: (c: Record<string, Customization>) => void;
  onSceneReady?: (scene: THREE.Object3D) => void;
}

const ItemCustomizationViewer: React.FC<ItemCustomizationViewerProps> = ({
  modelPath,
  customizations = {},
  onApplyCustomizations,
  selectedGroups,
  setSelectedGroups,
  onSceneReady,
}) => {
  const [localSelection, setLocalSelection] = useState<SelectionType[]>([]);
  const finalSelectedGroups = selectedGroups ?? localSelection;
  const finalSetSelectedGroups = setSelectedGroups ?? setLocalSelection;
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const handleCanvasClick = (event: React.MouseEvent) => {};

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full"
      onClick={handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ touchAction: "none" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, -10, -10]} intensity={1} />
        <OrbitControls />
        <SceneClickHandler
          selectedGroups={finalSelectedGroups}
          setSelectedGroups={finalSetSelectedGroups}
        >
          <ModelViewer
            modelPath={modelPath}
            customizations={customizations}
            selectedGroups={finalSelectedGroups}
            setSelectedGroups={finalSetSelectedGroups}
            onSceneReady={onSceneReady}
          />
        </SceneClickHandler>
      </Canvas>
      {onApplyCustomizations && (
        <button
          className="absolute bottom-4 right-4 bg-white p-2 shadow-md"
          onClick={() => onApplyCustomizations(customizations)}
        >
          Save
        </button>
      )}
    </div>
  );
};

export default ItemCustomizationViewer;
