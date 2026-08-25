<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Category;
use Cms\Shared\Tenant\ProjectContext;

test('category crud builds a tree per project', function () {
    $headers = actingAsContentOperator();

    $root = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Авто'], $headers)
        ->assertCreated()->json('data');

    $child = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Седаны', 'parent_id' => $root['id'],
    ], $headers)->assertCreated()->json('data');

    $tree = $this->getJson('/api/admin/v1/projects/proj-1/content/categories', $headers)->assertOk()->json('data');

    expect($tree)->toHaveCount(1)
        ->and($tree[0]['children'][0]['id'])->toBe($child['id']);
});

test('moving a node keeps its whole subtree intact', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $a = Category::create(['name' => 'A', 'slug' => 'a']);
    $b = Category::create(['name' => 'B', 'slug' => 'b']);
    $child = Category::create(['name' => 'A-child', 'slug' => 'a-child']);
    $child->appendToNode($a)->save();
    $grand = Category::create(['name' => 'A-grand', 'slug' => 'a-grand']);
    $grand->appendToNode($child)->save();

    // Перемещаем child (с поддеревом) под B
    $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$child->id}/move", [
        'parent_id' => $b->id,
    ], $headers)->assertOk();

    $child->refresh();
    $grand->refresh();
    $b->refresh();

    expect($child->parent_id)->toBe($b->id)
        ->and($grand->isDescendantOf($child))->toBeTrue()
        ->and($grand->isDescendantOf($b))->toBeTrue();
});

test('cannot move a node under its own descendant', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $a = Category::create(['name' => 'A', 'slug' => 'a']);
    $child = Category::create(['name' => 'C', 'slug' => 'c']);
    $child->appendToNode($a)->save();

    $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$a->id}/move", [
        'parent_id' => $child->id,
    ], $headers)->assertStatus(422);
});

test('trees of different projects are independent', function () {
    app(ProjectContext::class)->set('proj-1');
    Category::create(['name' => 'P1', 'slug' => 'p1']);

    app()->forgetScopedInstances();
    app(ProjectContext::class)->set('proj-2');
    Category::create(['name' => 'P2', 'slug' => 'p2']);

    expect(Category::query()->count())->toBe(1)
        ->and(Category::query()->first()->name)->toBe('P2');
});

test('disabled content service returns 404', function () {
    $headers = actingAsContentOperator(services: []); // сервис выключен для проекта

    $this->getJson('/api/admin/v1/projects/proj-1/content/categories', $headers)->assertNotFound();
});

test('operator without permission gets 403', function () {
    $headers = actingAsContentOperator(permissions: ['content.posts.view']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'X'], $headers)
        ->assertStatus(403);
});

test('move position places node among siblings', function () {
    $headers = actingAsContentOperator();
    app(ProjectContext::class)->set('proj-1');

    $root = Category::create(['name' => 'Root', 'slug' => 'pos-root']);
    $names = ['S1', 'S2', 'S3'];
    foreach ($names as $name) {
        $node = Category::create(['name' => $name, 'slug' => strtolower($name).'-pos']);
        $node->appendToNode($root)->save();
    }
    $moved = Category::create(['name' => 'Moved', 'slug' => 'moved-pos']);

    $order = fn () => Category::query()->whereDescendantOf($root->fresh())->defaultOrder()->pluck('name')->all();

    // В позицию 0 — первым
    $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$moved->id}/move", [
        'parent_id' => $root->id, 'position' => 0,
    ], $headers)->assertOk();
    expect($order())->toBe(['Moved', 'S1', 'S2', 'S3']);

    // В середину — перед соседом с индексом 2 (список без самого узла)
    $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$moved->id}/move", [
        'position' => 2,
    ], $headers)->assertOk();
    expect($order())->toBe(['S1', 'S2', 'Moved', 'S3']);

    // За пределы списка — последним
    $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$moved->id}/move", [
        'position' => 99,
    ], $headers)->assertOk();
    expect($order())->toBe(['S1', 'S2', 'S3', 'Moved']);

    // Без position — прежнее поведение: смена родителя ставит в конец
    $other = Category::create(['name' => 'Other', 'slug' => 'other-pos']);
    $this->postJson("/api/admin/v1/projects/proj-1/content/categories/{$other->id}/move", [
        'parent_id' => $root->id,
    ], $headers)->assertOk();
    expect($order())->toBe(['S1', 'S2', 'S3', 'Moved', 'Other']);
});
