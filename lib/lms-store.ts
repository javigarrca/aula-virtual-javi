import type { Course, StudentSummary } from '@/lib/types';

export type LmsState = {
  courses: Course[];
  students: StudentSummary[];
  enrollments: Record<string, string[]>;
};

const STORAGE_KEY = 'aula-virtual-data-v1';

export function getInitialLmsState(): LmsState {
  return {
    courses: structuredCloneSafe(courses),
    students: structuredCloneSafe(students),
    enrollments: {
      s1: ['curso-ux'],
      s2: ['curso-js'],
      s3: ['curso-ux'],
      s4: ['curso-js'],
    },
  };
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function readLmsState(): LmsState {
  if (typeof window === 'undefined') return getInitialLmsState();
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return getInitialLmsState();
    const parsed: unknown = JSON.parse(value);
    if (isLmsState(parsed)) return parsed;
  } catch {
    // Recover from unavailable storage or malformed saved data by using demo data.
  }
  return getInitialLmsState();
}

export function saveLmsState(state: LmsState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The UI can still be used for the current session if browser storage is disabled.
  }
}

export function createCourse(state: LmsState, input: Pick<Course, 'title' | 'category' | 'description' | 'teacher'>, id = `course-${Date.now()}`): LmsState {
  const course: Course = {
    ...input,
    id,
    progress: 0,
    students: 0,
    modules: [],
    materials: [],
    assignments: [],
    exams: [],
  };
  return { ...state, courses: [course, ...state.courses] };
}

export function enrollStudent(state: LmsState, courseId: string, studentId: string): LmsState {
  if (!state.courses.some((course) => course.id === courseId) || !state.students.some((student) => student.id === studentId)) return state;
  const current = state.enrollments[studentId] ?? [];
  if (current.includes(courseId)) return state;
  return { ...state, enrollments: { ...state.enrollments, [studentId]: [...current, courseId] } };
}

export function isLmsState(value: unknown): value is LmsState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LmsState>;
  return Array.isArray(candidate.courses) && Array.isArray(candidate.students) && Boolean(candidate.enrollments) && typeof candidate.enrollments === 'object';
}

import { courses, students } from '@/lib/mock-data';
