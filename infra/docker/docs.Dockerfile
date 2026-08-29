# Единая документация API: Swagger UI поверх собранного openapi/openapi.json
# (`./tools/cms api`). Контекст сборки — каталог openapi/ (см. infra/compose/compose.yaml).
FROM swaggerapi/swagger-ui:v5.32.14

ENV BASE_URL=/api/docs \
    SWAGGER_JSON=/spec/openapi.json

COPY openapi.json /spec/openapi.json
