<?php

declare(strict_types=1);

namespace Cms\Ai\Application\Contracts;

use Cms\Ai\Application\DTOs\GeneratePost\GeneratePostRequestDTO;
use Cms\Ai\Application\DTOs\GeneratePost\PostDraftDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeRequestDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeResultDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteRequestDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteResultDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\CategoryTreeDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\SuggestCategoriesRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateResultDTO;

/**
 * Порт AI-операций платформы.
 *
 * Потребители зависят только от этого контракта: провайдер, SDK и модель —
 * деталь инфраструктуры, настраиваемая окружением. Все операции без состояния
 * и пригодны для вызова из Jobs. Отказы — исключения пакета (AiException).
 */
interface AiOperations
{
    /** Редактирование текста по инструкции (тон, стиль, сокращение). */
    public function rewrite(RewriteRequestDTO $request): RewriteResultDTO;

    /** Нормализация текста: очистка, пунктуация, единый формат. */
    public function normalize(NormalizeRequestDTO $request): NormalizeResultDTO;

    /** Перевод набора строк на целевые локали: ключ → [локаль => значение]. */
    public function translate(TranslateRequestDTO $request): TranslateResultDTO;

    /** Дерево категорий для проекта по его описанию. */
    public function suggestCategories(SuggestCategoriesRequestDTO $request): CategoryTreeDTO;

    /** Черновик поста: заголовок, slug, тело. */
    public function generatePost(GeneratePostRequestDTO $request): PostDraftDTO;
}
