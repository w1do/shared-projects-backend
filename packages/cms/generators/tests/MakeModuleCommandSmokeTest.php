<?php

declare(strict_types=1);

use Cms\Generators\MakeModuleCommand;
use Illuminate\Console\Command;

/**
 * Smoke-тесты генератора модулей: класс подключается и стабы на месте.
 * Полноценные тесты структуры сгенерированного модуля — задача 8.4.
 */
test('make-module command class is autoloadable and registered as console command', function () {
    expect(class_exists(MakeModuleCommand::class))->toBeTrue()
        ->and(is_subclass_of(MakeModuleCommand::class, Command::class))->toBeTrue();
});

test('every stub referenced by the generator exists on disk', function () {
    $stubsDir = dirname((new ReflectionClass(MakeModuleCommand::class))->getFileName(), 2).'/stubs';

    expect(is_dir($stubsDir))->toBeTrue();

    $source = (string) file_get_contents((new ReflectionClass(MakeModuleCommand::class))->getFileName());
    preg_match_all("/\\\$replace\\('([\\w.\\-]+)'\\)/", $source, $matches);

    expect($matches[1])->not->toBeEmpty();

    foreach (array_unique($matches[1]) as $stub) {
        expect(is_file("{$stubsDir}/{$stub}.stub"))->toBeTrue("Стаб отсутствует: {$stub}.stub");
    }
});
