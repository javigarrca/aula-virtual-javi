import type { Course, Exam, ExamAnswer, ExamAttempt, ExamQuestion, StudentSummary } from '@/lib/types';
import { courses, students } from '@/lib/mock-data';

export type LmsState = {
  courses: Course[];
  students: StudentSummary[];
  enrollments: Record<string, string[]>;
  examAttempts: ExamAttempt[];
};

const STORAGE_KEY = 'aula-virtual-data-v1';

export function getInitialLmsState(): LmsState {
  return {
    courses: clone(courses),
    students: clone(students),
    enrollments: { s1: ['curso-ux'], s2: ['curso-js'], s3: ['curso-ux'], s4: ['curso-js'] },
    examAttempts: [],
  };
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export function readLmsState(): LmsState {
  if (typeof window === 'undefined') return getInitialLmsState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialLmsState();
    const parsed: unknown = JSON.parse(raw);
    if (isLmsState(parsed)) return { ...parsed, examAttempts: parsed.examAttempts ?? [] };
  } catch { /* Use demo data when browser storage is unavailable or invalid. */ }
  return getInitialLmsState();
}

export function saveLmsState(state: LmsState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Session still works without persistence. */ }
}

export function createCourse(state: LmsState, input: Pick<Course, 'title' | 'category' | 'description' | 'teacher'>, id = `course-${Date.now()}`): LmsState {
  const course: Course = { ...input, id, progress: 0, students: 0, modules: [], materials: [], assignments: [], exams: [] };
  return { ...state, courses: [course, ...state.courses] };
}

export function enrollStudent(state: LmsState, courseId: string, studentId: string): LmsState {
  if (!state.courses.some((course) => course.id === courseId) || !state.students.some((student) => student.id === studentId)) return state;
  const current = state.enrollments[studentId] ?? [];
  if (current.includes(courseId)) return state;
  return { ...state, enrollments: { ...state.enrollments, [studentId]: [...current, courseId] } };
}

export function upsertExam(state: LmsState, courseId: string, exam: Exam): LmsState {
  return {
    ...state,
    courses: state.courses.map((course) => course.id !== courseId ? course : {
      ...course,
      exams: [...course.exams.filter((item) => item.id !== exam.id), exam],
    }),
  };
}

export function gradeExam(questions: ExamQuestion[], answers: Record<string, ExamAnswer>) {
  let earnedPoints = 0;
  const totalPoints = questions.reduce((total, question) => total + Math.max(1, question.points ?? 1), 0);
  for (const question of questions) {
    const points = Math.max(1, question.points ?? 1);
    const answer = answers[question.id];
    let correct = false;
    if (question.type === 'short') {
      const accepted = question.correctAnswers ?? [];
      const submitted = typeof answer === 'string' ? normalize(answer) : '';
      correct = accepted.some((item) => normalize(item) === submitted);
    } else if (question.type === 'matching') {
      const submitted = answer && !Array.isArray(answer) && typeof answer === 'object' ? answer : {};
      correct = Boolean(question.pairs?.length) && question.pairs!.every((pair) => normalize(submitted[pair.left] ?? '') === normalize(pair.right));
    } else if (question.type === 'multiple') {
      const submitted = Array.isArray(answer) ? answer.map(String).sort() : [];
      const expected = (question.correctAnswers ?? []).map(String).sort();
      correct = expected.length > 0 && submitted.length === expected.length && expected.every((item, index) => item === submitted[index]);
    } else {
      const expected = question.correctAnswers?.[0] ?? (question.correctIndex !== undefined ? question.options?.[question.correctIndex] : undefined);
      correct = typeof answer === 'string' && expected !== undefined && answer === expected;
    }
    if (correct) earnedPoints += points;
  }
  return { earnedPoints, totalPoints, percentage: totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0 };
}

function normalize(value: string) { return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase(); }

export function addExamAttempt(state: LmsState, attempt: ExamAttempt): LmsState {
  return { ...state, examAttempts: [...(state.examAttempts ?? []), attempt] };
}

export function isLmsState(value: unknown): value is LmsState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LmsState>;
  return Array.isArray(candidate.courses) && Array.isArray(candidate.students) && Boolean(candidate.enrollments) && typeof candidate.enrollments === 'object';
}
