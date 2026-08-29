<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Post\PostDTO;
use Cms\Content\Domain\Models\Post;
use Illuminate\Pagination\CursorPaginator;

final class ListPostsQuery
{
    public function __construct(private readonly CategoryDescendantIdsQuery $descendants) {}

    /**
     * Admin-список: фильтры по статусу/локали/категории (с потомками).
     *
     * @return CursorPaginator<int, PostDTO>
     */
    public function handle(?string $status = null, ?string $locale = null, ?int $categoryId = null, bool $publishedOnly = false, int $perPage = 25, ?string $tag = null): CursorPaginator
    {
        $query = Post::query()->with(['categories:id', 'tags', 'seo', 'cover', 'banner'])->orderByDesc('id');

        if ($publishedOnly) {
            $query->published();
        } elseif ($status !== null) {
            $query->where('status', $status);
        }

        if ($locale !== null) {
            $query->where('locale', $locale);
        }

        if ($categoryId !== null) {
            $ids = $this->descendants->handle($categoryId);
            // Несуществующая категория фильтр не применяет — прежнее поведение
            if ($ids !== null) {
                $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $ids));
            }
        }

        if ($tag !== null && $tag !== '') {
            $query->withAnyTags([$tag]);
        }

        /** @var CursorPaginator<int, Post> $page */
        $page = $query->cursorPaginate($perPage);

        return $page->through(PostDTO::fromModel(...));
    }
}
