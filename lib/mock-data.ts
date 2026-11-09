import type { Course, StudentSummary } from '@/lib/types';

export const courses: Course[] = [
  {
    id: 'curso-ux',
    title: 'Diseño UX y Experiencia de Usuario',
    category: 'Diseño',
    teacher: 'Javi García',
    description:
      'Aprende a validar necesidades, diseñar flujos, wireframes, prototipos y evaluar la experiencia de usuario con criterios claros.',
    progress: 72,
    students: 28,
    modules: [
      {
        id: 'mod-1',
        title: 'Fundamentos del UX',
        objective: 'Entender la investigación y la empatía de usuario.',
        lessons: ['¿Qué es UX?', 'Encuestas y entrevistas', 'Personas y journeys']
      },
      {
        id: 'mod-2',
        title: 'Arquitectura y flujo',
        objective: 'Diseñar journeys y estructurar contenidos.',
        lessons: ['Mapa de navegación', 'Wireframes', 'Prototipos de baja fidelidad']
      }
    ],
    materials: [
      { id: 'm1', title: 'Guía de UX', type: 'pdf', url: 'https://example.com/ux-guide.pdf' },
      { id: 'm2', title: 'Plantilla de persona', type: 'pdf', url: 'https://example.com/persona-template.pdf' },
      { id: 'm3', title: 'Videotutorial de prototipado', type: 'video', url: 'https://example.com/prototyping.mp4' }
    ],
    assignments: [
      { id: 'a1', title: 'Análisis de una app', description: 'Haz un estudio de usabilidad de una app concreta.', dueDate: '2026-12-02', type: 'upload', status: 'submitted' },
      { id: 'a2', title: 'Diario de aprendizaje', description: 'Describe tus decisiones de diseño y feedback.', dueDate: '2026-12-10', type: 'text', status: 'pending' }
    ],
    exams: [
      {
        id: 'e1',
        title: 'Examen de UX básico',
        durationMinutes: 25,
        attempts: 2,
        questions: [
          {
            id: 'q1',
            prompt: '¿Qué elemento ayuda a comprender mejor la necesidad del usuario?',
            options: ['Personas', 'Diversión', 'Cruce de datos', 'CSS'],
            correctIndex: 0
          },
          {
            id: 'q2',
            prompt: '¿Qué describe mejor un wireframe?',
            options: ['Un boceto de estructura', 'Un cómputo final', 'Un algoritmo', 'Una base de datos'],
            correctIndex: 0
          },
          {
            id: 'q3',
            prompt: '¿Qué es más útil para evaluar la usabilidad?',
            options: ['Pruebas con usuarios', 'Mensajes de texto', 'Cifrado de datos', 'Hosting'],
            correctIndex: 0
          }
        ]
      }
    ]
  },
  {
    id: 'curso-js',
    title: 'JavaScript Avanzado',
    category: 'Programación',
    teacher: 'Javi García',
    description:
      'Domina la programación moderna con JavaScript, asincronía, promesas, APIs, testing y patrones reutilizables para construir apps robustas.',
    progress: 58,
    students: 32,
    modules: [
      {
        id: 'mod-a',
        title: 'Asincronía',
        objective: 'Trabajar con promesas, async/await y fetch.',
        lessons: ['Fetch y API', 'Promesas', 'Async / await']
      },
      {
        id: 'mod-b',
        title: 'Patrones y testing',
        objective: 'Crear componentes robustos y probar su comportamiento.',
        lessons: ['Testing con Vitest', 'Modularización', 'Patrones de diseño']
      }
    ],
    materials: [
      { id: 'm4', title: 'Resumen de promesas', type: 'pdf', url: 'https://example.com/promises.pdf' },
      { id: 'm5', title: 'Curso de testing', type: 'link', url: 'https://example.com/testing-course' }
    ],
    assignments: [
      { id: 'a3', title: 'API REST con fetch', description: 'Consume una API y construye una vista funcional.', dueDate: '2026-12-05', type: 'upload', status: 'reviewed' },
      { id: 'a4', title: 'Refactor de funciones', description: 'Haz cleaner code y documenta decisiones.', dueDate: '2026-12-13', type: 'text', status: 'pending' }
    ],
    exams: [
      {
        id: 'e2',
        title: 'Examen JavaScript intermedio',
        durationMinutes: 30,
        attempts: 1,
        questions: [
          {
            id: 'q10',
            prompt: '¿Qué devuelve Promise.all?',
            options: ['Un array con los resultados', 'Un número', 'Un objeto vacío', 'Un set'],
            correctIndex: 0
          },
          {
            id: 'q11',
            prompt: '¿Qué palabra clave permite esperar una promesa?',
            options: ['await', 'const', 'catch', 'finally'],
            correctIndex: 0
          },
          {
            id: 'q12',
            prompt: '¿Cuál es una ventaja de modularizar código?',
            options: ['Reutilización y mantenimiento', 'Más errores', 'Menos claridad', 'Menos pruebas'],
            correctIndex: 0
          }
        ]
      }
    ]
  }
];

export const students: StudentSummary[] = [
  { id: 's1', name: 'Lucía Martínez', email: 'lucia@alumno.com', course: 'Diseño UX', score: 93, status: 'activo' },
  { id: 's2', name: 'Pablo Serrano', email: 'pablo@alumno.com', course: 'JavaScript Avanzado', score: 87, status: 'activo' },
  { id: 's3', name: 'Ana López', email: 'ana@alumno.com', course: 'Diseño UX', score: 78, status: 'pendiente' },
  { id: 's4', name: 'Miguel Ruiz', email: 'miguel@alumno.com', course: 'JavaScript Avanzado', score: 82, status: 'activo' }
];

export const quickStats = {
  totalCourses: courses.length,
  activeStudents: students.length,
  pendingTasks: 5,
  completedExams: 17
};
