-- Keevan Blog — Turso (libsql) Schema
-- Compatible with Prisma sqlite provider
-- NOTE: All DateTime defaults use ISO 8601 format (strftime with Z suffix)
-- so Prisma can parse them correctly.

CREATE TABLE IF NOT EXISTS Post (
    id            TEXT PRIMARY KEY NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    excerpt       TEXT NOT NULL,
    content       TEXT NOT NULL,
    markdown      TEXT NOT NULL,
    coverImage    TEXT,
    coverAlt      TEXT,
    category      TEXT NOT NULL,
    tags          TEXT NOT NULL,
    keywords      TEXT NOT NULL,
    metaTitle     TEXT NOT NULL,
    metaDescription TEXT NOT NULL,
    focusKeyword  TEXT NOT NULL,
    wordCount     INTEGER NOT NULL DEFAULT 0,
    readingTime   INTEGER NOT NULL DEFAULT 1,
    status        TEXT NOT NULL DEFAULT 'published',
    scheduledFor  TEXT,
    publishedAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    createdAt     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updatedAt     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_post_status_publishedAt ON Post(status, publishedAt);
CREATE INDEX IF NOT EXISTS idx_post_category ON Post(category);
CREATE INDEX IF NOT EXISTS idx_post_slug ON Post(slug);

CREATE TABLE IF NOT EXISTS Keyword (
    id            TEXT PRIMARY KEY NOT NULL,
    keyword       TEXT NOT NULL UNIQUE,
    category      TEXT NOT NULL,
    searchVolume  INTEGER NOT NULL DEFAULT 0,
    difficulty    TEXT NOT NULL DEFAULT 'medium',
    usedCount     INTEGER NOT NULL DEFAULT 0,
    lastUsedAt    TEXT,
    createdAt     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_keyword_category ON Keyword(category);

CREATE TABLE IF NOT EXISTS ScheduleLog (
    id            TEXT PRIMARY KEY NOT NULL,
    action        TEXT NOT NULL,
    postSlug      TEXT,
    message       TEXT,
    createdAt     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS Setting (
    id            TEXT PRIMARY KEY NOT NULL,
    key           TEXT NOT NULL UNIQUE,
    value         TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_setting_key ON Setting(key);

CREATE TABLE IF NOT EXISTS Subscriber (
    id            TEXT PRIMARY KEY NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    source        TEXT NOT NULL DEFAULT 'footer',
    createdAt     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
