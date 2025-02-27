"use client";
import CustomButton from "@/components/CustomButton";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";
import { Scene, Camera, Vector3, WebGLRenderer } from "three";
import { TourPoint } from "@/types";
import { SegmentedControl } from "@radix-ui/themes";

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenderComplete: (imageUrl: string) => void;
  scene: Scene;
  camera: Camera;
  activeTourPoint?: TourPoint | null;
}

interface RenderTask {
  request_id: string;
  status: "pending" | "completed";
  image_url?: string;
}

const RenderModal: React.FC<RenderModalProps> = ({
  isOpen,
  onClose,
  onRenderComplete,
  scene,
  camera,
  activeTourPoint,
}) => {
  const [timeOfDay, setTimeOfDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [renderTasks, setRenderTasks] = useState<RenderTask[]>([]);

  const [preset, setPreset] = useState("Test");
  const [sunEnergy, setSunEnergy] = useState(100);
  const [sunAngle, setSunAngle] = useState(0.1);

  const [areaLightSizeX, setAreaLightSizeX] = useState(10);
  const [areaLightSizeY, setAreaLightSizeY] = useState(10);
  const [areaLightEnergy, setAreaLightEnergy] = useState(100);
  const [areaLightOffset, setAreaLightOffset] = useState(5);

  const [spotSpacing, setSpotSpacing] = useState(0);
  const [spotInwardOffset, setSpotInwardOffset] = useState(0);
  const [spotDownwardOffset, setSpotDownwardOffset] = useState(0);
  const [spotLightEnergy, setSpotLightEnergy] = useState(100);
  const [spotColor, setSpotColor] = useState("#ffffff");
  const [spotShadow, setSpotShadow] = useState(false);
  const [spotShadowSoftness, setSpotShadowSoftness] = useState(0);
  const [spotSize, setSpotSize] = useState(45);

  const [renderResolutionX, setRenderResolutionX] = useState(1920);
  const [renderResolutionY, setRenderResolutionY] = useState(1080);

  const [sampleContrast, setSampleContrast] = useState("Midium");
  const [lightPath, setLightPath] = useState("Default");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const [scenePreviewUpdated, setScenePreviewUpdated] = useState(false);

  // camera settings

  const EYE_LEVEL = 60;

  const target = activeTourPoint
    ? new Vector3(
        activeTourPoint.position[0],
        EYE_LEVEL,
        activeTourPoint.position[2],
      )
    : new Vector3(0, 0, 0);

  const [blenderCamPos, setBlenderCamPos] = useState({
    x: camera?.position.x || 0,
    y: -camera?.position.z || 0,
    z: camera?.position.y || 0,
  });
  const [blenderCamTarget, setBlenderCamTarget] = useState({
    x: target.x || 0,
    y: -target.z || 0,
    z: target.y || 0,
  });

  const renderScenePreview = () => {
    if (!canvasRef.current || !scene || !camera) return;

    if (!rendererRef.current) {
      rendererRef.current = new WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      });
      rendererRef.current.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight,
      );
    }

    const newPosition = new Vector3(
      blenderCamPos.x,
      blenderCamPos.z,
      -blenderCamPos.y,
    );
    const newTarget = new Vector3(
      blenderCamTarget.x,
      blenderCamTarget.z,
      -blenderCamTarget.y,
    );

    camera.position.copy(newPosition);
    camera.lookAt(newTarget);

    rendererRef.current.render(scene, camera);
    setScenePreviewUpdated(true);
  };

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (canvasRef.current && rendererRef.current) {
  //       const width = canvasRef.current.clientWidth;
  //       const height = canvasRef.current.clientHeight;
  //       rendererRef.current.setSize(width, height);
  //       renderScenePreview();
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  const updateCameraFromBlenderInputs = () => {
    camera.position.set(blenderCamPos.x, blenderCamPos.z, -blenderCamPos.y);

    const newTarget = new Vector3(
      blenderCamTarget.x,
      blenderCamTarget.z,
      -blenderCamTarget.y,
    );
    camera.lookAt(newTarget);

    console.log("Three.js camera position:", camera.position);
    console.log("Three.js camera target:", newTarget);
    console.log(
      "Blender camera position:",
      new Vector3(camera.position.x, -camera.position.z, camera.position.y),
    );
    console.log(
      "Blender camera target:",
      new Vector3(newTarget.x, -newTarget.z, newTarget.y),
    );
    renderScenePreview();
  };

  // camera settings end

  // export glb model
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

  // Check render status from backend
  const checkRenderStatus = (requestId: string, delay: number) => {
    setTimeout(async () => {
      try {
        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/render_request/get_image/?request_id=${requestId}`,
        );
        if (!statusResponse.ok) {
          throw new Error(`Status check error: ${statusResponse.statusText}`);
        }
        const statusData = await statusResponse.json();
        if (statusData.image_url) {
          setRenderTasks((prev) =>
            prev.map((task) =>
              task.request_id === requestId
                ? {
                    ...task,
                    status: "completed",
                    image_url: statusData.image_url,
                  }
                : task,
            ),
          );
          onRenderComplete(statusData.image_url);
        } else if (statusData.status === "pending") {
          checkRenderStatus(requestId, 20000);
        }
      } catch (err: any) {
        console.error("Error checking render status:", err);
        checkRenderStatus(requestId, 20000);
      }
    }, delay);
  };

  // Submit rendering data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // if (!timeOfDay) {
    //   setError("Please select a time of day.");
    //   return;
    // }

    setLoading(true);
    try {
      // const glbBlob = await exportGLTF();
      // Download model
      // const url = URL.createObjectURL(glbBlob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "exported_scene.glb";
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // URL.revokeObjectURL(url);
      // const formData = new FormData();
      // formData.append("file", glbBlob);
      // Glb File upload
      // const uploadResponse = await fetch("https://tmpfiles.org/api/v1/upload", {
      //   method: "POST",
      //   body: formData,
      // });
      // if (!uploadResponse.ok) {
      //   throw new Error(`File upload error: ${uploadResponse.statusText}`);
      // }
      // const uploadResult = await uploadResponse.json();
      // if (uploadResult.status !== "success") {
      //   throw new Error("File upload failed");
      // }
      // const uploadedUrl: string = uploadResult.data.url;
      // const finalGlbUrl = uploadedUrl.replace(
      //   "https://tmpfiles.org/",
      //   "https://tmpfiles.org/dl/",
      // );
      // Glb File upload end
      // Posting request to backend
      // const request_id = uid(16);
      // const newPayload = {
      //   request_id,
      //   theme: timeOfDay,
      //   params: { key: "value" },
      //   glb_url: finalGlbUrl,
      // };
      // const newResponse = await fetch(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}api/render_request/`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(newPayload),
      //   },
      // );
      // if (!newResponse.ok) {
      //   throw new Error(`Render request error: ${newResponse.statusText}`);
      // }
      // Posting request to backend end
      // Posting request to runpod
      // const runPodPayload = {
      //   time_of_day: timeOfDay,
      //   glb_url: finalGlbUrl,
      //   r_id: request_id,
      // };
      // const runPodResponse = await fetch("/api/render", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(runPodPayload),
      // });
      // if (!runPodResponse.ok) {
      //   throw new Error(
      //     `Render request error in Runpod: ${runPodResponse.statusText}`,
      //   );
      // }
      // Posting request to runpod end
      // setRenderTasks((prev) => [...prev, { request_id, status: "pending" }]);
      // checkRenderStatus(request_id, 60000);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      renderScenePreview();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative flex h-5/6 w-full max-w-7xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-gray-200 flex items-center justify-between border-b p-4">
          <h2 className="text-gray-800 text-xl font-semibold">Render Scene</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Panel */}
          <div className="w-3/5 overflow-auto p-4">
            <form onSubmit={handleSubmit}>
              {/* Preset Area */}
              <div className="bg-gray-50 col-span-2 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  Design Preset
                </h3>
                <SegmentedControl.Root
                  defaultValue="Test"
                  onValueChange={setPreset}
                  className="w-full"
                >
                  <SegmentedControl.Item value="Test">
                    Test
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="Low">Low</SegmentedControl.Item>
                  <SegmentedControl.Item value="Mid">Mid</SegmentedControl.Item>
                  <SegmentedControl.Item value="High">
                    High
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="Ultra">
                    Ultra
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              </div>

              {/* Sun Area */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                    </svg>
                    Sun Settings
                  </div>
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Sun Energy
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={sunEnergy}
                      onChange={(e) => setSunEnergy(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">0</span>
                      <span className="text-xs font-medium">{sunEnergy}</span>
                      <span className="text-gray-500 text-xs">500</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Sun Angle
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={sunAngle}
                      onChange={(e) => setSunAngle(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">0</span>
                      <span className="text-xs font-medium">{sunAngle}</span>
                      <span className="text-gray-500 text-xs">1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Area Light Settings Panel */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Area Light Settings
                  </div>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Size X</label>
                    <input
                      type="number"
                      value={areaLightSizeX}
                      onChange={(e) =>
                        setAreaLightSizeX(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Size Y</label>
                    <input
                      type="number"
                      value={areaLightSizeY}
                      onChange={(e) =>
                        setAreaLightSizeY(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Energy</label>
                    <input
                      type="number"
                      value={areaLightEnergy}
                      onChange={(e) =>
                        setAreaLightEnergy(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Offset</label>
                    <input
                      type="number"
                      value={areaLightOffset}
                      onChange={(e) =>
                        setAreaLightOffset(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Spot Light Settings Panel */}
              <div className="bg-gray-50 col-span-2 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Spot Light Settings
                  </div>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Spacing
                    </label>
                    <input
                      type="number"
                      value={spotSpacing}
                      onChange={(e) => setSpotSpacing(Number(e.target.value))}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Inward Offset
                    </label>
                    <input
                      type="number"
                      value={spotInwardOffset}
                      onChange={(e) =>
                        setSpotInwardOffset(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Downward Offset
                    </label>
                    <input
                      type="number"
                      value={spotDownwardOffset}
                      onChange={(e) =>
                        setSpotDownwardOffset(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Light Energy
                    </label>
                    <input
                      type="number"
                      value={spotLightEnergy}
                      onChange={(e) =>
                        setSpotLightEnergy(Number(e.target.value))
                      }
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Spot Size (deg)
                    </label>
                    <input
                      type="number"
                      value={spotSize}
                      onChange={(e) => setSpotSize(Number(e.target.value))}
                      max="180"
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Color</label>
                    <div className="border-gray-300 flex items-center rounded-md border p-2">
                      <input
                        type="color"
                        value={spotColor}
                        onChange={(e) => setSpotColor(e.target.value)}
                        className="h-6 w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={spotShadow}
                        onChange={(e) => setSpotShadow(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-600 ml-2 text-sm">Shadow</span>
                    </label>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Shadow Softness
                    </label>
                    <input
                      type="number"
                      value={spotShadowSoftness}
                      onChange={(e) =>
                        setSpotShadowSoftness(Number(e.target.value))
                      }
                      disabled={!spotShadow}
                      className={`border-gray-300 rounded-md border p-2 ${!spotShadow ? "cursor-not-allowed opacity-50" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Render Settings Panel */}
              <div className="bg-gray-50 col-span-2 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Render Settings
                  </div>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="text-gray-600 mb-2 text-sm">Resolution</h4>
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <label className="text-gray-500 mb-1 block text-xs">
                          Width
                        </label>
                        <input
                          type="number"
                          value={renderResolutionX}
                          onChange={(e) =>
                            setRenderResolutionX(Number(e.target.value))
                          }
                          className="border-gray-300 w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-gray-500 mb-1 block text-xs">
                          Height
                        </label>
                        <input
                          type="number"
                          value={renderResolutionY}
                          onChange={(e) =>
                            setRenderResolutionY(Number(e.target.value))
                          }
                          className="border-gray-300 w-full rounded-md border p-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-600 mb-2 text-sm">
                      Sample Contrast
                    </h4>
                    <SegmentedControl.Root
                      defaultValue="Midium"
                      onValueChange={setSampleContrast}
                      className="w-full"
                    >
                      <SegmentedControl.Item value="Low">
                        Low
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="Midium">
                        Medium
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="High">
                        High
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </div>

                  <div>
                    <h4 className="text-gray-600 mb-2 text-sm">Light Path</h4>
                    <SegmentedControl.Root
                      defaultValue="Default"
                      onValueChange={setLightPath}
                      className="w-full"
                    >
                      <SegmentedControl.Item value="Default">
                        Default
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="Fast">
                        Fast
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="Full">
                        Full
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </div>
                </div>
              </div>

              {/* Camera Settings Panel */}
              <div className="bg-gray-50 col-span-2 mt-4 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Camera Settings
                  </div>
                </h3>

                <div className="space-y-4">
                  {/* Blender Camera Position */}
                  <div>
                    <label className="text-gray-600 mb-2 block text-sm font-medium">
                      Blender Camera Position
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          X Position
                        </span>
                        <input
                          type="number"
                          value={blenderCamPos.x}
                          onChange={(e) =>
                            setBlenderCamPos({
                              ...blenderCamPos,
                              x: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          Y Position
                        </span>
                        <input
                          type="number"
                          value={blenderCamPos.y}
                          onChange={(e) =>
                            setBlenderCamPos({
                              ...blenderCamPos,
                              y: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          Z Position
                        </span>
                        <input
                          type="number"
                          value={blenderCamPos.z}
                          onChange={(e) =>
                            setBlenderCamPos({
                              ...blenderCamPos,
                              z: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 rounded-md border p-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Blender Camera Target */}
                  <div>
                    <label className="text-gray-600 mb-2 block text-sm font-medium">
                      Blender Camera Target
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          X Target
                        </span>
                        <input
                          type="number"
                          value={blenderCamTarget.x}
                          onChange={(e) =>
                            setBlenderCamTarget({
                              ...blenderCamTarget,
                              x: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          Y Target
                        </span>
                        <input
                          type="number"
                          value={blenderCamTarget.y}
                          onChange={(e) =>
                            setBlenderCamTarget({
                              ...blenderCamTarget,
                              y: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          Z Target
                        </span>
                        <input
                          type="number"
                          value={blenderCamTarget.z}
                          onChange={(e) =>
                            setBlenderCamTarget({
                              ...blenderCamTarget,
                              z: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 rounded-md border p-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <CustomButton
                      variant="secondary"
                      type="button"
                      onClick={updateCameraFromBlenderInputs}
                      className="w-full"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Update Camera
                    </CustomButton>
                  </div>
                </div>
              </div>

              {/* Status and Submit Section */}
              <div className="bg-gray-50 col-span-2 mt-4 rounded-lg p-4 shadow-sm">
                {error && (
                  <div className="bg-red-50 border-red-200 text-red-700 mb-4 rounded-md border p-3 text-sm">
                    <div className="flex items-center">
                      <svg
                        className="text-red-500 mr-2 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <CustomButton
                  variant="secondary"
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Rendering...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Submit Render
                    </div>
                  )}
                </CustomButton>
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-100 flex h-2/3 w-2/5 flex-col p-4">
            <h3 className="text-gray-700 mb-3 font-medium">Scene Preview</h3>
            <div className="relative flex-1 overflow-hidden rounded-lg bg-black">
              <canvas ref={canvasRef} className="h-full w-full" />
              {!scenePreviewUpdated && (
                <div className="text-gray-400 absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="mt-2">
                      Click "Update Camera" to render preview
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">
                This preview shows the scene from the current camera position.
                Adjust camera settings and click "Update Camera" to see changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderModal;
