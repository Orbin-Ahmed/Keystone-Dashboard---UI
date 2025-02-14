import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ItemOption,
  PlacedItemType,
  PlacingItemType,
  Plan3DViewerProps,
  SelectedWallItem,
  ShapeData,
  TourPoint,
  WallItem,
} from "@/types";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import CustomButton from "@/components/CustomButton";
import SceneContent, {
  ensureWallPoints,
} from "@/components/Planner3DViewer/SceneContent";
import ItemSidebar from "./ItemSidebar";
// import Stats from "stats.js";
import TourPointsList from "./sidebar/TourPointsList";
import ZoomControls from "./sidebar/ZoomControls";
import ModelSelectionSidebar from "./sidebar/ModelSelectionSidebar";
import ConfirmPlacementControls from "./sidebar/ConfirmPlacementControls";
import SelectedItemControls from "./sidebar/SelectedItemControls";
import SettingsModal from "./sidebar/SettingsModal";
import AddItemSidebar from "./sidebar/AddItemSidebar";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { Spinner } from "@radix-ui/themes";
import { uid } from "uid";
import SelectedWallItemControls from "./sidebar/SelectedWallItemControls";
import CustomizeItemModal from "./Modal/CustomizeItemModal";

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({
  lines,
  shapes,
  setShapes,
  roomNames,
  floorPlanPoints,
  centerX,
  centerY,
  minX,
  maxX,
  minY,
  maxY,
  furnitureItems,
  setFurnitureItems,
  ceilingItems,
  setCeilingItems,
  currentFloorIndex,
  wallItems2D,
  setWallItems2D,
}) => {
  const [activeTourPoint, setActiveTourPoint] = useState<TourPoint | null>(
    null,
  );
  const [shouldExport, setShouldExport] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showRoof, setShowRoof] = useState(false);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const glRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  // const statsRef = useRef<Stats | null>(null);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [localSceneImages, setLocalSceneImages] = useState<
    { id: string; url: string; finalUrl?: string; loading: boolean }[]
  >([]);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Window and Door Shape Data
  const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);
  const [modelPathsByShapeId, setModelPathsByShapeId] = useState<
    Record<string, string>
  >({});
  const [newWidth, setNewWidth] = useState<number | "">("");
  const [newHeight, setNewHeight] = useState<number | "">("");
  const [flipShape, setFlipShape] = useState<boolean>(false);
  const [shapeDimensionsById, setShapeDimensionsById] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [selectedModelPath, setSelectedModelPath] = useState<string | null>(
    null,
  );
  const [shapeFlipStatusById, setShapeFlipStatusById] = useState<
    Record<string, boolean>
  >({});

  // Item states
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [placingItem, setPlacingItem] = useState<PlacingItemType | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedItemType[]>([]);
  const [lastPlacedItemId, setLastPlacedItemId] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PlacedItemType | null>(null);

  const [placingWallItem, setPlacingWallItem] = useState<WallItem | null>(null);
  const [wallItems, setWallItems] = useState<WallItem[]>([]);
  const [selectedWallItem, setSelectedWallItem] =
    useState<SelectedWallItem | null>(null);
  const [isWallItemMoving, setIsWallItemMoving] = useState(false);
  const [originalWallItemPos, setOriginalWallItemPos] = useState<
    [number, number, number] | null
  >(null);
  const [originalWallItemRot, setOriginalWallItemRot] = useState<
    [number, number, number] | null
  >(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wallHeightSetting, setWallHeightSetting] = useState<number>(120);
  const [wallThicknessSetting, setWallThicknessSetting] = useState<number>(6);
  const [wallTextureSetting, setWallTextureSetting] = useState<string>(
    `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/textures/Yellow_Ceiling.png`,
  );
  const [floorTextureSetting, setFloorTextureSetting] = useState<string>(
    `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/textures/Crema_Marfil_Marble.jpg`,
  );
  const [ceilingTextureSetting, setCeilingTextureSetting] = useState<string>(
    `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/textures/Yellow_Wall.png`,
  );

  const [doorOptions, setDoorOptions] = useState<ItemOption[]>([]);
  const [windowOptions, setWindowOptions] = useState<ItemOption[]>([]);

  const fetchDoorAndWindowOptions = async () => {
    try {
      const doorResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/filtered-items/?type=Door`,
      );
      if (!doorResponse.ok) {
        throw new Error(
          `Error fetching door items: ${doorResponse.statusText}`,
        );
      }
      const doorData = await doorResponse.json();

      const doorOptions = doorData.map((item: any) => ({
        label: item.item_name,
        value: `${process.env.NEXT_PUBLIC_API_MEDIA_URL}${item.glb_file}`,
        height: item.height,
        width: item.width,
      }));
      setDoorOptions(doorOptions);

      const windowResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/filtered-items/?type=Window`,
      );

      if (!windowResponse.ok) {
        throw new Error(
          `Error fetching window items: ${windowResponse.statusText}`,
        );
      }
      const windowData = await windowResponse.json();

      const windowOptions = windowData.map((item: any) => ({
        label: item.item_name,
        value: `${process.env.NEXT_PUBLIC_API_MEDIA_URL}${item.glb_file}`,
        height: item.height,
        width: item.width,
      }));

      setWindowOptions(windowOptions);

      return { doorOptions, windowOptions };
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchDoorAndWindowOptions();
  }, []);

  const defaultDimensions = {
    door: { width: 50, height: 100 },
    window: { width: 70, height: 50 },
  };

  const DIMENSIONS_2D = {
    door: { width: 40, height: 40 },
    window: { width: 70, height: 8 },
  };

  const EYE_LEVEL = 70;

  const tourPoints = useMemo(
    () =>
      roomNames.map((room) => ({
        // id: room.name.toLowerCase().replace(/\s+/g, "-"),
        id: uid(16),
        position: [
          room.x -
            (Math.min(...lines.flatMap((l) => [l.points[0], l.points[2]])) +
              Math.max(...lines.flatMap((l) => [l.points[0], l.points[2]]))) /
              2,
          EYE_LEVEL,
          room.y -
            (Math.min(...lines.flatMap((l) => [l.points[1], l.points[3]])) +
              Math.max(...lines.flatMap((l) => [l.points[1], l.points[3]]))) /
              2,
        ] as [number, number, number],
        lookAt: [
          room.x -
            (Math.min(...lines.flatMap((l) => [l.points[0], l.points[2]])) +
              Math.max(...lines.flatMap((l) => [l.points[0], l.points[2]]))) /
              2,
          EYE_LEVEL - 10,
          room.y -
            (Math.min(...lines.flatMap((l) => [l.points[1], l.points[3]])) +
              Math.max(...lines.flatMap((l) => [l.points[1], l.points[3]]))) /
              2,
        ] as [number, number, number],
        title: room.name,
      })),
    [roomNames],
  );

  const handleTourPointClick = (point: TourPoint) => {
    setActiveTourPoint(point);
    setIsTransitioning(true);
    setIsAutoRotating(true);
    setShowRoof(true);
  };

  // const wallClassifications = useMemo(() => {
  //   const classifications: Record<string, WallClassification> = {};
  //   const tolerance = 5;

  //   const wallEndpoints: Array<[number, number, number, number]> = [];
  //   const wallIds: string[] = [];

  //   lines.forEach((line) => {
  //     wallEndpoints.push(ensureWallPoints(line.points));
  //     wallIds.push(line.id);
  //   });

  //   wallEndpoints.forEach((wall, wallIndex) => {
  //     const [x1, y1, x2, y2] = wall;
  //     const wallId = wallIds[wallIndex];
  //     const wallCenter = new Vector2((x1 + x2) / 2, (y1 + y2) / 2);
  //     const wallNormal = new Vector2(-(y2 - y1), x2 - x1).normalize();
  //     const toCenterVector = new Vector2(
  //       centerX - wallCenter.x,
  //       centerY - wallCenter.y,
  //     ).normalize();

  //     const isFacingInward = wallNormal.dot(toCenterVector) > 0;
  //     const isHorizontal = Math.abs(y1 - y2) < tolerance;
  //     const isVertical = Math.abs(x1 - x2) < tolerance;

  //     const isAtHorizontalBoundary =
  //       Math.abs(y1 - minY) < tolerance ||
  //       Math.abs(y1 - maxY) < tolerance ||
  //       Math.abs(y2 - minY) < tolerance ||
  //       Math.abs(y2 - maxY) < tolerance;

  //     const isAtVerticalBoundary =
  //       Math.abs(x1 - minX) < tolerance ||
  //       Math.abs(x1 - maxX) < tolerance ||
  //       Math.abs(x2 - minX) < tolerance ||
  //       Math.abs(x2 - maxX) < tolerance;

  //     const isOuter =
  //       (isHorizontal && isAtHorizontalBoundary) ||
  //       (isVertical && isAtVerticalBoundary);

  //     classifications[wallId] = {
  //       isOuter,
  //       isFacingInward,
  //     };
  //   });

  //   return classifications;
  // }, [lines]);

  const handleExitTour = () => {
    setActiveTourPoint(null);
    setIsAutoRotating(false);
    setShowRoof(false);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 300, 500);
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.zoom = Math.min(cameraRef.current.zoom + 0.1, 5);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.zoom = Math.max(cameraRef.current.zoom - 0.1, 0.5);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const toggleTourList = () => {
    setIsSettingsOpen(false);
    setIsTourOpen((prev) => !prev);
    setIsItemsOpen(false);
  };

  const handleCloseSidebar = () => {
    setSelectedShape(null);
  };

  const handleItemClick = (item: PlacingItemType) => {
    setIsSettingsOpen(false);
    setPlacingItem((prev) => ({
      ...item,
      position: prev?.position || [0, 0, 0],
      rotation: prev?.rotation || [0, 0, 0],
    }));
    setIsItemsOpen(false);
  };

  const confirmPlacement = () => {
    if (placingItem) {
      const newId = placingItem.id || uid();

      const newItem: PlacedItemType = {
        ...placingItem,
        id: newId,
        position: placingItem.position || [0, 0, 0],
        rotation: placingItem.rotation || [0, 0, 0],
      };

      setPlacedItems((prev) => [...prev, newItem]);
      if (!placingItem.id) {
        setLastPlacedItemId((prev) => prev + 1);
      }

      // add to 2D furniture list
      const rotationInDegrees = -(newItem.rotation[1] * 180) / Math.PI;

      const adjustedX =
        newItem.position[0] -
        (Math.cos(newItem.rotation[1]) * newItem.width) / 2 -
        (Math.sin(newItem.rotation[1]) * newItem.depth) / 2 +
        centerX;

      const adjustedY =
        newItem.position[2] +
        (Math.sin(newItem.rotation[1]) * newItem.width) / 2 -
        (Math.cos(newItem.rotation[1]) * newItem.depth) / 2 +
        centerY;

      const newFurnitureItem = {
        id: newId,
        x: adjustedX,
        y: adjustedY,
        name: placingItem.name || "Unnamed Item",
        width: placingItem.width,
        height: placingItem.height,
        depth: placingItem.depth,
        rotation: rotationInDegrees,
        category: placingItem.category || "Uncategorized",
        imageSrc: `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/viewer2d_images/${placingItem.name
          .toLowerCase()
          .replace(/[-\s]/g, "_")}.png`,
      };

      setFurnitureItems((prev) => {
        const filtered = prev.filter((item) => item.id !== newId);
        return [...filtered, newFurnitureItem];
      });

      setLastPlacedItemId((prev) => prev + 1);
      setPlacingItem(null);
    }
  };

  const rotatePlacingItemLeft = () => {
    if (placingItem) {
      const currentRotation = placingItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] - Math.PI / 8;
      setPlacingItem({
        ...placingItem,
        rotation: [currentRotation[0], newRotationY, currentRotation[2]],
      });
    }
  };

  const rotatePlacingItemRight = () => {
    if (placingItem) {
      const currentRotation = placingItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] + Math.PI / 8;
      setPlacingItem({
        ...placingItem,
        rotation: [currentRotation[0], newRotationY, currentRotation[2]],
      });
    }
  };

  const deselectItem = () => {
    setSelectedItem(null);
  };

  const handleCustomizeClick = () => {
    setIsCustomizeModalOpen(true);
  };

  const handleApplyCustomization = (color: string, textureFile?: File) => {
    console.log("Customization applied:", { color, textureFile });
  };

  const moveSelectedItem = () => {
    if (selectedItem) {
      setPlacingItem(selectedItem);
      setPlacedItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItem.id),
      );
      setSelectedItem(null);
    }
  };

  const rotateSelectedItemLeft = () => {
    if (selectedItem) {
      const currentRotation = selectedItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] - Math.PI / 8;
      updateSelectedItemRotation(newRotationY);
    }
  };

  const rotateSelectedItemRight = () => {
    if (selectedItem) {
      const currentRotation = selectedItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] + Math.PI / 8;
      updateSelectedItemRotation(newRotationY);
    }
  };

  const deleteSelectedItem = () => {
    if (selectedItem) {
      setPlacedItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItem.id),
      );
      setFurnitureItems((prev) =>
        prev.filter((item) => item.id !== selectedItem.id),
      );
      setSelectedItem(null);
    }
  };

  const updateSelectedItemRotation = (newRotationY: number) => {
    if (selectedItem) {
      const updatedRotation: [number, number, number] = [
        selectedItem.rotation![0],
        newRotationY,
        selectedItem.rotation![2],
      ];
      const updatedItem: PlacedItemType = {
        ...selectedItem,
        rotation: updatedRotation,
      };
      setPlacedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id ? updatedItem : item,
        ),
      );
      setSelectedItem(updatedItem);
    }
  };

  const handleModelClick = (shape: ShapeData) => {
    setSelectedShape(shape);
    setIsTourOpen(false);
    setIsSettingsOpen(false);
    const savedDimensions = shapeDimensionsById[shape.id];
    const defaultDims = defaultDimensions[shape.type];

    setNewWidth(savedDimensions?.width ?? shape.width ?? defaultDims.width);

    setNewHeight(savedDimensions?.height ?? shape.height ?? defaultDims.height);

    const currentModelPath =
      modelPathsByShapeId[shape.id] || shape.variant || "";
    setSelectedModelPath(currentModelPath);

    const flipStatus = shapeFlipStatusById[shape.id] || false;
    setFlipShape(flipStatus);
  };

  const handleWidthChange = (value: number | "") => {
    setNewWidth(value);
  };

  const handleHeightChange = (value: number | "") => {
    setNewHeight(value);
  };

  const handleModelPathChange = (path: string | null) => {
    setSelectedModelPath(path);

    if (selectedShape && path) {
      const options =
        selectedShape.type === "door" ? doorOptions : windowOptions;
      const selectedOption = options.find((option) => option.value === path);

      if (selectedOption) {
        setNewWidth(selectedOption.width);
        setNewHeight(selectedOption.height);
      }
    }
  };

  const handleSaveChanges = () => {
    if (selectedShape) {
      const shapeUpdates: Partial<ShapeData> = {};

      if (typeof newWidth === "number" && typeof newHeight === "number") {
        setShapeDimensionsById((prev) => ({
          ...prev,
          [selectedShape.id]: {
            width: newWidth,
            height: newHeight,
          },
        }));

        shapeUpdates.width = newWidth;
        shapeUpdates.height = newHeight;
      }

      if (selectedModelPath) {
        setModelPathsByShapeId((prev) => ({
          ...prev,
          [selectedShape.id]: selectedModelPath,
        }));
        shapeUpdates.variant = selectedModelPath;
      }

      setShapeFlipStatusById((prev) => ({
        ...prev,
        [selectedShape.id]: flipShape,
      }));

      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === selectedShape.id
            ? {
                ...shape,
                ...shapeUpdates,
                variant: shapeUpdates.variant || shape.variant || "default",
              }
            : shape,
        ),
      );

      setSelectedShape(null);
      setNewWidth("");
      setNewHeight("");
      setSelectedModelPath(null);
      setFlipShape(false);
    }
  };

  useEffect(() => {
    const initialDimensions: Record<string, { width: number; height: number }> =
      {};

    shapes.forEach((shape) => {
      const is2DDimensions =
        shape.width === DIMENSIONS_2D[shape.type]?.width &&
        shape.height === DIMENSIONS_2D[shape.type]?.height;

      if (is2DDimensions) {
        initialDimensions[shape.id] = {
          width: defaultDimensions[shape.type].width,
          height: defaultDimensions[shape.type].height,
        };
      } else {
        initialDimensions[shape.id] = {
          width:
            shape.width && shape.width > 49
              ? shape.width
              : defaultDimensions[shape.type].width,
          height: shape.height || defaultDimensions[shape.type].height,
        };
      }
    });

    setShapeDimensionsById(initialDimensions);
  }, [shapes]);

  const handleSnap = async () => {
    if (glRef.current && cameraRef.current && sceneRef.current) {
      const renderer = glRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      renderer.render(scene, camera);
      const dataURL = renderer.domElement.toDataURL("image/jpeg");

      const link = document.createElement("a");
      link.download = "scene.jpg";
      link.href = dataURL;
      link.click();
      if (activeTourPoint) {
        const imageID = uid(16);
        setLocalSceneImages((prevImages) => [
          ...prevImages,
          { id: imageID, url: dataURL, loading: true },
        ]);
        const formData = new FormData();
        const input = {
          image: await fetch(dataURL)
            .then((res) => res.blob())
            .then(
              (blob) => new File([blob], "scene.jpg", { type: "image/jpeg" }),
            ),
          prompt: `A ${activeTourPoint.title.toLowerCase()}`,
          guidance_scale: 5,
          prompt_strength: 0.9,
          num_inference_steps: 60,
          negative_prompt:
            "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, functional, realistic",
        };

        formData.append("image", input.image);
        formData.append("prompt", input.prompt);
        formData.append("guidance_scale", input.guidance_scale.toString());
        formData.append("prompt_strength", input.prompt_strength.toString());
        formData.append(
          "num_inference_steps",
          input.num_inference_steps.toString(),
        );
        formData.append("negative_prompt", input.negative_prompt);
        formData.append("imageID", imageID);

        // Send the API request
        try {
          const response = await fetch("/api/revampv2", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            console.log("API Response:", data);
          } else {
            console.error("API Error:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Fetch Error:", error);
        }
      }
    }
  };

  const pollForFinalImages = async () => {
    try {
      const pendingImages = localSceneImages.filter((img) => img.loading);
      if (pendingImages.length === 0) {
        return;
      }
      const updatedImages = await Promise.all(
        pendingImages.map(async (img) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}api/get-image-url/?imageID=${img.id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
                },
              },
            );

            if (!response.ok) {
              console.error(
                `Error fetching image URL for ID ${img.id}:`,
                response.status,
                response.statusText,
              );
              return img;
            }

            const data = await response.json();
            if (data.imageURL === "pending") {
              return {
                ...img,
                loading: true,
              };
            }

            const arrayString = data.imageURL.replace(/'/g, '"');
            const urlArray = JSON.parse(arrayString);
            const finalLink = urlArray[0];

            return {
              ...img,
              finalUrl: finalLink,
              loading: false,
            };
          } catch (error) {
            console.error(`Error fetching image URL for ID ${img.id}:`, error);
            return img;
          }
        }),
      );
      setLocalSceneImages((prevImages) => {
        const updatedMap = new Map<string, (typeof updatedImages)[number]>();
        for (const updatedImg of updatedImages) {
          updatedMap.set(updatedImg.id, updatedImg);
        }

        return prevImages.map((origImg) => {
          if (updatedMap.has(origImg.id)) {
            return updatedMap.get(origImg.id)!;
          }
          return origImg;
        });
      });
    } catch (error) {
      console.error("Error in polling function:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const hasPending = localSceneImages.some((img) => img.loading);
      if (hasPending) {
        pollForFinalImages();
      } else {
        clearInterval(interval);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [localSceneImages]);

  // Wall Item Control

  const handleIncrementWallItemZ = () => {
    if (!selectedWallItem) return;
    setWallItems((prev) =>
      prev.map((wi) =>
        wi.id === selectedWallItem.id
          ? {
              ...wi,
              position: [wi.position[0], wi.position[1], wi.position[2] + 1],
            }
          : wi,
      ),
    );
  };

  const handleDecrementWallItemZ = () => {
    if (!selectedWallItem) return;
    setWallItems((prev) =>
      prev.map((wi) =>
        wi.id === selectedWallItem.id
          ? {
              ...wi,
              position: [wi.position[0], wi.position[1], wi.position[2] - 1],
            }
          : wi,
      ),
    );
  };

  const handlePlaceWallItem = () => {
    setIsWallItemMoving(false);
    setOriginalWallItemPos(null);
    setOriginalWallItemRot(null);
    if (selectedWallItem) {
      const updatedWallItem = wallItems.find(
        (wi) => wi.id === selectedWallItem.id,
      );
      if (updatedWallItem) {
        updateWallItems2D(updatedWallItem);
      }
    }
  };

  const updateWallItems2D = (updatedItem: WallItem) => {
    const adjustedRotation = -(updatedItem.rotation[1] * 180) / Math.PI;

    const adjustedX =
      updatedItem.position[0] -
      (Math.cos(updatedItem.rotation[1]) * updatedItem.width) / 2 -
      (Math.sin(updatedItem.rotation[1]) * updatedItem.depth) / 2 +
      centerX;

    const adjustedY =
      updatedItem.position[2] +
      (Math.sin(updatedItem.rotation[1]) * updatedItem.width) / 2 -
      (Math.cos(updatedItem.rotation[1]) * updatedItem.depth) / 2 +
      centerY;

    const adjustedZ = updatedItem.position[1];

    setWallItems2D((prev) =>
      prev.map((item) => {
        if (item.id !== updatedItem.id) {
          return item;
        }

        return {
          ...item,
          x: adjustedX,
          y: adjustedY,
          z: adjustedZ,
          rotation: adjustedRotation,
        };
      }),
    );
  };

  const handleDeselectWallItem = () => {
    if (isWallItemMoving && selectedWallItem && originalWallItemPos) {
      setWallItems((prev) =>
        prev.map((wi) =>
          wi.id === selectedWallItem.id
            ? { ...wi, position: [...originalWallItemPos] }
            : wi,
        ),
      );
    }
    setIsWallItemMoving(false);
    setSelectedWallItem(null);
    setOriginalWallItemPos(null);
  };

  const handleDeleteWallItem = () => {
    if (!selectedWallItem) return;
    setWallItems((prev) => prev.filter((wi) => wi.id !== selectedWallItem.id));
    setWallItems2D((prev) =>
      prev.filter((wi2d) => wi2d.id !== selectedWallItem.id),
    );
    setSelectedWallItem(null);
    setIsWallItemMoving(false);
  };

  const handleStartMoveWallItem = () => {
    if (!selectedWallItem) return;
    setIsWallItemMoving(true);
    setOriginalWallItemPos([...selectedWallItem.position]);
    setOriginalWallItemRot([...selectedWallItem.rotation]);
  };

  const handleCancelMoveWallItem = () => {
    if (selectedWallItem && originalWallItemPos && originalWallItemRot) {
      setWallItems((prev) =>
        prev.map((wi) =>
          wi.id === selectedWallItem.id
            ? {
                ...wi,
                position: [...originalWallItemPos],
                rotation: [...originalWallItemRot],
              }
            : wi,
        ),
      );
    }
    setIsWallItemMoving(false);
    setOriginalWallItemPos(null);
    setOriginalWallItemRot(null);
  };

  const handleRotateWallItemLeft = () => {
    if (!selectedWallItem) return;
    setWallItems((prev) =>
      prev.map((wi) =>
        wi.id === selectedWallItem.id
          ? {
              ...wi,
              rotation: [
                wi.rotation[0],
                wi.rotation[1] - Math.PI / 8,
                wi.rotation[2],
              ],
            }
          : wi,
      ),
    );
  };

  const handleRotateWallItemRight = () => {
    if (!selectedWallItem) return;
    setWallItems((prev) =>
      prev.map((wi) =>
        wi.id === selectedWallItem.id
          ? {
              ...wi,
              rotation: [
                wi.rotation[0],
                wi.rotation[1] + Math.PI / 8,
                wi.rotation[2],
              ],
            }
          : wi,
      ),
    );
  };

  // Wall Item Control end

  // useEffect(() => {
  //   const stats = new Stats();
  //   stats.showPanel(0);
  //   statsRef.current = stats;
  //   document.body.appendChild(stats.dom);

  //   return () => {
  //     document.body.removeChild(stats.dom);
  //   };
  // }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 300, 500], fov: 65, near: 1, far: 2000 }}
        onCreated={({ camera, gl, scene }) => {
          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          glRef.current = gl;
          sceneRef.current = scene;
          // gl.autoClear = false;
          // gl.setAnimationLoop(() => {
          //   if (statsRef.current) statsRef.current.begin();
          //   gl.render(scene, camera);
          //   if (statsRef.current) statsRef.current.end();
          // });
        }}
      >
        <SceneContent
          lines={lines}
          shapes={shapes}
          roomNames={roomNames}
          activeTourPoint={activeTourPoint}
          isTransitioning={isTransitioning}
          setIsTransitioning={setIsTransitioning}
          isAutoRotating={isAutoRotating}
          setIsAutoRotating={setIsAutoRotating}
          showRoof={showRoof}
          setShowRoof={setShowRoof}
          tourPoints={tourPoints}
          onTourPointClick={handleTourPointClick}
          floorPlanPoints={floorPlanPoints}
          centerX={centerX}
          centerY={centerY}
          minX={minX}
          maxX={maxX}
          minY={minY}
          maxY={maxY}
          onModelClick={handleModelClick}
          modelPathsByShapeId={modelPathsByShapeId}
          shapeDimensionsById={shapeDimensionsById}
          shouldExport={shouldExport}
          setShouldExport={setShouldExport}
          placingItem={placingItem}
          setPlacingItem={setPlacingItem}
          placedItems={placedItems}
          setPlacedItems={setPlacedItems}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          wallHeight={wallHeightSetting}
          wallThickness={wallThicknessSetting}
          wallTexture={wallTextureSetting}
          floorTexture={floorTextureSetting}
          ceilingTexture={ceilingTextureSetting}
          shapeFlipStatusById={shapeFlipStatusById}
          furnitureItems={furnitureItems}
          setFurnitureItems={setFurnitureItems}
          placingWallItem={placingWallItem}
          setPlacingWallItem={setPlacingWallItem}
          wallItems={wallItems}
          setWallItems={setWallItems}
          selectedWallItem={selectedWallItem}
          setSelectedWallItem={setSelectedWallItem}
          ceilingItems={ceilingItems}
          setCeilingItems={setCeilingItems}
          currentFloorIndex={currentFloorIndex}
          wallItems2D={wallItems2D}
          setWallItems2D={setWallItems2D}
          isWallItemMoving={isWallItemMoving}
        />
      </Canvas>

      <div className="absolute left-4 top-4 z-50">
        <CustomButton
          variant="tertiary"
          onClick={() => setIsDesignOpen(!isDesignOpen)}
        >
          {!isDesignOpen ? "Design" : <FaArrowLeft />}
        </CustomButton>
      </div>

      {isDesignOpen && (
        <div className="absolute left-0 top-0 z-40 h-full w-80 overflow-auto bg-white p-4 shadow-md">
          <h2 className="mb-4 mt-12 text-lg font-semibold">
            AI Rendered Design
          </h2>
          {localSceneImages.length === 0 && (
            <p className="text-gray-500">No scene snapshots yet.</p>
          )}
          {localSceneImages.map((image, index) => (
            <div key={image.id} className="relative mb-4">
              <img
                src={image.finalUrl || image.url}
                alt={`3D Scene ${index + 1}`}
                className="w-full rounded object-cover"
              />
              {image.loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <Spinner />
                </div>
              ) : image.finalUrl ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={async () => {
                      if (image.finalUrl) {
                        try {
                          const response = await fetch(image.finalUrl);
                          const blob = await response.blob();
                          const objectUrl = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = objectUrl;
                          link.download = `rendered_design_${image.id}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(objectUrl);
                        } catch (err) {
                          console.error("Download failed:", err);
                        }
                      } else {
                        alert("The final image URL is not available yet.");
                      }
                    }}
                    className="text-white hover:text-blue-500"
                  >
                    <FaDownload size={24} />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {!selectedShape && (
        <div className="absolute right-4 top-4">
          <div className="flex gap-4">
            <CustomButton variant="tertiary" onClick={toggleTourList}>
              Tour Points
            </CustomButton>
            <AddItemSidebar
              onToggleItems={() => {
                setIsItemsOpen((prev) => !prev);
                setIsSettingsOpen(false);
                setIsTourOpen(false);
              }}
            />
          </div>

          {/* Tour Points List */}
          {isTourOpen && (
            <TourPointsList
              tourPoints={tourPoints}
              activeTourPoint={activeTourPoint}
              onTourPointClick={handleTourPointClick}
              onExitTour={handleExitTour}
            />
          )}

          {/* Items Sidebar */}
          {isItemsOpen && !activeTourPoint && (
            <ItemSidebar onItemClick={handleItemClick} />
          )}
        </div>
      )}

      {/* Zoom Controls and Export Button */}
      <ZoomControls
        onSnap={handleSnap}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={() => setShouldExport(true)}
        onToggleSettings={() => {
          setIsSettingsOpen((prev) => !prev);
          setIsItemsOpen(false);
          setIsTourOpen(false);
        }}
      />

      {/* Sidebar for Model Selection */}
      {selectedShape && (
        <ModelSelectionSidebar
          selectedShape={selectedShape}
          flipShape={flipShape}
          setFlipShape={setFlipShape}
          newWidth={newWidth}
          newHeight={newHeight}
          selectedModelPath={selectedModelPath}
          setSelectedModelPath={handleModelPathChange}
          doorOptions={doorOptions}
          windowOptions={windowOptions}
          onSaveChanges={handleSaveChanges}
          onClose={handleCloseSidebar}
          setNewWidth={handleWidthChange}
          setNewHeight={handleHeightChange}
        />
      )}

      {/* Confirm Placement Controls */}
      {placingItem && (
        <ConfirmPlacementControls
          onConfirmPlacement={confirmPlacement}
          onRotateLeft={rotatePlacingItemLeft}
          onRotateRight={rotatePlacingItemRight}
        />
      )}

      {/* Controls for Selected Item */}
      {selectedItem && (
        <SelectedItemControls
          onDeselect={deselectItem}
          onMove={moveSelectedItem}
          onRotateLeft={rotateSelectedItemLeft}
          onRotateRight={rotateSelectedItemRight}
          onDelete={deleteSelectedItem}
          onCustomize={handleCustomizeClick}
        />
      )}

      {isCustomizeModalOpen && selectedItem && (
        <CustomizeItemModal
          modelPath={selectedItem.path}
          onClose={() => setIsCustomizeModalOpen(false)}
          onApply={handleApplyCustomization}
        />
      )}

      {selectedWallItem && (
        <SelectedWallItemControls
          selectedWallItem={selectedWallItem}
          isMovingWallItem={isWallItemMoving}
          onDeselect={handleDeselectWallItem}
          onStartMove={handleStartMoveWallItem}
          onCancelMove={handleCancelMoveWallItem}
          onRotateLeft={handleRotateWallItemLeft}
          onRotateRight={handleRotateWallItemRight}
          onIncrementZ={handleIncrementWallItemZ}
          onDecrementZ={handleDecrementWallItemZ}
          onPlaceItem={handlePlaceWallItem}
          onDelete={handleDeleteWallItem}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          wallHeight={wallHeightSetting}
          wallThickness={wallThicknessSetting}
          wallTexture={wallTextureSetting}
          floorTexture={floorTextureSetting}
          ceilingTexture={ceilingTextureSetting}
          onWallHeightChange={setWallHeightSetting}
          onWallThicknessChange={setWallThicknessSetting}
          onWallTextureChange={setWallTextureSetting}
          onFloorTextureChange={setFloorTextureSetting}
          onCeilingTextureChange={setCeilingTextureSetting}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default Plan3DViewer;
