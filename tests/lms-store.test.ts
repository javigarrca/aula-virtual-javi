import { describe, expect, it } from 'vitest';
import { createCourse, deleteModuleResource, enrollStudent, getInitialLmsState, gradeExam, upsertExam, upsertModuleResource } from '../lib/lms-store';
import type { Exam, ModuleResource } from '../lib/types';

describe('LMS course and enrollment operations', () => {
  it('creates a course with empty content sections', () => {
    const state = createCourse(getInitialLmsState(), { title: 'Biología', category: 'Ciencias', description: 'Curso inicial', teacher: 'Javi García' }, 'biology');
    expect(state.courses[0].id).toBe('biology');
    expect(state.courses[0].title).toBe('Biología');
    expect(state.courses[0].modules).toEqual([]);
    expect(state.courses[0].assignments).toEqual([]);
  });
  it('enrolls a student in a course once', () => {
    const initial = getInitialLmsState();
    const enrolled = enrollStudent(initial, 'curso-js', 's1');
    expect(enrolled.enrollments.s1).toContain('curso-js');
    expect(enrollStudent(enrolled, 'curso-js', 's1').enrollments.s1.filter((id) => id === 'curso-js')).toHaveLength(1);
  });
  it('does not enroll unknown course or student', () => {
    const initial = getInitialLmsState();
    expect(enrollStudent(initial, 'missing-course', 's1')).toBe(initial);
    expect(enrollStudent(initial, 'curso-ux', 'missing-student')).toBe(initial);
  });
  it('saves an exam to the selected course', () => {
    const initial = getInitialLmsState();
    const exam: Exam = { id: 'new-exam', title: 'Test', durationMinutes: 10, attempts: 1, questions: [] };
    expect(upsertExam(initial, 'curso-ux', exam).courses.find((course) => course.id === 'curso-ux')?.exams[0]).toEqual(exam);
  });
  it('adds, updates and removes resources in the selected topic', () => {
    const initial = getInitialLmsState();
    const resource: ModuleResource = { id: 'r1', title: 'Guía externa', type: 'link', description: 'Lectura', url: 'https://example.org' };
    const added = upsertModuleResource(initial, 'curso-ux', 'mod-1', resource);
    expect(added.courses.find((course) => course.id === 'curso-ux')?.modules[0].resources).toEqual([resource]);
    const updated = upsertModuleResource(added, 'curso-ux', 'mod-1', { ...resource, title: 'Guía editada' });
    expect(updated.courses.find((course) => course.id === 'curso-ux')?.modules[0].resources).toHaveLength(1);
    expect(updated.courses.find((course) => course.id === 'curso-ux')?.modules[0].resources?.[0].title).toBe('Guía editada');
    const removed = deleteModuleResource(updated, 'curso-ux', 'mod-1', 'r1');
    expect(removed.courses.find((course) => course.id === 'curso-ux')?.modules[0].resources).toEqual([]);
  });
});

describe('automatic exam grading', () => {
  it('grades single and multiple choice; multiple answers require exact set', () => {
    const questions = [
      { id: 'one', type: 'single' as const, prompt: 'one', options: ['A', 'B'], correctAnswers: ['B'], points: 2 },
      { id: 'multi', type: 'multiple' as const, prompt: 'multi', options: ['A', 'B', 'C'], correctAnswers: ['A', 'C'], points: 3 },
    ];
    expect(gradeExam(questions, { one: 'B', multi: ['C', 'A'] })).toEqual({ earnedPoints: 5, totalPoints: 5, percentage: 100 });
    expect(gradeExam(questions, { one: 'B', multi: ['A'] }).earnedPoints).toBe(2);
  });
  it('grades accepted short text ignoring case and repeated whitespace', () => {
    const result = gradeExam([{ id: 'short', type: 'short', prompt: 'capital', correctAnswers: ['San  José'], points: 2 }], { short: ' san josé ' });
    expect(result).toEqual({ earnedPoints: 2, totalPoints: 2, percentage: 100 });
  });
  it('autocorrects matching pairs and rejects wrong pairs', () => {
    const question = { id: 'match', type: 'matching' as const, prompt: 'match', pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }], points: 1 };
    expect(gradeExam([question], { match: { A: '1', B: '2' } }).percentage).toBe(100);
    expect(gradeExam([question], { match: { A: '2', B: '1' } }).percentage).toBe(0);
  });
});
