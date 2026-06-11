# AI Homeroom

Daily AI news explained in plain English for beginners.

This repo is being built in phases. Phase 1 is ingestion + dedup only: fetch the last 24 hours of AI stories, normalize URLs/content, group duplicates, and produce a dry-run report before any production Supabase writes.

## Phase 1 status

Implemented:

- Configurable RSS feed list in `config/feeds.yaml`
- Hacker News top stories ingestion with AI keyword filtering
- Public Bluesky author-feed ingestion from configurable accounts
- URL canonicalization and SHA-256 hashes
- Fuzzy title grouping with RapidFuzz
- Supabase schema draft in `sql/schema.sql`
- Dry-run script that writes nothing to Supabase

Not yet implemented:

- Supabase persistence for `news_articles`
- Full-text article extraction beyond RSS/HN/Bluesky excerpts
- Phase 2 story ranking and beginner summaries
- Next.js frontend
- Daily cron + Telegram run summary

## Local setup

```bash
uv run pytest -q
uv run python scripts/dry_run.py --output artifacts/phase1-dry-run.json
```

## Working rule

Do not apply `sql/schema.sql` or write production rows until Dustin approves the dry-run output.
