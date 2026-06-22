/**
 * Day 7 — Data Interpretation & Revision
 */
const questions = [
  { id: 1, question: 'A table shows sales of 5 products. A=100, B=150, C=200, D=50, E=300. What is the average sale?', options: ['120', '140', '160', '180'], answer: 2 },
  { id: 2, question: 'From the same sales data (A=100, B=150, C=200, D=50, E=300), what percentage of total sales is product E?', options: ['30%', '37.5%', '40%', '42.5%'], answer: 1 },
  { id: 3, question: 'A pie chart shows expenses: Rent=30%, Food=25%, Transport=15%, Savings=30%. If total income is $4000, how much is spent on Food?', options: ['$800', '$900', '$1000', '$1200'], answer: 2 },
  { id: 4, question: 'A line graph shows temperature over 4 days: D1=20, D2=25, D3=22, D4=30. What is the percentage increase from D1 to D4?', options: ['33.3%', '40%', '50%', '60%'], answer: 2 },
  { id: 5, question: 'A bar chart shows students in 3 classes: C1=40, C2=50, C3=60. What is the ratio of students in C1 to C3?', options: ['2:3', '3:4', '4:5', '1:2'], answer: 0 },
  { id: 6, question: 'A company\'s revenue over 3 years: Y1=100k, Y2=120k, Y3=150k. What is the average annual growth rate approximately?', options: ['15%', '20%', '22.5%', '25%'], answer: 2 },
  { id: 7, question: 'If 20% of a number is 40, what is 80% of the number?', options: ['120', '140', '160', '180'], answer: 2 },
  { id: 8, question: 'A train 100m long passes a pole in 10 seconds. What is its speed in km/hr?', options: ['36', '45', '54', '72'], answer: 0 },
  { id: 9, question: 'If A can do a work in 10 days and B in 15 days, how long will they take working together?', options: ['5 days', '6 days', '8 days', '12 days'], answer: 1 },
  { id: 10, question: 'What is the next number in the series: 2, 6, 12, 20, 30, ...?', options: ['38', '40', '42', '44'], answer: 2 },
  { id: 11, question: 'In a class of 50, 30 like Math and 25 like Science. 10 like both. How many like neither?', options: ['0', '5', '10', '15'], answer: 1 },
  { id: 12, question: 'If the cost price of 10 items equals the selling price of 8 items, what is the profit percentage?', options: ['15%', '20%', '25%', '30%'], answer: 2 },
  { id: 13, question: 'A table shows marks of a student: Math=80, Sci=75, Eng=85, Hist=70. What is the overall percentage if each subject is out of 100?', options: ['75%', '77.5%', '80%', '82.5%'], answer: 1 },
  { id: 14, question: 'A pie chart divides a budget of $12000. If Education is 60 degrees, what is the amount spent on Education?', options: ['$1000', '$1500', '$2000', '$2400'], answer: 2 },
  { id: 15, question: 'The simple interest on a sum for 3 years at 10% is $300. What is the sum?', options: ['$800', '$900', '$1000', '$1200'], answer: 2 },
  { id: 16, question: 'If 3x + 4 = 19, what is x?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 17, question: 'A man walked 3km North, then 4km East. How far is he from the starting point?', options: ['5km', '6km', '7km', '8km'], answer: 0 },
  { id: 18, question: 'Which fraction is the largest: 1/2, 3/4, 5/8, 7/12?', options: ['1/2', '3/4', '5/8', '7/12'], answer: 1 },
  { id: 19, question: 'The HCF of 24 and 36 is:', options: ['6', '8', '12', '24'], answer: 2 },
  { id: 20, question: 'If the day before yesterday was Thursday, what day will be tomorrow?', options: ['Saturday', 'Sunday', 'Monday', 'Tuesday'], answer: 1 },
];

module.exports = questions;
