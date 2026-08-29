<?php

declare(strict_types=1);

use Cms\Content\Application\Commands\DeleteCategoriesCommand;
use Cms\Content\Application\Handlers\DeleteCategoriesHandler;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Event;

test('bulk delete removes selected nodes with their subtrees and keeps posts', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $a = Category::create(['name' => 'A', 'slug' => 'a']);
    $child = Category::create(['name' => 'A-child', 'slug' => 'a-child']);
    $child->appendToNode($a)->save();
    $b = Category::create(['name' => 'B', 'slug' => 'b']);
    $keep = Category::create(['name' => 'Keep', 'slug' => 'keep']);

    $post = Post::factory()->create();
    $post->categories()->sync([$child->id, $keep->id]);

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
        'ids' => [$a->id, $b->id],
    ], $headers)->assertNoContent();

    expect(Category::query()->pluck('slug')->all())->toBe(['keep'])
        ->and(Post::query()->count())->toBe(1)
        ->and($post->fresh()->categories()->pluck('categories.id')->all())->toBe([$keep->id]);
});

test('bulk delete skips foreign and missing ids', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $mine = Category::create(['name' => 'Mine', 'slug' => 'mine']);

    app()->forgetScopedInstances();
    app(ProjectContext::class)->set('proj-2');
    $foreign = Category::create(['name' => 'Foreign', 'slug' => 'foreign']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
        'ids' => [$mine->id, $foreign->id, 9999],
    ], $headers)->assertNoContent();

    expect(Category::acrossProjects()->pluck('slug')->all())->toBe(['foreign']);
});

test('bulk delete of a parent together with its own descendant succeeds', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $parent = Category::create(['name' => 'Parent', 'slug' => 'parent']);
    $child = Category::create(['name' => 'Child', 'slug' => 'child']);
    $child->appendToNode($parent)->save();

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
        'ids' => [$parent->id, $child->id],
    ], $headers)->assertNoContent();

    expect(Category::query()->count())->toBe(0);
});

test('bulk delete rejects an empty id list', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    Category::create(['name' => 'A', 'slug' => 'a']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
        'ids' => [],
    ], $headers)->assertStatus(422);

    expect(Category::query()->count())->toBe(1);
});

test('bulk delete is closed by the categories manage permission', function () {
    $headers = actingAsContentOperator(permissions: ['content.categories.view']);
    app(ProjectContext::class)->set('proj-1');

    $category = Category::create(['name' => 'A', 'slug' => 'a']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories/bulk-delete', [
        'ids' => [$category->id],
    ], $headers)->assertStatus(403);

    expect(Category::query()->count())->toBe(1);
});

test('bulk delete is not applied partially when it fails midway', function () {
    app(ProjectContext::class)->set('proj-1');

    $first = Category::create(['name' => 'First', 'slug' => 'first']);
    $boom = Category::create(['name' => 'Boom', 'slug' => 'boom']);

    Event::listen('eloquent.deleting: '.Category::class, function (Category $category): void {
        if ($category->slug === 'boom') {
            throw new RuntimeException('boom');
        }
    });

    expect(fn () => app(DeleteCategoriesHandler::class)->handle(
        new DeleteCategoriesCommand([$first->id, $boom->id]),
    ))->toThrow(RuntimeException::class);

    expect(Category::query()->pluck('slug')->sort()->values()->all())->toBe(['boom', 'first']);
});

test('purge empties the catalog and keeps posts without category bindings', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $root = Category::create(['name' => 'Root', 'slug' => 'root']);
    $child = Category::create(['name' => 'Child', 'slug' => 'child']);
    $child->appendToNode($root)->save();

    $post = Post::factory()->create();
    $post->categories()->sync([$root->id, $child->id]);

    $this->deleteJson('/api/admin/v1/projects/proj-1/content/categories', [], $headers)->assertNoContent();

    expect(Category::query()->count())->toBe(0)
        ->and(Post::query()->count())->toBe(1)
        ->and($post->fresh()->categories()->count())->toBe(0);
});

test('purge touches only the current project', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');
    Category::create(['name' => 'Mine', 'slug' => 'mine']);

    app()->forgetScopedInstances();
    app(ProjectContext::class)->set('proj-2');
    Category::create(['name' => 'Foreign', 'slug' => 'foreign']);

    $this->deleteJson('/api/admin/v1/projects/proj-1/content/categories', [], $headers)->assertNoContent();

    expect(Category::acrossProjects()->pluck('slug')->all())->toBe(['foreign']);
});

test('purge is closed by the categories manage permission', function () {
    $headers = actingAsContentOperator(permissions: ['content.categories.view']);
    app(ProjectContext::class)->set('proj-1');

    Category::create(['name' => 'A', 'slug' => 'a']);

    $this->deleteJson('/api/admin/v1/projects/proj-1/content/categories', [], $headers)->assertStatus(403);

    expect(Category::query()->count())->toBe(1);
});
