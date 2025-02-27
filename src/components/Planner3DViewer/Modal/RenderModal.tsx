import CustomButton from "@/components/CustomButton";
import React, { useState } from "react";
import { uid } from "uid";
import { GLTFExporter } from "three-stdlib";
import { Scene, Camera, Vector3 } from "three";
import { TourPoint } from "@/types";

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

  const logCameraInfo = () => {
    console.log("Three.js camera position:", camera.position);
    const EYE_LEVEL = 60;

    const target = activeTourPoint
      ? new Vector3(
          activeTourPoint.position[0],
          EYE_LEVEL,
          activeTourPoint.position[2],
        )
      : new Vector3(0, 0, 0);
    console.log("Three.js camera target:", target);

    const blenderCameraPosition = new Vector3(
      camera.position.x,
      camera.position.z,
      camera.position.y,
    );

    const blenderTarget = new Vector3(target.x, target.z, target.y);
    console.log("Blender camera position:", blenderCameraPosition);
    console.log("Blender camera target:", blenderTarget);
  };

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
      logCameraInfo();

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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          position: "relative",
        }}
      >
        <h2>Render Scene</h2>
        <form onSubmit={handleSubmit}>
          {/* <form> */}
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Time of Day:
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                // required
                style={{ marginLeft: "0.5rem" }}
              >
                <option value="">Select</option>
                <option value="day">Day</option>
                <option value="night">Night</option>
              </select>
            </label>
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
          )}
          <CustomButton variant="secondary" type="submit" disabled={loading}>
            {loading ? "Rendering..." : "Submit"}
          </CustomButton>
        </form>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default RenderModal;
