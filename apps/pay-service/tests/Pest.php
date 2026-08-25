<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('../../../packages/cms/pay/tests');

require_once __DIR__.'/../../../packages/cms/pay/tests/Helpers.php';
