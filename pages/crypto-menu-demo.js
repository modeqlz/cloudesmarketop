import React from 'react';
import Head from 'next/head';
import CryptoMainMenu from '../components/CryptoMainMenu';

const CryptoMenuDemo = () => {
  return (
    <>
      <Head>
        <title>Crypto Main Menu - NFT Gifts Demo</title>
        <meta name="description" content="Демонстрация элегантного главного меню для Telegram WebApp с NFT подарками" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <CryptoMainMenu />
    </>
  );
};

export default CryptoMenuDemo;
