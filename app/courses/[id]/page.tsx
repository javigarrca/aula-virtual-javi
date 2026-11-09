'use client';

import Link from 'next/link';
import { courses } from '@/lib/mock-data';
import { useMemo } from 'react';

export default function CoursePage({ params }: { params: { id: string } }) {
  const currentCourse = useMemo(
    () => courses.find((course) => course.id === params.id),
    [params.id]
  );

  if (!currentCourse) {
    return <main className="empty-state">Curso no encontrado.</main>;
  }

  return (
    <main className="course-shell">
      <header className="course-header panel">
        <div>
          <span className="eyebrow">{currentCourse.category}</span>
          <h1>{currentCourse.title}</h1>
        </div>
        <Link href="/dashboard" className="ghost-button">Volver</Link>
      </header>

      <section className="course-layout">
        <div className="cards-stack">
          <div className="panel course-info">
            <h2>Información del curso</h2>
            <p>{currentCourse.description}</p>
            <div className="meta-grid">
              <div>
                <span>Profesor</span>
                <strong>{currentCourse.teacher}</strong>
              </div>
              <div>
                <span>Alumnos</span>
                <strong>{currentCourse.students}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Temario</h2>
            {currentCourse.modules.map((module) => (
              <div key={module.id} className="module-block">
                <h3>{module.title}</h3>
                <p>{module.objective}</p>
                <ul>
                  {module.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="side-stack">
          <div className="panel">
            <h2>Materiales</h2>
            <ul className="resource-list">
              {currentCourse.materials.map((material) => (
                <li key={material.id}>
                  <span>{material.type}</span>
                  <a href={material.url} target="_blank" rel="noreferrer">
                    {material.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h2>Tareas</h2>
            <ul className="task-list">
              {currentCourse.assignments.map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong>
                  <small>{task.dueDate} · {task.type}</small>
                  <span className={`status-pill ${task.status}`}>{task.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h2>Exámenes</h2>
            {currentCourse.exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/courses/${currentCourse.id}/exam/${exam.id}`}
                className="exam-link"
              >
                {exam.title} · {exam.durationMinutes} min
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
