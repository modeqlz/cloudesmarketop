-- Создание таблиц для банковской системы и Google Pay интеграции

-- Таблица кошельков пользователей
CREATE TABLE wallets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'RUB',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(user_id, currency)
);

-- Таблица транзакций
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'purchase', 'refund')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'RUB',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Информация о платеже
  payment_method VARCHAR(30) CHECK (payment_method IN ('google_pay', 'bank_card', 'sbp', 'steam_wallet', 'system')),
  payment_id VARCHAR(255), -- ID транзакции от платежного провайдера
  external_id VARCHAR(255), -- Внешний ID (например, от Google Pay)
  
  -- Описание транзакции
  description TEXT,
  reference_id VARCHAR(255), -- Ссылка на связанную операцию (покупка, перевод и т.д.)
  
  -- Метаданные
  metadata JSONB, -- Дополнительная информация о платеже
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индексы для быстрого поиска
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_active ON wallets(user_id, is_active);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);

-- RLS (Row Level Security)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политики для кошельков
CREATE POLICY "Пользователи могут видеть только свои кошельки" ON wallets
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

-- Политики для транзакций  
CREATE POLICY "Пользователи могут видеть только свои транзакции" ON transactions
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для создания кошелька при регистрации пользователя
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (NEW.telegram_id, 0.00, 'RUB')
    ON CONFLICT (user_id, currency) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического создания кошелька
CREATE TRIGGER create_wallet_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Функция для безопасного обновления баланса
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_user_id BIGINT,
    p_amount DECIMAL(10,2),
    p_transaction_type VARCHAR(20),
    p_description TEXT,
    p_payment_method VARCHAR(30) DEFAULT NULL,
    p_payment_id VARCHAR(255) DEFAULT NULL,
    p_external_id VARCHAR(255) DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_wallet_id BIGINT;
    v_transaction_id BIGINT;
    v_current_balance DECIMAL(10,2);
BEGIN
    -- Получаем ID кошелька и текущий баланс
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM wallets 
    WHERE user_id = p_user_id AND currency = 'RUB' AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Кошелек не найден для пользователя %', p_user_id;
    END IF;
    
    -- Проверяем, что баланс не станет отрицательным при списании
    IF p_amount < 0 AND (v_current_balance + p_amount) < 0 THEN
        RAISE EXCEPTION 'Недостаточно средств. Текущий баланс: %, требуется: %', v_current_balance, ABS(p_amount);
    END IF;
    
    -- Создаем транзакцию
    INSERT INTO transactions (
        wallet_id, user_id, type, amount, currency, status,
        payment_method, payment_id, external_id, description
    ) VALUES (
        v_wallet_id, p_user_id, p_transaction_type, ABS(p_amount), 'RUB', 'completed',
        p_payment_method, p_payment_id, p_external_id, p_description
    ) RETURNING id INTO v_transaction_id;
    
    -- Обновляем баланс
    UPDATE wallets 
    SET balance = balance + p_amount
    WHERE id = v_wallet_id;
    
    RETURN v_transaction_id;
END;
$$ language 'plpgsql';

-- Вставляем тестовые данные (кошельки создадутся автоматически через триггер)
-- Добавим несколько тестовых транзакций для демонстрации
DO $$
DECLARE
    test_user_id BIGINT;
BEGIN
    -- Получаем первого пользователя для тестовых данных
    SELECT telegram_id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Тестовые транзакции
        PERFORM update_wallet_balance(
            test_user_id, 
            500.00, 
            'deposit', 
            'Пополнение баланса через Google Pay',
            'google_pay',
            'gpy_test_12345',
            'ext_test_67890'
        );
        
        PERFORM update_wallet_balance(
            test_user_id, 
            -1200.00, 
            'purchase', 
            'Покупка скина AK-47 Redline',
            'system',
            NULL,
            'purchase_skin_001'
        );
        
        PERFORM update_wallet_balance(
            test_user_id, 
            850.00, 
            'deposit', 
            'Продажа предмета',
            'system',
            NULL,
            'sale_item_002'
        );
        
        PERFORM update_wallet_balance(
            test_user_id, 
            -300.00, 
            'transfer_out', 
            'Перевод пользователю @username',
            'system',
            NULL,
            'transfer_003'
        );
    END IF;
END $$;