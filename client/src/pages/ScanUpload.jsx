import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./ScanUpload.css";



export default function ScanUpload() {
  const navigate = useNavigate(); 
  const [mainFile, setMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [closeupFile, setCloseupFile] = useState(null);
  const [closeupPreview, setCloseupPreview] = useState(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMainChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setMainFile(selected);
    setMainPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  };

  const handleCloseupChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setCloseupFile(selected);
    setCloseupPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  };

  const handleRemoveMain = () => {
    setMainFile(null);
    setMainPreview(null);
    setResult(null);
    setError("");
  };

  const handleRemoveCloseup = () => {
    setCloseupFile(null);
    setCloseupPreview(null);
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainFile) {
      setError("Please select a main photo first");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("images", mainFile);
    if (closeupFile) {
      formData.append("images", closeupFile);
    }

    try {
      const res = await api.post("/scans/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-page">
       <button className="back-link" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
      <div className="scan-card">
        <h1 className="scan-title">Upload a Medicine</h1>

        {error && <p className="scan-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <p className="scan-subheading">Main photo</p>
          <label className="scan-dropzone">
            {mainPreview ? (
              <img src={mainPreview} alt="main preview" className="scan-preview" />
            ) : (
              <p>Click to upload or capture a photo</p>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleMainChange}
              style={{ display: "none" }}
            />
          </label>
          {mainPreview && (
            <button type="button" className="scan-remove" onClick={handleRemoveMain}>
              Remove Main Photo
            </button>
          )}

          <p className="scan-subheading">
            Close-up of batch / expiry (optional)
          </p>
          <label className="scan-dropzone scan-dropzone-small">
            {closeupPreview ? (
              <img src={closeupPreview} alt="closeup preview" className="scan-preview" />
            ) : (
              <p>Click to add a close-up photo</p>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCloseupChange}
              style={{ display: "none" }}
            />
          </label>
          {closeupPreview && (
            <button type="button" className="scan-remove" onClick={handleRemoveCloseup}>
              Remove Close-up Photo
            </button>
          )}

          <button type="submit" className="scan-submit" disabled={loading || !mainFile}>
            {loading ? "Analyzing..." : "Identify Medicine"}
          </button>
        </form>
      </div>

      {result && (
        <div className="result-card">
          {result.medicine ? (
            <>
              <h2 className="result-title">{result.medicine.name}</h2>
              <p className="result-sub">{result.medicine.manufacturer}</p>

              {result.matchType === "composition" && (
                <p className="composition-note">
                  Similar Product has been taken from the datasets.
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
                <p className="result-label">Side Effects</p>
                <ul className="result-list">
                  {result.medicine.sideEffects.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
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