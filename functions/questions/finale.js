const day1 = require('./day1');
const day2 = require('./day2');
const day3 = require('./day3');
const day4 = require('./day4');
const day5 = require('./day5');
const day6 = require('./day6');
const day7 = require('./day7');

// Take first 7 from each (49 total), plus 1 extra from day1
const finaleQuestionsRaw = [
  ...day1.slice(0, 7),
  ...day2.slice(0, 7),
  ...day3.slice(0, 7),
  ...day4.slice(0, 7),
  ...day5.slice(0, 7),
  ...day6.slice(0, 7),
  ...day7.slice(0, 7),
  day1[7]
];

const finaleQuestions = finaleQuestionsRaw.map((q, idx) => ({
  ...q,
  id: idx + 1
}));

module.exports = finaleQuestions;
