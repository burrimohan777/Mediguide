import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./Dashboard.css";


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    navigate("/login");
    logout();
  };


  const location = useLocation();
  const [showLoginToast, setShowLoginToast] = useState(
    location.state?.loginSuccess === true
  );

  useEffect(() => {
    if (!showLoginToast) return;

    const timer = setTimeout(() => {
      setShowLoginToast(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showLoginToast]);


  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const DashboardHome = () => {
    return (
      <>
        <div className="main-header">
          <div>
            <h1 className="greeting-title">Hello, {user?.name}</h1>
            <p className="greeting-sub">Your Health Matters...</p>
          </div>
          <ProfileDropdown />
        </div>

        <div className="card-grid">
          <button className="dash-card card-teal" onClick={() => navigate("/scan-camera")}>
            <div className="ic-wrap">📷</div>
            <h3>Scan Medicine</h3>
            <p>Get medicine information</p>
          </button>

          <button className="dash-card card-clay" onClick={() => navigate("/scan")}>
            <div className="ic-wrap">📝</div>
            <h3>Upload Medicine</h3>
            <p>Upload your prescription</p>
          </button>

          <button className="dash-card card-plum" onClick={() => navigate("/scan-prescription")}>
            <div className="ic-wrap">📝</div>
            <h3>Scan Prescription</h3>
            <p>Identify medicines from a prescription</p>
          </button>

          <button className="dash-card card-amber" onClick={() => navigate("/scan-history")}>
            <div className="ic-wrap">🕘</div>
            <h3>View History</h3>
            <p>Check past scans</p>
          </button>

          <button className="dash-card card-sage dash-card-last">
            <div className="ic-wrap">💬</div>
            <h3>Ask AI</h3>
            <p>Get answers in your language</p>
          </button>
        </div>
      </>
    );
  };

  const ProfileDropdown = () => {
    return (
      <div className="avatar-wrap" ref={dropdownRef}>
        <button className="avatar" onClick={() => setShowDropdown((v) => !v)}>
          {initial}
        </button>

        {showDropdown && (
          <div className="profile-dropdown">
            <p className="dropdown-name">{user?.name}</p>
            <p className="dropdown-email">{user?.email}</p>
            <button className="dropdown-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  const PageHeader = ({ icon, title, subtitle }) => {
    return (
      <div className="feature-page-header">
        <div className="feature-icon">{icon}</div>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    );
  };

  const ScanMedicine = () => {
    return (
      <div className="feature-page">
        <PageHeader
          icon="📷"
          title="Scan Medicine"
          subtitle="Identify your medicine and learn more about it."
        />

        <div className="intro-box">
          <h2>What is Scan Medicine?</h2>
          <p>
            Scan Medicine allows you to capture a clear image of your medicine
            package, tablet strip, bottle, or label. The system can analyze the
            visible information and help identify the medicine.
          </p>
        </div>

        <h2 className="section-title">How it works</h2>

        <div className="steps-grid">
          <Step
            number="1"
            title="Capture the medicine"
            text="Take a clear picture of the medicine strip, bottle, box, or package."
          />
          <Step
            number="2"
            title="Scan the image"
            text="The system reads visible text such as the medicine name, strength, and other details."
          />
          <Step
            number="3"
            title="Identify the medicine"
            text="The detected medicine name can be matched with available medicine information."
          />
          <Step
            number="4"
            title="View information"
            text="View available information such as uses, possible side effects, warnings, and other details."
          />
        </div>

        <div className="tips-box">
          <h2>Tips for better scanning</h2>
          <ul>
            <li>Keep the medicine package clearly visible.</li>
            <li>Make sure the medicine name is readable.</li>
            <li>Use good lighting.</li>
            <li>Avoid blurry or tilted images.</li>
            <li>Include the medicine strength if possible.</li>
          </ul>
        </div>

        <button
          className="feature-button"
          onClick={() => {
            alert("Camera Scanning is Connecting.....");
            navigate("/scan-camera")
          }}
        >
          📷 Start Scanning
        </button>


      </div>
    );
  };

  const UploadMedicine = () => {
    return (
      <div className="feature-page">
        <PageHeader
          icon="📝"
          title="Upload Medicine"
          subtitle="Upload a medicine image or prescription for analysis."
        />

        <div className="intro-box">
          <h2>What is Upload Medicine?</h2>
          <p>
            Upload Medicine allows you to select an image from your device
            instead of using the camera. The uploaded image can be analyzed to
            detect medicine-related information.
          </p>
        </div>

        <h2 className="section-title">How it works</h2>

        <div className="steps-grid">
          <Step
            number="1"
            title="Select an image"
            text="Choose a clear medicine image or prescription from your phone or computer."
          />
          <Step
            number="2"
            title="Upload the image"
            text="The selected image will be prepared for processing."
          />
          <Step
            number="3"
            title="Extract information"
            text="The system can read visible text from the uploaded image."
          />
          <Step
            number="4"
            title="View the results"
            text="Available medicine information can be displayed in an easy-to-understand format."
          />
        </div>

        <div className="tips-box">
          <h2>Tips for better results</h2>
          <ul>
            <li>Upload a clear image.</li>
            <li>Make sure the medicine name is visible.</li>
            <li>Avoid dark or blurry images.</li>
            <li>Include the complete medicine label if possible.</li>
          </ul>
        </div>

        <button
          className="feature-button"
          onClick={() => {
            alert("File Upload is Connecting....");
            navigate("/scan");
          }}
        >
          📁 Upload Medicine
        </button>


      </div>
    );
  };

  const ScanPrescription = () => {
    return (
      <div className="feature-page">
        <PageHeader
          icon="📝"
          title="Scan Prescription"
          subtitle="Identify all medicines listed on a doctor's prescription."
        />

        <div className="intro-box">
          <h2>What is Scan Prescription?</h2>
          <p>
            Scan Prescription allows you to upload or capture a photo of a
            doctor's prescription slip. The system can attempt to read the
            medicines listed and show information about each one.
          </p>
        </div>

        <h2 className="section-title">How it works</h2>

        <div className="steps-grid">
          <Step
            number="1"
            title="Capture the prescription"
            text="Take a clear photo of the full prescription slip."
          />
          <Step
            number="2"
            title="Scan the text"
            text="The system reads the medicine names listed on the slip."
          />
          <Step
            number="3"
            title="Identify each medicine"
            text="Each detected medicine name is matched against available medicine information."
          />
          <Step
            number="4"
            title="View all results"
            text="See information for every medicine found on the prescription, in one place."
          />
        </div>

        <div className="tips-box">
          <h2>Tips for better results</h2>
          <ul>
            <li>Printed prescriptions work best.</li>
            <li>Handwritten prescriptions may not always be read accurately.</li>
            <li>Use good lighting and a flat, straight-on photo.</li>
            <li>Make sure all medicine names are visible in the frame.</li>
          </ul>
        </div>

        <button
          className="feature-button"
          onClick={() => {
            alert("Prescription Scanning is Connecting....");
            navigate("/scan-prescription");
          }}
        >
          📝 Start Scanning
        </button>
      </div>
    );
  };

  const ScanHistory = () => {
    return (
      <div className="feature-page">
        <PageHeader
          icon="🕘"
          title="Scan History"
          subtitle="Review your previous medicine scans."
        />

        <div className="intro-box">
          <h2>What is Scan History?</h2>
          <p>
            Scan History is where your previous medicine scans can be viewed.
            It helps you quickly return to medicine information that you have
            already checked.
          </p>
        </div>

        <h2 className="section-title">How it works</h2>

        <div className="steps-grid">
          <Step
            number="1"
            title="Scan a medicine"
            text="Use Scan Medicine or Upload Medicine to analyze a medicine."
          />
          <Step
            number="2"
            title="Save the scan"
            text="The medicine name and scan details can be stored in your history."
          />
          <Step
            number="3"
            title="Review later"
            text="Open Scan History whenever you want to review your previous scans."
          />
        </div>

        <div className="tips-box">
          <h2>Your history can contain</h2>
          <ul>
            <li>Medicine name</li>
            <li>Date and time of the scan</li>
            <li>Scan method</li>
            <li>Available medicine information</li>
          </ul>
        </div>

        <button
          className="feature-button"
          onClick={() => {
            alert("Scan History is Connecting....")
            navigate("/scan-history");
          }}
        >
          🕘 View Scan History
        </button>
      </div>
    );
  };

  const AskAI = () => {
    return (
      <div className="feature-page">
        <PageHeader
          icon="💬"
          title="Ask AI"
          subtitle="Get simple explanations about medicines and health information."
        />

        <div className="intro-box">
          <h2>What is Ask AI?</h2>
          <p>
            Ask AI allows you to ask questions about medicines and receive
            easy-to-understand explanations. You can ask follow-up questions
            to learn more.
          </p>
        </div>

        <h2 className="section-title">How it works</h2>

        <div className="steps-grid">
          <Step
            number="1"
            title="Ask a question"
            text="Type your question about a medicine or general medicine-related topic."
          />
          <Step
            number="2"
            title="AI understands your question"
            text="The AI processes your question and identifies what information you need."
          />
          <Step
            number="3"
            title="Get an explanation"
            text="You receive a simple explanation based on the information available to the AI."
          />
          <Step
            number="4"
            title="Ask follow-up questions"
            text="Continue asking questions if you need additional clarification."
          />
        </div>

        <div className="tips-box">
          <h2>Example questions</h2>
          <ul>
            <li>What is this medicine used for?</li>
            <li>What are the common side effects?</li>
            <li>How should this medicine be stored?</li>
            <li>What is the difference between these medicines?</li>
            <li>What does this medicine contain?</li>
          </ul>
        </div>

        <button
          className="feature-button"
          onClick={() => alert("AI Chat is Connecting....")}
        >
          💬 Start Chat
        </button>


      </div>
    );
  };

  const Step = ({ number, title, text }) => {
    return (
      <div className="step-card">
        <div className="step-number">{number}</div>
        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activePage === "scan") {
      return <ScanMedicine />;
    }

    if (activePage === "upload") {
      return <UploadMedicine />;
    }

    if (activePage === "prescription") {
      return <ScanPrescription />;
    }

    if (activePage === "history") {
      return <ScanHistory />;
    }

    if (activePage === "ai") {
      return <AskAI />;
    }

    return <DashboardHome />;
  };

  return (
    <div className="dash-shell">
      {showLoginToast && (
        <div className="toast toast-success" role="status">
          <span>✓ Login successful</span>

          <button
            type="button"
            className="toast-close"
            onClick={() => setShowLoginToast(false)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
      <div className="sidebar">
        <div
          className={`side-link ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          <span className="ic">📊</span>
          Dashboard
        </div>

        <div
          className={`side-link ${activePage === "scan" ? "active" : ""}`}
          onClick={() => setActivePage("scan")}
        >
          <span className="ic">📷</span>
          Scan Medicine
        </div>

        <div
          className={`side-link ${activePage === "upload" ? "active" : ""}`}
          onClick={() => setActivePage("upload")}
        >
          <span className="ic">📝</span>
          Upload Medicine
        </div>

        <div
          className={`side-link ${activePage === "prescription" ? "active" : ""}`}
          onClick={() => setActivePage("prescription")}
        >
          <span className="ic">📝</span>
          Scan Prescription
        </div>

        <div
          className={`side-link ${activePage === "history" ? "active" : ""}`}
          onClick={() => setActivePage("history")}
        >
          <span className="ic">🕘</span>
          Scan History
        </div>

        <div
          className={`side-link ${activePage === "ai" ? "active" : ""}`}
          onClick={() => setActivePage("ai")}
        >
          <span className="ic">💬</span>
          Ask AI
        </div>

        <div className="sidebar-logout">
          <button className="side-link" onClick={handleLogout}>
            <span className="ic">⏻</span>
            Logout
          </button>
        </div>
      </div>

      <div className="main">{renderContent()}</div>
    </div>
  );
}