import { RoleSwitcher } from '@/components/RoleSwitcher';

export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Aula Virtual Javi</span>
          <h1>Tu plataforma educativa, lista para enseñar y gestionar.</h1>
          <p>
            Diseñada para cursos, alumnos, materiales, exámenes, actividades y seguimiento
            con un enfoque tipo Moodle o Canvas.
          </p>
          <RoleSwitcher />
        </div>

        <div className="hero-panel">
          <div className="mini-stat">
            <strong>32</strong>
            <span>alumnos activos</span>
          </div>
          <div className="mini-stat">
            <strong>08</strong>
            <span>cursos creados</span>
          </div>
          <div className="mini-stat">
            <strong>94%</strong>
            <span>cumplimiento</span>
          </div>
        </div>
      </section>
    </main>
  );
}
