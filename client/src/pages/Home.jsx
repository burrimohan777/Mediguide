import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-copy">
          <p className="home-kicker">MediGuide</p>
          <h1 className="home-title">
            Point your camera at a medicine.
            <br />
            Understand it in seconds.
          </h1>
          <p className="home-sub">
            Scan any tablet, strip, or prescription and get its uses, dosage,
            warnings, and side effects — explained simply, in English, Hindi,
            or Telugu.
          </p>
          <button className="home-cta" onClick={() => navigate("/register")}>
            Get Started 
          </button>
          <p className="home-note">
            Already have an account? <a onClick={() => navigate("/login")}>Log in</a>
          </p>
        </div>

        <div className="home-visual" aria-hidden="true">
          <svg viewBox="0 0 420 420" className="viewfinder-svg">
            <path d="M28 90 V40 a12 12 0 0 1 12 -12 H90" className="bracket" />
            <path d="M330 28 H380 a12 12 0 0 1 12 12 V90" className="bracket" />
            <path d="M392 330 V380 a12 12 0 0 1 -12 12 H330" className="bracket" />
            <path d="M90 392 H40 a12 12 0 0 1 -12 -12 V330" className="bracket" />

            <g transform="translate(210 210)">
              <ellipse cx="0" cy="0" rx="98" ry="98" className="glow" />
              <g transform="rotate(-32)">
                <rect x="-70" y="-26" width="140" height="52" rx="26" className="pill-half-a" />
                <rect x="0" y="-26" width="70" height="52" rx="2" className="pill-half-b" />
                <rect x="-70" y="-26" width="140" height="52" rx="26" className="pill-outline" />
                <line x1="0" y1="-26" x2="0" y2="26" className="pill-divider" />
              </g>
            </g>

            <circle cx="210" cy="210" r="150" className="scan-ring" />
          </svg>
        </div>
      </div>

      <div className="home-strip">
        <div className="strip-item">
          <span className="strip-label">Scan</span>
          <span className="strip-text">Photograph a package or prescription</span>
        </div>
        <div className="strip-item">
          <span className="strip-label">Understand</span>
          <span className="strip-text">Plain-language uses, dosage, and warnings</span>
        </div>
        <div className="strip-item">
          <span className="strip-label">Speak</span>
          <span className="strip-text">Ask questions by voice, in your language</span>
        </div>
      </div>
    </div>
  );
}