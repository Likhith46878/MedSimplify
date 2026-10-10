import React from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse, Stethoscope } from 'lucide-react';

export default function SafetyNotice() {
  return (
    <section id="safety-notice" className="safety-section-container">
      <div className="safety-notice-card">
        <div className="safety-notice-icon-wrap">
          <AlertTriangle size={24} />
        </div>
        <div className="safety-notice-content">
          <div className="safety-title-row">
            <h3 className="safety-card-title">Medical Safety Notice</h3>
            <span className="safety-badge">Important Disclaimer</span>
          </div>
          <p className="safety-card-body">
            This tool provides general information to help you understand your report. It is not a diagnosis and does not replace advice from a qualified healthcare professional. Always consult your doctor for medical decisions and interpretation of diagnostic results.
          </p>

          <div className="safety-guidelines-grid">
            <div className="safety-bullet">
              <Stethoscope size={16} className="safety-bullet-icon" />
              <div>
                <strong>Non-Diagnostic</strong>
                <span>Translates vocabulary and numbers; does not formulate clinical conclusions.</span>
              </div>
            </div>
            <div className="safety-bullet">
              <HeartPulse size={16} className="safety-bullet-icon" />
              <div>
                <strong>Seek Immediate Care If Urgent</strong>
                <span>If you are experiencing acute symptoms or distress, call emergency services immediately.</span>
              </div>
            </div>
            <div className="safety-bullet">
              <ShieldCheck size={16} className="safety-bullet-icon" />
              <div>
                <strong>Physician Partnership</strong>
                <span>Use these simplified summaries and question prompts to prepare for productive doctor visits.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
