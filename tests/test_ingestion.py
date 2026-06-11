from datetime import datetime, timedelta, timezone

import pytest

from ai_homeroom.ingestion import (
    AITitleFilter,
    Article,
    Deduper,
    canonical_url,
    parse_rss_entries,
    sha256_text,
)


def test_canonical_url_strips_tracking_and_normalizes_host():
    url = "HTTPS://Example.COM/path/?utm_source=newsletter&b=2&fbclid=abc&a=1#section"

    assert canonical_url(url) == "https://example.com/path?b=2&a=1"


def test_sha256_text_is_stable():
    assert sha256_text("hello") == sha256_text("hello")
    assert sha256_text("hello") != sha256_text("Hello")


def test_ai_title_filter_keeps_ai_titles_and_rejects_unrelated_titles():
    filt = AITitleFilter()

    assert filt.matches("OpenAI launches a new model for coding")
    assert filt.matches("Why LLM agents are hard to secure")
    assert not filt.matches("SQLite announces filesystem improvements")


def test_parse_rss_entries_returns_recent_normalized_articles():
    now = datetime(2026, 6, 11, 12, 0, tzinfo=timezone.utc)
    xml = """<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title>OpenAI ships a small model</title>
        <link>https://example.com/story?utm_source=x</link>
        <pubDate>Thu, 11 Jun 2026 11:00:00 GMT</pubDate>
        <description><![CDATA[<p>A useful excerpt.</p>]]></description>
      </item>
      <item>
        <title>Old AI story</title>
        <link>https://example.com/old</link>
        <pubDate>Mon, 01 Jun 2026 11:00:00 GMT</pubDate>
        <description>Too old</description>
      </item>
    </channel></rss>
    """

    articles = parse_rss_entries("Example Feed", xml.encode(), now=now, lookback=timedelta(hours=24))

    assert len(articles) == 1
    assert articles[0].title == "OpenAI ships a small model"
    assert articles[0].source == "Example Feed"
    assert articles[0].url == "https://example.com/story"
    assert articles[0].excerpt == "A useful excerpt."
    assert articles[0].url_hash == sha256_text("https://example.com/story")


def test_deduper_skips_url_duplicates_and_groups_fuzzy_titles():
    now = datetime(2026, 6, 11, 12, 0, tzinfo=timezone.utc)
    articles = [
        Article.from_raw(
            title="Anthropic apologizes for hidden Claude guardrails",
            source="The Verge",
            url="https://example.com/a?utm_source=x",
            published_at=now,
            excerpt="Short.",
        ),
        Article.from_raw(
            title="Anthropic apologizes for hidden Claude guardrails",
            source="TechCrunch",
            url="https://example.com/a",
            published_at=now,
            excerpt="Duplicate URL.",
        ),
        Article.from_raw(
            title="Anthropic apologizes for invisible Claude guardrails",
            source="Wired",
            url="https://wired.example/story",
            published_at=now,
            excerpt="This is a much longer and more detailed source excerpt for primary selection.",
        ),
    ]

    result = Deduper(title_threshold=0.85).dedupe(articles)

    assert result.fetched_count == 3
    assert result.deduped_out_count == 2
    assert len(result.groups) == 1
    assert result.groups[0].primary.source == "Wired"
    assert [d.decision for d in result.decisions] == [
        "candidate_new",
        "skip_url_duplicate",
        "group_fuzzy_duplicate",
    ]
