// src/types/stats.ts
export type DashboardStats = {
  totalBooks: number;
  totalFinished: number;
  totalReading: number;
  totalReadingTime: number; // seconds
  streak: number;
  genres: { name: string; value: number }[];
  monthly: { month: string; count: number }[];
  weekly: { week: string; minutes: number }[];
};
