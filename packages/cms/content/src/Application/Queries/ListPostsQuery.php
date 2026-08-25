<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListPosts
{
    /** Admin-список: фильтры по статусу/локали/категории (с потомками). */
    public function handle(?string $status = null, ?string $locale = null, ?int $categoryId = null, bool $publishedOnly = false, int $perPage = 25): CursorPaginator
    {
        $query = Post::query()->with(['categories:id', 'seo'])->orderByDesc('id');

        if ($publishedOnly) {
            $query->published();
        } elseif ($status !== null) {
            $query->where('status', $status);
        }

        if ($locale !== null) {
            $query->where('locale', $locale);
        }

        if ($categoryId !== null) {
            $category = Category::query()->find($categoryId);
            if ($category !== null) {
                // Категория с потомками
                $ids = $category->descendants()->get()->pluck('id')->push($category->id);
                $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $ids));
            }
        }

        return $query->cursorPaginate($perPage);
    }
}
