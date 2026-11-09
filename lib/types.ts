export type Role = 'admin' | 'student';

export type Material = { id: string; title: string; type: 'pdf' | 'link' | 'video'; url: string };
export type Module = { id: string; title: string; objective: string; lessons: string[] };
export type Assignment = {
  id: string; title: string; description: string; dueDate: string;
  type: 'upload' | 'text' | 'quiz' | 'self-evaluation';
  status: 'pending' | 'submitted' | 'reviewed';
};

export type MatchPair = { left: string; right: string };
export type ExamQuestion = {
  id: string;
  type?: 'single' | 'multiple' | 'short' | 'matching';
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctAnswers?: string[];
  pairs?: MatchPair[];
  points?: number;
};
export type Exam = { id: string; title: string; durationMinutes: number; attempts: number; questions: ExamQuestion[] };
export type ExamAnswer = string | string[] | Record<string, string>;
export type ExamAttempt = {
  id: string;
  examId: string;
  courseId: string;
  studentId: string;
  answers: Record<string, ExamAnswer>;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
};
export type Course = {
  id: string; title: string; category: string; teacher: string; description: string;
  progress: number; students: number; modules: Module[]; materials: Material[];
  assignments: Assignment[]; exams: Exam[];
};
export type StudentSummary = { id: string; name: string; email: string; course: string; score: number; status: 'activo' | 'pendiente' };
