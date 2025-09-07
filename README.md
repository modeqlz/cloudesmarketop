# 🚀 Cloudес Market - Telegram WebApp

Telegram WebApp для торговли скинами с интеграцией Supabase для сохранения пользователей.

## 🎯 Особенности

- ✅ **Telegram WebApp авторизация** - проверка подписи initData
- ✅ **Supabase интеграция** - автоматическое сохранение пользователей
- ✅ **Современный UI** - адаптивный дизайн под мобильные устройства
- ✅ **Next.js 14** - оптимизирован для Vercel
- ✅ **Безопасность** - валидация данных Telegram на сервере

## 🛠 Технологии

- **Frontend**: Next.js 14, React 18, CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Auth**: Telegram WebApp

## 🚀 Быстрый старт

1. **Установка зависимостей**
```bash
npm install
```

2. **Настройка переменных окружения**
```bash
# Создай файл .env.local
BOT_TOKEN=твой_бот_токен
NEXT_PUBLIC_SUPABASE_URL=https://твой-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_anon_ключ
```

3. **Создание таблицы в Supabase**
   - Выполни SQL из файла `supabase-table.sql` в Supabase Dashboard

4. **Запуск проекта**
```bash
npm run dev
```

## 📱 Что происходит при нажатии "Continue"

1. **Проверка Telegram WebApp** - получение initData
2. **Валидация на сервере** - проверка подписи Telegram
3. **Извлечение данных** - имя, username, фото пользователя
4. **Сохранение в Supabase** - автоматическое создание/обновление записи
5. **Перенаправление** - переход в главное меню приложения

## 📊 База данных

В Supabase создается таблица `users` со следующими полями:
- `telegram_id` - ID пользователя в Telegram
- `first_name`, `last_name` - имя и фамилия
- `username` - никнейм (@username)
- `photo_url` - ссылка на аватар
- `last_login` - время последнего входа
- `created_at`, `updated_at` - метки времени

## 🔒 Безопасность

- Проверка подписи Telegram WebApp
- Row Level Security (RLS) в Supabase
- Валидация всех входящих данных
- Graceful обработка ошибок

## 🌐 Деплой

1. **Подключи к Vercel** - импортируй репозиторий
2. **Добавь переменные** - в настройках проекта Vercel
3. **Деплой** - автоматический при push в main

---

**Автор**: [@modeqlz](https://github.com/modeqlz)  
**Проект**: Cloudес Market Telegram WebApp