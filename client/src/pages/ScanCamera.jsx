import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./ScanCamera.css";

export default function ScanCamera() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("idle");
  const [capturedFile, setCapturedFile] = useState(null);
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
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (err) {
      setCameraError(
        "Could not access camera. Please allow camera permission."
      );
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setCapturedFile(file);
      setPreview(URL.createObjectURL(blob));
      setResult(null);
      setError("");
      setMode("preview");
    }, "image/jpeg");
  };

  const handleRetake = () => {
    setCapturedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setMode("camera");
  };

  const handleSubmit = async () => {
    if (!capturedFile) {
      setError("Please capture a photo first");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("images", capturedFile);

    try {
      const res = await api.post("/scans/upload", formData, {
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
    <div className="scan-camera-page">
      <button className="back-link" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="feature-page-header">
        <div className="feature-icon">📷</div>
        <div>
          <h1>Scan Medicine</h1>
          <p>Use your camera to identify a medicine instantly.</p>
        </div>
      </div>

      {mode === "idle" && (
        <div className="camera-launch-box">
          <p>Click below to open your camera and scan a medicine.</p>
          <button className="feature-button" onClick={() => setMode("camera")}>
            📷 Start Camera
          </button>
        </div>
      )}

      {mode === "camera" && (
        <div className="camera-box">
          {cameraError && <p className="scan-error">{cameraError}</p>}
          <video ref={videoRef} autoPlay playsInline className="camera-view" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {streamActive && (
            <button className="capture-btn" onClick={capturePhoto}>
              Capture Photo
            </button>
          )}
          <button
            className="feature-button-outline"
            onClick={() => setMode("idle")}
          >
            Cancel
          </button>
        </div>
      )}

      {mode === "preview" && (
        <div className="camera-box">
          {error && <p className="scan-error">{error}</p>}
          <img src={preview} alt="captured" className="captured-preview" />

          <div className="preview-actions">
            <button className="feature-button-outline" onClick={handleRetake}>
              Retake
            </button>
            <button
              className="feature-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Identify Medicine"}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="result-card">
          {result.medicine ? (
            <>
              <h2 className="result-title">{result.medicine.name}</h2>
              <p className="result-sub">{result.medicine.manufacturer}</p>

              {result.matchType === "composition" && (
                <p className="composition-note">
                  Similar medicine is taken from dataset.
                </p>
              )}

              <div className="result-section">
                <p className="result-label">Composition</p>
                <p>{result.medicine.composition}</p>
              </div>

              {result.batchNumber && (
                <div className="result-section">
                  <p className="result-label">Batch Number</p>
                  <p>{result.batchNumber}</p>
                </div>
              )}

              {result.manufacturingDate && (
                <div className="result-section">
                  <p className="result-label">Manufacturing Date</p>
                  <p>{result.manufacturingDate}</p>
                </div>
              )}

              {result.expiryDate && (
                <div className="result-section">
                  <p className="result-label">Expiry Date</p>
                  <p>{result.expiryDate}</p>
                </div>
              )}

              <div className="result-section">
                <p className="result-label">Uses</p>
                <ul className="result-list">
                  {result.medicine.uses.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>

              <div className="result-section">
                <p className="result-label">Uses</p>
                {result.medicine.uses && result.medicine.uses.length > 0 ? (
                  <ul className="result-list">
                    {result.medicine.uses.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-text">Not available for this product</p>
                )}
              </div>

              <div className="result-section">
                <p className="result-label">Warnings</p>
                <ul className="result-list">
                  {result.medicine.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="no-match">
              No confident match found. Try a clearer photo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}