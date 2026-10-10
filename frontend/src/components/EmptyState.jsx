import React from 'react';
import { FileSearch } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-wrap">
        <FileSearch size={36} />
      </div>
      <h3 className="empty-state-title">No Report Loaded Yet</h3>
      <p className="empty-state-description">
        Your simplified report will appear here after analysis. Upload a PDF or medical report image above to get started.
      </p>
    </div>
  );
}
