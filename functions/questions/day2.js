/**
 * Day 2 — Percentages: 25 MCQs + 5 Fill in the Blanks
 */
const questions = [
  { id: 1, type: 'mcq', question: 'What is 20% of 150?', options: ['20', '25', '30', '35'], answer: 2 },
  { id: 2, type: 'mcq', question: '50 is what percent of 200?', options: ['20%', '25%', '30%', '35%'], answer: 1 },
  { id: 3, type: 'mcq', question: 'A shirt costing Rs.800 is sold with a 10% discount. Find the discount amount.', options: ['Rs.60', 'Rs.70', 'Rs.80', 'Rs.90'], answer: 2 },
  { id: 4, type: 'mcq', question: 'What is 75% of 240?', options: ['160', '170', '180', '190'], answer: 2 },
  { id: 5, type: 'mcq', question: 'A number increased by 25% becomes 250. Find the original number.', options: ['180', '190', '200', '210'], answer: 2 },
  { id: 6, type: 'mcq', question: '15% of 400 equals:', options: ['50', '55', '60', '65'], answer: 2 },
  { id: 7, type: 'mcq', question: 'The population of a village increases from 5000 to 6000. Percentage increase is:', options: ['15%', '20%', '25%', '30%'], answer: 1 },
  { id: 8, type: 'mcq', question: 'A student scores 360 marks out of 450. Percentage scored is:', options: ['75%', '78%', '80%', '82%'], answer: 2 },
  { id: 9, type: 'mcq', question: 'What is 12.5% of 160?', options: ['18', '20', '22', '24'], answer: 1 },
  { id: 10, type: 'mcq', question: 'If 40% of a number is 80, the number is:', options: ['180', '190', '200', '220'], answer: 2 },
  { id: 11, type: 'mcq', question: 'A Wipro employee gets a 15% salary hike on Rs.40,000. New salary is:', options: ['Rs.44,000', 'Rs.45,000', 'Rs.46,000', 'Rs.47,000'], answer: 2 },
  { id: 12, type: 'mcq', question: 'What percentage of 500 is 125?', options: ['20%', '25%', '30%', '35%'], answer: 1 },
  { id: 13, type: 'mcq', question: 'The price of a bike rises from Rs.50,000 to Rs.60,000. Percentage increase is:', options: ['15%', '20%', '25%', '30%'], answer: 1 },
  { id: 14, type: 'mcq', question: '30% of 900 is:', options: ['250', '260', '270', '280'], answer: 2 },
  { id: 15, type: 'mcq', question: 'A product costing Rs.1000 is sold at a 20% profit. Selling price is:', options: ['Rs.1100', 'Rs.1150', 'Rs.1200', 'Rs.1250'], answer: 2 },
  { id: 16, type: 'mcq', question: 'A candidate scored 280 marks and failed by 40 marks. Passing marks are 40% of total marks. Total marks are:', options: ['700', '750', '800', '850'], answer: 2 },
  { id: 17, type: 'mcq', question: 'The value of a machine decreases by 20% and becomes Rs.8000. Original value was:', options: ['Rs.9000', 'Rs.9500', 'Rs.10000', 'Rs.11000'], answer: 2 },
  { id: 18, type: 'mcq', question: "If A's salary is 25% more than B's salary and B earns Rs.24,000, A earns:", options: ['Rs.28,000', 'Rs.29,000', 'Rs.30,000', 'Rs.31,000'], answer: 2 },
  { id: 19, type: 'mcq', question: 'A TCS test has 200 questions. A student answers 150 correctly. Accuracy percentage is:', options: ['70%', '75%', '80%', '85%'], answer: 1 },
  { id: 20, type: 'mcq', question: 'A shopkeeper marks an item at Rs.2000 and offers a 25% discount. Selling price is:', options: ['Rs.1400', 'Rs.1450', 'Rs.1500', 'Rs.1550'], answer: 2 },
  { id: 21, type: 'mcq', question: 'If 35% of a number is 140, the number is:', options: ['350', '375', '400', '425'], answer: 2 },
  { id: 22, type: 'mcq', question: 'The strength of a class decreases from 80 to 72. Percentage decrease is:', options: ['8%', '10%', '12%', '15%'], answer: 1 },
  { id: 23, type: 'mcq', question: 'A bank offers 5% interest on Rs.20,000. Interest earned is:', options: ['Rs.800', 'Rs.900', 'Rs.1000', 'Rs.1100'], answer: 2 },
  { id: 24, type: 'mcq', question: 'A quantity is increased by 10% and then decreased by 10%. Net percentage change is:', options: ['No change', '1% decrease', '1% increase', '2% decrease'], answer: 1 },
  { id: 25, type: 'mcq', question: 'What is 45% of 600?', options: ['250', '260', '270', '280'], answer: 2 },
  { id: 26, type: 'fill', question: '25% of 320 = ______', answer: '80' },
  { id: 27, type: 'fill', question: 'If 60 is 30% of a number, the number is ______', answer: '200' },
  { id: 28, type: 'fill', question: 'A salary of Rs.50,000 increased by 20% becomes ______', answer: '60000' },
  { id: 29, type: 'fill', question: '12% of 250 = ______', answer: '30' },
  { id: 30, type: 'fill', question: 'The price of an item decreases from Rs.1000 to Rs.900. Percentage decrease = ______', answer: '10%' },
];

module.exports = questions;
