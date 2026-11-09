create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  teacher text not null,
  description text,
  progress integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id),
  course_id uuid references public.courses(id),
  created_at timestamptz default now(),
  unique (profile_id, course_id)
);

create table if not exists public.materials (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id),
  title text not null,
  file_type text not null,
  file_url text,
  created_at timestamptz default now()
);

create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id),
  title text not null,
  description text,
  due_date date,
  type text not null default 'upload',
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id),
  title text not null,
  duration_minutes integer not null default 30,
  attempts integer not null default 1,
  created_at timestamptz default now()
);

create table if not exists public.exam_questions (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid references public.exams(id),
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  created_at timestamptz default now()
);

create table if not exists public.exam_attempts (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id),
  exam_id uuid references public.exams(id),
  score integer not null default 0,
  percentage numeric not null default 0,
  created_at timestamptz default now()
);

create policy "Allow public read to profiles" on public.profiles for select using (true);
create policy "Allow public insert to profiles" on public.profiles for insert with check (true);

create policy "Allow public read to courses" on public.courses for select using (true);
create policy "Allow public write to courses" on public.courses for insert with check (true);

create policy "Allow public read to enrollments" on public.enrollments for select using (true);
create policy "Allow public write to enrollments" on public.enrollments for insert with check (true);

-- Supabase storage bucket
create policy "Public access to course-materials" on storage.objects for select using (bucket_id = 'course-materials');
create policy "Upload to course-materials" on storage.objects for insert with check (bucket_id = 'course-materials');

-- Bucket creation example:
-- create bucket if not exists course-materials;
-- alter publication supabase_realtime add table public.courses;
