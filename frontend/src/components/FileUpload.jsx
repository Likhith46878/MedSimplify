import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { formatBytes } from '../services/api';

export default function FileUpload({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
  isAnalyzing
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      alert('Unsupported file format. Please upload a PDF, JPG, JPEG, or PNG medical report.');
      return;
    }

    // 15 MB limit check
    if (file.size > 15 * 1024 * 1024) {
      alert('The selected file exceeds the 15 MB limit. Please select a smaller file.');
      return;
    }

    onFileSelect(file);
  };

  const isPDF = selectedFile?.name?.toLowerCase().endsWith('.pdf');

  return (
    <div id="upload-section" className="upload-container">
      {/* Hidden standard file input supporting PDF and images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        style={{ display: 'none' }}
      />

      <div className="upload-card">
        {!selectedFile ? (
          /* ================= EMPTY / DROPZONE STATE ================= */
          <div className="dropzone-wrapper">
            <div
              className={`dropzone ${isDragOver ? 'dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <div className="dropzone-icon-circle">
                <UploadCloud size={32} />
              </div>
              <h3 className="dropzone-title">Upload your medical report</h3>
              <p className="dropzone-subtitle">Click to browse or drag and drop your document here</p>

              <div className="dropzone-tags">
                <span className="file-type-pill">PDF</span>
                <span className="file-type-pill">JPG</span>
                <span className="file-type-pill">JPEG</span>
                <span className="file-type-pill">PNG</span>
                <span className="file-type-pill max-size-tag">Max 15 MB</span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= FILE SELECTED STATE ================= */
          <div className="file-selected-state">
            <div className="selected-card-inner">
              <div className="file-icon-large">
                {isPDF ? <FileText size={28} /> : <ImageIcon size={28} />}
              </div>

              <div className="file-summary-meta">
                <span className="file-name-display" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <div className="file-subdetails">
                  <span className="file-kind-badge">{isPDF ? 'PDF Report' : 'Medical Image'}</span>
                  <span className="meta-separator">•</span>
                  <span className="file-size-display">{formatBytes(selectedFile.size)}</span>
                </div>
              </div>

              <div className="file-button-actions">
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  title="Change file"
                >
                  <RefreshCw size={15} />
                  <span>Change File</span>
                </button>
                <button
                  type="button"
                  className="btn-action-danger"
                  onClick={onRemoveFile}
                  disabled={isAnalyzing}
                  title="Remove file"
                >
                  <Trash2 size={15} />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            <div className="analyze-action-wrapper">
              <button
                type="button"
                className="btn-analyze-main"
                onClick={onAnalyze}
                disabled={isAnalyzing}
              >
                <span>Analyze Report</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Privacy Note required near upload */}
        <div className="privacy-micro-notice">
          <Shield size={15} className="text-muted-icon" />
          <p>
            Your report is used to generate your explanation. Avoid uploading documents containing information you do not want processed.
          </p>
        </div>
      </div>
    </div>
  );
}
