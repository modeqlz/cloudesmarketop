# 🚀 Настройка Supabase для Telegram WebApp

## 1. Создание проекта в Supabase

1. Зайди на [supabase.com](https://supabase.com)
2. Создай новый проект
3. Запомни название и пароль

## 2. Создание таблицы users

1. Перейди в **SQL Editor** в панели Supabase
2. Скопируй и выполни SQL из файла `supabase-table.sql`
3. Таблица `users` будет создана автоматически

## 3. Получение API ключей

1. Перейди в **Settings** → **API**
2. Скопируй:
   - `URL` (Project URL)
   - `anon public` ключ

## 4. Настройка переменных окружения

### Для локальной разработки:
Создай файл `.env.local` со следующими переменными:
```
BOT_TOKEN=твой_бот_токен
NEXT_PUBLIC_SUPABASE_URL=https://твой-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_anon_ключ
```

### Для Vercel (продакшн):
Добавь эти же переменные в **Vercel Dashboard** → **Settings** → **Environment Variables**

## 5. Установка зависимостей

```bash
npm install
```

## 6. Тестирование

1. Запусти приложение: `npm run dev`
2. Открой в Telegram WebApp
3. Нажми "Continue"
4. Проверь в Supabase Dashboard → **Table Editor** → **users**, что пользователь добавился

## 🎯 Что происходит при нажатии "Continue"

1. **Telegram WebApp** отправляет `initData` на сервер
2. **Сервер проверяет** подлинность данных Telegram
3. **Извлекает** данные пользователя (имя, username, фото)
4. **Сохраняет в Supabase** (или обновляет, если пользователь уже есть)
5. **Возвращает** профиль пользователя в приложение

## 📊 Структура таблицы users

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Уникальный ID (Primary Key) |
| `telegram_id` | BIGINT | ID пользователя в Telegram |
| `first_name` | TEXT | Имя |
| `last_name` | TEXT | Фамилия |
| `username` | TEXT | Username (@username) |
| `photo_url` | TEXT | Ссылка на аватар |
| `last_login` | TIMESTAMPTZ | Последний вход |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

## 🔒 Безопасность

- Включен **Row Level Security (RLS)**
- Настроены политики доступа
- Проверка подписи Telegram WebApp
- Все данные проходят валидацию

## ❗ Важно

- Переменные `NEXT_PUBLIC_*` будут видны в браузере
- Для чувствительных операций используй серверные API routes
- Supabase `anon` ключ безопасен для клиентского кода
- Проверь настройки RLS в продакшне