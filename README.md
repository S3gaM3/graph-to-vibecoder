# Vibe Coder — тренажёр (LAN)

Тренажёр для трёх учётных записей (**Витя**, **Паша** и **Сёга**): парольный вход, отдельный прогресс и дневник в MySQL. Запуск полностью локальный, без GitHub Actions.

## Что внутри

- Next.js (App Router) + Tailwind, тёмная тема и моноширинные заголовки.
- Контент юнитов в репозитории: [`content/curriculum.json`](content/curriculum.json) и [`content/units/*.md`](content/units/).
- Prisma + MySQL: пользователи, манифест, прогресс по юнитам, записи дневника.
- Сессия в зашифрованном cookie (`iron-session`), секрет `SESSION_SECRET` (минимум 32 символа).

## Автозапуск (максимально автоматический)

Одной командой в PowerShell:

```powershell
.\start-local.ps1
```

Откройте [http://localhost:3000](http://localhost:3000). Логины: `vitya`, `pasha`, `sega`, пароли — те, что в `.env`.

Если Docker ругается, что занят порт `3306`, это норм: у вас уже запущен локальный MySQL. В проекте по умолчанию проброс стоит на `3307` (`MYSQL_HOST_PORT`), так что конфликтов быть не должно.

По умолчанию (если `.env` не задан):

- `vitya` / `vitya12345`
- `pasha` / `pasha12345`
- `sega` / `sega12345`

Приложение автоматически:

- поднимает MySQL и app через `docker compose`;
- выполняет `prisma migrate deploy`;
- выполняет `prisma db seed` на старте контейнера app.

## LAN на вашем ПК

1. Запустите:

```powershell
.\start-local.ps1
```

2. Разрешите входящие подключения на порт **3000** в брандмауэре Windows.

3. Узнайте IP адрес ПК (`ipconfig`) и на клиенте в той же подсети откройте `http://<IP_ПК>:3000`.

## Кастомные пароли

Создайте `.env` на базе [`.env.example`](.env.example) и задайте:

```env
SEED_USER_VITYA_PASSWORD=your_strong_password
SEED_USER_PASHA_PASSWORD=your_strong_password
SEED_USER_SEGA_PASSWORD=your_strong_password
SESSION_SECRET=your_32_plus_chars_secret
```

## Структура

| Путь | Назначение |
|------|------------|
| `content/` | Учебный контент (JSON + Markdown) |
| `prisma/` | Схема и миграции |
| `src/app/(trainer)/` | Карта, юниты, профиль, дневник |
| `src/app/api/` | Логин, манифест, прогресс, дневник |

## Лицензия

Приватный учебный проект — по желанию добавьте свою лицензию.
