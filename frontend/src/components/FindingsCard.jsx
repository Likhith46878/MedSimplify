import React from 'react';
import { AlertCircle, CheckCircle, Info, Activity } from 'lucide-react';

export default function FindingsCard({ findings }) {
  if (!findings || findings.length === 0) return null;

  const renderBadge = (importance) => {
    const imp = (importance || '').toLowerCase();
    if (imp === 'high') {
      return (
        <span className="importance-badge badge-high">
          <AlertCircle size={13} />
          <span>Moderate Concern</span>
        </span>
      );
    }
    if (imp === 'moderate' || imp === 'medium') {
      return (
        <span className="importance-badge badge-moderate">
          <Info size={13} />
          <span>Moderate Importance</span>
        </span>
      );
    }
    return (
      <span className="importance-badge badge-low">
        <CheckCircle size={13} />
        <span>Within Normal Limits</span>
      </span>
    );
  };

  return (
    <div className="result-card findings-card">
      <div className="card-header-bar">
        <div className="card-header-icon icon-amber">
          <Activity size={18} />
        </div>
        <div className="card-header-title-wrap">
          <h3 className="card-section-title">Important Findings</h3>
          <span className="card-section-subtitle">Key observations extracted from your report</span>
        </div>
      </div>
      <div className="card-body">
        <div className="findings-grid">
          {findings.map((item, idx) => (
            <div key={idx} className="finding-item-card">
              <div className="finding-top-row">
                <div className="finding-title-group">
                  <span className="finding-title">{item.title}</span>
                  {item.value && <span className="finding-value-pill">{item.value}</span>}
                </div>
                {renderBadge(item.importance)}
              </div>
              <p className="finding-explanation-text">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
