import React from 'react';
import { ShieldCheck, ArrowDown, FileText, CheckCircle2 } from 'lucide-react';

export default function Hero({ onStartUpload }) {
  const handleScrollToUpload = () => {
    if (onStartUpload) {
      onStartUpload();
    } else {
      const el = document.getElementById('upload-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-pill">
        <ShieldCheck size={16} />
        <span>Patient-first AI</span>
      </div>

      <h1 className="hero-title">
        Understand Your Medical Reports
        <br />
        <span>in Simple Language</span>
      </h1>

      <p className="hero-subtitle">
        Upload a medical report and get a clear, easy-to-understand explanation of the important information in it.
      </p>

      <div className="hero-cta-wrap">
        <button type="button" className="btn-hero-cta" onClick={handleScrollToUpload}>
          <span>Analyze a Report</span>
          <ArrowDown size={18} />
        </button>
      </div>

      <div className="hero-supported-formats">
        <span className="format-label">Supported formats:</span>
        <span className="format-pill">PDF</span>
        <span className="format-dot">•</span>
        <span className="format-pill">JPG</span>
        <span className="format-dot">•</span>
        <span className="format-pill">JPEG</span>
        <span className="format-dot">•</span>
        <span className="format-pill">PNG</span>
      </div>
    </section>
  );
}
