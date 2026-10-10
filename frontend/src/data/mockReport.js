/**
 * Realistic Mock Data for MedSimplify Frontend (Phase 1)
 *
 * This file provides structured, patient-friendly medical report summaries
 * and intelligent chatbot response mappings for testing the entire UI flow.
 */

export const DEFAULT_MOCK_REPORT = {
  filename: "Blood_Chemistry_Panel_2026.pdf",
  file_type: "PDF Document",
  file_size: "1.4 MB",
  analyzed_at: "Demo Analysis",
  overview: {
    sections_detected: "Comprehensive Metabolic & Lipid Panel",
    total_tests_analyzed: 6,
    important_findings_count: 3,
    status: "Review Recommended"
  },
  summary:
    "This report shows several blood test results measuring your average blood sugar, cholesterol balance, and liver/kidney function. Most values are within standard healthy ranges, while your HbA1c and cholesterol levels are slightly above the suggested targets. These findings provide a helpful starting point to discuss with your healthcare professional.",
  important_findings: [
    {
      title: "HbA1c (Average Blood Sugar)",
      value: "6.1%",
      explanation:
        "Your HbA1c level is slightly higher than standard target ranges (below 5.7%). This metric reflects your average blood sugar over the last 2 to 3 months.",
      importance: "moderate"
    },
    {
      title: "LDL ('Bad') Cholesterol",
      value: "142 mg/dL",
      explanation:
        "Your LDL cholesterol is somewhat above the optimal target (below 100 mg/dL). Elevated LDL can be influenced by diet, activity, and genetics.",
      importance: "moderate"
    },
    {
      title: "Total Cholesterol",
      value: "218 mg/dL",
      explanation:
        "Total cholesterol is slightly above the recommended baseline of 200 mg/dL, primarily driven by the higher LDL level.",
      importance: "moderate"
    },
    {
      title: "Kidney Function (eGFR)",
      value: "95 mL/min",
      explanation:
        "Your estimated glomerular filtration rate indicates healthy, normal kidney filtration capacity.",
      importance: "low"
    }
  ],
  key_values: [
    {
      test: "Hemoglobin",
      value: "13.2",
      unit: "g/dL",
      reference_range: "13.0 – 17.0 g/dL",
      explanation: "Within the normal range. Indicates adequate oxygen-carrying red blood cells."
    },
    {
      test: "HbA1c",
      value: "6.1",
      unit: "%",
      reference_range: "< 5.7 %",
      explanation: "Above the standard target. Reflects average blood sugar over the past 2–3 months."
    },
    {
      test: "LDL Cholesterol",
      value: "142",
      unit: "mg/dL",
      reference_range: "< 100 mg/dL",
      explanation: "Above the optimal target. Commonly referred to as 'bad' cholesterol."
    },
    {
      test: "Total Cholesterol",
      value: "218",
      unit: "mg/dL",
      reference_range: "< 200 mg/dL",
      explanation: "Slightly elevated. Measures the overall quantity of cholesterol in the blood."
    },
    {
      test: "Fasting Glucose",
      value: "96",
      unit: "mg/dL",
      reference_range: "70 – 99 mg/dL",
      explanation: "Within the healthy reference range on this specific fasting measurement."
    },
    {
      test: "Creatinine",
      value: "0.9",
      unit: "mg/dL",
      reference_range: "0.7 – 1.3 mg/dL",
      explanation: "Normal healthy waste-filtering level for your kidneys."
    }
  ],
  what_this_means:
    "Overall, your report demonstrates solid baseline organ function (normal hemoglobin, fasting glucose, and kidney markers). The two main areas for follow-up are your average blood sugar (HbA1c at 6.1%) and cholesterol levels (LDL at 142 mg/dL). These values do not constitute a diagnosis on their own, but they are meaningful indicators that your doctor can contextualize based on your medical history, lifestyle, and family background.",
  doctor_questions: [
    "What do these specific HbA1c and cholesterol numbers mean for my daily routine?",
    "Should I repeat any of these blood tests in 3 to 6 months to track trends?",
    "Are there specific dietary or lifestyle modifications you recommend based on this panel?",
    "Which results should we monitor most closely going forward?",
    "Do you recommend any additional tests or follow-ups?"
  ]
};

export const MOCK_CHATBOT_QA = [
  {
    keywords: ["hba1c", "a1c", "blood sugar", "sugar", "glucose"],
    response:
      "HbA1c is a blood test that gives an estimate of your average blood sugar level over the previous 2–3 months. Your report lists it as 6.1% (target is typically under 5.7%). While this is slightly above standard baseline, it is not a diagnosis. Your doctor can interpret this result together with your daily habits and overall health profile."
  },
  {
    keywords: ["cholesterol", "ldl", "lipid", "fats", "hdl"],
    response:
      "LDL (often called 'bad cholesterol') carries cholesterol to your arteries. In your report, LDL is measured at 142 mg/dL (target is usually below 100 mg/dL), and Total Cholesterol is 218 mg/dL. These values are common topics for lifestyle discussions with your doctor."
  },
  {
    keywords: ["why is this value important", "important", "why important"],
    response:
      "Tracking metrics like HbA1c and cholesterol helps identify early opportunities to support long-term metabolic and cardiovascular wellness. Catching mild elevations early allows your doctor to suggest simple dietary, exercise, or lifestyle habits before they progress."
  },
  {
    keywords: ["explain simply", "more simply", "simpler", "simple", "summarize"],
    response:
      "In simple terms: Your body's organs and red blood cells look healthy and normal. However, your average blood sugar and blood fat (cholesterol) levels are slightly higher than recommended targets. Your doctor will help you decide if simple lifestyle tweaks are appropriate."
  },
  {
    keywords: ["doctor", "ask", "question", "appointment"],
    response:
      "Great questions to bring up include: 'What dietary changes should I prioritize?', 'When should we recheck these numbers?', and 'Are there any specific lifestyle habits that will help improve my LDL and HbA1c?'"
  },
  {
    keywords: ["kidney", "creatinine", "egfr", "hemoglobin"],
    response:
      "Your kidney markers (Creatinine 0.9 mg/dL) and red blood cell markers (Hemoglobin 13.2 g/dL) are all in the healthy reference range, which indicates steady vital organ functioning."
  }
];

export const SUGGESTED_CHAT_PROMPTS = [
  "What does HbA1c mean?",
  "Why is my LDL value important?",
  "Explain my results more simply",
  "What should I ask my doctor?"
];
