# Aula Virtual Javi

Plataforma educativa tipo Moodle/Canvas para gestionar cursos, alumnos, tareas, exámenes y recursos didácticos.

## Stack

- Next.js 14
- TypeScript
- Supabase (almacenamiento y base de datos)
- Diseño responsive tipo LMS

## Funcionalidades

- Roles: administrador y alumno.
- Dashboard con resumen de cursos y alumnos.
- Gestión de cursos y temarios.
- Materiales descargables y enlaces.
- Tareas con estados.
- Exámenes con temporizador y preguntas aleatorias.
- Integración opcional con Supabase Storage para archivos pesados.

## Inicio rápido

1. Copia `.env.example` a `.env.local`.
2. Añade tus claves de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Instala dependencias:

```bash
npm install
```

4. Ejecuta el proyecto:

```bash
npm run dev
```

5. Abre `http://localhost:3000`.

## Supabase

Se incluye un esquema SQL de ejemplo en `supabase/schema.sql` para tablas de perfiles, cursos, alumnos, materiales y exámenes.

## Hosting gratuito recomendado

- Vercel: ideal para Next.js y despliegue gratuito.
- Opción rápida: vincula el repositorio de GitHub y despliega desde Vercel.
- La URL será algo como `https://aula-virtual-javi.vercel.app` y luego podrás conectar tu dominio propio.

## Variables de entorno para producción

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

## Cómo extenderlo

- Añadir autenticación real con Supabase Auth.
- Guardar cursos y alumnos en tablas reales.
- Subir archivos en el bucket `course-materials`.
- Añadir endpoints para tareas, calificaciones y seguimientos.

## Notas

Este proyecto es una base funcional MVP para un aula virtual con enfoque educativo y fácil de extender.
