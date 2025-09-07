# 🏦 Supabase Setup для Stripe Checkout

## SQL Скрипт

Выполните в Supabase SQL Editor:

```sql
-- Таблица балансов пользователей
CREATE TABLE IF NOT EXISTS balances (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    balance_cents BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(telegram_id, currency)
);

-- Таблица транзакций
CREATE TABLE IF NOT EXISTS wallet_tx (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    kind VARCHAR(50) NOT NULL CHECK (kind IN ('topup', 'withdrawal', 'purchase', 'refund')),
    provider VARCHAR(50) CHECK (provider IN ('stripe_gpay', 'stripe_card', 'paypal', 'system')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    stripe_session_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_balances_telegram_id ON balances(telegram_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_telegram_id ON wallet_tx(telegram_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_stripe_session ON wallet_tx(stripe_session_id);

-- RLS
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_tx ENABLE ROW LEVEL SECURITY;

-- RPC функция для пополнения баланса
CREATE OR REPLACE FUNCTION wallet_increment(
    p_user BIGINT,
    p_amount_cents BIGINT
)
RETURNS BIGINT AS $$
DECLARE
    v_new_balance BIGINT;
BEGIN
    INSERT INTO balances (telegram_id, balance_cents, currency)
    VALUES (p_user, p_amount_cents, 'USD')
    ON CONFLICT (telegram_id, currency)
    DO UPDATE SET balance_cents = balances.balance_cents + p_amount_cents;
    
    SELECT balance_cents INTO v_new_balance
    FROM balances WHERE telegram_id = p_user AND currency = 'USD';
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```