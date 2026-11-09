import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aula Virtual Javi',
  description: 'Plataforma escolar con curso, alumnos, tareas y exámenes.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
