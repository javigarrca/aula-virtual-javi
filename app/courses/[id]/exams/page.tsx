'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getInitialLmsState, readLmsState, saveLmsState, upsertExam, type LmsState } from '@/lib/lms-store';
import type { Exam, ExamQuestion, MatchPair } from '@/lib/types';

function newQuestion(type: ExamQuestion['type'] = 'single'): ExamQuestion {
  return { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, prompt: '', options: ['', '', ''], correctAnswers: [], pairs: type === 'matching' ? [{ left: '', right: '' }, { left: '', right: '' }] : [], points: 1 };
}

export default function ExamsManagementPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const [data, setData] = useState<LmsState>(() => getInitialLmsState());
  const [ready, setReady] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [questions, setQuestions] = useState<ExamQuestion[]>([newQuestion()]);
  const [notice, setNotice] = useState('');

  useEffect(() => { setData(readLmsState()); setReady(true); }, []);
  useEffect(() => { if (ready) saveLmsState(data); }, [data, ready]);
  const course = data.courses.find((item) => item.id === courseId);
  if (!course) return <main className="empty-state">Curso no encontrado. <Link href="/dashboard">Volver</Link></main>;
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('aula-virtual-role') !== 'student';

  const updateQuestion = (questionId: string, update: (question: ExamQuestion) => ExamQuestion) => setQuestions((current) => current.map((question) => question.id === questionId ? update(question) : question));
  const changeType = (questionId: string, type: ExamQuestion['type']) => updateQuestion(questionId, (question) => ({ ...question, type, options: question.options?.length ? question.options : ['', '', ''], correctAnswers: [], pairs: type === 'matching' ? [{ left: '', right: '' }, { left: '', right: '' }] : [] }));
  const submitExam = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanQuestions = questions.map((question) => ({
      ...question,
      prompt: question.prompt.trim(),
      options: question.type === 'single' || question.type === 'multiple' ? (question.options ?? []).map((item) => item.trim()).filter(Boolean) : [],
      correctAnswers: (question.correctAnswers ?? []).map((item) => item.trim()).filter(Boolean),
      pairs: (question.pairs ?? []).filter((pair) => pair.left.trim() && pair.right.trim()).map((pair) => ({ left: pair.left.trim(), right: pair.right.trim() })),
      points: Math.max(1, Number(question.points) || 1),
    }));
    const invalid = cleanQuestions.some((question) => !question.prompt || ((question.type === 'single' || question.type === 'multiple') && (question.options?.length ?? 0) < 2) || (question.type === 'single' && !(question.correctAnswers?.length)) || (question.type === 'multiple' && !(question.correctAnswers?.length)) || (question.type === 'short' && !(question.correctAnswers?.length)) || (question.type === 'matching' && (question.pairs?.length ?? 0) < 2));
    if (!title.trim() || invalid) { setNotice('Revisa el título y las preguntas: cada pregunta necesita enunciado y respuesta correcta.'); return; }
    const exam: Exam = { id: `exam-${Date.now()}`, title: title.trim(), durationMinutes: Math.max(1, duration), attempts: Math.max(1, attemptsAllowed), questions: cleanQuestions };
    setData((current) => upsertExam(current, courseId, exam));
    setEditorOpen(false); setTitle(''); setQuestions([newQuestion()]); setNotice('Examen creado y guardado en este navegador.');
  };

  const attempts = data.examAttempts ?? [];
  return <main className="course-shell">
    <header className="course-header panel"><div><Link className="back-link" href={`/courses/${courseId}`}>← Volver al curso</Link><span className="eyebrow">Banco de evaluaciones</span><h1>Exámenes · {course.title}</h1><p className="muted-copy">Crea cuestionarios con distintos tipos de pregunta y revisa sus resultados.</p></div>{isAdmin && <button className="action-button" onClick={() => setEditorOpen(true)}>＋ Crear examen</button>}</header>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}
    <section className="exam-management-grid"><div className="panel"><div className="panel-header"><div><h2>Exámenes del curso</h2><p className="muted-copy">{course.exams.length} evaluaciones</p></div></div>
      {course.exams.length ? <div className="exam-management-list">{course.exams.map((exam) => <article className="exam-management-card" key={exam.id}><div><span className="course-pill">{exam.durationMinutes} min · {exam.attempts} intento(s)</span><h3>{exam.title}</h3><p className="muted-copy">{exam.questions.length} preguntas · {exam.questions.reduce((n, q) => n + (q.points ?? 1), 0)} puntos</p></div><Link className="action-button" href={`/courses/${courseId}/exam/${exam.id}`}>Vista previa / realizar</Link></article>)}</div> : <div className="empty-message">Aún no has creado exámenes. Usa “Crear examen” para preparar el primero.</div>}
    </div>
    <div className="panel"><div className="panel-header"><div><h2>Intentos y calificaciones</h2><p className="muted-copy">Resultados automáticos de esta demo.</p></div></div>
      {attempts.filter((attempt) => attempt.courseId === courseId).length ? <div className="table-wrap"><table><thead><tr><th>Alumno</th><th>Examen</th><th>Nota</th><th>Fecha</th></tr></thead><tbody>{attempts.filter((attempt) => attempt.courseId === courseId).map((attempt) => <tr key={attempt.id}><td>{data.students.find((student) => student.id === attempt.studentId)?.name ?? 'Alumno'}</td><td>{course.exams.find((exam) => exam.id === attempt.examId)?.title ?? 'Examen'}</td><td><strong>{attempt.percentage}%</strong> ({attempt.earnedPoints}/{attempt.totalPoints})</td><td>{new Date(attempt.submittedAt).toLocaleString('es-ES')}</td></tr>)}</tbody></table></div> : <p className="empty-message">Todavía no hay intentos entregados.</p>}
    </div></section>

    {editorOpen && <div className="modal-backdrop exam-builder-backdrop" role="presentation"><section className="modal-card exam-builder" role="dialog" aria-modal="true" aria-labelledby="builder-title"><div className="modal-heading"><div><span className="eyebrow">Nuevo cuestionario</span><h2 id="builder-title">Crear examen</h2></div><button onClick={() => setEditorOpen(false)} aria-label="Cerrar">×</button></div>
      <form className="form-stack" onSubmit={submitExam}><div className="exam-settings-grid"><label>Nombre del examen<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Unidad 1: conceptos básicos" /></label><label>Tiempo (minutos)<input type="number" min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label><label>Intentos permitidos<input type="number" min="1" value={attemptsAllowed} onChange={(event) => setAttemptsAllowed(Number(event.target.value))} /></label></div>
        <div className="builder-section-title"><div><h3>Preguntas</h3><p className="muted-copy">Las preguntas cerradas y el texto corto se autocorrigen al entregar.</p></div><button type="button" className="ghost-button" onClick={() => setQuestions((current) => [...current, newQuestion()])}>＋ Añadir pregunta</button></div>
        {questions.map((question, index) => <article className="builder-question" key={question.id}><div className="builder-question-head"><strong>Pregunta {index + 1}</strong><button type="button" className="text-danger" onClick={() => setQuestions((current) => current.length > 1 ? current.filter((item) => item.id !== question.id) : current)}>Eliminar</button></div>
          <label>Enunciado<textarea required rows={2} value={question.prompt} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, prompt: event.target.value }))} placeholder="Escribe la pregunta" /></label>
          <div className="question-config-grid"><label>Tipo de pregunta<select value={question.type ?? 'single'} onChange={(event) => changeType(question.id, event.target.value as ExamQuestion['type'])}><option value="single">Opción única (choice)</option><option value="multiple">Varias respuestas</option><option value="short">Texto corto</option><option value="matching">Relacionar conceptos</option></select></label><label>Puntos<input type="number" min="1" value={question.points ?? 1} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, points: Number(event.target.value) }))} /></label></div>
          {(question.type === 'single' || question.type === 'multiple' || !question.type) && <div className="builder-options"><div className="builder-subheading"><strong>Opciones</strong><button type="button" className="text-button" onClick={() => updateQuestion(question.id, (item) => ({ ...item, options: [...(item.options ?? []), ''] }))}>＋ Añadir opción</button></div>{(question.options ?? []).map((option, optionIndex) => <div className="builder-option-row" key={`${question.id}-option-${optionIndex}`}><input aria-label={`Opción ${optionIndex + 1}`} value={option} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, options: (item.options ?? []).map((value, i) => i === optionIndex ? event.target.value : value) }))} placeholder={`Opción ${optionIndex + 1}`} />{question.type === 'multiple' ? <label className="correct-toggle"><input type="checkbox" checked={(question.correctAnswers ?? []).includes(option)} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, correctAnswers: event.target.checked ? [...(item.correctAnswers ?? []), option] : (item.correctAnswers ?? []).filter((answer) => answer !== option) }))} /> Correcta</label> : <label className="correct-toggle"><input type="radio" name={`correct-${question.id}`} checked={(question.correctAnswers?.[0] ?? '') === option && option !== ''} onChange={() => updateQuestion(question.id, (item) => ({ ...item, correctAnswers: [option] }))} /> Correcta</label>}<button type="button" className="icon-button" aria-label="Quitar opción" onClick={() => updateQuestion(question.id, (item) => ({ ...item, options: (item.options ?? []).filter((_, i) => i !== optionIndex), correctAnswers: (item.correctAnswers ?? []).filter((answer) => answer !== option) }))}>×</button></div>)}</div>}
          {question.type === 'short' && <label>Respuestas aceptadas para autocorrección<input value={(question.correctAnswers ?? []).join(' | ')} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, correctAnswers: event.target.value.split('|').map((answer) => answer.trim()) }))} placeholder="Ej. Madrid | madrid" /><small className="muted-copy">Se ignoran mayúsculas y espacios repetidos. Separa variantes con |.</small></label>}
          {question.type === 'matching' && <div className="builder-options"><div className="builder-subheading"><strong>Pares que hay que relacionar</strong><button type="button" className="text-button" onClick={() => updateQuestion(question.id, (item) => ({ ...item, pairs: [...(item.pairs ?? []), { left: '', right: '' }] }))}>＋ Añadir par</button></div>{(question.pairs ?? []).map((pair, pairIndex) => <div className="matching-editor-row" key={`${question.id}-pair-${pairIndex}`}><input aria-label="Concepto" placeholder="Concepto" value={pair.left} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, pairs: (item.pairs ?? []).map((value, i) => i === pairIndex ? { ...value, left: event.target.value } : value) }))} /><span>↔</span><input aria-label="Correspondencia" placeholder="Correspondencia correcta" value={pair.right} onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, pairs: (item.pairs ?? []).map((value, i) => i === pairIndex ? { ...value, right: event.target.value } : value) }))} /><button type="button" className="icon-button" aria-label="Quitar par" onClick={() => updateQuestion(question.id, (item) => ({ ...item, pairs: (item.pairs ?? []).filter((_, i) => i !== pairIndex) }))}>×</button></div>)}</div>}
        </article>)}
        <div className="form-actions"><button type="button" className="ghost-button" onClick={() => setEditorOpen(false)}>Cancelar</button><button type="submit" className="action-button">Guardar examen</button></div>
      </form>
    </section></div>}
  </main>;
}
