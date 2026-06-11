"""AI Homeroom ingestion and deduplication utilities."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import hashlib
import html
import re
import uuid
import xml.etree.ElementTree as ET
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import requests
from rapidfuzz import fuzz

TRACKING_PREFIXES = ("utm_",)
TRACKING_KEYS = {"fbclid", "gclid", "mc_cid", "mc_eid", "igshid", "guccounter"}
DEFAULT_AI_TITLE_PATTERN = (
    r"\b(ai|a\.i\.|artificial intelligence|llm|large language model|model|openai|"
    r"anthropic|claude|chatgpt|gemini|gpt|deepmind|mistral|llama|copilot|agents?)\b"
)


def clean_text(value: str | None) -> str:
    """Strip HTML and collapse whitespace."""
    if not value:
        return ""
    text = re.sub(r"<[^>]+>", " ", value)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def canonical_url(url: str) -> str:
    """Normalize a URL for deduplication without changing meaningful query params."""
    parsed = urlsplit(url.strip())
    kept_query = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=True):
        lower_key = key.lower()
        if lower_key.startswith(TRACKING_PREFIXES) or lower_key in TRACKING_KEYS:
            continue
        kept_query.append((key, value))
    path = parsed.path.rstrip("/") or "/"
    if path == "/" and not parsed.path.endswith("/"):
        path = "/"
    return urlunsplit(
        (
            parsed.scheme.lower() or "https",
            parsed.netloc.lower(),
            path,
            urlencode(kept_query),
            "",
        )
    )


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", "ignore")).hexdigest()


@dataclass(slots=True)
class Article:
    title: str
    source: str
    url: str
    published_at: datetime
    excerpt: str = ""
    body_text: str = ""
    url_hash: str = ""
    content_hash: str = ""
    metadata: dict = field(default_factory=dict)

    @classmethod
    def from_raw(
        cls,
        *,
        title: str,
        source: str,
        url: str,
        published_at: datetime,
        excerpt: str = "",
        body_text: str = "",
        metadata: dict | None = None,
    ) -> "Article":
        normalized_url = canonical_url(url)
        normalized_title = clean_text(title)
        normalized_excerpt = clean_text(excerpt)
        normalized_body = clean_text(body_text) or normalized_excerpt
        return cls(
            title=normalized_title,
            source=source,
            url=normalized_url,
            published_at=published_at.astimezone(timezone.utc),
            excerpt=normalized_excerpt,
            body_text=normalized_body,
            url_hash=sha256_text(normalized_url),
            content_hash=sha256_text(f"{normalized_title}\n{normalized_body}"),
            metadata=metadata or {},
        )


@dataclass(slots=True)
class StoryGroup:
    id: str
    primary: Article
    members: list[Article] = field(default_factory=list)


@dataclass(slots=True)
class DedupDecision:
    decision: str
    title: str
    source: str
    duplicate_of: str | None = None
    score: float | None = None
    group_primary: str | None = None


@dataclass(slots=True)
class DedupResult:
    fetched_count: int
    groups: list[StoryGroup]
    decisions: list[DedupDecision]

    @property
    def deduped_out_count(self) -> int:
        return self.fetched_count - len(self.groups)


class AITitleFilter:
    def __init__(self, pattern: str = DEFAULT_AI_TITLE_PATTERN):
        self.pattern = re.compile(pattern, re.IGNORECASE)

    def matches(self, title: str) -> bool:
        return bool(self.pattern.search(title or ""))


class Deduper:
    """In-memory Phase 1 deduper; Supabase persistence is added after approval."""

    def __init__(self, title_threshold: float = 0.85):
        self.title_threshold = title_threshold

    def dedupe(self, articles: list[Article]) -> DedupResult:
        url_seen: dict[str, Article] = {}
        groups: list[StoryGroup] = []
        decisions: list[DedupDecision] = []

        for article in sorted(articles, key=lambda item: item.published_at, reverse=True):
            if article.url_hash in url_seen:
                decisions.append(
                    DedupDecision(
                        decision="skip_url_duplicate",
                        title=article.title,
                        source=article.source,
                        duplicate_of=url_seen[article.url_hash].title,
                    )
                )
                continue

            best_group: StoryGroup | None = None
            best_score = 0.0
            for group in groups:
                score = fuzz.token_sort_ratio(article.title, group.primary.title) / 100.0
                if score > best_score:
                    best_score = score
                    best_group = group

            if best_group and best_score > self.title_threshold:
                best_group.members.append(article)
                if _detail_score(article) > _detail_score(best_group.primary):
                    best_group.primary = article
                decisions.append(
                    DedupDecision(
                        decision="group_fuzzy_duplicate",
                        title=article.title,
                        source=article.source,
                        score=round(best_score, 3),
                        group_primary=best_group.primary.title,
                    )
                )
                continue

            group = StoryGroup(id=str(uuid.uuid4()), primary=article, members=[article])
            groups.append(group)
            url_seen[article.url_hash] = article
            decisions.append(
                DedupDecision(decision="candidate_new", title=article.title, source=article.source)
            )

        return DedupResult(fetched_count=len(articles), groups=groups, decisions=decisions)


def _detail_score(article: Article) -> int:
    return len(article.body_text or article.excerpt or "")


def parse_datetime(value: str | None, *, fallback: datetime | None = None) -> datetime:
    if not value:
        return fallback or datetime.now(timezone.utc)
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except Exception:
        pass
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except Exception:
        return fallback or datetime.now(timezone.utc)


def _first_text(entry: ET.Element, names: list[str]) -> str:
    for name in names:
        value = entry.findtext(name)
        if value:
            return value
    return ""


def _entry_link(entry: ET.Element) -> str:
    link = entry.findtext("link")
    if link:
        return link
    atom_link = entry.find("{http://www.w3.org/2005/Atom}link")
    if atom_link is not None:
        return atom_link.attrib.get("href", "")
    return ""


def parse_rss_entries(
    source: str,
    content: bytes,
    *,
    now: datetime | None = None,
    lookback: timedelta = timedelta(hours=24),
) -> list[Article]:
    now = now or datetime.now(timezone.utc)
    cutoff = now - lookback
    root = ET.fromstring(content)
    entries = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
    articles: list[Article] = []

    for entry in entries:
        title = clean_text(_first_text(entry, ["title", "{http://www.w3.org/2005/Atom}title"]))
        link = _entry_link(entry)
        excerpt = clean_text(
            _first_text(
                entry,
                [
                    "description",
                    "summary",
                    "{http://www.w3.org/2005/Atom}summary",
                    "{http://purl.org/rss/1.0/modules/content/}encoded",
                ],
            )
        )
        published_at = parse_datetime(
            _first_text(
                entry,
                [
                    "pubDate",
                    "published",
                    "updated",
                    "{http://purl.org/dc/elements/1.1/}date",
                    "{http://www.w3.org/2005/Atom}published",
                    "{http://www.w3.org/2005/Atom}updated",
                ],
            ),
            fallback=now,
        )
        if title and link and published_at >= cutoff:
            articles.append(
                Article.from_raw(
                    title=title,
                    source=source,
                    url=link,
                    published_at=published_at,
                    excerpt=excerpt,
                )
            )
    return articles


def fetch_rss_feed(source: str, url: str, *, now: datetime | None = None, lookback_hours: int = 24) -> list[Article]:
    response = requests.get(url, timeout=20, headers={"User-Agent": "AIHomeroom/0.1"})
    response.raise_for_status()
    return parse_rss_entries(source, response.content, now=now, lookback=timedelta(hours=lookback_hours))


def fetch_hacker_news_top_stories(*, limit: int = 100, now: datetime | None = None, lookback_hours: int = 24) -> list[Article]:
    now = now or datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=lookback_hours)
    filt = AITitleFilter()
    ids = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json", timeout=15).json()[:limit]
    articles: list[Article] = []
    for item_id in ids:
        item = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{item_id}.json", timeout=10).json() or {}
        title = item.get("title", "")
        if not filt.matches(title):
            continue
        published_at = datetime.fromtimestamp(item.get("time", 0), timezone.utc)
        if published_at < cutoff:
            continue
        url = item.get("url") or f"https://news.ycombinator.com/item?id={item_id}"
        excerpt = clean_text(item.get("text", "")) or f"HN score {item.get('score', 0)}, comments {item.get('descendants', 0)}"
        articles.append(
            Article.from_raw(
                title=title,
                source="Hacker News",
                url=url,
                published_at=published_at,
                excerpt=excerpt,
                metadata={"hn_id": item_id},
            )
        )
    return articles


def fetch_bluesky_author_feed(handle: str, *, limit: int = 30, now: datetime | None = None, lookback_hours: int = 24) -> list[Article]:
    """Fetch posts from a public Bluesky author feed and keep AI-related posts."""
    now = now or datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=lookback_hours)
    filt = AITitleFilter()
    response = requests.get(
        "https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed",
        params={"actor": handle, "limit": limit},
        timeout=20,
        headers={"User-Agent": "AIHomeroom/0.1"},
    )
    response.raise_for_status()
    articles: list[Article] = []
    for item in response.json().get("feed", []):
        post = item.get("post", {})
        record = post.get("record", {})
        text = clean_text(record.get("text", ""))
        if not text or not filt.matches(text):
            continue
        published_at = parse_datetime(record.get("createdAt"), fallback=now)
        if published_at < cutoff:
            continue
        handle_value = post.get("author", {}).get("handle", handle)
        uri = post.get("uri", "")
        post_id = uri.rsplit("/", 1)[-1] if uri else ""
        url = f"https://bsky.app/profile/{handle_value}/post/{post_id}" if post_id else f"https://bsky.app/profile/{handle_value}"
        articles.append(
            Article.from_raw(
                title=text[:100],
                source=f"Bluesky: {handle_value}",
                url=url,
                published_at=published_at,
                excerpt=text,
                metadata={"platform": "bluesky", "uri": uri},
            )
        )
    return articles
