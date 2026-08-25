CREATE MATERIALIZED VIEW IF NOT EXISTS top_pages
ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(date)
ORDER BY (project_id, date, path)
AS SELECT
    project_id,
    toDate(occurred_at) AS date,
    path,
    countState() AS hits,
    uniqState(session_id) AS sessions
FROM events
WHERE path != ''
GROUP BY project_id, date, path
