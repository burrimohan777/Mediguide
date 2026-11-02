import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./ScanHistoryPage.css";
import { Trash2 } from "lucide-react";

export default function ScanHistoryPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/scans/history");
        setScans(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      await api.delete(`/scans/${id}`);

      setScans((prev) =>
        prev.filter((scan) => scan._id !== id)
      );

      setConfirmDeleteId(null);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Could not delete the scan. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpand = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const renderMedicineDetails = (med, scanBatch, scanExpiry) => (
    <div className="history-detail-block" key={med._id || med.name}>
      <h4 className="detail-med-name">{med.name}</h4>

      <p className="detail-manufacturer">
        {med.manufacturer || "Manufacturer not available"}
      </p>

      {/* Show Batch & Expiry inside details if available from scan or medicine */}
      {(scanBatch || med.batchNumber) && (
        <div className="detail-section">
          <p className="detail-label">Batch Number</p>
          <p>{scanBatch || med.batchNumber}</p>
        </div>
      )}

      {(scanExpiry || med.expiryDate) && (
        <div className="detail-section">
          <p className="detail-label">Expiry Date</p>
          <p>{scanExpiry || med.expiryDate}</p>
        </div>
      )}

      <div className="detail-section">
        <p className="detail-label">Composition</p>
        <p>{med.composition || "Not available"}</p>
      </div>

      {/* Prescription-specific details */}
      {med.dose && (
        <div className="detail-section">
          <p className="detail-label">Dose</p>
          <p>{med.dose}</p>
        </div>
      )}

      {med.frequency && (
        <div className="detail-section">
          <p className="detail-label">
            Frequency (Morning-Afternoon-Night)
          </p>
          <p>{med.frequency}</p>
        </div>
      )}

      {med.duration && (
        <div className="detail-section">
          <p className="detail-label">Duration</p>
          <p>{med.duration}</p>
        </div>
      )}

      {med.instructions && (
        <div className="detail-section">
          <p className="detail-label">Instructions</p>
          <p>{med.instructions}</p>
        </div>
      )}

      <div className="detail-section">
        <p className="detail-label">Uses</p>
        {med.uses?.length ? (
          <ul className="detail-list">
            {med.uses.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        ) : (
          <p>Not available</p>
        )}
      </div>

      <div className="detail-section">
        <p className="detail-label">Side Effects</p>
        {med.sideEffects?.length ? (
          <ul className="detail-list">
            {med.sideEffects.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <p>Not available</p>
        )}
      </div>

      <div className="detail-section">
        <p className="detail-label">Warnings</p>
        {med.warnings?.length ? (
          <ul className="detail-list">
            {med.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        ) : (
          <p>Not available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="history-page">
      <button className="back-link" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h1 className="history-title">Scan History</h1>

      {loading && <p className="history-status">Loading your scans...</p>}
      {error && <p className="scan-error">{error}</p>}

      {!loading && !error && scans.length === 0 && (
        <p className="history-status">
          No scans yet. Go scan a medicine to see it appear here.
        </p>
      )}

      <div className="history-list">
        {scans.map((scan) => {
          const isExpanded = expandedId === scan._id;
          const isPrescription = scan.type === "prescription";
          const hasMultiple =
            isPrescription && scan.matchedMedicines?.length > 0;

          return (
            <div className="history-card" key={scan._id}>
              <div className="history-card-top history-card-clickable">
                <div
                  className="history-card-title"
                  onClick={() => toggleExpand(scan._id)}
                >
                  <h3>
                    {hasMultiple
                      ? `${scan.matchedMedicines.length} medicine(s) found`
                      : scan.matchedMedicine
                        ? scan.matchedMedicine.name
                        : "No match found"}
                  </h3>

                  {!isPrescription && scan.matchedMedicine?.manufacturer && (
                    <p className="history-manufacturer">
                      {scan.matchedMedicine.manufacturer}
                    </p>
                  )}
                </div>

                <div className="history-top-right">
                  <span className="history-date">
                    {formatDate(scan.createdAt)}
                  </span>

                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => setConfirmDeleteId(
                      confirmDeleteId === scan._id ? null : scan._id
                    )}
                    title="Delete scan"
                    aria-label="Delete scan"
                    disabled={deletingId === scan._id}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {!isPrescription && scan.matchedMedicine?.composition && (
                <p className="history-composition">
                  {scan.matchedMedicine.composition}
                </p>
              )}

              <div className="history-tags">
                {scan.batchNumber && (
                  <span className="history-tag">
                    Batch: {scan.batchNumber}
                  </span>
                )}
                {scan.expiryDate && (
                  <span className="history-tag">Exp: {scan.expiryDate}</span>
                )}
                <span className="history-tag history-tag-type">
                  {scan.type}
                </span>
              </div>

              <button
                className="history-toggle-btn"
                onClick={() => toggleExpand(scan._id)}
              >
                {isExpanded ? "Hide details ▲" : "View full details ▼"}
              </button>

              {confirmDeleteId === scan._id && (
                <div className="history-delete-confirm">
                  <span>Delete this scan from your history?</span>

                  <div className="history-delete-actions">
                    <button
                      type="button"
                      className="history-cancel-btn"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={deletingId === scan._id}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="history-confirm-btn"
                      onClick={() => handleDelete(scan._id)}
                      disabled={deletingId === scan._id}
                    >
                      {deletingId === scan._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}

              {isExpanded && (
                <div className="history-expanded">
                  {hasMultiple ? (
                    scan.matchedMedicines.map((med) =>
                      renderMedicineDetails(med, scan.batchNumber, scan.expiryDate)
                    )
                  ) : scan.matchedMedicine ? (
                    renderMedicineDetails(
                      scan.matchedMedicine,
                      scan.batchNumber,
                      scan.expiryDate
                    )
                  ) : (
                    <p className="no-match">
                      No confident match was found for this scan.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}