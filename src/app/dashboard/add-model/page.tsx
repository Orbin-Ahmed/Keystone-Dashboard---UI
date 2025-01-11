'use client'
import React, { useState,  useEffect } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { GLTF } from "three-stdlib";
import { Material, Mesh } from "three";
import { Text } from "@react-three/drei";
import { DimensionBoxProps } from "@/types";
import * as THREE from 'three';
import { Line } from "@react-three/drei";

const DimensionLine = ({
  start,
  end,
  label,
  rotation = [0, 0, 0],
}: {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  rotation?: [number, number, number];
}) => {
  return (
    <group>
      <Line
        points={[start, end]}
        color="black"
        lineWidth={1}
      />
      <Text
        position={[
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ]}
        fontSize={0.22}
        color="black"
        anchorX="center"
        anchorY="bottom"
        rotation={rotation}
      >
        {label}
      </Text>
    </group>
  );
};

const DimensionBox: React.FC<DimensionBoxProps> = ({ width, height, depth }) => {
  const boxSize = 2;

  return (
    <group position={[0, boxSize / 2 -1, 0]}>
      <mesh>
        <boxGeometry args={[boxSize, boxSize, boxSize]} />
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.5} />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(boxSize, boxSize, boxSize)]} />
        <lineBasicMaterial color="black" />
      </lineSegments>

      <DimensionLine
        start={[boxSize / 2 + 0.5, -boxSize / 2 + 0.7, boxSize / 2 + 0.5]}
        end={[boxSize / 2 + 0.5, boxSize / 2 + 0.7, boxSize / 2 + 0.5]}
        label={`Height: ${height}m`}
        rotation={[0, 0, Math.PI / 2]}
      />

      <DimensionLine
        start={[-boxSize / 2 + 0.1, boxSize / 2 + 0.1, boxSize / 2]}
        end={[boxSize / 2 + 0.1, boxSize / 2 + 0.1, boxSize / 2]}
        label={`Width: ${width}m`}
        rotation={[0, 0, 0]}
      />

      <DimensionLine
        start={[boxSize / 2, boxSize / 2 + 0.1, boxSize / 2 + 0.1]}
        end={[boxSize / 2, boxSize / 2 + 0.1, -boxSize / 2 + 0.1]}
        label={`Depth: ${depth}m`}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  );
};

const DimensionViewer: React.FC<DimensionBoxProps> = ({ width, height, depth }) => {
  return (
    <div className="h-64 border rounded">
      <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
        <PerspectiveCamera position={[3, 3, 3]} makeDefault />
        <OrbitControls 
          enableRotate={false}
          enableZoom={true}
          enablePan={false}
        />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <DimensionBox width={width} height={height} depth={depth} />
      </Canvas>
    </div>
  );
};

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

const ModelViewer: React.FC<ModelViewerProps> = ({ glbUrl }) => {
  const { scene } = useGLTF(glbUrl) as GLTFResult;

  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <primitive object={scene} />
    </>
  );
};

const EditImage = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    glbFile: null,
    viewer2D: null,
    viewer3D: null,
    width: 0,
    height: 0,
    depth: 0,
  });

  const [glbUrl, setGlbUrl] = useState("");
  const [viewer2DPreview, setViewer2DPreview] = useState("");
  const [viewer3DPreview, setViewer3DPreview] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (["width", "height", "depth"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;

    if (file) {
      if (name === "glbFile") {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension !== 'glb') {
          alert("Please upload a .glb file only!");
          e.target.value = '';
          return;
        }
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
      
      if (name !== "glbFile" && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (name === "viewer2D") {
            setViewer2DPreview(reader.result as string);
          } else if (name === "viewer3D") {
            setViewer3DPreview(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    if (formData.glbFile) {
      const url = URL.createObjectURL(formData.glbFile);
      setGlbUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [formData.glbFile]);

  return (
    <DefaultLayout>
      <div className="mx-auto p-4">
        <Breadcrumb pageName="3D Furnish Hub" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <InputField
              className="px-4.5 py-3"
              id="item_name"
              type="text"
              name="itemName"
              placeholder="Enter item name"
              value={formData.itemName}
              onChange={handleChange}
              required
            />

            <div>
              <p className="text-lg font-bold">Upload 3D Model (.glb)</p>
              <div className="mt-2">
                <input
                  id="glbFile"
                  className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
                  type="file"
                  name="glbFile"
                  accept=".glb"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold">2D Viewer Image</p>
                <div className="mt-2">
                  <input
                    id="viewer2D"
                    className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
                    type="file"
                    name="viewer2D"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>
              {viewer2DPreview && (
                <div className="w-48 h-48 relative">
                  <Image
                    src={viewer2DPreview}
                    alt="2D Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>


            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold">3D Viewer Image</p>
                <div className="mt-2">
                  <input
                    id="viewer3D"
                    className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
                    type="file"
                    name="viewer3D"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>
              {viewer3DPreview && (
                <div className="w-48 h-48 relative">
                  <Image
                    src={viewer3DPreview}
                    alt="3D Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-lg font-bold">Dimensions</p>
              <div className="grid grid-cols-2 gap-4">
                <DimensionViewer 
                  width={formData.width}
                  height={formData.height}
                  depth={formData.depth}
                />
                <div className="space-y-4">
                  <InputField
                    id="item_width"
                    type="number"
                    name="width"
                    placeholder="Width (m)"
                    value={formData.width}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    id="item_height"
                    type="number"
                    name="height"
                    placeholder="Height (m)"
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    id="item_depth"
                    type="number"
                    name="depth"
                    placeholder="Depth (m)"
                    value={formData.depth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <CustomButton type="submit" variant="primary">
              Submit
            </CustomButton>
          </div>

          {/* 3D Preview Section */}
          <div className="h-[600px] border rounded-md overflow-hidden">
            {glbUrl ? (
              <Canvas>
                <PerspectiveCamera position={[2, 2, 2]} />
                <OrbitControls autoRotate autoRotateSpeed={1} />
                <ModelViewer glbUrl={glbUrl} />
                <gridHelper args={[10, 10]} />
              </Canvas>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-gray-500">No 3D model uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditImage;