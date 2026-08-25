<?php

declare(strict_types=1);
use Cms\Shared\Jobs\ProjectAwareJob;
use Cms\Shared\Jobs\SendAnalyticsEventJob;

/*
 * Совместимость очередей (Safety Protocol, И13): в payload задач, поставленных
 * до переноса классов в Cms\Shared\Jobs, сериализованы старые FQCN.
 * Алиасы держатся один релиз — до подтверждённого дренажа очередей — и затем удаляются.
 */
class_alias(SendAnalyticsEventJob::class, 'Cms'.'\Shared\Analytics\SendAnalyticsEventJob');
class_alias(ProjectAwareJob::class, 'Cms'.'\Shared\Tenant\ProjectAwareJob');
