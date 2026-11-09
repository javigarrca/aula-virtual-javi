import { describe, expect, it } from 'vitest';
import { createCourse, enrollStudent, getInitialLmsState } from '../lib/lms-store';

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

  it('does not create enrollment for unknown course or student', () => {
    const initial = getInitialLmsState();
    expect(enrollStudent(initial, 'missing-course', 's1')).toBe(initial);
    expect(enrollStudent(initial, 'curso-ux', 'missing-student')).toBe(initial);
  });
});
