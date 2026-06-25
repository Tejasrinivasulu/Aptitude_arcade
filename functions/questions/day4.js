/**
 * Day 4 — Averages: 25 MCQs + 5 Fill in the Blanks
 */
const questions = [
  { id: 1, type: 'mcq', question: 'The average of 11 numbers is 50. If the average of the first six numbers is 49 and that of the last six numbers is 52, find the sixth number.', options: ['45', '48', '50', '54'], answer: 3 },
  { id: 2, type: 'mcq', question: 'The average age of 30 students is 16 years. If the teacher\'s age is included, the average becomes 17 years. What is the teacher\'s age?', options: ['45 years', '47 years', '48 years', '50 years'], answer: 2 },
  { id: 3, type: 'mcq', question: 'The average of five consecutive even numbers is 38. What is the largest number?', options: ['40', '42', '44', '46'], answer: 1 },
  { id: 4, type: 'mcq', question: 'The average marks of 25 students are 72. If one student\'s marks were recorded as 82 instead of 62, what is the correct average?', options: ['71.2', '71.4', '72', '72.8'], answer: 0 },
  { id: 5, type: 'mcq', question: 'The average of 8 numbers is 24. If one number 30 is replaced by 46, what is the new average?', options: ['25', '26', '27', '28'], answer: 1 },
  { id: 6, type: 'mcq', question: 'The average salary of 12 employees is Rs.25,000. If the manager\'s salary of Rs.61,000 is excluded, find the average salary of the remaining employees.', options: ['Rs.21,727', 'Rs.22,000', 'Rs.23,000', 'Rs.24,000'], answer: 0 },
  { id: 7, type: 'mcq', question: 'The average of the first 20 natural numbers is:', options: ['10', '10.5', '11', '11.5'], answer: 1 },
  { id: 8, type: 'mcq', question: 'The average of six numbers is 28. If one number is removed, the average becomes 25. The removed number is:', options: ['40', '41', '43', '44'], answer: 2 },
  { id: 9, type: 'mcq', question: 'The average of 15 observations is 36. Later it is found that one observation was entered as 48 instead of 30. Find the correct average.', options: ['34.8', '35.2', '36', '36.4'], answer: 0 },
  { id: 10, type: 'mcq', question: 'The average age of A, B and C is 24 years. If D joins them, the average becomes 26 years. Find D\'s age.', options: ['30', '31', '32', '34'], answer: 2 },
  { id: 11, type: 'mcq', question: 'The average of nine consecutive integers is 75. What is the smallest integer?', options: ['70', '71', '72', '73'], answer: 1 },
  { id: 12, type: 'mcq', question: 'The average score of a batsman in 25 innings is 42. If he scores 58 in the next innings, what is his new average?', options: ['42.4', '42.5', '42.6', '43'], answer: 2 },
  { id: 13, type: 'mcq', question: 'The average weight of 15 students is 56 kg. If one student weighing 64 kg leaves and another weighing 70 kg joins, what is the new average?', options: ['56', '56.2', '56.4', '56.6'], answer: 2 },
  { id: 14, type: 'mcq', question: 'The average of five numbers is 18. Four numbers are 12, 15, 20 and 21. Find the fifth number.', options: ['18', '20', '22', '24'], answer: 2 },
  { id: 15, type: 'mcq', question: 'The average of 40 students is 45 kg. If the teacher weighing 65 kg joins, the average becomes:', options: ['45.3 kg', '45.49 kg', '46 kg', '46.5 kg'], answer: 1 },
  { id: 16, type: 'mcq', question: 'The average of seven consecutive odd numbers is 31. The largest number is:', options: ['35', '37', '39', '41'], answer: 1 },
  { id: 17, type: 'mcq', question: 'The average income of a family of six members is Rs.32,000. One member leaves, reducing the average to Rs.30,000. Find the income of the member who left.', options: ['Rs.40,000', 'Rs.42,000', 'Rs.44,000', 'Rs.46,000'], answer: 1 },
  { id: 18, type: 'mcq', question: 'The average of 18 numbers is 25. If each number is increased by 5, what will be the new average?', options: ['25', '28', '30', '35'], answer: 2 },
  { id: 19, type: 'mcq', question: 'The average temperature of Monday to Saturday is 29°C. If Sunday\'s temperature is 35°C, the average temperature for the week is:', options: ['29.5°C', '29.86°C', '30°C', '30.5°C'], answer: 1 },
  { id: 20, type: 'mcq', question: 'The average of four consecutive odd numbers is 20. Which of the following is possible?', options: ['17, 19, 21, 23', '15, 17, 19, 21', '19, 21, 23, 25', 'None of these'], answer: 3 },
  { id: 21, type: 'mcq', question: 'The average marks of a class of 50 students is 60. If 10 more students with an average of 70 join the class, what is the new average?', options: ['61.5', '61.67', '62', '62.5'], answer: 1 },
  { id: 22, type: 'mcq', question: 'The average of five numbers is 45. If each number is multiplied by 3, the new average is:', options: ['90', '120', '135', '150'], answer: 2 },
  { id: 23, type: 'mcq', question: 'The average of 10 numbers is 52. If one number is omitted, the average of the remaining numbers becomes 50. Find the omitted number.', options: ['68', '70', '72', '74'], answer: 1 },
  { id: 24, type: 'mcq', question: 'The average of the first ten multiples of 6 is:', options: ['30', '33', '36', '39'], answer: 1 },
  { id: 25, type: 'mcq', question: 'The average of 12 observations is 28. If each observation is increased by 2, what will be the new average?', options: ['28', '29', '30', '32'], answer: 2 },
  { id: 26, type: 'fill', question: 'The average of the first 15 natural numbers is ______.', answer: '8' },
  { id: 27, type: 'fill', question: 'The average of five consecutive odd numbers is 41. The middle number is ______.', answer: '41' },
  { id: 28, type: 'fill', question: 'The average of 20 numbers is 35. Their total is ______.', answer: '700' },
  { id: 29, type: 'fill', question: 'If the average of 8 numbers is 24, then their sum is ______.', answer: '192' },
  { id: 30, type: 'fill', question: 'The average of 9 consecutive integers is 50. The smallest integer is ______.', answer: '46' },
];

module.exports = questions;
