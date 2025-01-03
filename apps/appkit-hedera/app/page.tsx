'use client';

import styles from './page.module.css';

import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { hederaTestnet } from '@reown/appkit/networks';
import Connect from './_components/Connect';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// 2. Create a metadata object
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/'],
};

// 3. Create the AppKit instance
if (projectId) {
  createAppKit({
    adapters: [new EthersAdapter()],
    metadata: metadata,
    networks: [hederaTestnet],
    defaultNetwork: hederaTestnet,
    projectId,
    features: {
      analytics: true,
      email: false,
      emailShowWallets: false,
      socials: false,
      allWallets: false,
      onramp: false,
      swaps: false,
    },
    themeMode: 'light',
    allWallets: 'HIDE',
    // NOTE: https://walletguide.walletconnect.network/
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'dc09ba6dfa61fefeda72672d88390226bc6fa9e94ce6a6820230d96af897b7ec', // Wallypto
      'a29498d225fa4b13468ff4d6cf4ae0ea4adcbd95f07ce8a843a1dee10b632f3f', // HashPack
    ],
    enableWalletConnect: false,
    enableInjected: true,
    enableCoinbase: false,
    // TODO: Add your terms and privacy policy URLs
    termsConditionsUrl: '',
    privacyPolicyUrl: '',
  });
}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Connect />
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
