import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./ScanPrescription.css";

export default function ScanPrescription() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState("upload");
  const [viewMode, setViewMode] = useState("idle");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (inputMode === "camera" && viewMode === "camera-live") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [inputMode, viewMode]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreamActive(true);
    } catch {
      setCameraError("Could not access camera. Please allow camera permission.");
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], `presc-${Date.now()}.jpg`, { type: "image/jpeg" });
      setFile(f);
      setPreview(URL.createObjectURL(blob));
      setResult(null);
      setError("");
      setViewMode("preview");
    }, "image/jpeg");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
    setViewMode("preview");
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setViewMode("idle");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select or capture a photo first");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await api.post("/scans/prescription", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="presc-page">
      <button className="back-link" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="feature-page-header">
        <div className="feature-icon">📝</div>
        <div>
          <h1>Scan Prescription</h1>
          <p>Identify all medicines listed on a prescription slip.</p>
        </div>
      </div>

      <div className="presc-card">
        <div className="camera-toggle">
          <button
            className={`toggle-btn ${inputMode === "upload" ? "active" : ""}`}
            onClick={() => {
              setInputMode("upload");
              handleRemove();
            }}
          >
            Upload Photo
          </button>
          <button
            className={`toggle-btn ${inputMode === "camera" ? "active" : ""}`}
            onClick={() => {
              setInputMode("camera");
              handleRemove();
              setViewMode("camera-live");
            }}
          >
            Use Camera
          </button>
        </div>

        {error && <p className="scan-error">{error}</p>}
        {cameraError && <p className="scan-error">{cameraError}</p>}

        {inputMode === "upload" && viewMode !== "preview" && (
          <label className="scan-dropzone">
            <p>Click to upload a photo of the prescription</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        )}

        {inputMode === "camera" && viewMode === "camera-live" && (
          <>
            <video ref={videoRef} autoPlay playsInline className="camera-view" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {streamActive && (
              <button className="capture-btn" onClick={capturePhoto}>
                Capture Photo
              </button>
            )}
          </>
        )}

        {viewMode === "preview" && preview && (
          <>
            <img src={preview} alt="preview" className="scan-preview" />
            <button className="feature-button-outline" onClick={handleRemove}>
              Remove Photo
            </button>
          </>
        )}

        <button
          className="feature-button"
          onClick={handleSubmit}
          disabled={loading || !file}
        >
          {loading ? "Analyzing..." : "Identify Medicines"}
        </button>
      </div>

      {result && (
        <div className="presc-results">
          <p className="presc-result-summary">{result.message}</p>

          {result.medicines && result.medicines.length > 0 ? (
            result.medicines.map((med) => (
              <div className="result-card" key={med._id}>
                <h2 className="result-title">{med.name}</h2>

                <div className="result-section">
                  <p className="result-label">Composition</p>
                  <p>{med.composition}</p>
                </div>

                <div className="result-section">
                  <p className="result-label">Dose</p>
                  <p>{med.dose || "Not specified"}</p>
                </div>

                <div className="result-section">
                  <p className="result-label">Frequency (Morning-Afternoon-Night)</p>
                  <p>{med.frequency || "Not specified"}</p>
                </div>

                <div className="result-section">
                  <p className="result-label">Duration</p>
                  <p>{med.duration || "Not specified"}</p>
                </div>

                <div className="result-section">
                  <p className="result-label">Instructions</p>
                  <p>{med.instructions || "Not specified"}</p>
                </div>

                <div className="result-section">
                  <p className="result-label">Manufacturer</p>
                  <p>{med.manufacturer}</p>
                </div>

                <div className="result-section">
                  <p className="result-label">Uses</p>
                  <ul className="result-list">
                    {(med.uses || []).map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-section">
                  <p className="result-label">Side Effects</p>
                  <ul className="result-list">
                    {(med.sideEffects || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-section">
                  <p className="result-label">Warnings</p>
                  {Array.isArray(med.warnings) && med.warnings.length > 0 ? (
                    <ul className="result-list">
                      {med.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{med.warnings || "No warnings listed"}</p>
                  )}
                </div>
              </div>
            ))
          
          ) : (
              <p className="no-match">
                No medicines could be confidently identified. Try a clearer
                photo, ideally of a printed (not handwritten) prescription.
              </p>
            )}
        </div>
      )}
    </div>
  );
}