export const dailyLearningPlan = [
  {
    day: 1,
    title: 'Number Systems',
    subtitle: 'Divisibility Rules, Prime Numbers, Factors & Multiples, HCF & LCM',
    topics: ['Divisibility Rules', 'Prime Numbers', 'Factors & Multiples', 'HCF & LCM', 'Remainders', 'Unit Digits', 'Number Properties', 'Base Conversions'],
    learningGoal: 'Master the fundamental properties of numbers, divisibility, and HCF & LCM.',
    totalPracticeQuestions: 60,
    tutorials: [
      {
        title: 'Number Systems Basics',
        url: 'https://youtu.be/qwHJtfEUCgE?si=8c5sadnRA9jNAwP5',
      },
      {
        title: 'HCF & LCM Concepts',
        url: 'https://youtu.be/t4b7mOdZaUI?si=O4DRuEfcyixRNZ1Y',
      },
      {
        title: 'Advanced Number Systems 1',
        url: 'https://youtu.be/xyyejJYeILM?si=WMFPSW9r6tuQgj0I',
      },
      {
        title: 'Advanced Number Systems 2',
        url: 'https://youtu.be/vsBpWgNYjtQ?si=I4S1KhShItUxmHh5',
      },
    ],
    studyMaterials: [
      {
        topic: 'Problems on Numbers',
        practiceLabel: 'Solve Problems on Numbers',
        practiceCount: 30,
        practiceUrl: 'https://www.indiabix.com/aptitude/problems-on-numbers/',
      },
      {
        topic: 'Problems on HCF and LCM',
        practiceLabel: 'Solve Problems on HCF & LCM',
        practiceCount: 30,
        practiceUrl: 'https://www.indiabix.com/aptitude/problems-on-hcf-and-lcm/#google_vignette',
      },
    ],
  },
  {
    day: 2,
    title: 'Percentages',
    subtitle: 'Percentage Calculations, Increase & Decrease, Profit & Discount',
    topics: ['Percentages', 'Percentage Change', 'Profit & Discount', 'Exam Applications'],
    learningGoal: 'Master percentage calculations for aptitude tests and placement exams.',
    totalPracticeQuestions: 30,
    tutorials: [
      {
        title: 'Percentages — Concepts & Tricks',
        url: 'https://www.youtube.com/watch?v=RWdNhJWwzSs',
      },
      {
        title: 'Percentages — Practice & Problems',
        url: 'https://www.youtube.com/watch?v=LdpsPknN-Ew&list=PLOoogDtEDyvvqaKSM-ZkwAqUyjyR402HH',
      },
    ],
    studyMaterials: [
      {
        topic: 'Percentages',
        practiceLabel: 'Practice Percentage Questions',
        practiceCount: 30,
        practiceUrl: 'https://www.indiabix.com/aptitude/percentage/',
      },
    ],
  },
  {
    day: 3,
    title: 'Ratio and Proportion',
    subtitle: 'Ratios, Proportions, Mixtures & Partnership',
    topics: ['Ratio', 'Proportion', 'Mixtures', 'Partnership', 'Compound Ratio'],
    learningGoal: 'Master ratio and proportion concepts for aptitude tests and placement exams.',
    totalPracticeQuestions: 30,
    tutorials: [
      {
        title: 'Ratio and Proportion — Concepts',
        url: 'https://www.youtube.com/results?search_query=ratio+and+proportion+aptitude',
      },
      {
        title: 'Ratio and Proportion — Practice',
        url: 'https://www.youtube.com/results?search_query=ratio+proportion+problems+aptitude',
      },
    ],
    studyMaterials: [
      {
        topic: 'Ratio and Proportion',
        practiceLabel: 'Practice Ratio & Proportion Questions',
        practiceCount: 30,
        practiceUrl: 'https://www.indiabix.com/aptitude/ratio-and-proportion/',
      },
    ],
  },
  {
    day: 4,
    title: 'Logical Reasoning Basics',
    subtitle: 'Coding-Decoding, Blood Relations, Directions',
    topics: ['Coding-Decoding', 'Blood Relations', 'Directions'],
    learningGoal: 'Strengthen analytical thinking and reasoning.',
    totalPracticeQuestions: 50,
    tutorials: [
      {
        title: 'Coding-Decoding Reasoning',
        url: 'https://www.youtube.com/results?search_query=coding+decoding+reasoning',
      },
      {
        title: 'Blood Relations Reasoning',
        url: 'https://www.youtube.com/results?search_query=blood+relations+reasoning',
      },
      {
        title: 'Direction Sense Test',
        url: 'https://www.youtube.com/results?search_query=direction+sense+reasoning',
      },
    ],
    studyMaterials: [
      {
        topic: 'Coding-Decoding',
        noteUrl: 'https://www.indiabix.com/verbal-reasoning/coding-decoding/',
        practiceLabel: '20 Coding-Decoding Questions',
        practiceCount: 20,
        practiceUrl: 'https://www.indiabix.com/verbal-reasoning/coding-decoding/',
      },
      {
        topic: 'Blood Relations',
        noteUrl: 'https://www.indiabix.com/verbal-reasoning/blood-relation-test/',
        practiceLabel: '15 Blood Relations Questions',
        practiceCount: 15,
        practiceUrl: 'https://www.indiabix.com/verbal-reasoning/blood-relation-test/',
      },
      {
        topic: 'Directions',
        noteUrl: 'https://www.indiabix.com/verbal-reasoning/direction-sense-test/',
        practiceLabel: '15 Directions Questions',
        practiceCount: 15,
        practiceUrl: 'https://www.indiabix.com/verbal-reasoning/direction-sense-test/',
      },
    ],
  },
];

export function getDayPlan(day) {
  return dailyLearningPlan.find((plan) => plan.day === day) ?? dailyLearningPlan[0];
}

export function getDayTopicLabel(day) {
  const plan = getDayPlan(day);
  return plan.subtitle || plan.topics.join(' · ');
}
