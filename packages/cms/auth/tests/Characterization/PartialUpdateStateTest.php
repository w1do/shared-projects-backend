<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Illuminate\Support\Facades\DB;

/**
 * Характеризационный тест частичного обновления проекта (задача 0.4,
 * инвариант И1: «ключ отсутствует» ≠ «ключ = null»).
 *
 * Проверяет СОСТОЯНИЕ БД, а не тело ответа: потеря locales при PATCH только
 * с name в ответе выглядит как валидный список и снимком не ловится.
 */
beforeEach(function () {
    syncAuthManifest();
});

test('guard: 0.4 project partial update keeps locales', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, 'site-a');

    // фикстура с явным значением: два языка, не дефолтный ["ru"]
    $project->forceFill(['locales' => ['ru', 'en']])->save();

    expect(DB::table('projects')->where('id', $project->id)->value('locales'))
        ->toBe('["ru","en"]');

    // тело только с name: ключ locales отсутствует, а не равен null
    $this->patchJson("/api/admin/v1/projects/{$project->key}", [
        'name' => 'Renamed Site',
    ], adminHeaders($admin))->assertOk();

    $row = (array) DB::table('projects')->where('id', $project->id)->first();

    expect($row['name'])->toBe('Renamed Site')
        ->and($row['locales'])->toBe('["ru","en"]')  // список не обнулён и не схлопнут в дефолт
        ->and($row['key'])->toBe('site-a')
        ->and($row['archived_at'])->toBeNull();
});
