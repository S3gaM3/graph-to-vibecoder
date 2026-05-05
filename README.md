# Vibe Coder — тренажёр (LAN)

Тренажёр для двух учётных записей (**Витя** и **Сёга**): парольный вход, отдельный прогресс и дневник в MySQL. Запуск на вашем ПК в локальной сети; GitHub Actions проверяет сборку и Dockerfile.

## Что внутри

- Next.js (App Router) + Tailwind, тёмная тема и моноширинные заголовки.
- Контент юнитов в репозитории: [`content/curriculum.json`](content/curriculum.json) и [`content/units/*.md`](content/units/).
- Prisma + MySQL: пользователи, манифест, прогресс по юнитам, записи дневника.
- Сессия в зашифрованном cookie (`iron-session`), секрет `SESSION_SECRET` (минимум 32 символа).

## Быстрый старт (разработка)

1. Скопируйте `.env.example` в `.env` и заполните переменные (пароли для сидов — не короче 8 символов).

2. Поднимите только базу:

   ```bash
   docker compose up -d db
   ```

3. Примените миграции и создайте пользователей:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Запустите приложение:

   ```bash
   npm install
   npm run dev
   ```

Откройте [http://localhost:3000](http://localhost:3000). Логины: `vitya` или `sega`, пароли — те, что в `.env`.

## LAN на вашем ПК

1. Убедитесь, что в `.env` заданы `SESSION_SECRET`, `DATABASE_URL`, `SEED_USER_*`, для HTTP в сети установите `COOKIE_SECURE=false`.

2. Соберите и поднимите приложение и базу:

   ```bash
   docker compose up --build
   ```

3. Разрешите входящие подключения на порт **3000** в брандмауэре Windows.

4. Узнайте IP адрес ПК (`ipconfig`) и на клиенте в той же подсети откройте `http://<IP_ПК>:3000`.

Первый запуск контейнера приложения выполняет `prisma migrate deploy`. Сид пользователей выполните один раз на хосте (или временно добавьте `RUN_SEED_ON_START=1` в сервис `app` и перезапустите):

```bash
docker compose exec app npx prisma db seed
```

(Если образ без интерактива — задайте те же переменные `SEED_USER_*`, что в `.env`, в окружении контейнера.)

## GitHub Actions

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml): MySQL-сервис, `prisma migrate deploy`, `lint`, `typecheck`, `build`, проверочная сборка Docker без push в реестр.

Для успешного CI миграции должны быть в репозитории (`prisma/migrations`).

## Структура

| Путь | Назначение |
|------|------------|
| `content/` | Учебный контент (JSON + Markdown) |
| `prisma/` | Схема и миграции |
| `src/app/(trainer)/` | Карта, юниты, профиль, дневник |
| `src/app/api/` | Логин, манифест, прогресс, дневник |

## Лицензия

Приватный учебный проект — по желанию добавьте свою лицензию.
