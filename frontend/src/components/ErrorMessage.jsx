import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <AlertCircle className="error-icon" size={22} />
      <div className="error-content">
        <h4 className="error-title">Unable to Process Report</h4>
        <p className="error-message">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="btn-dismiss-error"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
