/**
 * MedSimplify API Service Layer
 * Connects frontend directly to the FastAPI backend and AI endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Format bytes into readable string (KB / MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Uploads and analyzes a medical report file via the FastAPI backend.
 *
 * @param {File} file - Uploaded File object (PDF, JPG, JPEG, PNG)
 * @param {Function} onProgressUpdate - Callback reporting current processing stage
 * @returns {Promise<Object>} Analyzed report object from backend
 */
export async function analyzeReport(file, onProgressUpdate = () => {}) {
  if (!file) {
    throw new Error('No file was provided for analysis.');
  }

  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

  if (!hasValidExt) {
    throw new Error('Unsupported file format. Please upload a PDF, JPG, JPEG, or PNG medical report.');
  }

  // Max 15MB limit
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('The file exceeds the maximum allowed size of 15 MB. Please select a smaller document.');
  }

  // Stage 1: Uploading and reading file
  onProgressUpdate({ stage: 1, message: 'Reading and validating your report...' });

  const formData = new FormData();
  formData.append('file', file);

  // Stage 2: Extracting medical values & OCR
  onProgressUpdate({ stage: 2, message: 'Extracting medical tests, values, and ranges...' });

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze-report`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(
      `Unable to connect to the MedSimplify backend server at ${API_BASE_URL}. Please ensure the backend is running.`
    );
  }

  // Stage 3: AI simplification & structure building
  onProgressUpdate({ stage: 3, message: 'Preparing your simplified explanation...' });

  if (!response.ok) {
    let errorDetail = 'The medical report could not be analyzed.';
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch (_) {
      errorDetail = `Server error (${response.status}: ${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data;
}

/**
 * Sends a user question to the backend AI chatbot endpoint.
 *
 * @param {string} userQuestion - The question asked by user
 * @param {Object} reportContext - Current report details (containing extracted_text)
 * @param {Array} conversationHistory - List of prior messages [{role: 'user'|'assistant', content: '...'}]
 * @returns {Promise<string>} AI response answer
 */
export async function sendChatMessage(userQuestion, reportContext = null, conversationHistory = []) {
  if (!userQuestion || !userQuestion.trim()) {
    throw new Error('Message cannot be empty.');
  }

  const payload = {
    report_text: reportContext?.extracted_text || '',
    user_question: userQuestion.trim(),
    conversation_history: conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map((m) => ({
          role: m.sender === 'bot' ? 'assistant' : m.sender || m.role,
          content: m.text || m.content || ''
        }))
      : []
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/chat-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    throw new Error(
      `Unable to connect to the AI chatbot server. Please check your backend connection.`
    );
  }

  if (!response.ok) {
    let errorDetail = 'Failed to get a response from the AI assistant.';
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch (_) {
      errorDetail = `Chat service error (${response.status}: ${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data.answer || data.response || 'No response content returned.';
}
