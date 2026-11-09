import './globals.css';
import './lms.css';
import './theme.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aula Virtual Javi',
  description: 'Plataforma escolar con cursos, participantes, actividades y evaluaciones.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
