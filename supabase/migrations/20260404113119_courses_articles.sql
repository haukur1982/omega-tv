-- ===========================================
-- ARTICLES (Digital Print)
-- ===========================================
create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  author_name text default 'Omega TV',
  content text not null, -- Stores text, will be formatted on frontend
  excerpt text,
  featured_image text,
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table articles enable row level security;
create policy "Anyone can read published articles" on articles for select using (published_at is not null);
create policy "Service role full access on articles" on articles for all using (auth.role() = 'service_role');

-- ===========================================
-- E-COURSES
-- ===========================================
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text,
  instructor text,
  poster_horizontal text,
  poster_vertical text,
  status text default 'draft', -- 'draft', 'published'
  created_at timestamptz default now()
);

alter table courses enable row level security;
create policy "Anyone can read active courses" on courses for select using (status = 'published');
create policy "Service role full access on courses" on courses for all using (auth.role() = 'service_role');

-- ===========================================
-- COURSE MODULES
-- ===========================================
create table if not exists course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  module_number integer not null,
  title text not null,
  description text,
  created_at timestamptz default now(),
  unique(course_id, module_number)
);

alter table course_modules enable row level security;
create policy "Anyone can read course modules" on course_modules for select using (true);
create policy "Service role full access on modules" on course_modules for all using (auth.role() = 'service_role');

-- ===========================================
-- COURSE LESSONS
-- ===========================================
create table if not exists course_lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid not null references course_modules(id) on delete cascade,
  lesson_number integer not null,
  title text not null,
  bunny_video_id text, -- Video content for the lesson
  text_content text, -- Optional text content
  is_free_preview boolean default false,
  created_at timestamptz default now(),
  unique(module_id, lesson_number)
);

alter table course_lessons enable row level security;
create policy "Anyone can read course lessons" on course_lessons for select using (true);
create policy "Service role full access on lessons" on course_lessons for all using (auth.role() = 'service_role');

-- ===========================================
-- USER PROGRESS (Strict Progression Lock)
-- ===========================================
create table if not exists user_lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- References auth.users eventually
  lesson_id uuid not null references course_lessons(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

alter table user_lesson_progress enable row level security;
create policy "Users can read own progress" on user_lesson_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on user_lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on user_lesson_progress for update using (auth.uid() = user_id);
create policy "Service role full access on progress" on user_lesson_progress for all using (auth.role() = 'service_role');
