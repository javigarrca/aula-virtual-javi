# Aula Virtual Javi

Aula virtual responsive con una organización inspirada en los patrones habituales de un LMS: panel del profesor, área personal del alumno, catálogo, cursos por temas, participantes y actividades.

## Ejecutar

Requiere Node.js 18.17+ o 20+.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Para validar: `npm test` y `npm run build`.

## Interacciones disponibles en la demo

- El panel de profesor permite crear cursos, editar sus datos, añadir temas, añadir alumnos e inscribir alumnos existentes.
- La vista de alumno tiene “Mis cursos”, catálogo e inscripción a cursos.
- La página de un curso muestra el temario, los materiales, las tareas y el listado de participantes.
- Los cambios se guardan en el almacenamiento local del navegador desde el que se usa la demo.
- El selector de alumno permite probar varias cuentas de ejemplo en el mismo navegador.

## Importante: demo, no todavía un LMS multiusuario

Esta versión persiste información en `localStorage`, por lo que los datos solo están disponibles en ese navegador/dispositivo. El selector Profesor/Alumno es únicamente una vista de demostración: no autentica usuarios ni protege permisos. No introduzcas datos personales reales ni uses esto para exámenes de verdad todavía. Para compartir cursos entre dispositivos y tener seguridad real hace falta configurar Supabase Auth, tablas con Row Level Security y almacenamiento privado.

## Supabase y despliegue

Se conserva un esquema inicial en `supabase/schema.sql` y una utilidad de subida preparada en `lib/supabase.ts`; todavía no están conectados a los formularios de esta demo. Para Vercel, conecta el repositorio y ejecuta el despliegue. Los cambios nuevos en `main` deberían iniciar un nuevo deployment automáticamente.
