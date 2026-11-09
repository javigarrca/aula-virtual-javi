'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getInitialLmsState, readLmsState, saveLmsState, enrollStudent, type LmsState } from '@/lib/lms-store';
import type { Role } from '@/lib/types';

export default function CoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const [data, setData] = useState<LmsState>(() => getInitialLmsState());
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>('admin');
  const [studentId, setStudentId] = useState('s1');
  const [moduleTitle, setModuleTitle] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const stored = readLmsState(); setData(stored);
    setRole(localStorage.getItem('aula-virtual-role') === 'student' ? 'student' : 'admin');
    const savedStudentId = localStorage.getItem('aula-virtual-student');
    if (savedStudentId && stored.students.some((student) => student.id === savedStudentId)) setStudentId(savedStudentId);
    setReady(true);
  }, []);
  useEffect(() => { if (ready) saveLmsState(data); }, [data, ready]);

  const course = data.courses.find((item) => item.id === courseId);
  if (!course) return <main className="empty-state"><div>Curso no encontrado.<p><Link href="/dashboard">Volver al aula</Link></p></div></main>;
  const enrolled = data.students.filter((student) => data.enrollments[student.id]?.includes(course.id));
  const isEnrolled = Boolean(data.enrollments[studentId]?.includes(course.id));
  const availableStudents = data.students.filter((student) => !data.enrollments[student.id]?.includes(course.id));

  const updateCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setData((current) => ({ ...current, courses: current.courses.map((item) => item.id === course.id ? { ...item, title: String(form.get('title')).trim(), category: String(form.get('category')).trim() || 'General', description: String(form.get('description')).trim() } : item) }));
    setEditOpen(false); setNotice('Cambios guardados.');
  };
  const addModule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const title = moduleTitle.trim(); if (!title) return;
    setData((current) => ({ ...current, courses: current.courses.map((item) => item.id === course.id ? { ...item, modules: [...item.modules, { id: `module-${Date.now()}`, title, objective: '', lessons: [] }] } : item) }));
    setModuleTitle(''); setNotice('Tema añadido al temario.');
  };
  const addExistingStudent = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value; if (!id) return;
    setData((current) => enrollStudent(current, course.id, id)); setNotice('Alumno inscrito en el curso.'); event.target.value = '';
  };

  return <main className="course-shell">
    <header className="course-header panel"><div><span className="eyebrow">{course.category} · Curso</span><h1>{course.title}</h1><p className="muted-copy">{course.description}</p></div><div className="header-actions">{role === 'admin' && <button className="ghost-button" onClick={() => setEditOpen(true)}>Editar curso</button>}<Link href="/dashboard" className="ghost-button">← Aula</Link></div></header>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}
    {role === 'student' && !isEnrolled && <div className="notice enrollment-notice">No estás inscrito en este curso.<button className="action-button" onClick={() => { setData((current) => enrollStudent(current, course.id, studentId)); setNotice('Ya estás inscrito. El curso aparecerá en Mis cursos.'); }}>Apuntarme al curso</button></div>}
    <section className="course-layout"><div className="cards-stack">
      <div className="panel course-info"><div className="panel-header"><div><h2>Contenido del curso</h2><p className="muted-copy">Temas, unidades y recursos de aprendizaje.</p></div><span className="course-pill">{course.modules.length} temas</span></div>
        {course.modules.length ? course.modules.map((module, index) => <details className="course-topic" key={module.id} open={index === 0}><summary><span className="topic-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{module.title}</strong>{module.objective && <small>{module.objective}</small>}</span><span className="topic-count">{module.lessons.length} recursos</span></summary>{module.lessons.length ? <ul>{module.lessons.map((lesson) => <li key={lesson}>▹ {lesson}</li>)}</ul> : <p className="muted-copy topic-empty">Todavía no hay recursos en este tema.</p>}</details>) : <p className="empty-message">El profesor aún no ha publicado temas.</p>}
        {role === 'admin' && <form className="inline-add-form" onSubmit={addModule}><input aria-label="Nombre del tema" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Añadir un tema o unidad…" required /><button className="action-button">＋ Añadir tema</button></form>}
      </div>
      <div className="panel"><div className="panel-header"><div><h2>Materiales</h2><p className="muted-copy">Recursos de aprendizaje del curso.</p></div></div>{course.materials.length ? <ul className="resource-list">{course.materials.map((material) => <li key={material.id}><span>{material.type}</span><a href={material.url} target="_blank" rel="noreferrer">{material.title} ↗</a></li>)}</ul> : <p className="empty-message">Aún no hay materiales publicados.</p>}</div>
      <div className="panel"><div className="panel-header"><div><h2>Actividades y tareas</h2><p className="muted-copy">Fechas de entrega y estado.</p></div></div>{course.assignments.length ? <ul className="task-list">{course.assignments.map((task) => <li key={task.id}><strong>{task.title}</strong><small>{task.dueDate} · {task.type}</small><span className={`status-pill ${task.status}`}>{task.status === 'pending' ? 'Pendiente' : task.status === 'submitted' ? 'Entregada' : 'Revisada'}</span></li>)}</ul> : <p className="empty-message">No hay tareas en este curso.</p>}</div>
    </div><aside className="side-stack">
      <div className="panel participant-panel"><div className="panel-header"><div><h2>Participantes</h2><p className="muted-copy">{enrolled.length} {enrolled.length === 1 ? 'alumno inscrito' : 'alumnos inscritos'}</p></div></div>{role === 'admin' && availableStudents.length > 0 && <label className="enroll-select">Inscribir alumno<select defaultValue="" onChange={addExistingStudent}><option value="">Selecciona un alumno…</option>{availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.email}</option>)}</select></label>}{enrolled.length ? <ul className="participant-list">{enrolled.map((student) => <li key={student.id}><span className="avatar-circle">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{student.name}</strong><small>{student.email}</small></span><span className={`status-pill ${student.status}`}>{student.status}</span></li>)}</ul> : <p className="empty-message">Todavía no hay alumnos inscritos.</p>}</div>
      <div className="panel"><div className="panel-header"><div><h2>Exámenes y evaluaciones</h2><p className="muted-copy">{course.exams.length} examen(es) · gestionar y revisar notas</p></div></div>{course.exams.slice(0, 2).map((exam) => <Link key={exam.id} href={`/courses/${course.id}/exam/${exam.id}`} className="exam-link">{exam.title}<small>{exam.questions.length} preguntas · {exam.durationMinutes} min</small></Link>)}{role === 'admin' ? <Link className="action-button exam-manage-button" href={`/courses/${course.id}/exams`}>{course.exams.length ? 'Gestionar exámenes y notas' : '＋ Crear primer examen'}</Link> : course.exams.length === 0 ? <p className="empty-message">Aún no hay exámenes publicados.</p> : <Link className="ghost-button exam-manage-button" href={`/courses/${course.id}/exams`}>Ver evaluaciones</Link>}</div>
    </aside></section>
    {editOpen && <div className="modal-backdrop" role="presentation"><section className="modal-card" role="dialog" aria-modal="true"><div className="modal-heading"><h2>Editar curso</h2><button onClick={() => setEditOpen(false)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={updateCourse}><label>Nombre<input name="title" required defaultValue={course.title} /></label><label>Categoría<input name="category" defaultValue={course.category} /></label><label>Descripción<textarea name="description" rows={4} defaultValue={course.description} /></label><div className="form-actions"><button type="button" className="ghost-button" onClick={() => setEditOpen(false)}>Cancelar</button><button className="action-button">Guardar cambios</button></div></form></section></div>}
  </main>;
}
