import React from 'react';
import { FileText, Clock, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';

export default function ReportOverviewCard({ results }) {
  if (!results) return null;

  const overview = results.overview || {};
  const findingsCount = results.important_findings ? results.important_findings.length : 0;

  return (
    <div className="report-overview-card">
      <div className="overview-card-header">
        <div className="overview-badge">
          <ShieldCheck size={14} />
          <span>Report Overview</span>
        </div>
        {results.file_type && (
          <span className="overview-type-pill">{results.file_type}</span>
        )}
      </div>

      <div className="overview-grid">
        <div className="overview-item">
          <div className="overview-item-icon">
            <FileText size={16} />
          </div>
          <div className="overview-item-text">
            <span className="overview-label">Report File</span>
            <span className="overview-value" title={results.filename}>
              {results.filename || 'Uploaded Document'}
            </span>
          </div>
        </div>

        <div className="overview-item">
          <div className="overview-item-icon">
            <Clock size={16} />
          </div>
          <div className="overview-item-text">
            <span className="overview-label">Analyzed</span>
            <span className="overview-value">{results.analyzed_at || 'Recently'}</span>
          </div>
        </div>

        <div className="overview-item">
          <div className="overview-item-icon">
            <Layers size={16} />
          </div>
          <div className="overview-item-text">
            <span className="overview-label">Sections Detected</span>
            <span className="overview-value">
              {overview.sections_detected || 'Medical Laboratory Panel'}
            </span>
          </div>
        </div>

        <div className="overview-item">
          <div className="overview-item-icon">
            <AlertTriangle size={16} />
          </div>
          <div className="overview-item-text">
            <span className="overview-label">Important Findings</span>
            <span className="overview-value highlight-value">
              {overview.important_findings_count ?? findingsCount} Noted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
