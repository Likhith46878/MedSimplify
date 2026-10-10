import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const handleNavClick = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-brand-section">
          <div className="footer-logo-row">
            <div className="footer-logo-icon">
              <Activity size={20} />
            </div>
            <span className="footer-brand-title">
              Med<span>Simplify</span>
            </span>
          </div>
          <p className="footer-tagline">Making medical information easier to understand.</p>
          <span className="footer-subtext">
            Dedicated to patient literacy, empathetic communication, and clear health insights.
          </span>
        </div>

        <div className="footer-nav-columns">
          <div className="footer-col">
            <h5 className="footer-col-heading">Navigation</h5>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => handleNavClick('upload-section')}>
                  Analyze Report
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-heading">Trust & Safety</h5>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => handleNavClick('safety-notice')}>
                  Medical Safety Notice
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => handleNavClick('privacy-notice')}>
                  Privacy & Data Principles
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          © {new Date().getFullYear()} MedSimplify. All rights reserved. For educational and informational purposes only.
        </p>
        <p className="footer-disclaimer-micro">
          MedSimplify does not provide medical diagnoses, treatment recommendations, or clinical advice. Always consult your qualified healthcare provider.
        </p>
      </div>
    </footer>
  );
}
