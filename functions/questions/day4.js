/**
 * Day 4 — Logical Reasoning Basics
 * Coding-Decoding, Blood Relations, Directions
 */
const questions = [
  { id: 1, question: 'If CAT is coded as FDW, how is DOG coded?', options: ['GRJ', 'GRI', 'FRI', 'FRJ'], answer: 1 },
  { id: 2, question: 'If in a code, 247 means "spread red carpet", 132 means "red carpet clean", what stands for "spread"?', options: ['2', '4', '7', 'Cannot determine'], answer: 1 },
  { id: 3, question: 'If FRIEND is coded as HUMGPK, how is CANDLE coded?', options: ['EDRIRL', 'ESJFOG', 'DCPEMF', 'ECRJKL'], answer: 0 },
  { id: 4, question: 'A man points to a photo and says "Her mother is the only daughter of my mother." How is the person related?', options: ['Daughter', 'Niece', 'Sister', 'Mother'], answer: 0 },
  { id: 5, question: 'If P + Q means P is the father of Q, P × Q means P is the wife of Q, then M + N × O means O is the ___ of M.', options: ['Son', 'Daughter', 'Grandchild', 'Cannot determine'], answer: 3 },
  { id: 6, question: 'Looking at a portrait, a man says "His mother is my mother\'s daughter." The portrait is of:', options: ['Himself', 'His son', 'His father', 'His nephew'], answer: 0 },
  { id: 7, question: 'Ram is the son of Shyam. Shyam is the brother of Ravi. Ravi is the son of Mohan. How is Ram related to Mohan?', options: ['Grandson', 'Son', 'Nephew', 'Brother'], answer: 0 },
  { id: 8, question: 'If APPLE is coded as ELPPA, how is MANGO coded?', options: ['OGNAM', 'OGANM', 'OGANM', 'OGNAM'], answer: 0 },
  { id: 9, question: 'A walks 5 km North, turns right, walks 3 km, turns right again, walks 5 km. How far is he from the start?', options: ['3 km', '5 km', '8 km', '13 km'], answer: 0 },
  { id: 10, question: 'If 1 is coded as Z, 2 as Y, 3 as X, ..., 26 as A, how is CAT coded?', options: ['XZW', 'XZV', 'YZW', 'YZV'], answer: 0 },
  { id: 11, question: 'If South-East becomes North, then what does North-East become?', options: ['South', 'West', 'South-West', 'North-West'], answer: 0 },
  { id: 12, question: '"Doctor" is related to "Patient" in the same way as "Teacher" is related to:', options: ['Student', 'Class', 'Subject', 'School'], answer: 0 },
  { id: 13, question: 'If GO = 32, SHE = 38, then SOME = ?', options: ['50', '56', '58', '64'], answer: 1 },
  { id: 14, question: 'A woman introduces a man as the son of her brother. How is the man related to the woman?', options: ['Nephew', 'Uncle', 'Cousin', 'Son'], answer: 0 },
  { id: 15, question: 'If the code for RED is 57, for BLUE is 6145, what is the code for WHITE?', options: ['5291', '52920', '53920', '54920'], answer: 0 },
  { id: 16, question: 'A man facing East turns left twice. Which direction is he facing now?', options: ['East', 'West', 'North', 'South'], answer: 0 },
  { id: 17, question: 'If EARTH is coded as HDUWA, how is MOON coded?', options: ['LQQL', 'LPQL', 'LRQL', 'LQRL'], answer: 0 },
  { id: 18, question: 'Pointing to a girl, Arun says "She is the daughter of the only child of my grandmother." How is the girl related?', options: ['Sister', 'Cousin', 'Aunt', 'Cannot determine'], answer: 0 },
  { id: 19, question: 'If TIGER is written as QFDBO, how can HORSE be written?', options: ['ENQSU', 'ENQST', 'DMOQR', 'DMOQS'], answer: 0 },
  { id: 20, question: 'A person walks 4 km South, then 3 km East, then 4 km North. Distance from start?', options: ['3 km', '5 km', '7 km', '11 km'], answer: 0 },
];

module.exports = questions;
