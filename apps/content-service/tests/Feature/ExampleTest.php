<?php

test('health endpoint responds', function () {
    $this->getJson('/health')->assertOk()->assertJsonPath('service', 'content-service');
});
