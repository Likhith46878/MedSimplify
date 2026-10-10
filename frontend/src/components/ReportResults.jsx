import React from 'react';
import {
  RotateCcw,
  Printer,
  Sparkles,
  MessageSquare,
  FileCheck,
  Share2
} from 'lucide-react';
import ReportOverviewCard from './ReportOverviewCard';
import SummaryCard from './SummaryCard';
import FindingsCard from './FindingsCard';
import KeyValuesTable from './KeyValuesTable';
import WhatThisMeansCard from './WhatThisMeansCard';
import DoctorQuestionsCard from './DoctorQuestionsCard';
import ExtractedTextCard from './ExtractedTextCard';

export default function ReportResults({ results, onReset, onOpenChatbot, onAskChatbotQuestion }) {
  if (!results) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="results-section" className="results-container">
      {/* Results Header */}
      <div className="results-main-header">
        <div className="results-title-group">
          <div className="results-badge-pill">
            <FileCheck size={16} />
            <span>Analysis Complete</span>
          </div>
          <h2 className="results-heading">Your Report, Simplified</h2>
          <p className="results-subheading">
            Here's an easy-to-understand explanation of the information found in your report.
          </p>
        </div>

        <div className="results-top-actions">
          <button
            type="button"
            className="btn-action-outline"
            onClick={handlePrint}
            title="Print or save as PDF"
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            className="btn-action-primary-sm"
            onClick={onOpenChatbot}
            title="Open AI Chat Assistant"
          >
            <MessageSquare size={16} />
            <span>Ask AI Assistant</span>
          </button>
          <button
            type="button"
            className="btn-action-subtle"
            onClick={onReset}
            title="Upload a new report"
          >
            <RotateCcw size={16} />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* Main Results Grid / Layout */}
      <div className="results-layout-grid">
        {/* Top/Sidebar Overview */}
        <ReportOverviewCard results={results} />

        {/* Section A: Quick Summary */}
        <SummaryCard summary={results.summary} />

        {/* Section B: Important Findings */}
        <FindingsCard findings={results.important_findings} />

        {/* Section C: Key Medical Values */}
        <KeyValuesTable keyValues={results.key_values} />

        {/* Section D: What This Means */}
        <WhatThisMeansCard text={results.what_this_means} />

        {/* Section E: Questions for Doctor */}
        <DoctorQuestionsCard
          questions={results.doctor_questions}
          onAskChatbot={onAskChatbotQuestion}
        />

        {/* Section F: Extracted Text Audit */}
        <ExtractedTextCard extractedText={results.extracted_text} />
      </div>

      {/* Bottom Action Footer for Results */}
      <div className="results-bottom-bar">
        <div className="bottom-bar-text">
          <span>Need further clarification on these findings?</span>
        </div>
        <div className="bottom-bar-buttons">
          <button type="button" className="btn-primary" onClick={onOpenChatbot}>
            <Sparkles size={16} />
            <span>Ask MedSimplify AI</span>
          </button>
          <button type="button" className="btn-secondary" onClick={onReset}>
            <RotateCcw size={16} />
            <span>Analyze Another Document</span>
          </button>
        </div>
      </div>
    </div>
  );
}
