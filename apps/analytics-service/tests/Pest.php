<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->in('../../../packages/cms/shared/tests');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/analytics/tests');

require_once __DIR__.'/../../../packages/cms/analytics/tests/Helpers.php';
