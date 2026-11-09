export type Role = 'admin' | 'student';

export function isAdmin(role: string | null | undefined): boolean {
  return role === 'admin';
}

export function isStudent(role: string | null | undefined): boolean {
  return role === 'student';
}

export function canEditCourse(role: Role | null | undefined): boolean {
  return role === 'admin';
}

export function shuffleQuestions<T>(items: T[]): T[] {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}
