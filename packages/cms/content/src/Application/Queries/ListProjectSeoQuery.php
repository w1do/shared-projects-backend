<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Seo\SeoCatalogFilterDTO;
use Cms\Content\Domain\Enums\SeoableType;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\DB;

/**
 * Каталог SEO проекта: по строке на сущность контента, включая сущности без
 * сохранённого SEO-блока.
 */
final class ListProjectSeoQuery
{
    private const SORT_COLUMNS = [
        'type' => 'type',
        'title' => 'entity_title',
        'updated_at' => 'entity_updated_at',
    ];

    private const SEO_COLUMNS = [
        'title', 'description', 'keywords', 'canonical', 'robots',
        'og_title', 'og_description', 'og_image', 'twitter_card', 'json_ld',
    ];

    public function __construct(private readonly ProjectContext $context) {}

    /**
     * Страница несёт сырые строки: курсор строится из полей сортировки
     * последнего элемента, и подмена их на DTO ломает вторую страницу.
     * В DTO строка превращается на границе ответа.
     *
     * @return CursorPaginator<int, object>
     */
    public function handle(SeoCatalogFilterDTO $filter): CursorPaginator
    {
        $direction = $filter->direction === 'asc' ? 'asc' : 'desc';

        /** @var CursorPaginator<int, object> $page */
        $page = DB::query()
            ->fromSub($this->union($filter->type), 'seo_catalog')
            ->orderBy(self::SORT_COLUMNS[$filter->sort] ?? 'entity_updated_at', $direction)
            ->orderBy('type')
            ->orderBy('entity_id')
            ->cursorPaginate($filter->per_page);

        return $page;
    }

    private function union(?SeoableType $type): Builder
    {
        $types = $type === null ? SeoableType::cases() : [$type];

        $union = $this->rows($types[0]);

        foreach (array_slice($types, 1) as $next) {
            $union->unionAll($this->rows($next));
        }

        return $union;
    }

    private function rows(SeoableType $type): Builder
    {
        [$table, $titleColumn] = match ($type) {
            SeoableType::Post => ['posts', 'title'],
            SeoableType::Page => ['pages', 'title'],
            SeoableType::Category => ['categories', 'name'],
        };

        $model = $type->modelClass();

        return DB::table($table)
            ->where($table.'.project_id', $this->context->required())
            ->leftJoin('seo_meta', function (JoinClause $join) use ($table, $model): void {
                $join->on('seo_meta.seoable_id', '=', $table.'.id')
                    ->where('seo_meta.seoable_type', $model);
            })
            ->select(array_merge([
                DB::raw("'{$type->value}' as type"),
                $table.'.id as entity_id',
                // Имя категории — переводимое (jsonb в postgres): без приведения
                // к тексту типы веток UNION не сходятся.
                DB::raw("cast({$table}.{$titleColumn} as text) as entity_title"),
                $table.'.updated_at as entity_updated_at',
                'seo_meta.id as seo_id',
            ], array_map(static fn (string $column): string => 'seo_meta.'.$column, self::SEO_COLUMNS)));
    }
}
