'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { addExamAttempt, getInitialLmsState, gradeExam, readLmsState, saveLmsState, type LmsState } from '@/lib/lms-store';
import type { ExamAnswer } from '@/lib/types';

export default function ExamPage() {
  const params = useParams<{ id: string; examId: string }>();
  const [data, setData] = useState<LmsState>(() => getInitialLmsState());
  const [ready, setReady] = useState(false);
  const [studentId, setStudentId] = useState('s1');
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ earnedPoints: number; totalPoints: number; percentage: number } | null>(null);

  useEffect(() => {
    const state = readLmsState(); setData(state);
    const savedStudent = localStorage.getItem('aula-virtual-student');
    if (savedStudent && state.students.some((student) => student.id === savedStudent)) setStudentId(savedStudent);
    const course = state.courses.find((item) => item.id === params.id);
    const exam = course?.exams.find((item) => item.id === params.examId);
    if (exam) setTimeLeft(exam.durationMinutes * 60);
    setReady(true);
  }, [params.id, params.examId]);
  useEffect(() => { if (ready) saveLmsState(data); }, [data, ready]);

  const course = useMemo(() => data.courses.find((item) => item.id === params.id), [data.courses, params.id]);
  const exam = course?.exams.find((item) => item.id === params.examId);
  useEffect(() => {
    if (!exam || submitted || timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [exam, submitted, timeLeft > 0]);
  useEffect(() => { if (exam && timeLeft === 0 && !submitted) submitExam(); }, [timeLeft, exam, submitted]);

  if (!course || !exam) return <main className="empty-state">Examen no disponible. <Link href="/dashboard">Volver al aula</Link></main>;
  const student = data.students.find((item) => item.id === studentId);
  const isEnrolled = Boolean(data.enrollments[studentId]?.includes(course.id));
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  function submitExam() {
    if (submitted || !exam || !course) return;
    const graded = gradeExam(exam.questions, answers);
    const attempt = { id: `attempt-${Date.now()}`, examId: exam.id, courseId: course.id, studentId, answers, ...graded, submittedAt: new Date().toISOString() };
    setData((current) => addExamAttempt(current, attempt));
    setResult(graded); setSubmitted(true);
  }

  const setAnswer = (questionId: string, answer: ExamAnswer) => setAnswers((current) => ({ ...current, [questionId]: answer }));
  return <main className="exam-shell"><header className="course-header panel"><div><Link href={`/courses/${course.id}`} className="back-link">← {course.title}</Link><span className="eyebrow">Evaluación</span><h1>{exam.title}</h1><p className="muted-copy">{exam.questions.length} preguntas · {exam.durationMinutes} minutos · Alumno: {student?.name ?? 'Demo'}</p></div><div className="timer-box"><small>Tiempo restante</small><strong>{minutes}:{seconds}</strong></div></header>
    {!isEnrolled && <div className="notice">Esta cuenta de alumno no está inscrita en el curso. Esta es una demo; vuelve al curso para apuntarte.</div>}
    <div className="panel exam-panel">{!submitted ? <>
      {exam.questions.map((question, index) => <section key={question.id} className="question-block"><div className="question-heading"><span className="question-number">{index + 1}</span><div><h3>{question.prompt}</h3><small>{question.points ?? 1} punto(s) · {question.type === 'multiple' ? 'Varias respuestas' : question.type === 'short' ? 'Texto corto' : question.type === 'matching' ? 'Relacionar conceptos' : 'Una respuesta'}</small></div></div>
        {question.type === 'short' ? <input className="answer-input" aria-label={`Respuesta pregunta ${index + 1}`} value={typeof answers[question.id] === 'string' ? answers[question.id] as string : ''} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder="Escribe tu respuesta" /> : null}
        {(question.type === 'single' || !question.type) && <div className="options-grid">{(question.options ?? []).map((option) => <label className="option-item" key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswer(question.id, option)} /><span>{option}</span></label>)}</div>}
        {question.type === 'multiple' && <div className="options-grid">{(question.options ?? []).map((option) => { const selected = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : []; return <label className="option-item" key={option}><input type="checkbox" checked={selected.includes(option)} onChange={(event) => setAnswer(question.id, event.target.checked ? [...selected, option] : selected.filter((item) => item !== option))} /><span>{option}</span></label>; })}</div>}
        {question.type === 'matching' && <div className="matching-list">{(question.pairs ?? []).map((pair) => { const current = answers[question.id] && !Array.isArray(answers[question.id]) && typeof answers[question.id] === 'object' ? answers[question.id] as Record<string, string> : {}; return <label key={pair.left}><strong>{pair.left}</strong><select value={current[pair.left] ?? ''} onChange={(event) => setAnswer(question.id, { ...current, [pair.left]: event.target.value })}><option value="">Elige la correspondencia</option>{(question.pairs ?? []).map((item) => <option key={item.right} value={item.right}>{item.right}</option>)}</select></label>; })}</div>}
      </section>)}
      <div className="exam-actions"><Link href={`/courses/${course.id}`} className="ghost-button">Salir del examen</Link><button className="action-button" onClick={submitExam}>Entregar examen</button></div>
    </> : <div className="result-box"><span className="eyebrow">Examen entregado</span><h2>Resultado: {result?.percentage ?? 0}%</h2><p>{result?.earnedPoints ?? 0} de {result?.totalPoints ?? 0} puntos. La nota se ha corregido automáticamente y queda guardada en esta demo.</p><Link href={`/courses/${course.id}/exams`} className="action-button">Volver a evaluaciones</Link></div>}</div>
  </main>;
}
