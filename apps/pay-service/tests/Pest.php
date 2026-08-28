<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->in('../../../packages/cms/shared/tests');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/pay/tests');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/licensing/tests');

require_once __DIR__.'/../../../packages/cms/pay/tests/Helpers.php';
require_once __DIR__.'/../../../packages/cms/licensing/tests/Helpers.php';
