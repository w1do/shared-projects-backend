<?php

declare(strict_types=1);

/**
 * Архитектурный гейт канона (Decision 14, задача 8.2): «единый вид» шести
 * модуль-пакетов проверяется механически, а не на глаз. Красный тест здесь —
 * отклонение от канона CLAUDE.md, внесённое новой правкой.
 *
 * Библиотеки (shared, contracts, generators) не проверяются: four-layer
 * к ним не применяется (Decision 11 / задача 1.7).
 */
function cmsPackagesRoot(): string
{
    return dirname(__DIR__, 2);
}

/** @return list<string> */
function modulePackages(): array
{
    return ['auth', 'content', 'pay', 'analytics', 'localization', 'ai', 'licensing'];
}

/** @return list<string> php-файлы каталога рекурсивно */
function phpFilesIn(string $dir): array
{
    if (! is_dir($dir)) {
        return [];
    }

    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if ($file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }

    return $files;
}

/** @return list<array{string, string}> пары [файл, совпавшая строка] */
function grepFiles(array $files, string $pattern, ?callable $skip = null): array
{
    $hits = [];
    foreach ($files as $path) {
        if ($skip !== null && $skip($path)) {
            continue;
        }
        foreach (explode("\n", (string) file_get_contents($path)) as $line) {
            $trimmed = ltrim($line);
            // Комментарии не считаются нарушением: канон описывают, а не нарушают.
            if (str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, '/*')) {
                continue;
            }
            if (preg_match($pattern, $line) === 1) {
                $hits[] = [$path, trim($line)];
            }
        }
    }

    return $hits;
}

test('arch: validation lives in FormRequests, not in DTOs, controllers or handlers', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src/Application/DTOs"), '/public\s+static\s+function\s+rules\s*\(/') as $hit) {
            $violations[] = "rules() в DTO: {$hit[0]}";
        }
        foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src"), '/\$request->validate\(|Validator::make\(/') as $hit) {
            $violations[] = "валидация вне FormRequest: {$hit[0]} — {$hit[1]}";
        }
    }

    expect($violations)->toBe([]);
});

test('arch: no service locator in Domain, Application or Presentation layers', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        foreach (['Domain', 'Application', 'Presentation'] as $layer) {
            foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src/{$layer}"), '/\b(?:app|resolve)\(/') as $hit) {
                $violations[] = "{$hit[0]} — {$hit[1]}";
            }
        }
    }

    expect($violations)->toBe([]);
});

test('arch: every query class carries the *Query suffix', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        foreach (phpFilesIn("{$root}/{$pkg}/src/Application/Queries") as $path) {
            if (! str_ends_with($path, 'Query.php')) {
                $violations[] = $path;
            }
        }
    }

    expect($violations)->toBe([]);
});

test('arch: module service providers live in Infrastructure/Providers', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        foreach (glob("{$root}/{$pkg}/src/*ServiceProvider.php") ?: [] as $path) {
            $violations[] = "провайдер в корне src/: {$path}";
        }
        $canonical = glob("{$root}/{$pkg}/src/Infrastructure/Providers/*ServiceProvider.php") ?: [];
        if ($canonical === []) {
            $violations[] = "нет провайдера в Infrastructure/Providers/: {$pkg}";
        }
    }

    expect($violations)->toBe([]);
});

test('arch: packages with HTTP surface have Requests and Resources directories', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        $http = "{$root}/{$pkg}/src/Presentation/Http";
        if (! is_dir($http)) {
            continue; // у пакета нет HTTP-поверхности (ai) — канон это допускает
        }
        foreach (['Requests', 'Resources'] as $dir) {
            if (! is_dir("{$http}/Api/V1/{$dir}")) {
                $violations[] = "{$pkg}: нет Presentation/Http/Api/V1/{$dir}";
            }
        }
    }

    expect($violations)->toBe([]);
});

test('arch: layers respect dependency direction and package boundaries', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        $studly = str_replace(' ', '', ucwords(str_replace('-', ' ', $pkg)));

        // Domain не импортирует Application своего пакета.
        foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src/Domain"), "/use\\s+Cms\\\\{$studly}\\\\Application\\\\/") as $hit) {
            $violations[] = "Domain → Application: {$hit[0]}";
        }
        // Application не импортирует HTTP-классы фреймворка.
        foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src/Application"), '/use\s+Illuminate\\\\Http\\\\Request;|use\s+Illuminate\\\\Foundation\\\\Http\\\\FormRequest;/') as $hit) {
            $violations[] = "Application → HTTP: {$hit[0]}";
        }
        // Модели чужих модуль-пакетов не импортируются (границы пакетов).
        foreach (modulePackages() as $other) {
            if ($other === $pkg) {
                continue;
            }
            $otherStudly = str_replace(' ', '', ucwords(str_replace('-', ' ', $other)));
            foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src"), "/use\\s+Cms\\\\{$otherStudly}\\\\Domain\\\\Models\\\\/") as $hit) {
                // Разрешённое направление: content реализует порты localization (Decision 10).
                if ($pkg === 'content' && $other === 'localization') {
                    continue;
                }
                $violations[] = "граница пакетов {$pkg} → {$other}: {$hit[0]}";
            }
        }
        // Пакеты не видят Cms\Auth\* (И15) — общие middleware живут в shared.
        if ($pkg !== 'auth') {
            foreach (grepFiles(phpFilesIn("{$root}/{$pkg}/src"), '/use\s+Cms\\\\Auth\\\\/') as $hit) {
                $violations[] = "И15 {$pkg} → Cms\\Auth: {$hit[0]}";
            }
        }
    }

    expect($violations)->toBe([]);
});

test('arch: no empty stub directories inside packages', function () {
    $root = cmsPackagesRoot();
    $violations = [];

    foreach (modulePackages() as $pkg) {
        $src = "{$root}/{$pkg}/src";
        if (! is_dir($src)) {
            continue;
        }
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST,
        );
        foreach ($iterator as $entry) {
            if ($entry->isDir() && iterator_count(new FilesystemIterator($entry->getPathname())) === 0) {
                $violations[] = $entry->getPathname();
            }
        }
    }

    expect($violations)->toBe([]);
});
