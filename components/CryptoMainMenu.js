import React, { useState, useEffect } from 'react';
import styles from '../styles/CryptoMainMenu.module.css';

const CryptoMainMenu = () => {
  const [balance, setBalance] = useState(1250.75);
  const [activeAuctions, setActiveAuctions] = useState([
    { id: 1, name: "Cosmic Dragon #1337", currentBid: 2.5, timeLeft: "2h 15m" },
    { id: 2, name: "Neon Warrior #888", currentBid: 1.8, timeLeft: "45m" },
    { id: 3, name: "Digital Phoenix #2024", currentBid: 3.2, timeLeft: "1h 30m" }
  ]);
  const [nftCollection, setNftCollection] = useState([
    { id: 1, name: "Cyber Cat #123", image: "🐱", rarity: "Rare" },
    { id: 2, name: "Space Knight #456", image: "🚀", rarity: "Epic" },
    { id: 3, name: "Crystal Gem #789", image: "💎", rarity: "Legendary" }
  ]);

  const [user] = useState({
    name: "CryptoTrader",
    level: 15,
    avatar: "👤",
    reputation: 98.5
  });

  // Анимация счетчика баланса
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGiftNFT = () => {
    // Логика подарка NFT
    console.log('Gift NFT clicked');
  };

  const handleMyNFTs = () => {
    // Переход к коллекции NFT
    console.log('My NFTs clicked');
  };

  const handleAuctions = () => {
    // Переход к аукционам
    console.log('Auctions clicked');
  };

  const handleProfile = () => {
    // Переход к профилю
    console.log('Profile clicked');
  };

  return (
    <div className={styles.cryptoMainMenu}>
      {/* Фоновые декоративные элементы */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingOrb1}></div>
        <div className={styles.floatingOrb2}></div>
        <div className={styles.floatingOrb3}></div>
        <div className={styles.gridPattern}></div>
      </div>

      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <h1>NFT Gifts</h1>
        </div>
        <div className={styles.headerDecor}>
          <div className={styles.glowLine}></div>
        </div>
      </div>

      {/* Баланс кошелька */}
      <div className={styles.walletSection}>
        <div className={styles.walletCard}>
          <div className={styles.walletHeader}>
            <span className={styles.walletIcon}>💰</span>
            <h3>Баланс кошелька</h3>
            <div className={styles.cryptoIcons}>
              <span className={styles.cryptoIcon}>₿</span>
              <span className={styles.cryptoIcon}>Ξ</span>
              <span className={styles.cryptoIcon}>◊</span>
            </div>
          </div>
          <div className={styles.balanceAmount}>
            <span className={styles.balanceValue}>{balance.toFixed(2)}</span>
            <span className={styles.balanceCurrency}>ETH</span>
          </div>
          <div className={styles.balanceChange}>
            <span className={styles.changePositive}>+5.2%</span>
            <span className={styles.changeText}>за 24ч</span>
          </div>
        </div>
      </div>

      {/* Основные кнопки меню */}
      <div className={styles.mainButtons}>
        {/* Мои NFT */}
        <div className={styles.menuCard} onClick={handleMyNFTs}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🎨</span>
            <h3>Мои NFT</h3>
            <span className={styles.cardBadge}>{nftCollection.length}</span>
          </div>
          <div className={styles.nftPreview}>
            {nftCollection.slice(0, 3).map((nft, index) => (
              <div key={nft.id} className={styles.nftItem} style={{zIndex: 3 - index}}>
                <span className={styles.nftEmoji}>{nft.image}</span>
                <div className={styles.nftRarity}>{nft.rarity}</div>
              </div>
            ))}
          </div>
          <div className={styles.cardArrow}>→</div>
        </div>

        {/* Активные аукционы */}
        <div className={styles.menuCard} onClick={handleAuctions}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🔥</span>
            <h3>Активные аукционы</h3>
            <div className={styles.liveBadge}>
              <div className={styles.liveDot}></div>
              LIVE
            </div>
          </div>
          <div className={styles.auctionPreview}>
            {activeAuctions.slice(0, 2).map(auction => (
              <div key={auction.id} className={styles.auctionItem}>
                <div className={styles.auctionName}>{auction.name}</div>
                <div className={styles.auctionBid}>
                  <span className={styles.bidAmount}>{auction.currentBid} ETH</span>
                  <span className={styles.timeLeft}>{auction.timeLeft}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cardArrow}>→</div>
        </div>

        {/* Подарить NFT */}
        <div className={styles.menuCard} onClick={handleGiftNFT}>
          <div className={styles.giftCard}>
            <div className={styles.giftIcon}>
              <span className={styles.giftEmoji}>🎁</span>
              <div className={styles.giftGlow}></div>
            </div>
            <h3>Подарить NFT</h3>
            <p>Отправь уникальный подарок друзьям</p>
            <div className={styles.giftParticles}>
              <div className={styles.particle}></div>
              <div className={styles.particle}></div>
              <div className={styles.particle}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Профиль пользователя */}
      <div className={styles.profileSection}>
        <div className={styles.profileCard} onClick={handleProfile}>
          <div className={styles.profileAvatar}>
            <span className={styles.avatarEmoji}>{user.avatar}</span>
            <div className={styles.levelBadge}>
              <span className={styles.levelNumber}>{user.level}</span>
            </div>
          </div>
          <div className={styles.profileInfo}>
            <h4 className={styles.profileName}>{user.name}</h4>
            <div className={styles.profileStats}>
              <div className={styles.reputation}>
                <span className={styles.reputationIcon}>⭐</span>
                <span className={styles.reputationValue}>{user.reputation}%</span>
              </div>
              <div className={styles.profileLevel}>Level {user.level}</div>
            </div>
          </div>
          <div className={styles.profileArrow}>→</div>
        </div>
      </div>

      {/* Дополнительные элементы интерфейса */}
      <div className={styles.bottomActions}>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>📊</span>
          Статистика
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>⚙️</span>
          Настройки
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>💬</span>
          Поддержка
        </button>
      </div>
    </div>
  );
};

export default CryptoMainMenu;
