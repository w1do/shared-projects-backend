# Gateway-образ: Traefik с запечённой матрицей маршрутов (без bind-mount —
# работает в любом деплое, включая Dokploy). Контекст сборки — infra/gateway.
# В dev конфиги монтируются поверх (compose.dev.yaml) и перечитываются на лету.
FROM traefik:v3

COPY traefik.yml dynamic.yml /etc/traefik/
