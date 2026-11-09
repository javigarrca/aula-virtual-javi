import { describe, expect, it } from 'vitest';
import { canEditCourse, isAdmin, isStudent, shuffleQuestions } from '@/lib/permissions';

describe('permissions helpers', () => {
  it('admin can edit course', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(canEditCourse('admin')).toBe(true);
  });

  it('student cannot edit course', () => {
    expect(isStudent('student')).toBe(true);
    expect(canEditCourse('student')).toBe(false);
  });

  it('question shuffle keeps the same items', () => {
    const questions = ['A', 'B', 'C'];
    const shuffled = shuffleQuestions(questions);
    expect(shuffled).toHaveLength(3);
    expect(shuffled.sort()).toEqual(['A', 'B', 'C'].sort());
  });
});
