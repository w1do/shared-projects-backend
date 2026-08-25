<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->in('../../../packages/cms/shared/tests');
pest()->in('../../../packages/cms/contracts/tests');
pest()->in('../../../packages/cms/generators/tests');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/auth/tests');

require_once __DIR__.'/../../../packages/cms/auth/tests/Helpers.php';
