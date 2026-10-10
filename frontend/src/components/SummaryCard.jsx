import React from 'react';
import { FileText } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="result-card summary-card">
      <div className="card-header-bar">
        <div className="card-header-icon icon-blue">
          <FileText size={18} />
        </div>
        <div className="card-header-title-wrap">
          <h3 className="card-section-title">Quick Summary</h3>
          <span className="card-section-subtitle">High-level overview of your document</span>
        </div>
      </div>
      <div className="card-body">
        <p className="summary-paragraph">{summary}</p>
      </div>
    </div>
  );
}
