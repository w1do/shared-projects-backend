<?php

declare(strict_types=1);

use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Illuminate\Support\Facades\Cache;

/**
 * Инвалидация bootstrap-кэша: bump обязан менять ключ и на холодном кэше.
 *
 * Регресс: downstream cache-bust сбрасывает Redis целиком, ключ версии
 * пропадает, а key() подставляет 1 по умолчанию. Голый increment создавал
 * версию равной этому же 1 — первый bump после сброса не менял ключ, и
 * оператор получал прежний состав сервисов из устаревшей записи.
 */
test('bump на холодном кэше меняет ключ bootstrap', function () {
    Cache::forget('bootstrap:version');
    $cold = BootstrapCache::key(1, 'demo');

    BootstrapCache::bump();

    expect(BootstrapCache::key(1, 'demo'))->not->toBe($cold);
});

test('каждый следующий bump продолжает менять ключ', function () {
    BootstrapCache::bump();
    $first = BootstrapCache::key(1, 'demo');

    BootstrapCache::bump();

    expect(BootstrapCache::key(1, 'demo'))->not->toBe($first);
});
