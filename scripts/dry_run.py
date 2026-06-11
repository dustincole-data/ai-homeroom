from __future__ import annotations

import argparse
from dataclasses import asdict
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

import yaml

from ai_homeroom.ingestion import (
    Deduper,
    fetch_bluesky_author_feed,
    fetch_hacker_news_top_stories,
    fetch_rss_feed,
)


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


def run_dry_run(config_path: Path) -> dict:
    config = load_config(config_path)
    now = datetime.now(timezone.utc)
    lookback_hours = int(config.get("lookback_hours", 24))
    errors: list[str] = []
    articles = []

    for feed in config.get("rss_feeds", []):
        try:
            articles.extend(
                fetch_rss_feed(
                    feed["name"],
                    feed["url"],
                    now=now,
                    lookback_hours=lookback_hours,
                )
            )
        except Exception as exc:  # noqa: BLE001 - dry-run should continue and report all feed failures.
            errors.append(f"{feed.get('name', 'RSS')}: {type(exc).__name__}: {exc}")

    hn_config = config.get("hacker_news", {})
    if hn_config.get("enabled", True):
        try:
            articles.extend(
                fetch_hacker_news_top_stories(
                    limit=int(hn_config.get("top_story_limit", 100)),
                    now=now,
                    lookback_hours=lookback_hours,
                )
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(f"Hacker News: {type(exc).__name__}: {exc}")

    bluesky_config = config.get("bluesky", {})
    if bluesky_config.get("enabled", False):
        for handle in bluesky_config.get("accounts", []):
            try:
                articles.extend(
                    fetch_bluesky_author_feed(
                        handle,
                        limit=int(bluesky_config.get("per_account_limit", 30)),
                        now=now,
                        lookback_hours=lookback_hours,
                    )
                )
            except Exception as exc:  # noqa: BLE001
                errors.append(f"Bluesky {handle}: {type(exc).__name__}: {exc}")

    result = Deduper(title_threshold=float(config.get("fuzzy_title_threshold", 0.85))).dedupe(articles)
    source_counts: dict[str, int] = {}
    for article in articles:
        source_counts[article.source] = source_counts.get(article.source, 0) + 1

    ranked_groups = sorted(
        result.groups,
        key=lambda group: (len(group.members), group.primary.published_at),
        reverse=True,
    )

    return {
        "dry_run_at": now.isoformat(),
        "config_path": str(config_path),
        "lookback_hours": lookback_hours,
        "fetched_count": result.fetched_count,
        "unique_story_groups": len(result.groups),
        "deduped_out_count": result.deduped_out_count,
        "source_counts": source_counts,
        "errors": errors,
        "top_candidates": [
            {
                "title": group.primary.title,
                "source": group.primary.source,
                "published": group.primary.published_at.isoformat(),
                "same_story_sources": len(group.members),
                "url": group.primary.url,
                "dedup_status": "new_in_empty_table_dry_run",
            }
            for group in ranked_groups[:12]
        ],
        "sample_decisions": [asdict(decision) for decision in result.decisions[:40]],
        "notes": [
            "No Supabase reads/writes performed.",
            "Production persistence waits for explicit schema approval.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Phase 1 AI Homeroom ingestion without writing to Supabase.")
    parser.add_argument("--config", default="config/feeds.yaml", type=Path)
    parser.add_argument("--output", type=Path, help="Optional JSON output file")
    args = parser.parse_args()

    payload = run_dry_run(args.config)
    rendered = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    print(rendered)


if __name__ == "__main__":
    main()
