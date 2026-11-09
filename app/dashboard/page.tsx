'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { courses, quickStats, students } from '@/lib/mock-data';
import { isAdmin, type Role } from '@/lib/permissions';

export default function DashboardPage() {
  const [role, setRole] = useState<Role>('admin');

  useEffect(() => {
    const stored = localStorage.getItem('aula-virtual-role');
    if (stored === 'admin' || stored === 'student') {
      setRole(stored);
    }
  }, []);

  const adminView = (
    <>
      <div className="dashboard-grid stats-grid">
        <div className="panel stat-card">
          <span className="label">Cursos</span>
          <strong>{quickStats.totalCourses}</strong>
        </div>
        <div className="panel stat-card">
          <span className="label">Alumnos</span>
          <strong>{quickStats.activeStudents}</strong>
        </div>
        <div className="panel stat-card">
          <span className="label">Tareas pendientes</span>
          <strong>{quickStats.pendingTasks}</strong>
        </div>
        <div className="panel stat-card">
          <span className="label">Exámenes realizados</span>
          <strong>{quickStats.completedExams}</strong>
        </div>
      </div>

      <div className="panel section-panel">
        <div className="panel-header">
          <h2>Cursos</h2>
          <button className="action-button">Nuevo curso</button>
        </div>

        <div className="cards-grid">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="course-card card-link">
              <div className="course-pill">{course.category}</div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="progress-row">
                <span>Progreso</span>
                <strong>{course.progress}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${course.progress}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="panel section-panel">
        <div className="panel-header">
          <h2>Alumnos</h2>
          <button className="action-button">Invitar</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Curso</th>
                <th>Nota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.course}</td>
                  <td>{student.score}</td>
                  <td>
                    <span className={`status-pill ${student.status}`}>{student.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const studentView = (
    <>
      <div className="dashboard-grid stats-grid">
        <div className="panel stat-card">
          <span className="label">Cursos activos</span>
          <strong>2</strong>
        </div>
        <div className="panel stat-card">
          <span className="label">Tareas sin entregar</span>
          <strong>3</strong>
        </div>
        <div className="panel stat-card">
          <span className="label">Media</span>
          <strong>86%</strong>
        </div>
        <div className="panel stat-card">
          <span className="label">Próximo examen</span>
          <strong>12 dic</strong>
        </div>
      </div>

      <div className="panel section-panel">
        <div className="panel-header">
          <h2>Mis cursos</h2>
        </div>
        <div className="cards-grid">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="course-card card-link">
              <div className="course-pill">{course.category}</div>
              <h3>{course.title}</h3>
              <p>{course.teacher}</p>
              <div className="progress-row">
                <span>Mi progreso</span>
                <strong>{course.progress}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${course.progress}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">AV</div>
          <div>
            <strong>Aula Virtual</strong>
            <small>Javi</small>
          </div>
        </div>

        <nav className="nav-list">
          <a className="active" href="/dashboard">Panel principal</a>
          <a href="/dashboard">Cursos</a>
          <a href="/dashboard">Calificaciones</a>
          <a href="/dashboard">Tareas</a>
          <a href="/dashboard">Exámenes</a>
        </nav>

        <div className="sidebar-card">
          <small>Rol actual</small>
          <strong>{isAdmin(role) ? 'Administrador' : 'Alumno'}</strong>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Panel</span>
            <h1>{isAdmin(role) ? 'Dashboard administrativo' : 'Mi aprendizaje'}</h1>
          </div>
          <Link href="/" className="ghost-button">Salir</Link>
        </header>

        {isAdmin(role) ? adminView : studentView}
      </section>
    </main>
  );
}
