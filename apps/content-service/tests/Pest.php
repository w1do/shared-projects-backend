<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->in('../../../packages/cms/shared/tests');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/content/tests');
// Тесты cms/ai не трогают базу — RefreshDatabase им не нужен.
pest()->extend(Tests\TestCase::class)->in('../../../packages/cms/ai/tests');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/localization/tests');

require_once __DIR__.'/../../../packages/cms/content/tests/Helpers.php';
