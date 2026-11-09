'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deleteModuleResource, enrollStudent, getInitialLmsState, readLmsState, saveLmsState, upsertModuleResource, type LmsState } from '@/lib/lms-store';
import type { ModuleResource, Role } from '@/lib/types';

type ResourceDraft = { title: string; type: 'link' | 'task'; description: string; url: string; dueDate: string };
const emptyDraft: ResourceDraft = { title: '', type: 'link', description: '', url: '', dueDate: '' };

export default function CoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const [data, setData] = useState<LmsState>(() => getInitialLmsState());
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>('admin');
  const [studentId, setStudentId] = useState('s1');
  const [moduleTitle, setModuleTitle] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [resourceModuleId, setResourceModuleId] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceDraft, setResourceDraft] = useState<ResourceDraft>(emptyDraft);
  const [resourceError, setResourceError] = useState('');
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
    setData((current) => ({ ...current, courses: current.courses.map((item) => item.id === course.id ? { ...item, modules: [...item.modules, { id: `module-${Date.now()}`, title, objective: '', lessons: [], resources: [] }] } : item) }));
    setModuleTitle(''); setNotice('Tema añadido al temario.');
  };
  const addExistingStudent = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value; if (!id) return;
    setData((current) => enrollStudent(current, course.id, id)); setNotice('Alumno inscrito en el curso.'); event.target.value = '';
  };
  const openResourceEditor = (moduleId: string, resource?: ModuleResource) => {
    setResourceModuleId(moduleId);
    setEditingResourceId(resource?.id ?? null);
    setResourceDraft(resource ? { title: resource.title, type: resource.type, description: resource.description, url: resource.url ?? '', dueDate: resource.dueDate ?? '' } : emptyDraft);
    setResourceError('');
  };
  const saveResource = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resourceModuleId || !resourceDraft.title.trim()) return;
    let url = resourceDraft.url.trim();
    if (resourceDraft.type === 'link') {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol');
        url = parsed.toString();
      } catch {
        setResourceError('Introduce un enlace válido que empiece por https:// o http://.');
        return;
      }
    }
    const resource: ModuleResource = {
      id: editingResourceId ?? `resource-${Date.now()}`,
      title: resourceDraft.title.trim(),
      type: resourceDraft.type,
      description: resourceDraft.description.trim(),
      ...(resourceDraft.type === 'link' ? { url } : { dueDate: resourceDraft.dueDate }),
    };
    setData((current) => upsertModuleResource(current, courseId, resourceModuleId, resource));
    setResourceModuleId(null); setEditingResourceId(null); setResourceDraft(emptyDraft);
    setNotice(editingResourceId ? 'Recurso actualizado.' : 'Recurso añadido al tema.');
  };
  const removeResource = (moduleId: string, resource: ModuleResource) => {
    if (!window.confirm(`¿Eliminar “${resource.title}” de este tema?`)) return;
    setData((current) => deleteModuleResource(current, courseId, moduleId, resource.id));
    setNotice('Recurso eliminado.');
  };

  return <main className="course-shell">
    <header className="course-header panel"><div><span className="eyebrow">{course.category} · Curso</span><h1>{course.title}</h1><p className="muted-copy">{course.description}</p></div><div className="header-actions">{role === 'admin' && <button className="ghost-button" onClick={() => setEditOpen(true)}>Editar curso</button>}<Link href="/dashboard" className="ghost-button">← Aula</Link></div></header>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}
    {role === 'student' && !isEnrolled && <div className="notice enrollment-notice">No estás inscrito en este curso.<button className="action-button" onClick={() => { setData((current) => enrollStudent(current, course.id, studentId)); setNotice('Ya estás inscrito. El curso aparecerá en Mis cursos.'); }}>Apuntarme al curso</button></div>}
    <section className="course-layout"><div className="cards-stack">
      <div className="panel course-info"><div className="panel-header"><div><h2>Contenido del curso</h2><p className="muted-copy">Temas, unidades y recursos de aprendizaje.</p></div><span className="course-pill">{course.modules.length} temas</span></div>
        {course.modules.length ? course.modules.map((module, index) => <details className="course-topic" key={module.id} open={index === 0}>
          <summary><span className="topic-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{module.title}</strong>{module.objective && <small>{module.objective}</small>}</span><span className="topic-count">{(module.resources?.length ?? 0) + module.lessons.length} recursos</span></summary>
          {module.lessons.length > 0 && <ul className="legacy-lessons">{module.lessons.map((lesson) => <li key={lesson}>▹ {lesson}</li>)}</ul>}
          {module.resources?.length ? <ul className="topic-resource-list">{module.resources.map((resource) => <li className="topic-resource" key={resource.id}><span className={`resource-icon ${resource.type}`}>{resource.type === 'task' ? '✓' : '↗'}</span><div className="topic-resource-body"><strong>{resource.title}</strong><span className="resource-kind">{resource.type === 'task' ? 'Tarea' : 'Enlace externo'}{resource.dueDate ? ` · Entrega: ${resource.dueDate}` : ''}</span>{resource.description && <p>{resource.description}</p>}{resource.type === 'link' && resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer">Abrir recurso ↗</a>}</div>{role === 'admin' && <div className="resource-actions"><button type="button" className="text-button" onClick={() => openResourceEditor(module.id, resource)}>Editar</button><button type="button" className="text-danger" onClick={() => removeResource(module.id, resource)}>Eliminar</button></div>}</li>)}</ul> : <p className="empty-message topic-empty">Todavía no hay recursos en este tema.</p>}
          {role === 'admin' && <button type="button" className="add-topic-resource" onClick={() => openResourceEditor(module.id)}>＋ Añadir tarea o enlace a este tema</button>}
        </details>) : <p className="empty-message">El profesor aún no ha publicado temas.</p>}
        {role === 'admin' && <form className="inline-add-form" onSubmit={addModule}><input aria-label="Nombre del tema" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Añadir un tema o unidad…" required /><button className="action-button">＋ Añadir tema</button></form>}
      </div>
      <div className="panel"><div className="panel-header"><div><h2>Materiales generales</h2><p className="muted-copy">Recursos de aprendizaje no asociados a un tema concreto.</p></div></div>{course.materials.length ? <ul className="resource-list">{course.materials.map((material) => <li key={material.id}><span>{material.type}</span><a href={material.url} target="_blank" rel="noreferrer">{material.title} ↗</a></li>)}</ul> : <p className="empty-message">Aún no hay materiales generales publicados.</p>}</div>
      <div className="panel"><div className="panel-header"><div><h2>Actividades y tareas</h2><p className="muted-copy">Fechas de entrega y estado.</p></div></div>{course.assignments.length ? <ul className="task-list">{course.assignments.map((task) => <li key={task.id}><strong>{task.title}</strong><small>{task.dueDate} · {task.type}</small><span className={`status-pill ${task.status}`}>{task.status === 'pending' ? 'Pendiente' : task.status === 'submitted' ? 'Entregada' : 'Revisada'}</span></li>)}</ul> : <p className="empty-message">No hay tareas generales en este curso.</p>}</div>
    </div><aside className="side-stack">
      <div className="panel participant-panel"><div className="panel-header"><div><h2>Participantes</h2><p className="muted-copy">{enrolled.length} {enrolled.length === 1 ? 'alumno inscrito' : 'alumnos inscritos'}</p></div></div>{role === 'admin' && availableStudents.length > 0 && <label className="enroll-select">Inscribir alumno<select defaultValue="" onChange={addExistingStudent}><option value="">Selecciona un alumno…</option>{availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.email}</option>)}</select></label>}{enrolled.length ? <ul className="participant-list">{enrolled.map((student) => <li key={student.id}><span className="avatar-circle">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{student.name}</strong><small>{student.email}</small></span><span className={`status-pill ${student.status}`}>{student.status}</span></li>)}</ul> : <p className="empty-message">Todavía no hay alumnos inscritos.</p>}</div>
      <div className="panel"><div className="panel-header"><div><h2>Exámenes y evaluaciones</h2><p className="muted-copy">{course.exams.length} examen(es) · gestionar y revisar notas</p></div></div>{course.exams.slice(0, 2).map((exam) => <Link key={exam.id} href={`/courses/${course.id}/exam/${exam.id}`} className="exam-link">{exam.title}<small>{exam.questions.length} preguntas · {exam.durationMinutes} min</small></Link>)}{role === 'admin' ? <Link className="action-button exam-manage-button" href={`/courses/${course.id}/exams`}>{course.exams.length ? 'Gestionar exámenes y notas' : '＋ Crear primer examen'}</Link> : course.exams.length === 0 ? <p className="empty-message">Aún no hay exámenes publicados.</p> : <Link className="ghost-button exam-manage-button" href={`/courses/${course.id}/exams`}>Ver evaluaciones</Link>}</div>
    </aside></section>

    {resourceModuleId && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResourceModuleId(null); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title"><div className="modal-heading"><div><span className="eyebrow">{course.modules.find((item) => item.id === resourceModuleId)?.title}</span><h2 id="resource-modal-title">{editingResourceId ? 'Editar recurso' : 'Añadir recurso al tema'}</h2></div><button type="button" onClick={() => setResourceModuleId(null)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={saveResource}>
      <label>Tipo de recurso<select value={resourceDraft.type} onChange={(event) => setResourceDraft((draft) => ({ ...draft, type: event.target.value as ResourceDraft['type'] }))}><option value="link">Enlace a sitio web</option><option value="task">Tarea</option></select></label>
      <label>{resourceDraft.type === 'task' ? 'Título de la tarea' : 'Nombre del enlace'}<input required autoFocus value={resourceDraft.title} onChange={(event) => setResourceDraft((draft) => ({ ...draft, title: event.target.value }))} placeholder={resourceDraft.type === 'task' ? 'Ej. Resumen del tema' : 'Ej. Documentación complementaria'} /></label>
      {resourceDraft.type === 'link' ? <label>URL<input type="url" required value={resourceDraft.url} onChange={(event) => setResourceDraft((draft) => ({ ...draft, url: event.target.value }))} placeholder="https://…" /></label> : <label>Fecha de entrega (opcional)<input type="date" value={resourceDraft.dueDate} onChange={(event) => setResourceDraft((draft) => ({ ...draft, dueDate: event.target.value }))} /></label>}
      <label>Descripción / instrucciones<textarea rows={4} value={resourceDraft.description} onChange={(event) => setResourceDraft((draft) => ({ ...draft, description: event.target.value }))} placeholder={resourceDraft.type === 'task' ? 'Explica qué debe entregar el alumno…' : 'Contexto para los alumnos (opcional)'} /></label>
      {resourceError && <p className="form-error" role="alert">{resourceError}</p>}
      <div className="form-actions"><button type="button" className="ghost-button" onClick={() => setResourceModuleId(null)}>Cancelar</button><button className="action-button" type="submit">{editingResourceId ? 'Guardar cambios' : 'Añadir recurso'}</button></div>
    </form></section></div>}

    {editOpen && <div className="modal-backdrop" role="presentation"><section className="modal-card" role="dialog" aria-modal="true"><div className="modal-heading"><h2>Editar curso</h2><button onClick={() => setEditOpen(false)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={updateCourse}><label>Nombre<input name="title" required defaultValue={course.title} /></label><label>Categoría<input name="category" defaultValue={course.category} /></label><label>Descripción<textarea name="description" rows={4} defaultValue={course.description} /></label><div className="form-actions"><button type="button" className="ghost-button" onClick={() => setEditOpen(false)}>Cancelar</button><button className="action-button">Guardar cambios</button></div></form></section></div>}
  </main>;
}
