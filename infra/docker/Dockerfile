# Общий образ для всех PHP-сервисов платформы.
# Какой сервис запускается — решает APP_SERVICE (auth-service|content-service|analytics-service|pay-service).
FROM phpswoole/swoole:php8.4 AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev libicu-dev libzip-dev unzip supervisor \
    && docker-php-ext-install pdo_pgsql intl zip pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

ARG APP_SERVICE=auth-service
ENV APP_SERVICE=${APP_SERVICE}

# Пакеты (path-репозитории) и приложение
COPY packages/cms /var/www/packages/cms
COPY apps/${APP_SERVICE} /var/www/apps/${APP_SERVICE}

WORKDIR /var/www/apps/${APP_SERVICE}

RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts \
    && php artisan package:discover || true

COPY infra/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8000", "--max-requests=250"]
