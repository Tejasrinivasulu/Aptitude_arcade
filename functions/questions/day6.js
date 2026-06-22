/**
 * Day 6 — Advanced Quantitative Aptitude
 * Permutations & Combinations, Probability
 */
const questions = [
  { id: 1, question: '5! is equal to:', options: ['60', '100', '120', '150'], answer: 2 },
  { id: 2, question: 'Number of permutations of the letters in the word "CAT":', options: ['4', '6', '8', '12'], answer: 1 },
  { id: 3, question: 'A coin is tossed 3 times. Probability of getting exactly 2 heads?', options: ['1/8', '1/4', '3/8', '1/2'], answer: 2 },
  { id: 4, question: 'How many ways can 4 people sit in 6 chairs?', options: ['24', '120', '360', '720'], answer: 2 },
  { id: 5, question: 'A bag has 3 red and 5 blue balls. Probability of drawing a red ball?', options: ['3/5', '3/8', '5/8', '1/2'], answer: 1 },
  { id: 6, question: '10C3 is:', options: ['120', '210', '720', '1000'], answer: 0 },
  { id: 7, question: 'Two dice are rolled. Probability that sum is 7?', options: ['1/6', '5/36', '7/36', '1/12'], answer: 0 },
  { id: 8, question: 'In how many ways can 5 books be arranged on a shelf?', options: ['60', '120', '240', '720'], answer: 1 },
  { id: 9, question: 'A card is drawn from a standard deck. Probability it is a king?', options: ['1/13', '1/26', '1/52', '4/52'], answer: 0 },
  { id: 10, question: 'Number of 3-digit numbers formed from digits 1,2,3,4,5 (no repetition):', options: ['25', '60', '120', '125'], answer: 1 },
  { id: 11, question: 'What is 7P2?', options: ['21', '35', '42', '56'], answer: 2 },
  { id: 12, question: 'Probability of getting at least one head in 2 coin tosses?', options: ['1/4', '1/2', '3/4', '1'], answer: 2 },
  { id: 13, question: 'A committee of 3 is to be formed from 5 men and 4 women with at least 1 woman. Number of ways?', options: ['50', '70', '80', '100'], answer: 2 },
  { id: 14, question: 'A die is rolled twice. Probability that both results are even?', options: ['1/4', '1/3', '1/2', '3/4'], answer: 0 },
  { id: 15, question: 'In how many ways can the letters of "APPLE" be arranged?', options: ['20', '60', '120', '720'], answer: 1 },
  { id: 16, question: 'Two events are mutually exclusive. P(A) = 0.3, P(B) = 0.5. P(A or B) = ?', options: ['0.15', '0.2', '0.8', '0.35'], answer: 2 },
  { id: 17, question: 'How many 4-digit PINs can be formed if digits can repeat?', options: ['1000', '5040', '9000', '10000'], answer: 2 },
  { id: 18, question: 'A jar has 4 green, 6 red, and 2 yellow marbles. Probability of NOT picking green?', options: ['4/12', '8/12', '6/12', '10/12'], answer: 1 },
  { id: 19, question: 'nCr + nC(r-1) = ?', options: ['(n-1)Cr', '(n+1)Cr', 'nC(r+1)', 'nCr'], answer: 1 },
  { id: 20, question: 'From a group of 7, a team of 4 is selected. How many selections?', options: ['28', '35', '70', '210'], answer: 1 },
];

module.exports = questions;
