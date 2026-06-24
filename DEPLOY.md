# Деплой на TimeWeb VPS

Сайт собирается в Node-сервер (Nitro preset `node_server`) и запускается в Docker.

## 1. Подготовка сервера (один раз)

Зайди по SSH на свой VPS TimeWeb и установи Docker:

```bash
apt update && apt install -y docker.io docker-compose-plugin git
systemctl enable --now docker
```

## 2. Клонирование репозитория

```bash
cd /opt
git clone https://github.com/<твой-логин>/<репо>.git mk-site
cd mk-site
```

## 3. Переменные окружения

```bash
cp .env.production.example .env.production
nano .env.production
```

Скопируй значения из Lovable: открой в редакторе `.env` (там есть `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) и перенеси их в `.env.production` на сервере.

## 4. Сборка и запуск

```bash
docker compose up -d --build
```

Сайт поднимется на 80 порту. Проверь:

```bash
curl -I http://localhost
docker compose logs -f web
```

После этого открой `http://<IP-сервера>` в браузере без VPN — должен открыться сайт. IP можешь отправлять заказчику.

## 5. Обновление при изменениях в Lovable

После push'а в GitHub из Lovable:

```bash
cd /opt/mk-site
git pull
docker compose up -d --build
```

Можно автоматизировать через GitHub webhook + скрипт, но это позже.

## 6. Домен (когда будет готов)

1. В панели DNS направь A-запись домена на IP VPS.
2. Поставь Caddy или nginx + certbot для HTTPS. Готов помочь, когда дойдём.

## Полезные команды

- Логи: `docker compose logs -f web`
- Перезапуск: `docker compose restart web`
- Остановить: `docker compose down`
- Пересборка с нуля: `docker compose build --no-cache && docker compose up -d`
