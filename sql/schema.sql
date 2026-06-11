create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  url_hash text not null unique,
  title text not null,
  source text not null,
  url text not null,
  canonical_url text,
  body_text text,
  excerpt text,
  content_hash text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  published_at timestamptz,
  times_shown integer not null default 0,
  status text not null default 'new'
    check (status in ('new', 'shown', 'updated', 'skipped')),
  duplicate_group_id uuid,
  primary_article_id uuid references public.news_articles(id),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists news_articles_last_seen_idx
  on public.news_articles(last_seen desc);

create index if not exists news_articles_published_at_idx
  on public.news_articles(published_at desc);

create index if not exists news_articles_status_idx
  on public.news_articles(status);

create table if not exists public.glossary (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  definition text not null,
  first_used date not null default current_date,
  times_used integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_editions (
  id uuid primary key default gen_random_uuid(),
  edition_date date not null unique,
  stories jsonb not null,
  generated_at timestamptz not null default now()
);

create table if not exists public.run_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  fetched integer not null default 0,
  skipped integer not null default 0,
  published integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);
