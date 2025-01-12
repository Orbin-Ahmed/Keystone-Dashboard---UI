import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLoader, useThree, ThreeEvent } from "@react-three/fiber";
import {
  categories,
  PDFItemData,
  PlacingItemType,
  Point,
  SceneContentProps,
  ScheduleItem,
  ShapeData,
  WallClassification,
  WallItem,
} from "@/types";
import {
  Vector3,
  TextureLoader,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Vector2,
  DoubleSide,
  ExtrudeGeometry,
  RepeatWrapping,
  Shape,
  Raycaster,
  Plane,
  Object3D,
  Box3,
  Material,
  EquirectangularReflectionMapping,
  FrontSide,
} from "three";
import { CSG } from "three-csg-ts";
import Model from "./Model";
import ItemModel from "./ItemModel";
import CameraController from "@/components/Planner3DViewer/CameraController";
import RoomLabel from "@/components/Planner3DViewer/RoomLabel";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { GLTFExporter } from "three-stdlib";
import throttle from "lodash.throttle";
import { RGBELoader } from "three-stdlib";
import { uid } from "uid";
import WallItemModel from "./WallItemModel";

export const ensureWallPoints = (
  points: number[],
): [number, number, number, number] => {
  if (points.length !== 4) {
    throw new Error("Wall points must contain exactly 4 values");
  }
  return [points[0], points[1], points[2], points[3]];
};

const CreateFloorShape = (
  floorPlanPoints: Point[],
  centerX: number,
  centerY: number,
) => {
  if (floorPlanPoints.length < 3) {
    console.error("Not enough floor plan points to create a shape.");
    return null;
  }

  const shape = new Shape();

  const firstPoint = floorPlanPoints[0];
  shape.moveTo(firstPoint.x - centerX, firstPoint.y - centerY);

  for (let i = 1; i < floorPlanPoints.length; i++) {
    const point = floorPlanPoints[i];
    shape.lineTo(point.x - centerX, point.y - centerY);
  }

  shape.lineTo(firstPoint.x - centerX, firstPoint.y - centerY);

  return shape;
};

const SceneContent: React.FC<SceneContentProps> = ({
  lines,
  shapes,
  roomNames,
  activeTourPoint,
  isTransitioning,
  setIsTransitioning,
  isAutoRotating,
  setIsAutoRotating,
  showRoof,
  tourPoints,
  onTourPointClick,
  floorPlanPoints,
  centerX,
  centerY,
  minX,
  maxX,
  minY,
  maxY,
  onModelClick,
  modelPathsByShapeId,
  shapeDimensionsById,
  shouldExport,
  setShouldExport,
  placingItem,
  setPlacingItem,
  placedItems,
  setPlacedItems,
  selectedItem,
  setSelectedItem,
  wallHeight,
  wallThickness,
  wallTexture,
  floorTexture,
  ceilingTexture,
  shapeFlipStatusById,
  furnitureItems,
  setFurnitureItems,
  placingWallItem,
  setPlacingWallItem,
  wallItems,
  setWallItems,
  selectedWallItem,
  setSelectedWallItem,
  ceilingItems,
  setCeilingItems,
  currentFloorIndex,
}) => {
  const { scene, camera, gl } = useThree();
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 1, 0), 0);

  const doorDimensions = { width: 50, height: 100 };
  const windowDimensions = { width: 60, height: 50 };

  const isDragging = useRef(false);
  const dragOffset = useRef<[number, number, number] | null>(null);
  const placingItemRef = useRef<PlacingItemType | null>(placingItem);
  const modelRef = useRef<Object3D | null>(null);

  const envMap = useLoader(RGBELoader, "beach_2k_env.hdr");
  envMap.mapping = EquirectangularReflectionMapping;

  const envMap_floor = useLoader(RGBELoader, "indoor_env.hdr");
  envMap_floor.mapping = EquirectangularReflectionMapping;

  const wallClassifications = useMemo(() => {
    const classifications: Record<string, WallClassification> = {};
    const tolerance = 5;

    const wallEndpoints: Array<[number, number, number, number]> = [];
    const wallIds: string[] = [];

    lines.forEach((line) => {
      wallEndpoints.push(ensureWallPoints(line.points));
      wallIds.push(line.id);
    });

    wallEndpoints.forEach((wall, wallIndex) => {
      const [x1, y1, x2, y2] = wall;
      const wallId = wallIds[wallIndex];
      const wallCenter = new Vector2((x1 + x2) / 2, (y1 + y2) / 2);
      const wallNormal = new Vector2(-(y2 - y1), x2 - x1).normalize();
      const toCenterVector = new Vector2(
        centerX - wallCenter.x,
        centerY - wallCenter.y,
      ).normalize();

      const isFacingInward = wallNormal.dot(toCenterVector) > 0;
      const isHorizontal = Math.abs(y1 - y2) < tolerance;
      const isVertical = Math.abs(x1 - x2) < tolerance;

      const isAtHorizontalBoundary =
        Math.abs(y1 - minY) < tolerance ||
        Math.abs(y1 - maxY) < tolerance ||
        Math.abs(y2 - minY) < tolerance ||
        Math.abs(y2 - maxY) < tolerance;

      const isAtVerticalBoundary =
        Math.abs(x1 - minX) < tolerance ||
        Math.abs(x1 - maxX) < tolerance ||
        Math.abs(x2 - minX) < tolerance ||
        Math.abs(x2 - maxX) < tolerance;

      const isOuter =
        (isHorizontal && isAtHorizontalBoundary) ||
        (isVertical && isAtVerticalBoundary);

      classifications[wallId] = {
        isOuter,
        isFacingInward,
      };
    });

    return classifications;
  }, [lines]);
  // }, [lines, centerX, centerY, minX, maxX, minY, maxY]);

  const shapesByWallId = useMemo(() => {
    return shapes.reduce(
      (acc, shape) => {
        if (!acc[shape.wallId]) {
          acc[shape.wallId] = [];
        }
        acc[shape.wallId].push(shape);
        return acc;
      },
      {} as Record<string, ShapeData[]>,
    );
  }, [shapes]);

  const floorShape = useMemo(() => {
    const shape = CreateFloorShape(floorPlanPoints, centerX, centerY);
    if (!shape) {
      console.error("Failed to create floor shape.");
      return null;
    }
    return shape;
  }, [floorPlanPoints]);

  // Texure Data
  const floorTextureData = useLoader(
    TextureLoader,
    `/textures/${floorTexture}`,
  );
  const wallTextureData = useLoader(TextureLoader, `/textures/${wallTexture}`);
  const ceilingTextureData = useLoader(
    TextureLoader,
    `/textures/${ceilingTexture}`,
  );

  const textures = {
    floor: floorTextureData,
    wall: wallTextureData,
    roof: ceilingTextureData,
  };

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    };
  }, [textures.floor, textures.wall, textures.roof]);

  const modelTypeNames: { [key: string]: string } = {
    "door/door.glb": "Glass Door",
    "door/door_wooden.glb": "Wooden Door 1",
    "door/door_wooden_1.glb": "Wooden Door 2",
    "door/door_wooden_2.glb": "Wooden Door 3",
    "door/door_wooden_3.glb": "Wooden Door 4",
    "door/door_wooden_4.glb": "Wooden Door 5",
    "door/door_wooden_5.glb": "Wooden Door 6",
    "door/blastDoor.glb": "Blast Door",
    "door/doorFrame.glb": "Door Frame",
    "window/window.glb": "Casement Window",
    "window/window_arch.glb": "Arch Window",
    "window/window_slide.glb": "Slide Window",
    "window/window_curtain.glb": "Window with Curtain",
  };

  const modelImagePaths: { [key: string]: string } = {
    "door/door.glb": "/models/door/door.png",
    "door/door_wooden.glb": "/models/door/door_wooden.png",
    "door/door_wooden_1.glb": "/models/door/door_wooden_1.png",
    "door/door_wooden_2.glb": "/models/door/door_wooden_2.png",
    "door/door_wooden_3.glb": "/models/door/door_wooden_3.png",
    "door/door_wooden_4.glb": "/models/door/door_wooden_4.png",
    "door/door_wooden_5.glb": "/models/door/door_wooden_5.png",
    "door/blastDoor.glb": "/models/door/blastDoor.png",
    "door/doorFrame.glb": "/models/door/doorFrame.png",
    "window/window.glb": "/models/window/window.png",
    "window/window_arch.glb": "/models/window/window_arch.png",
    "window/window_slide.glb": "/models/window/window_slide.png",
    "window/window_curtain.glb": "/models/window/window_curtain.png",
  };
  // Export Functionality

  const itemToRoomName: Record<string, string> = categories.reduce(
    (acc, room) => {
      room.items.forEach((item) => {
        acc[item.type] = room.name;
      });
      return acc;
    },
    {} as Record<string, string>,
  );

  useEffect(() => {
    if (shouldExport) {
      const exportScene = async () => {
        try {
          const scheduleItems = collectScheduleData();
          const pdfBlob = await generateSchedulePDF(scheduleItems);

          const itemData = collectItemData();
          const itemPdfBlob = await generateItemPDF(itemData);

          const gltfBlob = await exportGLTF();

          const zipBlob = await createZipFile(gltfBlob, pdfBlob, itemPdfBlob);
          const link = document.createElement("a");
          link.href = URL.createObjectURL(zipBlob);
          link.download = "scene_and_schedule.zip";
          link.click();
          URL.revokeObjectURL(link.href);

          setShouldExport(false);
        } catch (error) {
          console.error("An error occurred during export", error);
          setShouldExport(false);
        }
      };

      exportScene();
    }
  }, [shouldExport]);

  const collectScheduleData = (): ScheduleItem[] => {
    const scheduleMap = new Map<string, ScheduleItem>();

    const typeCounters: { [key: string]: number } = {};

    shapes.forEach((shape) => {
      const { id: shapeId, type, wallId } = shape;

      // Get wall classification
      const wallClassification = wallClassifications[wallId];
      const isOuter = wallClassification ? wallClassification.isOuter : false;

      // Get dimensions
      const dimensions =
        shapeDimensionsById[shapeId] ||
        (type === "door" ? doorDimensions : windowDimensions);
      const width = dimensions.width;
      const height = dimensions.height;

      const defaultModelPath =
        type === "window"
          ? "window/window.glb"
          : isOuter
            ? "door/door.glb"
            : "door/door_wooden.glb";
      const modelPath = modelPathsByShapeId[shapeId] || defaultModelPath;
      const modelName = modelPath.split("/").pop()?.split(".").shift() || "";
      const typeName = modelTypeNames[modelPath] || type;
      const area = width * height;
      const imagePath = modelImagePaths[modelPath];
      const key = `${type}-${modelName}-${width}-${height}`;

      if (scheduleMap.has(key)) {
        const item = scheduleMap.get(key)!;
        item.count += 1;
      } else {
        const typeInitial = type === "door" ? "D" : "W";
        typeCounters[type] = (typeCounters[type] || 0) + 1;
        const groupId = `${typeInitial}${typeCounters[type]}`;

        scheduleMap.set(key, {
          id: groupId,
          type: typeName,
          modelName: modelName,
          width: width,
          height: height,
          area: area,
          count: 1,
          image: imagePath,
        });
      }
    });

    const scheduleItems = Array.from(scheduleMap.values());

    return scheduleItems;
  };

  const collectItemData = (): PDFItemData[] => {
    const itemMap = new Map<string, PDFItemData>();
    const typeCounters: { [key: string]: number } = {};

    placedItems.forEach((item) => {
      const { type, width, height, depth, name, category } = item;

      const roomName = itemToRoomName[type] || category || "N/A";

      const area = width * height;
      const image_name = name.toLowerCase().replace(/[-\s]/g, "_");
      const imagePath = `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/viewer3D_images/${image_name}.png`;
      const key = `${image_name}-${width}-${height}-${depth}`;

      if (itemMap.has(key)) {
        const itemData = itemMap.get(key)!;
        itemData.count += 1;
      } else {
        typeCounters[roomName] = (typeCounters[roomName] || 0) + 1;
        const groupId = `${roomName[0].toUpperCase()}${typeCounters[roomName]}`;

        itemMap.set(key, {
          id: groupId,
          name: name,
          roomName: roomName,
          type: type,
          width: width,
          height: height,
          depth: depth,
          area: area,
          count: 1,
          image: imagePath,
        });
      }
    });

    return Array.from(itemMap.values());
  };

  const loadImageAsDataURL = async (imagePath: string): Promise<string> => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataURL = reader.result as string;
          resolve(dataURL);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Failed to load image at path: ${imagePath}`, error);
      return "";
    }
  };

  const generateSchedulePDF = async (
    scheduleItems: ScheduleItem[],
  ): Promise<Blob> => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Door and Window Schedule", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Dimensions are measured in inches", 14, 26);

    const tableColumn = [
      "ID",
      "Type",
      "Model Name",
      "Width",
      "Height",
      "Area",
      "Count",
      "3D Elevation View",
    ];
    const tableRows: any[][] = [];

    for (const item of scheduleItems) {
      const imageDataURL = await loadImageAsDataURL(item.image);

      const rowData = [
        item.id,
        item.type,
        item.modelName,
        item.width.toString(),
        item.height.toString(),
        item.area.toString(),
        item.count.toString(),
        { content: "", image: imageDataURL },
      ];

      tableRows.push(rowData);
    }

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      columnStyles: {
        7: { cellWidth: 40, halign: "center" },
      },
      bodyStyles: {
        minCellHeight: 40,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        halign: "center",
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 7 && data.cell.section === "body") {
          const imageDataURL = data.row.raw[7].image;

          if (imageDataURL) {
            const formatMatch = imageDataURL.match(
              /^data:image\/(png|jpeg);base64,/,
            );
            const format = formatMatch ? formatMatch[1].toUpperCase() : "PNG";
            const isDoor = data.row.raw[1].toLowerCase().includes("door");
            const imgWidth = isDoor ? 20 : 30;
            const imgHeight = 30;
            const paddingX = (data.cell.width - imgWidth) / 2;
            const paddingY = (data.cell.height - imgHeight) / 2;

            doc.addImage(
              imageDataURL,
              format,
              data.cell.x + paddingX,
              data.cell.y + paddingY,
              imgWidth,
              imgHeight,
            );
          }
        }
      },
    });

    return doc.output("blob");
  };

  const generateItemPDF = async (itemData: PDFItemData[]): Promise<Blob> => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Items Schedule", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Dimensions are measured in inches", 14, 26);

    const tableColumn = [
      "ID",
      "Name",
      "Room Name",
      "Type",
      "Width",
      "Height",
      "Depth",
      "Count",
      "Item Image",
    ];
    const tableRows: any[][] = [];

    for (const item of itemData) {
      const imageDataURL = await loadImageAsDataURL(item.image);

      const rowData = [
        item.id,
        item.name,
        item.roomName,
        item.type,
        item.width.toString(),
        item.height.toString(),
        item.depth.toString(),
        item.count.toString(),
        { content: "", image: imageDataURL },
      ];

      tableRows.push(rowData);
    }

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // ID
        1: { cellWidth: 20, halign: "center" }, // Name
        2: { cellWidth: 30, halign: "center" }, // Room Name
        3: { cellWidth: 20, halign: "center" }, // Type
        4: { cellWidth: 15, halign: "center" }, // Width
        5: { cellWidth: 15, halign: "center" }, // Height
        6: { cellWidth: 15, halign: "center" }, // Depth
        7: { cellWidth: 15, halign: "center" }, // Count
        8: { cellWidth: 40, halign: "center" }, // Item Image
      },
      bodyStyles: {
        minCellHeight: 40,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        halign: "center",
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 8 && data.cell.section === "body") {
          const imageDataURL = data.row.raw[8].image;

          if (imageDataURL) {
            const formatMatch = imageDataURL.match(
              /^data:image\/(png|jpeg);base64,/,
            );
            const format = formatMatch ? formatMatch[1].toUpperCase() : "PNG";
            const imgWidth = 30;
            const imgHeight = 30;
            const paddingX = (data.cell.width - imgWidth) / 2;
            const paddingY = (data.cell.height - imgHeight) / 2;

            doc.addImage(
              imageDataURL,
              format,
              data.cell.x + paddingX,
              data.cell.y + paddingY,
              imgWidth,
              imgHeight,
            );
          }
        }
      },
    });

    return doc.output("blob");
  };

  const exportGLTF = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (result) => {
          const output =
            result instanceof ArrayBuffer ? result : JSON.stringify(result);
          const gltfBlob = new Blob([output], { type: "model/gltf-binary" });
          resolve(gltfBlob);
        },
        (error) => {
          console.error("An error occurred during GLTF export", error);
          reject(error);
        },
        { binary: true },
      );
    });
  };

  const createZipFile = async (
    gltfBlob: Blob,
    pdfBlob: Blob,
    itemPdfBlob: Blob,
  ): Promise<Blob> => {
    const zip = new JSZip();
    zip.file("scene.glb", gltfBlob);
    zip.file("door_and_window_schedule.pdf", pdfBlob);
    zip.file("items_schedule.pdf", itemPdfBlob);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  };

  // Export Functionality Ends

  useEffect(() => {
    return () => {
      const disposeObject = (obj: any) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((material: Material) =>
              disposeMaterial(material),
            );
          } else {
            disposeMaterial(obj.material);
          }
        }

        if (obj.children) {
          obj.children.forEach(disposeObject);
        }
      };

      const disposeMaterial = (material: any) => {
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        material.dispose();
      };

      scene.traverse(disposeObject);
    };
  }, [scene]);

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    };
  }, [textures]);

  const Floor = useMemo(() => {
    if (!floorShape) {
      console.log("No floor shape available");
      return null;
    }

    const geometry = new ExtrudeGeometry(floorShape, {
      depth: 1,
      bevelEnabled: false,
    });

    geometry.rotateX(Math.PI / 2);

    const floorTexture = textures.floor;
    floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
    const textureUnitSize = 200000;
    const floorWidth = maxX - minX;
    const floorHeight = maxY - minY;
    const textureRepeatX = floorWidth / textureUnitSize;
    const textureRepeatY = floorHeight / textureUnitSize;
    floorTexture.repeat.set(textureRepeatX, textureRepeatY);

    return (
      <mesh geometry={geometry} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          map={floorTexture}
          // envMap={envMap_floor}
          side={DoubleSide}
          roughness={0.1}
          metalness={0.2}
          reflectivity={0.2}
          clearcoat={0.1}
          clearcoatRoughness={0.7}
          envMapIntensity={0.3}
        />
      </mesh>
    );
  }, [floorShape, textures.floor]);

  const Roof = useMemo(() => {
    if (!showRoof || !floorShape) return null;

    const geometry = new ExtrudeGeometry(floorShape, {
      depth: 1,
      bevelEnabled: false,
    });

    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, wallHeight + 1, 0);

    return (
      <mesh geometry={geometry} position={[0, 0, 0]}>
        <meshStandardMaterial map={textures.roof} side={DoubleSide} />
      </mesh>
    );
  }, [floorShape, showRoof, textures.roof]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!placingItemRef.current) return;

    isDragging.current = true;

    const mouse = new Vector2();
    mouse.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersectPoint = new Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    const itemPosition = new Vector3(
      ...(placingItemRef.current.position || [0, 0, 0]),
    );
    const offset = itemPosition.clone().sub(intersectPoint);
    dragOffset.current = [offset.x, offset.y, offset.z];
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current || !placingItemRef.current) return;
    e.stopPropagation();

    const mouse = new Vector2();
    mouse.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersectPoint = new Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    const newPosition = intersectPoint.clone();
    if (dragOffset.current) {
      newPosition.add(new Vector3(...dragOffset.current));
    }

    if (placingItemRef.current) {
      placingItemRef.current.position = [newPosition.x, 0, newPosition.z];
    }

    if (modelRef.current) {
      modelRef.current.position.set(newPosition.x, 0, newPosition.z);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = false;
    dragOffset.current = null;
    gl.domElement.style.cursor = "default";
  };

  const handlePointerOver = () => {
    if (placingItem) {
      gl.domElement.style.cursor = "move";
    }
  };

  const handlePointerOut = () => {
    gl.domElement.style.cursor = "default";
  };

  const handlePlacedItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const wallBoundingBoxes = useMemo(() => {
    return lines.map((line) => {
      const points = ensureWallPoints(line.points);
      const [x1, y1, x2, y2] = points;
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const wallPosition = new Vector3(
        (x1 + x2) / 2 - centerX,
        wallHeight / 2,
        (y1 + y2) / 2 - centerY,
      );
      const angle = Math.atan2(y2 - y1, x2 - x1);

      const wallGeometry = new BoxGeometry(length, wallHeight, wallThickness);
      const wallMesh = new Mesh(wallGeometry);
      wallMesh.position.copy(wallPosition);
      wallMesh.rotation.y = -angle;
      wallMesh.updateMatrixWorld(true);

      const wallBox = new Box3().setFromObject(wallMesh);
      wallGeometry.dispose();

      return wallBox;
    });
  }, [lines, wallThickness]);

  useEffect(() => {
    placingItemRef.current = placingItem;
    if (!placingItem) {
      isDragging.current = false;
      dragOffset.current = null;
      gl.domElement.style.cursor = "default";
    }
  }, [placingItem, gl.domElement.style]);

  const throttledHandlePointerMove = useMemo(
    () => throttle(handlePointerMove, 16),
    [handlePointerMove],
  );

  useEffect(() => {
    const newPlacedItems = furnitureItems.map((item) => {
      const id = item.id;
      const name = item.name;
      const type = name.toLowerCase().replace(/[-\s]/g, "_");
      const path = `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/glb_files/${type}.glb`;
      const rotationInRadians = -(item.rotation * Math.PI) / 180;

      const adjustedX =
        item.x -
        centerX +
        (Math.cos(rotationInRadians) * item.width) / 2 +
        (Math.sin(rotationInRadians) * item.depth) / 2;

      const adjustedZ =
        item.y -
        centerY -
        (Math.sin(rotationInRadians) * item.width) / 2 +
        (Math.cos(rotationInRadians) * item.depth) / 2;

      const position: [number, number, number] = [adjustedX, 0, adjustedZ];
      const rotation: [number, number, number] = [0, rotationInRadians, 0];

      return {
        id,
        name,
        type,
        path,
        width: item.width,
        height: item.height,
        depth: item.depth,
        position,
        rotation,
        category: item.category,
      };
    });

    setPlacedItems((prevPlacedItems) => [
      ...prevPlacedItems,
      ...newPlacedItems,
    ]);
  }, [furnitureItems, centerX, centerY, setPlacedItems, currentFloorIndex]);

  useEffect(() => {
    const newCeilingPlaced = ceilingItems.map((item) => {
      const id = item.id;
      const name = item.name;
      const type = name.toLowerCase().replace(/[-\s]/g, "_");
      const path = `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/glb_files/${type}.glb`;

      const rotationInRadians = -(item.rotation * Math.PI) / 180;
      const adjustedX =
        item.x -
        centerX +
        (Math.cos(rotationInRadians) * item.width) / 2 +
        (Math.sin(rotationInRadians) * item.depth) / 2;

      const adjustedZ =
        item.y -
        centerY -
        (Math.sin(rotationInRadians) * item.width) / 2 +
        (Math.cos(rotationInRadians) * item.depth) / 2;

      const position: [number, number, number] = [
        adjustedX,
        wallHeight - 32,
        adjustedZ,
      ];
      const rotation: [number, number, number] = [0, rotationInRadians, 0];

      return {
        id,
        name,
        type,
        path,
        width: item.width,
        height: item.height,
        depth: item.depth,
        position,
        rotation,
        category: item.category,
      };
    });
    setPlacedItems((prev) => [...prev, ...newCeilingPlaced]);
  }, [
    ceilingItems,
    wallHeight,
    centerX,
    centerY,
    setPlacedItems,
    currentFloorIndex,
  ]);

  useEffect(() => {
    if (envMap && showRoof) {
      scene.background = envMap;
    }
    return () => {
      scene.background = null;
    };
  }, [envMap, showRoof]);

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((texture) => {
        if (texture) texture.dispose();
      });

      if (envMap) envMap.dispose();
      if (envMap_floor) envMap_floor.dispose();
    };
  }, [textures, envMap, envMap_floor]);

  // Wall Items and Wall Textures Settings

  const handleWallClick = (event: ThreeEvent<MouseEvent>) => {
    if (!placingWallItem) return;

    event.stopPropagation();

    const intersectionPoint = event.point.clone();
    const faceNormal = event.face?.normal.clone();
    if (!faceNormal) {
      console.error("Face normal not found for intersection.");
      return;
    }

    const wallMesh = event.object as Mesh;
    const lineId = wallMesh.userData.lineId;
    const wallNormal = wallMesh.userData.wallNormal;

    const line = lines.find((line) => line.id === lineId);
    if (!line) {
      console.error("Line not found for wall click event.");
      return;
    }

    const isFrontSide = faceNormal.dot(wallNormal) > 0;

    const angle = Math.atan2(
      line.points[3] - line.points[1],
      line.points[2] - line.points[0],
    );
    const rotationY = isFrontSide ? 0 : Math.PI;
    const rotation: [number, number, number] = [0, angle + rotationY, 0];
    const offsetDistance = wallThickness / 2 + 0.1;
    const offset = wallNormal
      .clone()
      .multiplyScalar(isFrontSide ? offsetDistance : -offsetDistance);

    const finalPosition: [number, number, number] = [
      intersectionPoint.x + offset.x,
      intersectionPoint.y + offset.y,
      intersectionPoint.z + offset.z,
    ];

    const newWallItem: WallItem = {
      ...placingWallItem,
      id: uid(),
      position: finalPosition,
      rotation: rotation,
      wallNormal: wallNormal.clone(),
      wallPlane: new Plane().setFromNormalAndCoplanarPoint(
        wallNormal,
        intersectionPoint,
      ),
      lineId: lineId,
    };

    setWallItems((prev) => [...prev, newWallItem]);
    setPlacingWallItem(null);
  };

  const handleWallItemClick = (item: WallItem) => {
    if (selectedWallItem?.id === item.id) {
      setSelectedWallItem(null);
      return;
    }

    setSelectedWallItem({
      ...item,
    });
  };

  const handleWallItemDrag = (
    item: WallItem,
    event: ThreeEvent<PointerEvent>,
  ) => {
    event.stopPropagation();

    if (!item.wallPlane || !item.wallNormal) return;

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersectionPoint = new Vector3();
    raycaster.ray.intersectPlane(item.wallPlane, intersectionPoint);

    if (!intersectionPoint) return;

    const offsetDistance = wallThickness / 2 + 0.1;
    const offset = item.wallNormal.clone().multiplyScalar(offsetDistance);
    const newPosition: [number, number, number] = [
      intersectionPoint.x + offset.x,
      intersectionPoint.y + offset.y,
      intersectionPoint.z + offset.z,
    ];

    const updatedItem = {
      ...item,
      position: newPosition,
    };

    setWallItems((prev) =>
      prev.map((wallItem) =>
        wallItem.id === item.id ? updatedItem : wallItem,
      ),
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedWallItem(null);
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        if (selectedWallItem) {
          setWallItems((prev) =>
            prev.filter((wi) => wi.id !== selectedWallItem.id),
          );
          setSelectedWallItem(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWallItem, setSelectedWallItem, setWallItems]);

  return (
    <>
      <CameraController
        activeTourPoint={activeTourPoint}
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
        disableControls={
          !!placingItem || !!placingWallItem || !!selectedWallItem
        }
      />
      {/* Lights */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 50, 25]} intensity={0.7} />
      <directionalLight position={[-10, 50, -25]} intensity={0.7} />
      <hemisphereLight intensity={0.5} />
      {/* Tour Points */}
      {tourPoints.map((point) => (
        <mesh
          key={point.id}
          position={point.position}
          onClick={() => onTourPointClick(point)}
        >
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}
      {/* Room Labels */}
      {!shouldExport &&
        !activeTourPoint &&
        roomNames.map((room) => (
          <RoomLabel
            key={room.id}
            position={[room.x - centerX, wallHeight / 2, room.y - centerY]}
            name={room.name}
          />
        ))}
      {/* Roof  */}
      {Roof}
      {/* Floor  */}
      {Floor}
      {/* Walls */}
      {lines.map((line) => {
        const points = ensureWallPoints(line.points);
        const [x1, y1, x2, y2] = points;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const wallPosition = new Vector3(
          (x1 + x2) / 2 - centerX,
          wallHeight / 2,
          (y1 + y2) / 2 - centerY,
        );
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const wallNormal = new Vector3(
          -Math.sin(angle),
          0,
          Math.cos(angle),
        ).normalize();
        const wallClass = wallClassifications[line.id];
        const { isOuter, isFacingInward } = wallClass;
        const wallGeometry = new BoxGeometry(length, wallHeight, wallThickness);

        let wallMesh = new Mesh(
          wallGeometry,
          new MeshStandardMaterial({ map: textures.wall, side: FrontSide }),
        );

        const shapesOnWall = shapesByWallId[line.id] || [];

        shapesOnWall.forEach((shape) => {
          const { type, x, y, id } = shape;
          const defaultDims =
            type === "door" ? doorDimensions : windowDimensions;
          const { width: defaultWidth, height: defaultHeight } = defaultDims;
          const shapeDims = shapeDimensionsById[id] || {};
          const width = shapeDims.width || defaultWidth;
          const height = shapeDims.height || defaultHeight;
          const cutoutWidth = width;
          const cutoutHeight = height;
          const shapeWorldX = x - centerX;
          const shapeWorldZ = y - centerY;
          const dx = shapeWorldX - wallPosition.x;
          const dz = shapeWorldZ - wallPosition.z;
          // const alignmentFactor = 1;
          // const localX = dx + (width / 2) * alignmentFactor;
          // const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
          const localX =
            type === "window"
              ? dx * Math.cos(angle) + dz * Math.sin(angle) - 30
              : dx * Math.cos(angle) + dz * Math.sin(angle) + 20;
          const localY = type === "window" ? 0 : -wallHeight / 2 + height / 2;
          const cutoutGeometry = new BoxGeometry(
            cutoutWidth,
            cutoutHeight,
            wallThickness,
          );
          cutoutGeometry.translate(localX, localY, 0);
          const cutoutMesh = new Mesh(cutoutGeometry);
          wallMesh = CSG.subtract(
            wallMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
            cutoutMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
          ) as Mesh<BoxGeometry, MeshStandardMaterial>;
        });
        wallMesh.userData.lineId = line.id;
        wallMesh.userData.wallNormal = wallNormal;
        return (
          <group
            key={line.id}
            position={wallPosition}
            rotation={[0, -angle, 0]}
            onClick={handleWallClick}
          >
            <primitive object={wallMesh} />
            {shapesOnWall.map((shape) => {
              const { type, x, y, id } = shape;
              const defaultModelPath =
                type === "window"
                  ? "window/window.glb"
                  : isOuter
                    ? "door/door.glb"
                    : "door/door_wooden_2.glb";

              const modelPath = modelPathsByShapeId[id] || defaultModelPath;
              const flipStatus = shapeFlipStatusById[id] || false;
              const defaultDims =
                type === "door" ? doorDimensions : windowDimensions;
              const shapeDims = shapeDimensionsById[id] || defaultDims;
              const { width, height } = shapeDims;
              const shapeWorldX = x - centerX;
              const shapeWorldZ = y - centerY;
              const dx = shapeWorldX - wallPosition.x;
              const dz = shapeWorldZ - wallPosition.z;
              // const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
              const localX =
                type === "window"
                  ? dx * Math.cos(angle) + dz * Math.sin(angle) - 30
                  : dx * Math.cos(angle) + dz * Math.sin(angle) + 20;
              // const alignmentFactor = 1;
              // const localX = dx + (width / 2) * alignmentFactor;
              const localY =
                type === "window" ? 0 : -wallHeight / 2 + height / 2;
              const rotationY =
                type === "door"
                  ? isFacingInward
                    ? Math.PI
                    : 0
                  : isFacingInward
                    ? 0
                    : Math.PI;
              const adjustedRotationY = flipStatus
                ? rotationY
                : rotationY + Math.PI;

              return (
                <Model
                  key={id}
                  path={modelPath}
                  position={[localX, localY, 0]}
                  rotation={[0, adjustedRotationY, 0]}
                  type={type}
                  wallThickness={wallThickness}
                  wallHeight={wallHeight}
                  width={width}
                  height={height}
                  onClick={() => onModelClick(shape)}
                />
              );
            })}
          </group>
        );
      })}
      {/* Currently placing item */}
      {placingItem && (
        <ItemModel
          ref={modelRef}
          key="placing-item"
          path={placingItem.path}
          position={placingItem.position || [0, 0, 0]}
          rotation={placingItem.rotation || [0, 0, 0]}
          dimensions={{
            width: placingItem.width,
            height: placingItem.height,
            depth: placingItem.depth,
          }}
          wallBoundingBoxes={wallBoundingBoxes}
          onPointerDown={handlePointerDown}
          onPointerMove={throttledHandlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      )}

      {/* Placed items */}
      {!activeTourPoint &&
        placedItems
          .filter(
            (item) =>
              !ceilingItems.some((ceilingItem) => ceilingItem.id === item.id),
          )
          .map((item) => (
            <ItemModel
              key={item.id}
              path={item.path}
              position={item.position || [0, 0, 0]}
              rotation={item.rotation || [0, 0, 0]}
              dimensions={{
                width: item.width,
                height: item.height,
                depth: item.depth,
              }}
              wallBoundingBoxes={wallBoundingBoxes}
              onClick={() => handlePlacedItemClick(item)}
            />
          ))}

      {activeTourPoint &&
        placedItems.map((item) => (
          <ItemModel
            key={item.id}
            path={item.path}
            position={item.position || [0, 0, 0]}
            rotation={item.rotation || [0, 0, 0]}
            dimensions={{
              width: item.width,
              height: item.height,
              depth: item.depth,
            }}
            wallBoundingBoxes={wallBoundingBoxes}
            onClick={() => handlePlacedItemClick(item)}
          />
        ))}

      {placingWallItem && (
        <WallItemModel
          ref={modelRef}
          key="placing-wall-item"
          path={placingWallItem.path}
          position={placingWallItem.position || [0, 0, 0]}
          rotation={placingWallItem.rotation || [0, 0, 0]}
          dimensions={{
            width: placingWallItem.width,
            height: placingWallItem.height,
            depth: placingWallItem.depth,
          }}
          wallBoundingBoxes={wallBoundingBoxes}
        />
      )}

      {/* Placed wall items */}
      {wallItems.map((item) => (
        <WallItemModel
          key={item.id}
          path={item.path}
          position={item.position}
          rotation={item.rotation}
          dimensions={{
            width: item.width,
            height: item.height,
            depth: item.depth,
          }}
          wallNormal={item.wallNormal}
          wallPlane={item.wallPlane}
          wallBoundingBoxes={wallBoundingBoxes}
          onClick={() => handleWallItemClick(item)}
          onPointerDown={() => setSelectedWallItem(item)}
          onPointerMove={(event) =>
            selectedWallItem && handleWallItemDrag(selectedWallItem, event)
          }
        />
      ))}
    </>
  );
};

export default SceneContent;
