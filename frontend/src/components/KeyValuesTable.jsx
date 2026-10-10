import React from 'react';
import { Table, CheckCircle2, AlertCircle } from 'lucide-react';

export default function KeyValuesTable({ keyValues }) {
  if (!keyValues || keyValues.length === 0) return null;

  return (
    <div className="result-card key-values-card">
      <div className="card-header-bar">
        <div className="card-header-icon icon-teal">
          <Table size={18} />
        </div>
        <div className="card-header-title-wrap">
          <h3 className="card-section-title">Key Medical Values</h3>
          <span className="card-section-subtitle">Measurements and standard reference targets</span>
        </div>
      </div>
      <div className="card-body">
        {/* Desktop / Tablet Table View */}
        <div className="table-responsive-wrapper desktop-table-view">
          <table className="medical-values-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Test</th>
                <th style={{ width: '18%' }}>Result</th>
                <th style={{ width: '20%' }}>Reference Range</th>
                <th style={{ width: '40%' }}>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {keyValues.map((row, idx) => {
                const isElevated = row.explanation && row.explanation.toLowerCase().includes('above');
                return (
                  <tr key={idx} className={isElevated ? 'row-elevated' : 'row-normal'}>
                    <td className="cell-test-name">
                      <strong>{row.test}</strong>
                    </td>
                    <td className="cell-result">
                      <span className={`result-badge ${isElevated ? 'badge-amber' : 'badge-neutral'}`}>
                        {row.value} {row.unit ? row.unit : ''}
                      </span>
                    </td>
                    <td className="cell-range">
                      <span className="reference-range-text">{row.reference_range || 'N/A'}</span>
                    </td>
                    <td className="cell-explanation">
                      <p className="table-explanation-text">{row.explanation}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="mobile-values-cards-view">
          {keyValues.map((row, idx) => {
            const isElevated = row.explanation && row.explanation.toLowerCase().includes('above');
            return (
              <div key={idx} className={`mobile-value-card ${isElevated ? 'border-elevated' : ''}`}>
                <div className="mobile-value-top">
                  <span className="mobile-test-title">{row.test}</span>
                  <span className={`result-badge ${isElevated ? 'badge-amber' : 'badge-neutral'}`}>
                    {row.value} {row.unit ? row.unit : ''}
                  </span>
                </div>
                <div className="mobile-range-row">
                  <span className="mobile-range-label">Reference Range:</span>
                  <span className="mobile-range-val">{row.reference_range || 'N/A'}</span>
                </div>
                <p className="mobile-explanation-text">{row.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
