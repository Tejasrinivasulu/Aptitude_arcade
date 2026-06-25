const day1 = require('./day1');
const day2 = require('./day2');
const day3 = require('./day3');
const day4 = require('./day4');

// 50 questions drawn from Days 1–4 only
const finaleQuestionsRaw = [
  ...day1.slice(0, 12),
  ...day2.slice(0, 12),
  ...day3.slice(0, 13),
  ...day4.slice(0, 13),
];

const finaleQuestions = finaleQuestionsRaw.map((q, idx) => ({
  ...q,
  id: idx + 1,
}));

module.exports = finaleQuestions;
