export type Role = 'admin' | 'student';

export type Material = {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video';
  url: string;
};

export type Module = {
  id: string;
  title: string;
  objective: string;
  lessons: string[];
};

export type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: 'upload' | 'text' | 'quiz' | 'self-evaluation';
  status: 'pending' | 'submitted' | 'reviewed';
};

export type ExamQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type Exam = {
  id: string;
  title: string;
  durationMinutes: number;
  attempts: number;
  questions: ExamQuestion[];
};

export type Course = {
  id: string;
  title: string;
  category: string;
  teacher: string;
  description: string;
  progress: number;
  students: number;
  modules: Module[];
  materials: Material[];
  assignments: Assignment[];
  exams: Exam[];
};

export type StudentSummary = {
  id: string;
  name: string;
  email: string;
  course: string;
  score: number;
  status: 'activo' | 'pendiente';
};
