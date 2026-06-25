-- Create the candidates table
create table if
  exists candidates (
    id uuid default gen_random_uuid () primary key,
    name text not null,
    email text,
    phone text,
    linkedin_url text,
    job_title text,
    location text,
    experience_years numeric,
    skills text[],
    scrubbed_text text,
    resume_url text,
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null
  );

-- Enable Row Level Security (optional, for development we can disable or allow all operations)
alter table candidates enable row level security;

-- Create policies to allow all actions for simplicity (or authenticated if preferred)
create policy "Allow public read access" on candidates for select using (true);

create policy "Allow public insert access" on candidates for insert with check (true);
