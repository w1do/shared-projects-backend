<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Persistence\ClickHouse;

/** Нумерованные .sql из database/clickhouse; журнал — таблица schema_migrations в ClickHouse. */
final class Migrator
{
    public function __construct(private readonly Connection $connection) {}

    /** @return list<string> применённые файлы */
    public function migrate(string $path): array
    {
        $this->connection->statement(
            'CREATE TABLE IF NOT EXISTS schema_migrations (name String, applied_at DateTime DEFAULT now()) ENGINE = MergeTree ORDER BY name'
        );

        $applied = array_column($this->connection->select('SELECT name FROM schema_migrations'), 'name');
        $ran = [];

        $files = glob(rtrim($path, '/').'/*.sql') ?: [];
        sort($files);

        foreach ($files as $file) {
            $name = basename($file);
            if (in_array($name, $applied, true)) {
                continue;
            }

            foreach (array_filter(array_map('trim', explode(';;', (string) file_get_contents($file)))) as $sql) {
                $this->connection->statement($sql);
            }

            $this->connection->insertBatch('schema_migrations', [['name' => $name]]);
            $ran[] = $name;
        }

        return $ran;
    }
}
