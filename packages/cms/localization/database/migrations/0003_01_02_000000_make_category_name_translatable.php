<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * name: string → jsonb {locale: value}. Существующие имена переносятся в
 * локаль по умолчанию платформы ('en'); откат возвращает строку из неё же
 * (или из первой имеющейся локали).
 */
return new class extends Migration
{
    private const DEFAULT_LOCALE = 'en';

    public function up(): void
    {
        // Строковые значения оборачиваются в JSON до смены типа столбца.
        foreach (DB::table('categories')->get(['id', 'name']) as $row) {
            $decoded = json_decode((string) $row->name, true);
            if (is_array($decoded)) {
                continue; // уже переводимая форма (повторный накат)
            }
            DB::table('categories')->where('id', $row->id)->update([
                'name' => json_encode([self::DEFAULT_LOCALE => (string) $row->name], JSON_UNESCAPED_UNICODE),
            ]);
        }

        // pgsql не приводит varchar→jsonb автоматически — нужен USING
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE categories ALTER COLUMN name TYPE jsonb USING name::jsonb');
        } else {
            Schema::table('categories', function ($table) {
                $table->jsonb('name')->change();
            });
        }

        if (! Schema::hasColumn('categories', 'name_machine')) {
            Schema::table('categories', function ($table) {
                // локаль → true: имя в этой локали создано автопереводом
                $table->jsonb('name_machine')->default('{}');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('categories', 'name_machine')) {
            Schema::table('categories', function ($table) {
                $table->dropColumn('name_machine');
            });
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE categories ALTER COLUMN name TYPE varchar(255) USING name::text');
        } else {
            Schema::table('categories', function ($table) {
                $table->string('name')->change();
            });
        }

        foreach (DB::table('categories')->get(['id', 'name']) as $row) {
            $decoded = json_decode((string) $row->name, true);
            if (! is_array($decoded)) {
                continue;
            }
            $value = $decoded[self::DEFAULT_LOCALE] ?? (reset($decoded) ?: '');
            DB::table('categories')->where('id', $row->id)->update(['name' => $value]);
        }
    }
};
