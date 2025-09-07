# 💳 Stripe Checkout с Google Pay - Интеграция

## 🎯 Обзор

Полная интеграция Stripe Checkout с поддержкой Google Pay для пополнения баланса в Telegram WebApp.

## 🚀 Возможности

- ✅ **Stripe Checkout** с автоматической поддержкой Google Pay
- ✅ **Предустановленные суммы**: $1.00, $2.50, $5.00, $10.00
- ✅ **Произвольные суммы**: от $0.50 до $999.99
- ✅ **Webhook обработка** успешных платежей
- ✅ **Автоматическое пополнение баланса** через Supabase RPC
- ✅ **История транзакций** в базе данных
- ✅ **Адаптивный UI** для мобильных устройств
- ✅ **Telegram WebApp** интеграция с внешним браузером

## 📋 Установка и настройка

### 1. Установите зависимости

```bash
npm install stripe @supabase/supabase-js
# или
yarn add stripe @supabase/supabase-js
```

### 2. Настройте переменные окружения

Создайте `.env.local`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (уже существующие)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=eyJ...
```

### 3. Настройте базу данных

Выполните SQL скрипт из `SUPABASE_SETUP.md` в Supabase SQL Editor.

### 4. Настройте Stripe

1. **Создайте аккаунт** на [stripe.com](https://stripe.com)
2. **Получите API ключи** из Dashboard → API keys
3. **Настройте webhook endpoint**: Dashboard → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Events: `checkout.session.completed`

## 🧪 Тестирование

### Локальная разработка

1. **Запустите приложение:**
   ```bash
   npm run dev
   ```

2. **Настройте Stripe CLI** (в отдельном терминале):
   ```bash
   # Установите Stripe CLI
   # macOS: brew install stripe/stripe-cli/stripe
   # Windows: scoop install stripe
   # Linux: wget + install

   # Войдите в аккаунт
   stripe login

   # Прослушивайте webhook события
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

3. **Скопируйте webhook secret:**
   ```bash
   # Stripe CLI покажет webhook signing secret
   # Добавьте его в .env.local как STRIPE_WEBHOOK_SECRET
   ```

### Тестовые карты Stripe

```
# Успешная оплата
4242 4242 4242 4242

# Требует аутентификации
4000 0025 0000 3155

# Отклоненная карта
4000 0000 0000 0002

# Любая будущая дата для срока действия
# Любой 3-значный CVC
```

### Тест Google Pay

1. Используйте Chrome на Android или desktop
2. Войдите в Google аккаунт с привязанной картой
3. При оплате появится опция Google Pay

## 🔧 Структура файлов

```
├── SUPABASE_SETUP.md          # SQL скрипт для БД
├── lib/supabaseServer.ts      # Серверный клиент Supabase
├── pages/api/
│   ├── create-checkout-session.ts  # Создание Stripe сессии
│   └── stripe-webhook.ts           # Обработка webhook
├── pages/topup/
│   ├── success.tsx            # Страница успешной оплаты
│   └── cancel.tsx             # Страница отмены
├── components/
│   ├── TopUpModal.tsx         # Модал пополнения
│   └── WalletMenu.js          # Обновлен для интеграции
└── styles/globals.css         # Стили для модала
```

## 💡 Использование

### Для пользователей

1. **Откройте кошелек** через боковое меню
2. **Нажмите "Пополнить"**
3. **Выберите сумму** или введите произвольную
4. **Нажмите "Pay with Google Pay / Card"**
5. **Завершите оплату** в Stripe Checkout
6. **Баланс обновится автоматически**

### Для разработчиков

```javascript
// Создание checkout сессии
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amountCents: 500, // $5.00
    userId: 123456789
  })
})

// Получение URL для редиректа
const { url } = await response.json()

// Открытие в внешнем браузере (Telegram WebApp)
window.Telegram?.WebApp?.openLink(url, { try_instant_view: false })
```

## 🔒 Безопасность

- ✅ **Webhook signature verification** - проверка подписи Stripe
- ✅ **Server-side validation** - валидация на сервере
- ✅ **RLS policies** - Row Level Security в Supabase
- ✅ **Amount limits** - лимиты сумм ($0.50 - $999.99)
- ✅ **Telegram auth** - аутентификация через Telegram

## 📊 Мониторинг

### Просмотр транзакций

```sql
-- Последние транзакции
SELECT 
  wt.*,
  u.username
FROM wallet_tx wt
JOIN users u ON u.telegram_id = wt.telegram_id
ORDER BY wt.created_at DESC
LIMIT 20;

-- Статистика по суммам
SELECT 
  COUNT(*) as transactions,
  SUM(amount_cents) as total_cents,
  AVG(amount_cents) as avg_cents
FROM wallet_tx 
WHERE status = 'succeeded' 
AND kind = 'topup'
AND created_at >= NOW() - INTERVAL '7 days';
```

### Stripe Dashboard

- **Payments**: Все платежи и их статусы
- **Webhooks**: Логи webhook событий
- **Logs**: Детальные логи API запросов

## 🚨 Troubleshooting

### Webhook не работает

```bash
# Проверьте endpoint
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Проверьте Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook --log-level debug
```

### Google Pay не появляется

1. **Проверьте браузер**: Chrome рекомендуется
2. **Проверьте HTTPS**: Google Pay требует SSL в продакшене
3. **Проверьте аккаунт**: войдите в Google с привязанной картой
4. **Проверьте регион**: Google Pay доступен не везде

### Ошибки базы данных

```sql
-- Проверьте таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('balances', 'wallet_tx');

-- Проверьте RPC функции
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'wallet_increment';
```

## 📈 Продакшн

### Переключение на LIVE режим

1. **Замените тестовые ключи** на продакшн ключи
2. **Обновите webhook URL** в Stripe Dashboard
3. **Настройте HTTPS** на вашем домене
4. **Протестируйте** с реальными картами (малые суммы)

### Рекомендации

- **Логирование**: добавьте детальные логи транзакций
- **Мониторинг**: настройте алерты на ошибки webhook
- **Backup**: регулярные бэкапы базы данных
- **Rate limiting**: ограничьте частоту запросов

## 🎉 Готово!

Ваша интеграция Stripe Checkout с Google Pay готова к использованию! 

Пользователи могут легко пополнять баланс через удобный интерфейс с поддержкой всех популярных способов оплаты.