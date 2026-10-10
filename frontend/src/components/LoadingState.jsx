import React from 'react';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function LoadingState({ progressStep = 1, currentMessage = 'Reading your report...' }) {
  const steps = [
    { number: 1, label: 'Reading Document' },
    { number: 2, label: 'Extracting Information' },
    { number: 3, label: 'Simplifying Medical Content' }
  ];

  return (
    <div className="loading-card" role="status" aria-live="polite">
      <div className="loading-spinner-ring"></div>

      <h3 className="loading-title">{currentMessage}</h3>
      <p className="loading-subtitle">
        Translating clinical terminology and structuring key measurements into plain English.
      </p>

      {/* Progress Step Indicators */}
      <div className="loading-step-indicators">
        {steps.map((step) => {
          const isDone = progressStep > step.number;
          const isCurrent = progressStep === step.number;

          return (
            <div
              key={step.number}
              className={`loading-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-dot">
                {isDone ? <CheckCircle2 size={14} /> : <span>{step.number}</span>}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="loading-progress-bar-wrap">
        <div
          className="loading-progress-bar"
          style={{ width: `${Math.min(progressStep * 33.33, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
