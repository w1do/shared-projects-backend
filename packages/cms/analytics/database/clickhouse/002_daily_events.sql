CREATE MATERIALIZED VIEW IF NOT EXISTS daily_events
ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(date)
ORDER BY (project_id, date, name)
AS SELECT
    project_id,
    toDate(occurred_at) AS date,
    name,
    countState() AS events,
    uniqState(session_id) AS sessions,
    uniqState(subject_key) AS subjects
FROM events
GROUP BY project_id, date, name
