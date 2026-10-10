import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FileUpload from './components/FileUpload';
import LoadingState from './components/LoadingState';
import ReportResults from './components/ReportResults';
import SafetyNotice from './components/SafetyNotice';
import PrivacyNotice from './components/PrivacyNotice';
import ErrorMessage from './components/ErrorMessage';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';

import { analyzeReport } from './services/api';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({
    stage: 1,
    message: 'Reading your report...'
  });
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // AI Chatbot State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [externalChatbotPrompt, setExternalChatbotPrompt] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setResults(null);
    setErrorMessage('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResults(null);
    setErrorMessage('');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResults(null);
    setErrorMessage('');
    setIsChatbotOpen(false);
    setExternalChatbotPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisProgress({ stage: 1, message: 'Uploading and reading document...' });

    try {
      const data = await analyzeReport(selectedFile, (progressUpdate) => {
        setAnalysisProgress(progressUpdate);
      });

      setResults(data);

      // Scroll to results section smoothly
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'The report could not be processed. Please upload a clearer image or another copy.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenChatbot = () => {
    setIsChatbotOpen(true);
  };

  const handleToggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  const handleAskChatbotQuestion = (question) => {
    setExternalChatbotPrompt(question);
    setIsChatbotOpen(true);
  };

  const handleNavigate = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header onNavigate={handleNavigate} />

      <main className="main-content">
        {/* Landing Hero */}
        {!results && (
          <Hero
            onStartUpload={() => {
              const el = document.getElementById('upload-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Error States */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onDismiss={() => setErrorMessage('')}
          />
        )}

        {/* Upload Zone */}
        {!results && !isAnalyzing && (
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* Loading / Progress State */}
        {isAnalyzing && (
          <LoadingState
            progressStep={analysisProgress.stage}
            currentMessage={analysisProgress.message}
          />
        )}

        {/* Results View */}
        {results && (
          <ReportResults
            results={results}
            onReset={handleReset}
            onOpenChatbot={handleOpenChatbot}
            onAskChatbotQuestion={handleAskChatbotQuestion}
          />
        )}

        {/* Medical Safety Disclaimer Section */}
        <SafetyNotice />

        {/* Privacy Principles */}
        <PrivacyNotice />
      </main>

      {/* Floating / Expandable AI Chatbot */}
      <Chatbot
        reportContext={results}
        isOpen={isChatbotOpen}
        onToggle={handleToggleChatbot}
        externalPrompt={externalChatbotPrompt}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
