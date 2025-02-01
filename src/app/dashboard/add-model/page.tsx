"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { Text } from "@react-three/drei";
import { DimensionBoxProps } from "@/types";
import * as THREE from "three";
import { ModelViewer } from "@/components/ModelViewer";

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

const DimensionBox: React.FC<DimensionBoxProps> = ({
  width,
  height,
  depth,
}) => {
  const boxSize = 2;

  return (
    <group position={[0, boxSize / 2 - 1, 0]}>
      <mesh>
        <boxGeometry args={[boxSize, boxSize, boxSize]} />
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.5} />
      </mesh>

      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(boxSize, boxSize, boxSize)]}
        />
        <lineBasicMaterial color="black" />
      </lineSegments>

      <DimensionLine
        start={[boxSize / 2 + 0.5, -boxSize / 2 + 0.7, boxSize / 2 + 0.5]}
        end={[boxSize / 2 + 0.5, boxSize / 2 + 0.7, boxSize / 2 + 0.5]}
        label={`Height: ${height}cm`}
        rotation={[0, 0, Math.PI / 2]}
      />

      <DimensionLine
        start={[-boxSize / 2 + 0.3, boxSize / 2 + 0.1, boxSize / 2]}
        end={[boxSize / 2 + 0.3, boxSize / 2 + 0.1, boxSize / 2]}
        label={`Width: ${width}cm`}
        rotation={[0, 0, 0]}
      />

      <DimensionLine
        start={[boxSize / 2, boxSize / 2 + 0.1, boxSize / 2 + 0.3]}
        end={[boxSize / 2, boxSize / 2 + 0.1, -boxSize / 2 + 0.3]}
        label={`Depth: ${depth}cm`}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  );
};

const DimensionViewer: React.FC<DimensionBoxProps> = ({
  width,
  height,
  depth,
}) => {
  return (
    <div className="h-64 rounded border">
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

const AddModel = () => {
  const [formData, setFormData] = useState<{
    itemName: string;
    glbFile: File | null;
    viewer2D: File | null;
    viewer3D: File | null;
    width: number;
    height: number;
    depth: number;
    category: string;
    type: string;
  }>({
    itemName: "",
    glbFile: null,
    viewer2D: null,
    viewer3D: null,
    width: 0,
    height: 0,
    depth: 0,
    category: "",
    type: "",
  });

  const [glbUrl, setGlbUrl] = useState("");
  const [viewer2DPreview, setViewer2DPreview] = useState("");
  const [viewer3DPreview, setViewer3DPreview] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (["width", "height", "depth"].includes(name)) {
      const numericValue = Number(value);
      if (name === "height" && numericValue > 2842) {
        alert("Height cannot exceed 2842 cm.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;

    if (file) {
      if (name === "glbFile") {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (fileExtension !== "glb") {
          alert("Please upload a .glb file only!");
          e.target.value = "";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const sanitizedItemName = formData.itemName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-/g, "_");

    const formDataObj = new FormData();

    if (formData.glbFile) {
      const glbFileExtension = formData.glbFile.name.split(".").pop();
      const glbFileName = `${sanitizedItemName}.${glbFileExtension}`;
      const glbFile = new File([formData.glbFile], glbFileName, {
        type: formData.glbFile.type,
      });
      formDataObj.append("glb_file", glbFile);
    }

    if (formData.viewer3D) {
      const viewer3DExtension = formData.viewer3D.name.split(".").pop();
      const viewer3DFileName = `${sanitizedItemName}.${viewer3DExtension}`;
      const viewer3DFile = new File([formData.viewer3D], viewer3DFileName, {
        type: formData.viewer3D.type,
      });
      formDataObj.append("viewer3d", viewer3DFile);
    }

    if (formData.viewer2D) {
      const viewer2DExtension = formData.viewer2D.name.split(".").pop();
      const viewer2DFileName = `${sanitizedItemName}.${viewer2DExtension}`;
      const viewer2DFile = new File([formData.viewer2D], viewer2DFileName, {
        type: formData.viewer2D.type,
      });
      formDataObj.append("viewer2d", viewer2DFile);
    }
    const conversionFactor = 0.393701;
    formDataObj.append("item_name", formData.itemName);
    formDataObj.append("category", formData.category.toLowerCase());
    formDataObj.append("type", formData.type);
    formDataObj.append("width", (formData.width * conversionFactor).toString());
    formDataObj.append(
      "height",
      (formData.height * conversionFactor).toString(),
    );
    formDataObj.append("depth", (formData.depth * conversionFactor).toString());

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/items/`,
        {
          method: "POST",
          body: formDataObj,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages = Object.entries(errorData)
          .map(([key, value]: [string, any]) => `${value.join(", ")}`)
          .join("\n");

        alert(`Error:\n${errorMessages}`);
        return;
      }

      const data = await response.json();
      const formDataEntries: { [key: string]: string } = {};
      formDataObj.forEach((value, key) => {
        if (value instanceof File) {
          formDataEntries[key] = `File: ${value.name}`;
        } else {
          formDataEntries[key] = value.toString();
        }
      });

      console.log("FormData Contents:", formDataEntries);
      alert("Item submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto p-4">
        <Breadcrumb pageName="3D Furnish Hub" />

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {/* Item Name */}
              <InputField
                className="flex-1 px-4.5 py-3"
                id="item_name"
                type="text"
                name="itemName"
                placeholder="Item Name"
                value={formData.itemName}
                onChange={handleChange}
                required
              />

              {/* Category Field */}
              <InputField
                className="flex-1 px-4.5 py-3"
                id="category"
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category || ""}
                onChange={handleChange}
                required
              />

              {/* Type Dropdown */}
              <div className="flex-1">
                <select
                  id="type"
                  name="type"
                  className="w-full rounded border border-stroke px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.type || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Type
                  </option>
                  <option value="Wall">Wall</option>
                  <option value="Ceiling">Ceiling</option>
                  <option value="Floor">Floor</option>
                  <option value="Door">Door</option>
                  <option value="Window">Window</option>
                </select>
              </div>
            </div>

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
                <div className="relative h-48 w-48">
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
                <div className="relative h-48 w-48">
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
              <p className="text-lg font-bold">Dimensions (cm)</p>
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
                    placeholder="Width (cm)"
                    value={formData.width}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    id="item_height"
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    id="item_depth"
                    type="number"
                    name="depth"
                    placeholder="Depth (cm)"
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
          <div className="h-[600px] overflow-hidden rounded-md border">
            {glbUrl ? (
              <Canvas>
                <PerspectiveCamera position={[2, 2, 2]} />
                <OrbitControls autoRotate autoRotateSpeed={1} />
                <Environment preset="lobby" background={false} />
                <ModelViewer glbUrl={glbUrl} />
                <gridHelper args={[10, 10]} />
              </Canvas>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-gray-500">No 3D model uploaded</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default AddModel;
