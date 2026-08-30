<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

/** Вид фоновой работы: по нему консоль показывает, что именно выполняется. */
enum BackgroundTaskKind: string
{
    case PostGeneration = 'post_generation';
    case PostRebuild = 'post_rebuild';
    case Research = 'research';
    case ResearchIndexing = 'research_indexing';
    case ProjectBuildout = 'project_buildout';
    case MediaImport = 'media_import';
}
