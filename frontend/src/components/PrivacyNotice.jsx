import React from 'react';
import { Lock, EyeOff, FileText, DatabaseZap } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <section id="privacy-notice" className="privacy-section-container">
      <div className="privacy-card">
        <div className="privacy-card-header">
          <div className="privacy-icon-badge">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="privacy-title">Privacy & Processing Policy</h3>
            <span className="privacy-subtitle">How your medical documents are handled</span>
          </div>
        </div>

        <div className="privacy-card-body">
          <p className="privacy-highlight-text">
            Your report is used to generate your explanation. Avoid uploading documents containing information you do not want processed.
          </p>

          <div className="privacy-points-grid">
            <div className="privacy-point-item">
              <EyeOff size={18} className="privacy-point-icon" />
              <div>
                <strong>In-Memory Processing</strong>
                <p>Uploaded documents are processed temporarily in memory to extract text and generate summaries.</p>
              </div>
            </div>

            <div className="privacy-point-item">
              <DatabaseZap size={18} className="privacy-point-icon" />
              <div>
                <strong>No Long-Term Storage</strong>
                <p>We do not maintain permanent user accounts, medical databases, or historical record vaults.</p>
              </div>
            </div>

            <div className="privacy-point-item">
              <FileText size={18} className="privacy-point-icon" />
              <div>
                <strong>Patient Discretion</strong>
                <p>You may redact or obscure personal identifiers (such as national ID or address) before upload.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
