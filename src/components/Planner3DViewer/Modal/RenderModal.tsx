"use client";
import CustomButton from "@/components/CustomButton";
import React, { useEffect, useState } from "react";
import { GLTFExporter } from "three-stdlib";
import { Scene, Camera, Vector3 } from "three";
import { TourPoint } from "@/types";
import { SegmentedControl } from "@radix-ui/themes";
import { uid } from "uid";

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenderComplete: (imageUrl: string) => void;
  onRenderStart: () => void;
  scene: Scene;
  camera: Camera;
  activeTourPoint?: TourPoint | null;
  zoomLevel?: number;
  cameraHeight: number;
  fov: number;
  glbUrl: string;
  setGlbUrl: React.Dispatch<React.SetStateAction<string>>;
  sceneModified: boolean;
  setSceneModified: React.Dispatch<React.SetStateAction<boolean>>;
}

interface RenderTask {
  request_id: string;
  status: "pending" | "completed";
  image_url?: string;
}

interface BlenderCamCoords {
  x: number;
  y: number;
  z: number;
}

const RenderModal: React.FC<RenderModalProps> = ({
  isOpen,
  onClose,
  onRenderComplete,
  onRenderStart,
  scene,
  camera,
  activeTourPoint,
  cameraHeight,
  fov,
  glbUrl,
  setGlbUrl,
  sceneModified,
  setSceneModified,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [renderTasks, setRenderTasks] = useState<RenderTask[]>([]);

  // Present and Sun Settings
  const [preset, setPreset] = useState("Mid");
  const [sunEnergy, setSunEnergy] = useState("15");
  const [sunAngle, setSunAngle] = useState("0.1");
  const [useReflection, setUseReflection] = useState(false);

  // area light settings
  const [areaLightSizeX, setAreaLightSizeX] = useState("50");
  const [areaLightSizeY, setAreaLightSizeY] = useState("50");
  const [areaLightEnergy, setAreaLightEnergy] = useState("50000");
  const [areaLightOffset, setAreaLightOffset] = useState("3");

  // spot light settings
  const [spotSpacing, setSpotSpacing] = useState("60");
  const [spotInwardOffset, setSpotInwardOffset] = useState("25");
  const [spotDownwardOffset, setSpotDownwardOffset] = useState("5");
  const [spotLightEnergy, setSpotLightEnergy] = useState("50000");
  const [spotShadowSoftness, setSpotShadowSoftness] = useState("5");
  const [spotSize, setSpotSize] = useState("180");
  const [spotColor, setSpotColor] = useState("#fffab7");
  const [spotShadow, setSpotShadow] = useState(true);

  // rendering settings
  const [renderResolutionX, setRenderResolutionX] = useState("1920");
  const [renderResolutionY, setRenderResolutionY] = useState("1080");
  const [renderResolutionPercentage, setRenderResolutionPercentage] =
    useState("100");
  const [sampling, setSampling] = useState("512");
  const [sampleContrast, setSampleContrast] = useState("Medium");
  const [lightPath, setLightPath] = useState("Default");
  const [theme, setTheme] = useState("day");

  // camera settings

  const target = activeTourPoint
    ? new Vector3(
        activeTourPoint.position[0],
        cameraHeight,
        activeTourPoint.position[2],
      )
    : new Vector3(0, 0, 0);

  const [blenderCamPos, setBlenderCamPos] = useState<BlenderCamCoords>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [blenderCamTarget, setBlenderCamTarget] = useState<BlenderCamCoords>({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    if (isOpen && camera) {
      const threeCamPos = camera.position;
      const threeTarget = target;

      const convertedCamPos = {
        x: threeCamPos.x,
        y: -threeCamPos.z,
        z: threeCamPos.y,
      };

      const convertedTarget = {
        x: threeTarget.x,
        y: -threeTarget.z,
        z: threeTarget.y,
      };

      // console.log("Converted Blender Camera Position:", convertedCamPos);
      // console.log("Converted Blender Target:", convertedTarget);

      setBlenderCamPos(convertedCamPos);
      setBlenderCamTarget(convertedTarget);
    }
  }, [isOpen, camera]);

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

  // Check render status from backend for 15 mins
  const checkRenderStatus = (
    requestId: string,
    delay: number,
    startTime = Date.now(),
  ) => {
    setTimeout(async () => {
      if (Date.now() - startTime >= 720000) {
        console.warn(
          `Polling timed out for request ${requestId} after 10 minutes.`,
        );
        return;
      }

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
          checkRenderStatus(requestId, 5000, startTime);
        }
      } catch (err: any) {
        console.error("Error checking render status:", err);
        checkRenderStatus(requestId, 5000, startTime);
      }
    }, delay);
  };

  // Submit rendering data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    onRenderStart();
    setLoading(true);
    try {
      let finalGlbUrl = glbUrl;

      if (!finalGlbUrl || sceneModified) {
        const glbBlob = await exportGLTF();
        const uniqueFilename = `${uid(16)}.glb`;
        const presignRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/presign/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: uniqueFilename,
              folder: "glb_files",
              content_type: "model/gltf-binary",
            }),
          },
        );

        if (!presignRes.ok) {
          throw new Error(`Presign failed: ${await presignRes.text()}`);
        }
        const { url: s3Url, fields, key } = await presignRes.json();

        const s3form = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
          s3form.append(k, v as string);
        });

        s3form.append("file", glbBlob, uniqueFilename);

        const uploadResp = await fetch(s3Url, {
          method: "POST",
          body: s3form,
        });

        if (!uploadResp.ok) {
          throw new Error(`S3 upload failed: ${uploadResp.statusText}`);
        }
        const finalGlbUrl = `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/glb_files/${uniqueFilename}`;

        setGlbUrl(finalGlbUrl);
        setSceneModified(false);
      }
      // Glb File upload end

      // Posting request to backend
      const request_id = uid(16);
      const renderParams = generateRenderPayload(
        theme,
        spotSpacing,
        spotInwardOffset,
        spotDownwardOffset,
        spotLightEnergy,
        spotShadowSoftness,
        spotSize,
        spotColor,
        spotShadow,
        sunEnergy,
        sunAngle,
        areaLightSizeX,
        areaLightSizeY,
        areaLightEnergy,
        areaLightOffset,
        renderResolutionX,
        renderResolutionY,
        renderResolutionPercentage,
        sampling,
        sampleContrast,
        lightPath,
        blenderCamPos,
        blenderCamTarget,
        glbUrl,
        request_id,
        fov,
        useReflection,
      );

      const backendPayload = {
        request_id,
        theme: theme,
        params: renderParams,
        glb_url: glbUrl,
      };
      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/render_request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendPayload),
        },
      );
      if (!backendResponse.ok) {
        throw new Error(`Backend request error: ${backendResponse.statusText}`);
      }

      console.log("Backend request successful!");
      // Posting request to backend end

      // Posting request to runpod
      const runPodPayload = renderParams;
      const runPodResponse = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(runPodPayload),
      });
      if (!runPodResponse.ok) {
        throw new Error(
          `Render request error in Runpod: ${runPodResponse.statusText}`,
        );
      }
      // Posting request to runpod end
      setRenderTasks((prev) => [...prev, { request_id, status: "pending" }]);
      checkRenderStatus(request_id, 60000);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const generateRenderPayload = (
    theme: string,
    spotSpacing: string,
    spotInwardOffset: string,
    spotDownwardOffset: string,
    spotLightEnergy: string,
    spotShadowSoftness: string,
    spotSize: string,
    spotColor: string,
    spotShadow: boolean,
    sunEnergy: string,
    sunAngle: string,
    areaLightSizeX: string,
    areaLightSizeY: string,
    areaLightEnergy: string,
    areaLightOffset: string,
    renderResolutionX: string,
    renderResolutionY: string,
    renderResolutionPercentage: string,
    sampling: string,
    sampleContrast: string,
    lightPath: string,
    blenderCamPos: { x: number; y: number; z: number },
    blenderCamTarget: { x: number; y: number; z: number },
    glbUrl: string,
    requestId: string,
    fov: number,
    useReflection: boolean,
  ) => {
    return {
      // Spot settings
      spot_spacing: parseFloat(spotSpacing),
      spot_inward_offset: parseFloat(spotInwardOffset),
      spot_downward_offset: parseFloat(spotDownwardOffset),
      spot_light_energy: parseFloat(spotLightEnergy),
      spot_shadow_softness: parseFloat(spotShadowSoftness),
      spot_size: (parseFloat(spotSize) * Math.PI) / 180,
      spot_color: {
        r: parseInt(spotColor.slice(1, 3), 16) / 255,
        g: parseInt(spotColor.slice(3, 5), 16) / 255,
        b: parseInt(spotColor.slice(5, 7), 16) / 255,
      },
      spot_shadow: spotShadow,

      // Sun Settings
      sun_energy: parseFloat(sunEnergy),
      sun_angle: parseFloat(sunAngle),

      // Area Light Settings
      areaLightSizeX: parseFloat(areaLightSizeX),
      areaLightSizeY: parseFloat(areaLightSizeY),
      areaLightEnergy: parseFloat(areaLightEnergy),
      areaLightOffset: parseFloat(areaLightOffset),
      // https://keystone-backend.up.railway.app/media/glb_files/2028e21a9a554a69a4e3ff0b7ac5ba93.glb
      // /usr/local/bin/blender -b --python /src/code/day.py -- --glb /tmp/scene.glb --r_id 7ea6f246187b68f6 --camera_location 170.4129732897311, -50.691516276340984, 64.0512644933855 --camera_target 27, -7, 60 --spot_spacing 60 --spot_inward_offset 25 --spot_downward_offset 5 --spot_light_energy 50000 --spot_shadow_softness 5 --spot_size 3.141592653589793 --spot_shadow True --spot_color 1, 0.9803921568627451, 0.7176470588235294 --sun_energy 100 --sun_angle 0.1 --area_light_size_x 50 --area_light_size_y 50 --area_light_energy 50000 --area_light_offset 3 --resolution_x 1920 --resolution_y 1080 --resolution_percentage 100 --sampling 512 --sample_contrast Midium Contrast --max_bounces 12 --diffuse_bounces 4 --glossy_bounces 4 --transmission_bounces 8 --volume_bounces 2 --transparent_max_bounces 8 --output /tmp/rendered_image.png
      // Render Settings
      resolution_x: parseInt(renderResolutionX),
      resolution_y: parseInt(renderResolutionY),
      resolution_percentage: parseInt(renderResolutionPercentage),
      sampling: parseInt(sampling),
      sample_contrast: `${sampleContrast} Contrast`,
      time_of_day: theme,
      camera_fov: fov,
      reflection: useReflection,

      // Light path settings
      light_path: (() => {
        switch (lightPath) {
          case "Fast":
            return {
              max_bounces: 8,
              diffuse_bounces: 1,
              glossy_bounces: 4,
              transmission_bounces: 8,
              volume_bounces: 2,
              transparent_max_bounces: 8,
            };
          case "Full":
            return {
              max_bounces: 32,
              diffuse_bounces: 32,
              glossy_bounces: 32,
              transmission_bounces: 32,
              volume_bounces: 32,
              transparent_max_bounces: 32,
            };
          default:
            return {
              max_bounces: 12,
              diffuse_bounces: 4,
              glossy_bounces: 4,
              transmission_bounces: 8,
              volume_bounces: 2,
              transparent_max_bounces: 8,
            };
        }
      })(),

      // Camera Settings
      camera_position: {
        x: blenderCamPos.x,
        y: blenderCamPos.y,
        z: blenderCamPos.z,
      },
      camera_target: {
        x: blenderCamTarget.x,
        y: blenderCamTarget.y,
        z: blenderCamTarget.z,
      },

      // GLB File & Request ID
      glb_url: glbUrl,
      r_id: requestId,
    };
  };

  const handleInputChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("Input value changing to:", e.target.value);
      setter(e.target.value);
      setPreset("Custom");
    };

  const handleCheckboxChange =
    (setter: (value: boolean) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.checked);
      setPreset("Custom");
    };

  const handleSegmentedChange =
    (setter: (value: string) => void) => (value: string) => {
      setter(value);
      setPreset("Custom");
    };

  const applyPreset = (presetValue: string) => {
    resetDefaults();
    setPreset(presetValue);
    if (presetValue === "Test") {
      setSpotShadow(false);
      setRenderResolutionX("1280");
      setRenderResolutionY("720");
      setSampling("64");
      setLightPath("Fast");
    } else if (presetValue === "Low") {
      setRenderResolutionX("1920");
      setRenderResolutionY("1080");
      setRenderResolutionPercentage("100");
      setSampling("256");
      setLightPath("Default");
    } else if (presetValue === "Mid") {
      setRenderResolutionX("2160");
      setRenderResolutionY("1440");
      setRenderResolutionPercentage("100");
      setSampling("512");
      setLightPath("Default");
    } else if (presetValue === "High") {
      setRenderResolutionX("3840");
      setRenderResolutionY("2160");
      setRenderResolutionPercentage("100");
      setSampling("512");
      setLightPath("Default");
    } else if (presetValue === "Ultra") {
      setRenderResolutionX("3840");
      setRenderResolutionY("2160");
      setRenderResolutionPercentage("200");
      setSampling("512");
      setLightPath("Full");
    }
  };

  const resetDefaults = () => {
    // Sun Settings
    setSunEnergy("15");
    setSunAngle("0.1");

    // Area Light Settings
    setAreaLightSizeX("50");
    setAreaLightSizeY("50");
    setAreaLightEnergy("50000");
    setAreaLightOffset("3");

    // Spot Light Settings
    setSpotSpacing("60");
    setSpotInwardOffset("25");
    setSpotDownwardOffset("5");
    setSpotLightEnergy("50000");
    setSpotShadowSoftness("5");
    setSpotSize("180");
    setSpotColor("#fffab7");
    setSpotShadow(true);

    // Rendering Settings
    setRenderResolutionX("1920");
    setRenderResolutionY("1080");
    setRenderResolutionPercentage("100");
    setSampling("512");
    setSampleContrast("Medium");
    setLightPath("Default");
    setTheme("day");
  };

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
          <div className="w-full overflow-auto p-4">
            <form onSubmit={handleSubmit}>
              {/* Preset Area */}
              <div className="bg-gray-50 col-span-2 rounded-lg p-4 shadow-sm">
                <h3 className="text-gray-700 mb-3 font-medium">
                  Design Preset
                </h3>
                <SegmentedControl.Root
                  value={preset}
                  onValueChange={applyPreset}
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
                  <SegmentedControl.Item value="Custom">
                    Custom
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              </div>
              {/* Sun Settings */}
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
                <div className="flex w-full flex-col items-center justify-center space-y-3 md:flex-row md:space-x-4 md:space-y-0">
                  <div className="flex w-full flex-col md:w-1/2">
                    <label className="text-gray-600 mb-1 text-sm">
                      Sun Energy
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={sunEnergy}
                      onChange={handleInputChange(setSunEnergy)}
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">0</span>
                      <span className="text-xs font-medium">{sunEnergy}</span>
                      <span className="text-gray-500 text-xs">500</span>
                    </div>
                  </div>
                  <div className="flex w-full flex-col md:w-1/2">
                    <label className="text-gray-600 mb-1 text-sm">
                      Sun Angle
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={sunAngle}
                      onChange={handleInputChange(setSunAngle)}
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">0</span>
                      <span className="text-xs font-medium">{sunAngle}</span>
                      <span className="text-gray-500 text-xs">1</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={useReflection}
                      onChange={handleCheckboxChange(setUseReflection)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="text-gray-600 ml-2 text-sm">
                      Reflection
                    </span>
                  </label>
                </div>
              </div>

              {/* Area Light Settings */}
              {/* <div className="bg-gray-50 mt-4 rounded-lg p-4 shadow-sm">
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Size X</label>
                    <input
                      type="text"
                      value={areaLightSizeX}
                      onChange={handleInputChange(setAreaLightSizeX)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Size Y</label>
                    <input
                      type="text"
                      value={areaLightSizeY}
                      onChange={handleInputChange(setAreaLightSizeY)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Energy</label>
                    <input
                      type="text"
                      value={areaLightEnergy}
                      onChange={handleInputChange(setAreaLightEnergy)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">Offset</label>
                    <input
                      type="text"
                      value={areaLightOffset}
                      onChange={handleInputChange(setAreaLightOffset)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                </div>
              </div> */}

              {/* Spot Light Settings */}
              {/* <div className="bg-gray-50 col-span-2 rounded-lg p-4 shadow-sm">
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Spacing
                    </label>
                    <input
                      type="text"
                      value={spotSpacing}
                      onChange={handleInputChange(setSpotSpacing)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Inward Offset
                    </label>
                    <input
                      type="text"
                      value={spotInwardOffset}
                      onChange={handleInputChange(setSpotInwardOffset)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Downward Offset
                    </label>
                    <input
                      type="text"
                      value={spotDownwardOffset}
                      onChange={handleInputChange(setSpotDownwardOffset)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Light Energy
                    </label>
                    <input
                      type="text"
                      value={spotLightEnergy}
                      onChange={handleInputChange(setSpotLightEnergy)}
                      className="border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 text-sm">
                      Spot Size (deg)
                    </label>
                    <input
                      type="text"
                      value={spotSize}
                      onChange={handleInputChange(setSpotSize)}
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
                        onChange={(e) => {
                          setSpotColor(e.target.value);
                          if (preset !== "Custom") setPreset("Custom");
                        }}
                        className="h-6 w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={spotShadow}
                        onChange={handleCheckboxChange(setSpotShadow)}
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
                      type="text"
                      value={spotShadowSoftness}
                      onChange={handleInputChange(setSpotShadowSoftness)}
                      disabled={!spotShadow}
                      className={`border-gray-300 rounded-md border p-2 ${
                        !spotShadow ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                  </div>
                </div>
              </div> */}

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
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex-1">
                      <label className="text-gray-500 mb-1 block text-xs">
                        Width
                      </label>
                      <input
                        type="text"
                        value={renderResolutionX}
                        onChange={handleInputChange(setRenderResolutionX)}
                        className="border-gray-300 w-full rounded-md border p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-500 mb-1 block text-xs">
                        Height
                      </label>
                      <input
                        type="text"
                        value={renderResolutionY}
                        onChange={handleInputChange(setRenderResolutionY)}
                        className="border-gray-300 w-full rounded-md border p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-500 mb-1 block text-xs">
                        Sample Size
                      </label>
                      <input
                        type="text"
                        value={sampling}
                        onChange={handleInputChange(setSampling)}
                        className="border-gray-300 w-full rounded-md border p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-500 mb-1 block text-xs">
                        Render Resolution %
                      </label>
                      <input
                        type="text"
                        value={renderResolutionPercentage}
                        onChange={handleInputChange(
                          setRenderResolutionPercentage,
                        )}
                        className="border-gray-300 w-full rounded-md border p-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex-1">
                      <h4 className="text-gray-600 mb-2 text-sm">
                        Sample Contrast
                      </h4>
                      <SegmentedControl.Root
                        value={sampleContrast}
                        onValueChange={(value) =>
                          handleSegmentedChange(setSampleContrast)(value)
                        }
                        className="w-full"
                      >
                        <SegmentedControl.Item value="Low">
                          Low
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="Medium">
                          Medium
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="High">
                          High
                        </SegmentedControl.Item>
                      </SegmentedControl.Root>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-600 mb-2 text-sm">Light Path</h4>
                      <SegmentedControl.Root
                        value={lightPath}
                        onValueChange={(value) =>
                          handleSegmentedChange(setLightPath)(value)
                        }
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
                    <div className="flex-1">
                      <h4 className="text-gray-600 mb-2 text-sm">Theme</h4>
                      <SegmentedControl.Root
                        value={theme}
                        onValueChange={setTheme}
                        className="w-full"
                      >
                        <SegmentedControl.Item value="morning">
                          Morning
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="day">
                          Day
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="night">
                          Night
                        </SegmentedControl.Item>
                      </SegmentedControl.Root>
                    </div>
                  </div>
                </div>
              </div>

              {/* Camera Settings Panel */}
              {/* <div className="bg-gray-50 col-span-2 mt-4 rounded-lg p-4 shadow-sm">
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
                </h3> */}
              {/* <div className="space-y-4"> */}
              {/* Blender Camera Position */}
              {/* <div>
                    <label className="text-gray-600 mb-2 block text-sm font-medium">
                      Blender Camera Position
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          X Position
                        </span>
                        <input
                          type="text"
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
                          type="text"
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
                          type="text"
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
                  </div> */}

              {/* Blender Camera Target */}
              {/* <div>
                    <label className="text-gray-600 mb-2 block text-sm font-medium">
                      Blender Camera Target
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1 text-xs">
                          X Target
                        </span>
                        <input
                          type="text"
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
                          type="text"
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
                          type="text"
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
                </div>
              </div> */}

              {/* Status and Submit Section */}
              <div className="bg-gray-50 col-span-2 mb-8 mt-4 rounded-lg p-4 shadow-sm">
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
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="float-right"
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
        </div>
      </div>
    </div>
  );
};

export default RenderModal;
