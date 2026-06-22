/**
 * Day 3 — Time-Based Problems
 * Time & Work, Time, Speed & Distance
 */
const questions = [
  { id: 1, question: 'A can do a work in 15 days and B in 20 days. Together they finish in:', options: ['8 days', '8 4/7 days', '9 days', '10 days'], answer: 1 },
  { id: 2, question: 'A train 150m long crosses a pole in 15s. Its speed in km/h is:', options: ['36', '40', '45', '54'], answer: 0 },
  { id: 3, question: 'If 6 men can do a job in 10 days, how many men are needed to do it in 5 days?', options: ['10', '12', '15', '18'], answer: 1 },
  { id: 4, question: 'A car travels at 60 km/h for 3 hours and at 80 km/h for 2 hours. Average speed?', options: ['66 km/h', '68 km/h', '70 km/h', '72 km/h'], answer: 1 },
  { id: 5, question: 'Pipe A fills a tank in 12 min, Pipe B in 15 min. Together they fill in:', options: ['6 min', '6 2/3 min', '7 min', '8 min'], answer: 1 },
  { id: 6, question: 'Two trains 100m and 120m long run at 72 km/h and 54 km/h in opposite directions. Time to cross?', options: ['8s', '10s', '12s', '15s'], answer: 2 },
  { id: 7, question: 'A is twice as good a workman as B. Together they finish a job in 14 days. A alone takes:', options: ['18 days', '21 days', '24 days', '28 days'], answer: 1 },
  { id: 8, question: 'A person walks at 4 km/h from A to B and returns at 6 km/h. Average speed?', options: ['4.5 km/h', '4.8 km/h', '5 km/h', '5.2 km/h'], answer: 1 },
  { id: 9, question: 'A tap can fill a tank in 6 hours. Due to a leak, it takes 8 hours. The leak alone empties in:', options: ['18 hours', '24 hours', '30 hours', '36 hours'], answer: 1 },
  { id: 10, question: 'A train 200m long running at 90 km/h crosses a platform 300m long in:', options: ['15s', '18s', '20s', '25s'], answer: 2 },
  { id: 11, question: 'If A does 1/3 of work in 5 days, B does the rest in 10 days. Together?', options: ['5 days', '6 days', '8 days', '10 days'], answer: 1 },
  { id: 12, question: 'The distance between two places is 500 km. Two cars start towards each other at 60 and 40 km/h. Meeting time?', options: ['4h', '5h', '6h', '7h'], answer: 1 },
  { id: 13, question: '20 men complete 1/3 of a work in 10 days. How many more men to finish in 15 more days?', options: ['5', '10', '15', '20'], answer: 1 },
  { id: 14, question: 'A boat goes 30 km upstream in 5 hours and downstream in 3 hours. Speed of current?', options: ['2 km/h', '3 km/h', '4 km/h', '5 km/h'], answer: 0 },
  { id: 15, question: '3 workers finish 1/2 a work in 12 days. 1 worker finishes the whole work in:', options: ['24 days', '36 days', '48 days', '72 days'], answer: 3 },
  { id: 16, question: 'A cyclist covers 120 km in 4 hours. His speed in m/s is approximately:', options: ['7.5', '8.33', '10', '12'], answer: 1 },
  { id: 17, question: 'A and B together earn Rs. 600. If A gets 2/3 of it, B gets:', options: ['Rs. 150', 'Rs. 200', 'Rs. 250', 'Rs. 300'], answer: 1 },
  { id: 18, question: 'A bus leaves at 9 AM at 50 km/h. A car leaves at 10 AM at 75 km/h. When does it catch the bus?', options: ['12 PM', '1 PM', '2 PM', '3 PM'], answer: 1 },
  { id: 19, question: 'P can do a job in 10 days, Q in 12 days. They work together for 4 days. Remaining work?', options: ['1/3', '2/3', '1/2', '1/4'], answer: 0 },
  { id: 20, question: 'A man walks 1 km in 10 min. His speed in km/h is:', options: ['4', '5', '6', '8'], answer: 2 },
];

module.exports = questions;
