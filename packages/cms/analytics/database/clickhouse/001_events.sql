CREATE TABLE IF NOT EXISTS events (
    project_id      String,
    event_id        UUID,
    occurred_at     DateTime64(3, 'UTC'),
    received_at     DateTime64(3, 'UTC') DEFAULT now64(3),
    name            LowCardinality(String),
    source          LowCardinality(String),
    subject_key     String,
    session_id      String DEFAULT '',
    path            String DEFAULT '',
    referrer        String DEFAULT '',
    utm_source      LowCardinality(String) DEFAULT '',
    utm_medium      LowCardinality(String) DEFAULT '',
    utm_campaign    LowCardinality(String) DEFAULT '',
    device          LowCardinality(String) DEFAULT '',
    os              LowCardinality(String) DEFAULT '',
    browser         LowCardinality(String) DEFAULT '',
    ip_hash         FixedString(64) DEFAULT '',
    value_minor     Int64 DEFAULT 0,
    currency        LowCardinality(String) DEFAULT '',
    props           String DEFAULT '{}'
)
ENGINE = ReplacingMergeTree(received_at)
PARTITION BY toYYYYMM(occurred_at)
ORDER BY (project_id, subject_key, occurred_at, event_id)
TTL toDateTime(occurred_at) + INTERVAL 12 MONTH DELETE
