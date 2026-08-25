<?php

declare(strict_types=1);

use Cms\Shared\Tenant\MissingProjectContext;
use Cms\Shared\Tenant\ProjectContext;

test('context stores and clears the project id', function () {
    $context = new ProjectContext;
    expect($context->resolved())->toBeFalse();

    $context->set('proj-1');
    expect($context->id())->toBe('proj-1')->and($context->required())->toBe('proj-1');

    $context->clear();
    expect($context->resolved())->toBeFalse();
});

test('required context throws when unresolved', function () {
    (new ProjectContext)->required();
})->throws(MissingProjectContext::class);

// Octane-шаблон: scoped-биндинг обязан давать чистый контекст на каждый "запрос".
test('scoped binding does not leak between simulated requests', function () {
    app()->scoped(ProjectContext::class);

    app(ProjectContext::class)->set('project-a');
    expect(app(ProjectContext::class)->id())->toBe('project-a');

    // Octane между запросами сбрасывает scoped-инстансы:
    app()->forgetScopedInstances();

    expect(app(ProjectContext::class)->id())->toBeNull();
});
