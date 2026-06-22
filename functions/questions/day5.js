/**
 * Day 5 — Advanced Logical Reasoning
 * Series, Seating Arrangements
 */
const questions = [
  { id: 1, question: 'What comes next in the series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], answer: 1 },
  { id: 2, question: 'Find the missing number: 3, 8, 15, 24, 35, ?', options: ['42', '44', '46', '48'], answer: 3 },
  { id: 3, question: 'What comes next: A, C, F, J, O, ?', options: ['S', 'T', 'U', 'V'], answer: 2 },
  { id: 4, question: 'Complete the series: 1, 1, 2, 3, 5, 8, 13, ?', options: ['18', '20', '21', '26'], answer: 2 },
  { id: 5, question: 'What replaces ?: 7, 11, 13, 17, 19, ?', options: ['21', '23', '25', '29'], answer: 1 },
  { id: 6, question: 'Find the odd one out: 2, 5, 10, 17, 26, 37, 50, ?', options: ['63', '65', '67', '72'], answer: 1 },
  { id: 7, question: '5 people sit in a row. A is to the left of B but right of C. D is to the right of B. E is between A and B. Who sits in the middle?', options: ['A', 'B', 'E', 'C'], answer: 2 },
  { id: 8, question: 'In a circle, 6 friends sit facing center. A is opposite D, B is next to A clockwise. Who is opposite B?', options: ['C', 'E', 'F', 'Cannot determine'], answer: 1 },
  { id: 9, question: 'What is next: Z, X, U, Q, M, ?', options: ['H', 'I', 'G', 'J'], answer: 1 },
  { id: 10, question: 'Find the pattern: 1, 4, 9, 16, 25, ?', options: ['30', '35', '36', '49'], answer: 2 },
  { id: 11, question: '4 friends sit at a round table. Ram is to the left of Shyam and opposite Geeta. Who is to the right of Ram?', options: ['Geeta', 'Shyam', 'Cannot determine', 'No one — only 3 people'], answer: 2 },
  { id: 12, question: 'What is missing: 2, 3, 5, 7, 11, 13, ?', options: ['15', '17', '19', '21'], answer: 1 },
  { id: 13, question: 'Complete: 1, 2, 6, 24, 120, ?', options: ['240', '360', '480', '720'], answer: 3 },
  { id: 14, question: 'Eight people sit in a line. The 4th from the left is P. The 3rd from the right is Q. How many people are between P and Q?', options: ['0', '1', '2', '3'], answer: 1 },
  { id: 15, question: 'What comes next: AA, BB, CC, DD, EE, ?', options: ['FG', 'FF', 'GG', 'EF'], answer: 0 },
  { id: 16, question: 'A is 3rd from left in a row of 7. C is 5th from right. A and C are the same person. How many from the right is A?', options: ['3rd', '4th', '5th', '6th'], answer: 0 },
  { id: 17, question: 'Find: 0, 1, 1, 2, 4, 7, 13, ?', options: ['20', '22', '24', '26'], answer: 2 },
  { id: 18, question: 'In a line of 5, Ravi is between Sita and Gita. Sita is at one end. Who is at the other end?', options: ['Ravi', 'Gita', 'Cannot determine', 'No one'], answer: 1 },
  { id: 19, question: 'What comes next: 3, 6, 18, 72, ?', options: ['144', '216', '288', '360'], answer: 3 },
  { id: 20, question: '7 chairs are in a circle. A sits. B sits 2 seats to the left. C sits opposite A. D sits between B and C. How many seats between A and D?', options: ['1', '2', '3', '4'], answer: 1 },
];

module.exports = questions;
