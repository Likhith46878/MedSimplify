import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function ExtractedTextCard({ extractedText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!extractedText) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="result-card extracted-text-card">
      <div
        className="card-header-bar clickable-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="card-header-icon icon-blue">
          <FileText size={18} />
        </div>
        <div className="card-header-title-wrap">
          <h3 className="card-section-title">Original Extracted Text</h3>
          <span className="card-section-subtitle">
            Raw text extracted from your document for audit and verification
          </span>
        </div>
        <div className="card-header-actions">
          <button
            type="button"
            className="btn-toggle-expand"
            aria-label={isOpen ? "Collapse extracted text" : "Expand extracted text"}
          >
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="card-body">
          <div className="extracted-text-toolbar">
            <span className="extracted-text-meta">
              {extractedText.length.toLocaleString()} characters extracted
            </span>
            <button
              type="button"
              className="btn-copy-text"
              onClick={handleCopy}
              title="Copy extracted text"
            >
              {copied ? (
                <>
                  <Check size={14} className="copy-check-icon" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
          <div className="extracted-text-container">
            <pre className="extracted-raw-text">{extractedText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
