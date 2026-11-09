'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { courses } from '@/lib/mock-data';
import { shuffleQuestions } from '@/lib/permissions';

export default function ExamPage({ params }: { params: { id: string; examId: string } }) {
  const course = useMemo(() => courses.find((item) => item.id === params.id), [params.id]);
  const exam = useMemo(
    () => course?.exams.find((item) => item.id === params.examId),
    [course, params.examId]
  );

  const [timeLeft, setTimeLeft] = useState<number>(exam?.durationMinutes ? exam.durationMinutes * 60 : 0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState(exam?.questions ?? []);

  useEffect(() => {
    if (!exam || submitted) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          setSubmitted(true);
          clearInterval(interval);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exam, submitted]);

  useEffect(() => {
    if (exam) {
      setQuestions(shuffleQuestions(exam.questions));
    }
  }, [exam]);

  if (!course || !exam) {
    return <main className="empty-state">Examen no disponible.</main>;
  }

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((previous) => ({ ...previous, [questionId]: optionIndex }));
  };

  const submitExam = () => {
    setSubmitted(true);
  };

  const score = questions.reduce((total, question) => {
    const chosen = answers[question.id];
    if (chosen === question.correctIndex) {
      return total + 1;
    }
    return total;
  }, 0);

  return (
    <main className="exam-shell">
      <header className="course-header panel">
        <div>
          <span className="eyebrow">Examen</span>
          <h1>{exam.title}</h1>
        </div>
        <div className="timer-box">
          <strong>{minutes}:{seconds}</strong>
        </div>
      </header>

      <div className="panel exam-panel">
        {!submitted ? (
          <>
            {questions.map((question, index) => (
              <div key={question.id} className="question-block">
                <h3>
                  {index + 1}. {question.prompt}
                </h3>
                <div className="options-grid">
                  {question.options.map((option, optionIndex) => (
                    <label key={option} className="option-item">
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === optionIndex}
                        onChange={() => handleAnswer(question.id, optionIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="exam-actions">
              <Link href={`/courses/${course.id}`} className="ghost-button">Cancelar</Link>
              <button className="action-button" onClick={submitExam}>Entregar examen</button>
            </div>
          </>
        ) : (
          <div className="result-box">
            <h2>Resultado del examen</h2>
            <p>
              Has acertado <strong>{score}</strong> de <strong>{questions.length}</strong> preguntas.
            </p>
            <p>
              Tu nota final es <strong>{Math.round((score / questions.length) * 100)}%</strong>.
            </p>
            <Link href={`/courses/${course.id}`} className="action-button">Volver al curso</Link>
          </div>
        )}
      </div>
    </main>
  );
}
