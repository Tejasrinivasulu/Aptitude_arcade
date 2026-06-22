/**
 * Day 1 — Number Systems: 25 MCQs + 5 Fill in the Blanks
 */
const questions = [
  { id: 1, type: 'mcq', question: 'Which of the following is a prime number?', options: ['91', '87', '97', '99'], answer: 2 },
  { id: 2, type: 'mcq', question: 'The HCF of 84 and 126 is:', options: ['21', '42', '63', '84'], answer: 1 },
  { id: 3, type: 'mcq', question: 'The LCM of 18 and 24 is:', options: ['48', '60', '72', '96'], answer: 2 },
  { id: 4, type: 'mcq', question: 'How many factors does 72 have?', options: ['10', '12', '14', '16'], answer: 1 },
  { id: 5, type: 'mcq', question: 'The unit digit of 7^50 is:', options: ['1', '3', '7', '9'], answer: 0 },
  { id: 6, type: 'mcq', question: 'The remainder when 245 is divided by 7 is:', options: ['0', '1', '2', '5'], answer: 0 },
  { id: 7, type: 'mcq', question: 'Which pair is co-prime?', options: ['(15,35)', '(18,24)', '(25,49)', '(27,45)'], answer: 2 },
  { id: 8, type: 'mcq', question: 'The smallest prime number is:', options: ['0', '1', '2', '3'], answer: 2 },
  { id: 9, type: 'mcq', question: 'The greatest 4-digit number divisible by 9 is:', options: ['9990', '9999', '9996', '9993'], answer: 1 },
  { id: 10, type: 'mcq', question: 'Number of trailing zeros in 50! is:', options: ['10', '11', '12', '13'], answer: 2 },
  { id: 11, type: 'mcq', question: 'Convert (110101)2 into decimal.', options: ['51', '52', '53', '54'], answer: 2 },
  { id: 12, type: 'mcq', question: 'Convert decimal 45 into binary.', options: ['101101', '101011', '110101', '111001'], answer: 0 },
  { id: 13, type: 'mcq', question: 'The sum of first 20 odd natural numbers is:', options: ['200', '300', '400', '500'], answer: 2 },
  { id: 14, type: 'mcq', question: 'Product of two numbers is 420 and HCF is 7. Their LCM is:', options: ['50', '60', '70', '80'], answer: 1 },
  { id: 15, type: 'mcq', question: 'How many prime numbers are there between 1 and 20?', options: ['7', '8', '9', '10'], answer: 1 },
  { id: 16, type: 'mcq', question: 'Which number is divisible by 11?', options: ['1331', '1234', '1452', '1245'], answer: 0 },
  { id: 17, type: 'mcq', question: 'The HCF of 36 and 48 is:', options: ['6', '8', '12', '24'], answer: 2 },
  { id: 18, type: 'mcq', question: 'The LCM of 15, 20 and 30 is:', options: ['30', '45', '60', '90'], answer: 2 },
  { id: 19, type: 'mcq', question: 'The unit digit of 13^57 is:', options: ['1', '3', '7', '9'], answer: 1 },
  { id: 20, type: 'mcq', question: 'The least number to be added to 568 to make it divisible by 9 is:', options: ['1', '2', '3', '4'], answer: 3 },
  { id: 21, type: 'mcq', question: 'The largest 3-digit prime number is:', options: ['991', '993', '997', '999'], answer: 2 },
  { id: 22, type: 'mcq', question: 'If a number leaves remainder 3 when divided by 8, then its square leaves remainder:', options: ['1', '3', '5', '7'], answer: 0 },
  { id: 23, type: 'mcq', question: 'The remainder when 2^100 is divided by 7 is:', options: ['1', '2', '4', '6'], answer: 1 },
  { id: 24, type: 'mcq', question: 'Number of factors of 100 is:', options: ['8', '9', '10', '12'], answer: 1 },
  { id: 25, type: 'mcq', question: 'Which of the following is not a prime number?', options: ['31', '37', '39', '41'], answer: 2 },
  { id: 26, type: 'fill', question: 'The binary equivalent of decimal 10 is ______.', answer: '1010' },
  { id: 27, type: 'fill', question: 'The HCF of 24 and 36 is ______.', answer: '12' },
  { id: 28, type: 'fill', question: 'The LCM of 12 and 18 is ______.', answer: '36' },
  { id: 29, type: 'fill', question: 'The remainder when 100 is divided by 9 is ______.', answer: '1' },
  { id: 30, type: 'fill', question: 'The unit digit of 9^50 is ______.', answer: '1' },
];

module.exports = questions;
