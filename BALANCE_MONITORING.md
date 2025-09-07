# 💰 Мониторинг баланса пользователей

## 📊 SQL запросы для отслеживания баланса

### 1. Сброс всех балансов на 0
```sql
-- Сбрасываем все балансы на 0
UPDATE balances SET balance_cents = 0 WHERE currency = 'USD';

-- Проверяем результат
SELECT 
    u.username,
    u.telegram_id,
    b.balance_cents,
    b.balance_cents / 100.0 as balance_usd
FROM balances b
JOIN users u ON u.telegram_id = b.telegram_id
ORDER BY b.balance_cents DESC;
```

### 2. Просмотр всех пользователей с их балансами
```sql
-- Все пользователи с балансами
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.telegram_id,
    COALESCE(b.balance_cents, 0) as balance_cents,
    COALESCE(b.balance_cents, 0) / 100.0 as balance_usd,
    b.created_at as wallet_created,
    b.updated_at as last_balance_update
FROM users u
LEFT JOIN balances b ON b.telegram_id = u.telegram_id AND b.currency = 'USD'
ORDER BY COALESCE(b.balance_cents, 0) DESC;
```

### 3. История всех операций с балансом
```sql
-- Полная история транзакций
SELECT 
    wt.id,
    u.username,
    u.telegram_id,
    wt.amount_cents,
    wt.amount_cents / 100.0 as amount_usd,
    wt.kind,
    wt.provider,
    wt.status,
    wt.description,
    wt.stripe_session_id,
    wt.created_at
FROM wallet_tx wt
JOIN users u ON u.telegram_id = wt.telegram_id
ORDER BY wt.created_at DESC
LIMIT 50;
```

### 4. Статистика по операциям
```sql
-- Статистика за последние 30 дней
SELECT 
    kind,
    provider,
    status,
    COUNT(*) as count,
    SUM(amount_cents) as total_cents,
    SUM(amount_cents) / 100.0 as total_usd,
    AVG(amount_cents) as avg_cents,
    AVG(amount_cents) / 100.0 as avg_usd
FROM wallet_tx 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY kind, provider, status
ORDER BY total_cents DESC;
```

### 5. Топ пользователей по балансу
```sql
-- Топ 10 пользователей по балансу
SELECT 
    u.username,
    u.first_name,
    u.telegram_id,
    b.balance_cents,
    b.balance_cents / 100.0 as balance_usd,
    b.updated_at as last_update
FROM balances b
JOIN users u ON u.telegram_id = b.telegram_id
WHERE b.currency = 'USD'
ORDER BY b.balance_cents DESC
LIMIT 10;
```

### 6. Пользователи с нулевым балансом
```sql
-- Пользователи с нулевым балансом
SELECT 
    u.username,
    u.first_name,
    u.telegram_id,
    COALESCE(b.balance_cents, 0) as balance_cents
FROM users u
LEFT JOIN balances b ON b.telegram_id = u.telegram_id AND b.currency = 'USD'
WHERE COALESCE(b.balance_cents, 0) = 0
ORDER BY u.created_at DESC;
```

### 7. Последние операции конкретного пользователя
```sql
-- Замените 123456789 на нужный telegram_id
SELECT 
    wt.amount_cents,
    wt.amount_cents / 100.0 as amount_usd,
    wt.kind,
    wt.provider,
    wt.status,
    wt.description,
    wt.created_at
FROM wallet_tx wt
WHERE wt.telegram_id = 123456789
ORDER BY wt.created_at DESC
LIMIT 10;
```

### 8. Создание кошелька для всех пользователей
```sql
-- Создаем кошельки для всех пользователей без них
INSERT INTO balances (telegram_id, balance_cents, currency)
SELECT 
    u.telegram_id,
    0,
    'USD'
FROM users u
LEFT JOIN balances b ON b.telegram_id = u.telegram_id AND b.currency = 'USD'
WHERE b.telegram_id IS NULL;
```

### 9. Проверка целостности данных
```sql
-- Проверяем что все пользователи имеют кошельки
SELECT 
    COUNT(*) as total_users,
    COUNT(b.telegram_id) as users_with_wallets,
    COUNT(*) - COUNT(b.telegram_id) as users_without_wallets
FROM users u
LEFT JOIN balances b ON b.telegram_id = u.telegram_id AND b.currency = 'USD';
```

### 10. Ежедневная статистика
```sql
-- Операции по дням за последние 7 дней
SELECT 
    DATE(created_at) as date,
    kind,
    COUNT(*) as operations,
    SUM(amount_cents) as total_cents,
    SUM(amount_cents) / 100.0 as total_usd
FROM wallet_tx 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), kind
ORDER BY date DESC, total_cents DESC;
```

## 🔧 Полезные команды

### Сброс всех балансов
```sql
UPDATE balances SET balance_cents = 0 WHERE currency = 'USD';
```

### Удаление всех транзакций (осторожно!)
```sql
DELETE FROM wallet_tx;
```

### Создание тестового пополнения
```sql
-- Пополняем баланс пользователя на $10
SELECT wallet_increment(123456789, 1000);
```

### Проверка баланса пользователя
```sql
-- Замените 123456789 на нужный telegram_id
SELECT 
    u.username,
    b.balance_cents,
    b.balance_cents / 100.0 as balance_usd
FROM users u
JOIN balances b ON b.telegram_id = u.telegram_id
WHERE u.telegram_id = 123456789 AND b.currency = 'USD';
```