import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  Minimize2,
  Maximize2,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { SUGGESTED_CHAT_PROMPTS } from '../data/mockReport';

export default function Chatbot({ reportContext, isOpen, onToggle, externalPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text:
        "Hello! I am your MedSimplify assistant. I can help explain medical terms, lab ranges, and questions in your report. What would you like to clarify?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Handle external prompt passed from parent (e.g. from questions card)
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSendMessage(externalPrompt);
    }
  }, [externalPrompt]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query || !query.trim() || isTyping) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const botResponse = await sendChatMessage(query.trim(), reportContext, messages);
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: `Error: ${err.message || "Failed to reach AI service. Please verify the backend is running and try again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-fresh',
        sender: 'bot',
        text:
          "Chat cleared. Feel free to ask another question about your medical report!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-floating-trigger"
          onClick={onToggle}
          aria-label="Open AI Assistant"
        >
          <div className="chat-trigger-icon-wrap">
            <MessageSquare size={20} />
            <span className="chat-trigger-pulse"></span>
          </div>
          <span className="chat-trigger-label">
            {reportContext ? 'Ask about this report' : 'Ask medical question'}
          </span>
        </button>
      )}

      {/* Floating / Responsive Chat Panel */}
      {isOpen && (
        <div className={`chatbot-window-panel ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-identity">
              <div className="chatbot-avatar-icon">
                <Bot size={20} />
              </div>
              <div className="chatbot-header-text">
                <div className="chatbot-header-title-row">
                  <h4 className="chatbot-title">MedSimplify Assistant</h4>
                  {reportContext ? (
                    <span className="report-active-badge">Report Active</span>
                  ) : (
                    <span className="report-inactive-badge">General Mode</span>
                  )}
                </div>
                <span className="chatbot-subtitle">
                  {reportContext ? `Linked to ${reportContext.filename || 'uploaded report'}` : 'Ask questions about tests & ranges'}
                </span>
              </div>
            </div>

            <div className="chatbot-header-controls">
              <button
                type="button"
                className="btn-chat-ctrl"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                type="button"
                className="btn-chat-ctrl"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                className="btn-chat-ctrl"
                onClick={onToggle}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Internal Safety Disclaimer */}
              <div className="chatbot-disclaimer-banner">
                <Shield size={14} className="text-amber flex-shrink-0" />
                <span>
                  I provide educational explanations of lab metrics. I do not diagnose conditions or prescribe medications.
                </span>
              </div>

              {/* Message Feed */}
              <div className="chatbot-message-feed">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
                  >
                    <div className="chat-avatar">
                      {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="chat-bubble-content">
                      <div className="chat-bubble-text">{msg.text}</div>
                      <span className="chat-timestamp">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="chat-bubble-row bot-row">
                    <div className="chat-avatar">
                      <Bot size={14} />
                    </div>
                    <div className="chat-bubble-content typing-bubble">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Chips */}
              <div className="chatbot-suggestions-wrapper">
                <span className="suggestions-eyebrow">
                  <Sparkles size={12} />
                  <span>Suggested questions:</span>
                </span>
                <div className="suggestions-chips-scroll">
                  {SUGGESTED_CHAT_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isTyping}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="chatbot-input-area">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    reportContext
                      ? "Ask a question about your report..."
                      : "Ask a general medical question..."
                  }
                  rows={1}
                  className="chatbot-input-textarea"
                />
                <button
                  type="button"
                  className="btn-send-chat"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
