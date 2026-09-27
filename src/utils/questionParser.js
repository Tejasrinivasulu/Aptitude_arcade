/**
 * Smart Question Parser
 * Supports both JSON arrays and raw AI / ChatGPT text formats.
 */

export function parseQuestionsInput(rawText) {
  const text = (rawText || '').trim();
  if (!text) {
    return { success: false, error: 'Input is empty. Please paste questions.' };
  }

  // 1. Try parsing as JSON first
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      let parsed = JSON.parse(text);
      if (!Array.isArray(parsed) && Array.isArray(parsed.questions)) {
        parsed = parsed.questions;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated = parsed.map((q, idx) => normalizeQuestionObject(q, idx + 1));
        return { success: true, questions: validated, count: validated.length, format: 'json' };
      }
    } catch {
      // Not valid JSON, fall through to text parser
    }
  }

  // 2. Parse Plain Text / AI Generated format
  try {
    const questions = parsePlainTextQuestions(text);
    if (questions.length > 0) {
      return { success: true, questions, count: questions.length, format: 'text' };
    }
  } catch (err) {
    return { success: false, error: `Failed to parse text format: ${err.message}` };
  }

  return {
    success: false,
    error: 'Could not detect questions. Please ensure questions are in valid JSON or standard Q1/A/B/C/D format.',
  };
}

function normalizeQuestionObject(q, fallbackId) {
  const type = q.type === 'fill' ? 'fill' : 'mcq';
  const question = String(q.question || q.q || '').trim();
  
  if (type === 'fill') {
    return {
      id: q.id || fallbackId,
      type: 'fill',
      question,
      answer: String(q.answer !== undefined ? q.answer : '').trim(),
    };
  }

  const rawOptions = Array.isArray(q.options)
    ? q.options
    : [q.optionA || q.a, q.optionB || q.b, q.optionC || q.c, q.optionD || q.d];

  const options = (rawOptions || []).map((o) => String(o ?? '').trim());
  while (options.length < 4) options.push('');

  let answerIndex = 0;
  if (typeof q.answer === 'number') {
    answerIndex = Math.max(0, Math.min(3, q.answer));
  } else if (typeof q.answer === 'string') {
    const ansChar = q.answer.trim().toUpperCase();
    if (ansChar === 'A') answerIndex = 0;
    else if (ansChar === 'B') answerIndex = 1;
    else if (ansChar === 'C') answerIndex = 2;
    else if (ansChar === 'D') answerIndex = 3;
    else {
      const parsedNum = parseInt(ansChar, 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 4) {
        answerIndex = parsedNum - 1;
      }
    }
  }

  return {
    id: q.id || fallbackId,
    type: 'mcq',
    question,
    options: options.slice(0, 4),
    answer: answerIndex,
  };
}

function parsePlainTextQuestions(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const questions = [];

  let currentQ = null;

  const commitCurrent = () => {
    if (currentQ && currentQ.question) {
      while (currentQ.options.length < 4) currentQ.options.push('');
      questions.push({
        id: questions.length + 1,
        type: currentQ.type || 'mcq',
        question: currentQ.question,
        options: currentQ.options.slice(0, 4),
        answer: currentQ.answer ?? 0,
      });
    }
    currentQ = null;
  };

  const qRegex = /^(?:Q(?:uestion)?\s*\d*|\d+)[\.\:\)]\s*(.+)/i;
  const optRegex = /^[\(\[]?([A-Da-d1-4])[\)\]\.\:]\s*(.+)/;
  const ansRegex = /^(?:Ans(?:wer)?|Correct(?:\s*Option)?|Key)[\:\s\-]+([A-Da-d1-4]|.+)/i;

  for (const line of lines) {
    // Check if new question
    const qMatch = line.match(qRegex);
    if (qMatch) {
      commitCurrent();
      currentQ = {
        question: qMatch[1].trim(),
        options: [],
        answer: 0,
        type: 'mcq',
      };
      continue;
    }

    if (!currentQ) continue;

    // Check if Answer line
    const ansMatch = line.match(ansRegex);
    if (ansMatch) {
      const rawAns = ansMatch[1].trim().toUpperCase();
      if (rawAns === 'A' || rawAns === '1') currentQ.answer = 0;
      else if (rawAns === 'B' || rawAns === '2') currentQ.answer = 1;
      else if (rawAns === 'C' || rawAns === '3') currentQ.answer = 2;
      else if (rawAns === 'D' || rawAns === '4') currentQ.answer = 3;
      else if (currentQ.type === 'fill') currentQ.answer = rawAns;
      continue;
    }

    // Check if Option line
    const optMatch = line.match(optRegex);
    if (optMatch && currentQ.options.length < 4) {
      currentQ.options.push(optMatch[2].trim());
      continue;
    }

    // Otherwise append to question text if no options collected yet
    if (currentQ.options.length === 0) {
      currentQ.question += ` ${line}`;
    }
  }

  commitCurrent();
  return questions;
}
