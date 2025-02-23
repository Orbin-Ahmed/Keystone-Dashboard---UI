import React, { useState } from "react";

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RenderModal: React.FC<RenderModalProps> = ({ isOpen, onClose }) => {
  const [timeOfDay, setTimeOfDay] = useState("");
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRenderedImage(null);

    if (!timeOfDay) {
      setError("Please select a time of day.");
      return;
    }
    if (!glbFile) {
      setError("Please select a GLB file.");
      return;
    }

    setLoading(true);
    try {
      const glbBase64 = await getBase64(glbFile);

      const payload = {
        time_of_day: timeOfDay,
        glb_file: glbBase64,
      };

      const apiEndpoint = "https://api.runpod.ai/v2/hx49n6kpwjzb86/run";
      const bearerToken = "rpa_ZPRXJCLK7JQ8ADPY7A2F943F63CMO1MLYA8QEM72wi9au7";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else if (data.output) {
        setRenderedImage(data.output);
      }
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
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Time of Day:
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                required
                style={{ marginLeft: "0.5rem" }}
              >
                <option value="">Select</option>
                <option value="day">Day</option>
                <option value="night">Night</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              GLB File:
              <input
                type="file"
                accept=".glb"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setGlbFile(e.target.files[0]);
                  }
                }}
                required
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>
          {error && (
            <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Rendering..." : "Submit"}
          </button>
        </form>
        {renderedImage && (
          <div style={{ marginTop: "1rem" }}>
            <h3>Rendered Image:</h3>
            <img
              src={`data:image/png;base64,${renderedImage}`}
              alt="Rendered Scene"
              style={{ width: "100%" }}
            />
          </div>
        )}
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
