<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->in('Feature');
pest()->extend(TestCase::class)->in('../../../packages/cms/shared/tests');
pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/content/tests');
// Тесты cms/ai не трогают базу — RefreshDatabase им не нужен.
pest()->extend(TestCase::class)->in('../../../packages/cms/ai/tests');
pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/localization/tests');
pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/instructs/tests');
pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/research/tests');

require_once __DIR__.'/../../../packages/cms/content/tests/Helpers.php';
require_once __DIR__.'/../../../packages/cms/research/tests/Helpers.php';
