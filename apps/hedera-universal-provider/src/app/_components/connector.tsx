'use client';

import { SignClient } from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

const STORED_WALLET_CONNECT_SESSION_KEY = 'walletconnect-session';

const Connector = () => {
  const [provider, setProvider] = useState<UniversalProvider>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedSession, setConnectedSession] =
    useState<SessionTypes.Struct>();

  const [accounts, setAccounts] = useState<string[]>([]);

  const handleInit = async () => {
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

    // 1. SignClient 초기화
    const signClient = await SignClient.init({
      projectId: projectId,
      metadata: {
        name: 'React App',
        description: 'React App for WalletConnect',
        url: 'http://localhost:3000',
        icons: ['http://localhost:3000/favicon.ico'],
      },
    });

    // 2. UniversalProvider 초기화
    const providerInstance = await UniversalProvider.init({
      logger: 'info',
      projectId: projectId,
      metadata: {
        name: 'React App',
        description: 'React App for WalletConnect',
        url: 'http://localhost:3000',
        icons: ['http://localhost:3000/favicon.ico'],
      },
      client: signClient,
    });

    // 세션이 저장된 경우 복원
    const storedSession = localStorage.getItem(
      STORED_WALLET_CONNECT_SESSION_KEY
    );
    if (storedSession) {
      const session = JSON.parse(storedSession) as SessionTypes.Struct;
      console.log('stored session::', session);

      providerInstance.session = session;
      console.log('new session::', session);
      setConnectedSession(session);
      setAccounts(session?.namespaces?.['hedera'].accounts);
    }

    setProvider(providerInstance);
  };

  const handleConnect = async () => {
    try {
      if (!provider) {
        throw new Error('Provider를 Initializing 해주세요.');
      }

      provider.on('display_uri', (uri: string) => {
        QRCode.toCanvas(document.getElementById('qrcode'), uri, (error) => {
          if (error) {
            console.error('Failed to generate QR code:', error);
          }
        });
      });

      const session = await provider.connect({
        optionalNamespaces: {
          hedera: {
            methods: [
              'hedera_signAndExecuteTransaction',
              'hedera_signTransaction',
              'hedera_executeTransaction',
              'hedera_signAndExecuteQuery',
              'hedera_signMessage',
              'hedera_getNodeAddresses',
            ],
            chains: ['hedera:testnet'],
            events: ['accountsChanged'],
            rpcMap: {
              mainnet: 'https://mainnet.hashio.io/api',
              testnet: 'https://testnet.hashio.io/api',
            },
          },
        },
      });

      console.log('connected session::', session);

      if (session) {
        setConnectedSession(session);
        setAccounts(session?.namespaces?.['hedera'].accounts);
        setIsConnected(true);

        // 세션 저장
        localStorage.setItem(
          STORED_WALLET_CONNECT_SESSION_KEY,
          JSON.stringify(session)
        );
      }
    } catch (error: unknown) {
      // error가 객체인지 확인
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error(`Error:: ${(error as { message: string }).message}`);
        alert(`Error:: ${(error as { message: string }).message}`);
      } else {
        console.error('Unknown error occurred', error);
        alert('Unknown error occurred');
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      if (!provider) {
        throw new Error('Provider를 Initializing 해주세요.');
      }

      await provider.disconnect();
      localStorage.removeItem(STORED_WALLET_CONNECT_SESSION_KEY);
      setConnectedSession(undefined);
      setAccounts([]);
      setIsConnected(false);

      // 세션 삭제
      localStorage.removeItem(STORED_WALLET_CONNECT_SESSION_KEY);
    } catch (error: unknown) {
      // error가 객체인지 확인
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error(`Error:: ${(error as { message: string }).message}`);
        alert(`Error:: ${(error as { message: string }).message}`);
      } else {
        console.error('Unknown error occurred', error);
        alert('Unknown error occurred');
      }
    }
  };

  useEffect(() => {
    handleInit();
  }, []);

  useEffect(() => {
    if (connectedSession) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectedSession]);

  return (
    <div>
      {!isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">지갑이 연결되지 않았습니다.</span>
          <button className="border px-2 py-1" onClick={handleConnect}>
            연결
          </button>
          <div className="flex flex-col justify-center items-center">
            <h3>Scan this QR code to connect your wallet:</h3>
            <canvas id="qrcode"></canvas>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">연결된 지갑</span>
          <button className="border px-2 py-1">
            <p className="text-blue-500">{accounts?.[0] || ''}</p>
          </button>
          <button className="border px-2 py-1" onClick={handleDisconnect}>
            연결 해제
          </button>
        </div>
      )}
    </div>
  );
};

export default Connector;
