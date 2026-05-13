export type Talk = {
  id: string
  title: string
  /** ISO `YYYY-MM-DD` */
  date: string
  href: string
  tag: string
}

export const talks: Talk[] = [
  {
    id: "state-vs-memoization-hackbuddy",
    title: "State vs. Memoization: Finding the Right Balance with Hooks",
    date: "2023-08-30",
    href: "https://www.youtube.com/watch?v=6O2iJN0zliI&t=13s",
    tag: "HackBuddy",
  },
  {
    id: "introduction-to-generative-art",
    title: "Introduction to Generative Art",
    date: "2022-04-20",
    href: "https://www.youtube.com/watch?v=u4QTr56t7iM&t=5502s",
    tag: "Geekle",
  },
];
