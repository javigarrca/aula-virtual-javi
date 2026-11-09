'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { students as seedStudents } from '@/lib/mock-data';
import type { Role, StudentSummary } from '@/lib/types';
import { createCourse, enrollStudent, getInitialLmsState, readLmsState, saveLmsState, type LmsState } from '@/lib/lms-store';

export default function DashboardPage() {
  const [data, setData] = useState<LmsState>(() => getInitialLmsState());
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>('admin');
  const [studentId, setStudentId] = useState('s1');
  const [dialog, setDialog] = useState<'course' | 'student' | null>(null);
  const [notice, setNotice] = useState('');
  const [courseForm, setCourseForm] = useState({ title: '', category: '', description: '' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', courseId: '' });

  useEffect(() => {
    const stored = readLmsState();
    setData(stored);
    const storedRole = localStorage.getItem('aula-virtual-role');
    const storedStudent = localStorage.getItem('aula-virtual-student');
    if (storedRole === 'admin' || storedRole === 'student') setRole(storedRole);
    if (storedStudent && stored.students.some((student) => student.id === storedStudent)) setStudentId(storedStudent);
    setReady(true);
  }, []);

  useEffect(() => { if (ready) saveLmsState(data); }, [data, ready]);

  const selectedStudent = data.students.find((student) => student.id === studentId) ?? data.students[0];
  const myCourseIds = useMemo(() => new Set(data.enrollments[studentId] ?? []), [data.enrollments, studentId]);
  const myCourses = data.courses.filter((course) => myCourseIds.has(course.id));
  const availableCourses = data.courses.filter((course) => !myCourseIds.has(course.id));
  const totalEnrollments = Object.values(data.enrollments).reduce((total, ids) => total + ids.length, 0);

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    localStorage.setItem('aula-virtual-role', nextRole);
  };

  const createNewCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = courseForm.title.trim();
    if (!title) return;
    setData((current) => createCourse(current, {
      title,
      category: courseForm.category.trim() || 'General',
      description: courseForm.description.trim(),
      teacher: 'Javi García',
    }));
    setCourseForm({ title: '', category: '', description: '' });
    setDialog(null);
    setNotice('Curso creado. Ya aparece en tu panel.');
  };

  const addStudent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = studentForm.name.trim();
    const email = studentForm.email.trim();
    if (!name || !email || !studentForm.courseId) return;
    const newStudent: StudentSummary = {
      id: `student-${Date.now()}`,
      name,
      email,
      course: data.courses.find((item) => item.id === studentForm.courseId)?.title ?? '',
      score: 0,
      status: 'activo',
    };
    setData((current) => ({
      ...current,
      students: [...current.students, newStudent],
      enrollments: enrollStudent({ ...current, students: [...current.students, newStudent] }, studentForm.courseId, newStudent.id).enrollments,
    }));
    setStudentForm({ name: '', email: '', courseId: '' });
    setDialog(null);
    setNotice('Alumno añadido al curso.');
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand-block"><div className="brand-mark">AV</div><div><strong>Aula Virtual</strong><small>Javi</small></div></Link>
        <nav className="nav-list" aria-label="Navegación principal">
          <a className="active" href="#inicio">Panel principal</a>
          <a href="#cursos">{role === 'admin' ? 'Cursos' : 'Mis cursos'}</a>
          {role === 'admin' && <a href="#alumnos">Participantes</a>}
          {role === 'student' && <a href="#catalogo">Catálogo de cursos</a>}
        </nav>
        <div className="sidebar-card"><small>Vista de demostración</small><strong>{role === 'admin' ? 'Profesor / admin' : 'Alumno'}</strong></div>
      </aside>

      <section className="main-panel" id="inicio">
        <header className="topbar">
          <div><span className="eyebrow">Aula Virtual · Inicio</span><h1>{role === 'admin' ? 'Panel del profesor' : 'Área personal'}</h1></div>
          <div className="role-controls" aria-label="Cambiar vista de demostración">
            <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => changeRole('admin')}>Profesor</button>
            <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => changeRole('student')}>Alumno</button>
          </div>
        </header>

        {notice && <div className="notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}

        {role === 'admin' ? <>
          <div className="dashboard-grid stats-grid">
            <div className="panel stat-card"><span className="label">Mis cursos</span><strong>{data.courses.length}</strong></div>
            <div className="panel stat-card"><span className="label">Alumnos registrados</span><strong>{data.students.length}</strong></div>
            <div className="panel stat-card"><span className="label">Inscripciones</span><strong>{totalEnrollments}</strong></div>
            <div className="panel stat-card"><span className="label">Tareas por revisar</span><strong>{data.courses.reduce((n, course) => n + course.assignments.filter((task) => task.status === 'submitted').length, 0)}</strong></div>
          </div>
          <div className="panel section-panel" id="cursos">
            <div className="panel-header"><div><h2>Mis cursos</h2><p className="muted-copy">Gestiona el contenido y consulta sus participantes.</p></div><button className="action-button" onClick={() => setDialog('course')}>＋ Crear curso</button></div>
            <CourseCards courses={data.courses} enrollments={data.enrollments} role="admin" />
          </div>
          <div className="panel section-panel" id="alumnos">
            <div className="panel-header"><div><h2>Participantes</h2><p className="muted-copy">Alumnos registrados en el aula y sus cursos.</p></div><button className="action-button" onClick={() => setDialog('student')} disabled={data.courses.length === 0}>＋ Añadir alumno</button></div>
            {data.students.length ? <div className="table-wrap"><table><thead><tr><th>Alumno</th><th>Correo</th><th>Cursos inscritos</th><th>Estado</th></tr></thead><tbody>
              {data.students.map((student) => {
                const enrolled = data.courses.filter((course) => data.enrollments[student.id]?.includes(course.id));
                return <tr key={student.id}><td>{student.name}</td><td>{student.email}</td><td>{enrolled.length ? enrolled.map((course) => course.title).join(', ') : 'Sin cursos'}</td><td><span className={`status-pill ${student.status}`}>{student.status}</span></td></tr>;
              })}
            </tbody></table></div> : <p className="empty-message">Todavía no hay alumnos. Añade uno para empezar.</p>}
          </div>
        </> : <>
          <div className="student-welcome panel"><div><span className="eyebrow">Hola{selectedStudent ? `, ${selectedStudent.name.split(' ')[0]}` : ''}</span><h2>Continúa aprendiendo</h2><p className="muted-copy">Tus cursos y el catálogo están aquí.</p></div>
            <label className="student-picker">Alumno de demostración<select value={studentId} onChange={(event) => { setStudentId(event.target.value); localStorage.setItem('aula-virtual-student', event.target.value); }}>
              {data.students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select></label>
          </div>
          <div className="panel section-panel" id="cursos"><div className="panel-header"><div><h2>Mis cursos</h2><p className="muted-copy">Cursos a los que estás inscrito.</p></div></div>
            {myCourses.length ? <CourseCards courses={myCourses} enrollments={data.enrollments} role="student" /> : <p className="empty-message">Aún no estás inscrito en ningún curso. Explora el catálogo.</p>}
          </div>
          <div className="panel section-panel" id="catalogo"><div className="panel-header"><div><h2>Catálogo de cursos</h2><p className="muted-copy">Apúntate a un curso para que aparezca en “Mis cursos”.</p></div></div>
            {availableCourses.length ? <CourseCards courses={availableCourses} enrollments={data.enrollments} role="student" onEnroll={(courseId) => { setData((current) => enrollStudent(current, courseId, studentId)); setNotice('Inscripción realizada. El curso ya está en Mis cursos.'); }} /> : <p className="empty-message">Ya estás inscrito en todos los cursos disponibles.</p>}
          </div>
        </>}
      </section>

      {dialog === 'course' && <Modal title="Crear un curso" onClose={() => setDialog(null)}><form className="form-stack" onSubmit={createNewCourse}>
        <label>Nombre del curso<input required autoFocus value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} placeholder="Ej. Matemáticas de 2º ESO" /></label>
        <label>Categoría<input value={courseForm.category} onChange={(event) => setCourseForm({ ...courseForm, category: event.target.value })} placeholder="Ej. Ciencias" /></label>
        <label>Descripción<textarea rows={3} value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} placeholder="¿Qué aprenderán los alumnos?" /></label>
        <div className="form-actions"><button type="button" className="ghost-button" onClick={() => setDialog(null)}>Cancelar</button><button className="action-button" type="submit">Crear curso</button></div>
      </form></Modal>}
      {dialog === 'student' && <Modal title="Añadir alumno a un curso" onClose={() => setDialog(null)}><form className="form-stack" onSubmit={addStudent}>
        <label>Nombre completo<input required autoFocus value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} placeholder="Nombre del alumno" /></label>
        <label>Correo electrónico<input required type="email" value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} placeholder="alumno@ejemplo.com" /></label>
        <label>Inscribir en<select required value={studentForm.courseId} onChange={(event) => setStudentForm({ ...studentForm, courseId: event.target.value })}><option value="">Selecciona un curso</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
        <div className="form-actions"><button type="button" className="ghost-button" onClick={() => setDialog(null)}>Cancelar</button><button className="action-button" type="submit">Añadir alumno</button></div>
      </form></Modal>}
    </main>
  );
}

function CourseCards({ courses, enrollments, role, onEnroll }: { courses: LmsState['courses']; enrollments: LmsState['enrollments']; role: Role; onEnroll?: (courseId: string) => void }) {
  return <div className="cards-grid">{courses.map((course) => {
    const enrolledCount = Object.values(enrollments).filter((ids) => ids.includes(course.id)).length;
    return <article key={course.id} className="course-card"><span className="course-pill">{course.category}</span><h3>{course.title}</h3><p>{course.description || 'Sin descripción todavía.'}</p>
      <div className="course-card-meta"><span>◉ {enrolledCount} participantes</span><span>{course.modules.length} temas</span></div>
      <div className="course-card-actions"><Link href={`/courses/${course.id}`} className="action-button">{role === 'admin' ? 'Gestionar curso' : 'Ver curso'}</Link>{onEnroll && <button className="ghost-button" onClick={() => onEnroll(course.id)}>＋ Apuntarme</button>}</div>
    </article>;
  })}</div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar">×</button></div>{children}</section></div>;
}
