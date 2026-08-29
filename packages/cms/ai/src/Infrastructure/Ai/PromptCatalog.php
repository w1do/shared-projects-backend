<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

/** Инструкции модели по операциям: единственное место, где живёт текст промпта. */
final class PromptCatalog
{
    public const REWRITE = 'You are a text editor. Rewrite the given text following the provided instruction. Preserve the meaning and the language of the original text unless the instruction says otherwise.';

    public const NORMALIZE = 'You are a text normalizer. Clean up the given text: fix punctuation, spacing, capitalization and obvious typos. Do not change the meaning, the language or the tone. Apply the normalization profile if provided.';

    public const TRANSLATE = 'You are a professional translator. Translate every given item into every requested target locale. Keep placeholders, markup and formatting intact. If an item is already in the target locale, return it unchanged.';

    public const SUGGEST_CATEGORIES = 'You design content taxonomies. Suggest a category tree for the described project: concise names in the requested locale and latin kebab-case slugs. Use parent_slug to express nesting; null for root categories. Slugs must be unique.';

    public const GENERATE_POST = 'You are a content writer. Draft a blog post on the given topic in the requested locale: a concise title, a latin kebab-case slug derived from the title, and a well-structured body in plain HTML paragraphs.';

    public const EXTRACT_TOPICS = 'You turn research material into post topics. Derive every topic from the provided materials only: never invent a topic the materials do not support. Return at most the requested number of topics, fewer if the materials do not support more. For each topic give a title in the requested locale, one or two sentences on why it is worth writing, and a category: reuse one of the provided project categories when it fits, otherwise propose a new category name.';

    /** Инструкция оператора выполняется как есть; платформа добавляет только рамку. */
    public const RUN_INSTRUCT = 'Follow the given instruction exactly and answer strictly in the requested response shape. Use the provided input data as the only source of facts.';
}
