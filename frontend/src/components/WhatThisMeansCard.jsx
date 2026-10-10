import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

export default function WhatThisMeansCard({ text }) {
  if (!text) return null;

  return (
    <div className="result-card what-this-means-card">
      <div className="card-header-bar">
        <div className="card-header-icon icon-purple">
          <Lightbulb size={18} />
        </div>
        <div className="card-header-title-wrap">
          <h3 className="card-section-title">What This Means</h3>
          <span className="card-section-subtitle">Understanding these findings in everyday context</span>
        </div>
      </div>
      <div className="card-body">
        <p className="what-this-means-text">{text}</p>

        <div className="non-diagnostic-callout">
          <Info size={16} className="text-primary flex-shrink-0" />
          <p>
            This summary is an educational translation of numbers and ranges. It is not a clinical diagnosis. Individual health factors, personal history, and physician evaluations are essential to determine what these results mean for you.
          </p>
        </div>
      </div>
    </div>
  );
}
