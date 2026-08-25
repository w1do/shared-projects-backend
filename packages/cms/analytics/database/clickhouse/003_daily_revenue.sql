CREATE MATERIALIZED VIEW IF NOT EXISTS daily_revenue
ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(date)
ORDER BY (project_id, date, currency)
AS SELECT
    project_id,
    toDate(occurred_at) AS date,
    currency,
    sumState(value_minor) AS revenue_minor,
    countState() AS payments
FROM events
WHERE value_minor != 0
GROUP BY project_id, date, currency
