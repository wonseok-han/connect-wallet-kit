'use client';

import {
  AccountId,
  Client,
  Hbar,
  LedgerId,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
  TransactionId,
  TransferTransaction,
} from '@hashgraph/sdk';
import { SignClient } from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

const STORED_WALLET_CONNECT_SESSION_KEY = 'walletconnect-session';
const NETWORK = 'testnet';

const Connector = () => {
  const [provider, setProvider] = useState<UniversalProvider>();
  const [sessionLink, setSessionLink] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedSession, setConnectedSession] =
    useState<SessionTypes.Struct>();

  const [accounts, setAccounts] = useState<string[]>([]);

  const [receiptAddress, setReceiptAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txMemo, setTxMemo] = useState('');
  const [afterTransferText, setAfterTransferText] = useState('');
  const [afterTxLink, setAfterTxLink] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleInit = async () => {
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
    const METADATA = {
      name: 'WalletConnect UniversalProvider With Hedera',
      description: 'React App for WalletConnect UniversalProvider With Hedera',
      url: 'https://connect-wallet-kit-universal-provider.vercel.app',
      icons: [
        'https://connect-wallet-kit-universal-provider.vercel.app/vercel.svg',
      ],
    };

    // 1. SignClient 초기화
    const signClient = await SignClient.init({
      projectId: projectId,
      metadata: METADATA,
    });

    // 2. UniversalProvider 초기화
    const providerInstance = await UniversalProvider.init({
      logger: 'info',
      projectId: projectId,
      metadata: METADATA,
      client: signClient,
    });

    // 세션이 저장된 경우 복원
    const storedSession = localStorage.getItem(
      STORED_WALLET_CONNECT_SESSION_KEY
    );
    if (storedSession) {
      const session = JSON.parse(storedSession) as SessionTypes.Struct;
      console.log('stored session::', session);

      providerInstance.session = {
        ...session,
      };
      setConnectedSession(session);

      const acocunts = session?.namespaces?.['hedera'].accounts.map(
        (account) => {
          const [network, chain, address] = account.split(':');
          console.log(
            `Network is ${network}.. and Chain is ${chain}.. and Account is ${address}..`
          );
          return address;
        }
      );
      setAccounts(acocunts);
    }

    setProvider(providerInstance);
  };

  const handleConnect = async () => {
    try {
      if (!provider) {
        throw new Error('Provider를 Initializing 해주세요.');
      }

      provider.on('display_uri', (uri: string) => {
        console.log('display_uri', uri);

        setSessionLink(uri);

        QRCode.toCanvas(document.getElementById('qrcode'), uri, (error) => {
          if (error) {
            console.error('Failed to generate QR code:', error);
          }
        });
      });

      // Subscribe to session ping
      provider.on(
        'session_ping',
        ({ id, topic }: { id: string; topic: string }) => {
          console.log('session_ping', id, topic);
        }
      );

      // Subscribe to session event
      provider.on(
        'session_event',
        ({ chainId, event }: { chainId: string; event: unknown }) => {
          console.log('session_event', event, chainId);
        }
      );

      // Subscribe to session update
      provider.on(
        'session_update',
        ({ params, topic }: { params: unknown; topic: string }) => {
          console.log('session_update', topic, params);
        }
      );

      // Subscribe to session delete
      provider.on(
        'session_delete',
        ({ id, topic }: { id: string; topic: string }) => {
          console.log('session_delete', id, topic);
        }
      );

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
            defaultChain: 'hedera:testnet',
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
        const walletName = session.peer.metadata.name;
        const allowedWallets = ['HashPack', 'Wallypto'];
        if (!allowedWallets.includes(walletName)) {
          throw new Error(
            '지원하지 않는 지갑입니다. HashPack, Wallypto만 지원합니다.'
          );
        }
        setConnectedSession(session);

        const acocunts = session?.namespaces?.['hedera'].accounts.map(
          (account) => {
            const [network, chain, address] = account.split(':');
            console.log(
              `Network is ${network}.. and Chain is ${chain}.. and Account is ${address}..`
            );
            return address;
          }
        );
        setAccounts(acocunts);

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

      setSessionLink('');
      setReceiptAddress('');
      setAmount('');
      setTxMemo('');
      setAfterTransferText('');
      setAfterTxLink('');

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

  const handleHederaSendUSDC = async () => {
    try {
      const operatorAccount = process.env.NEXT_PUBLIC_SYSTEM_ACCOUNT;
      const operatorPrivateKey = process.env.NEXT_PUBLIC_SYSTEM_PRIVATE_KEY;

      if (!provider || !connectedSession || accounts.length === 0) {
        throw new Error('지갑이 연결되지 않았습니다.');
      }

      if (!operatorAccount || !operatorPrivateKey) {
        console.error('operatorAccount or operatorPrivateKey is not found.');
        throw new Error('operatorAccount or operatorPrivateKey is not found.');
      }

      setIsLoading(true);

      const operatorAccountID = AccountId.fromString(operatorAccount);
      const operatorPK = PrivateKey.fromStringECDSA(operatorPrivateKey);
      const client = Client.forTestnet();
      client.setOperator(operatorAccountID, operatorPK);

      const sender = accounts[0];
      const tokenDecimals = 6;
      const parsedAmount = Math.floor(
        Number(amount) * Math.pow(10, tokenDecimals)
      );

      const usdcTokenId = '0.0.429274';
      const transaction = new TransferTransaction()
        .setTransactionId(TransactionId.generate(sender))
        .addTokenTransfer(usdcTokenId, sender, -parsedAmount) // 송신 계정에서 amount만큼 차감
        .addTokenTransfer(usdcTokenId, receiptAddress, parsedAmount) // 수신 계정에 amount만큼 추가
        .setTransactionMemo(txMemo)
        .freezeWith(client); // 트랜잭션 고정

      console.log('transaction::', transaction);

      // 트랜잭션 직렬화 (base64 인코딩)
      const transactionBytes = transaction.toBytes();
      const transactionBase64 =
        Buffer.from(transactionBytes).toString('base64');

      const LEDGER_ID_MAPPINGS: [LedgerId, number, string][] = [
        [LedgerId.MAINNET, 295, 'hedera:mainnet'],
        [LedgerId.TESTNET, 296, 'hedera:testnet'],
        [LedgerId.PREVIEWNET, 297, 'hedera:previewnet'],
        [LedgerId.LOCAL_NODE, 298, 'hedera:devnet'],
      ];
      const DEFAULT_CAIP = LEDGER_ID_MAPPINGS[3][2];
      const ledgerIdToCAIPChainId = (ledgerId: LedgerId): string => {
        for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
          const [ledgerId_, , chainId] = LEDGER_ID_MAPPINGS[i];
          if (ledgerId.toString() === ledgerId_.toString()) {
            return chainId;
          }
        }
        return DEFAULT_CAIP;
      };

      const result = (await provider.client.request({
        topic: connectedSession.topic,
        request: {
          method: 'hedera_signAndExecuteTransaction',
          params: {
            signerAccountId: `hedera:testnet:${sender}`,
            transactionList: transactionBase64,
          },
        },
        chainId: ledgerIdToCAIPChainId(LedgerId.TESTNET),
      })) as {
        nodeId: `0.0.${string}`;
        transactionHash: string;
        transactionId: `0.0.${string}`;
      };

      // const result = (await provider.request(
      //   {
      //     method: 'hedera_signAndExecuteTransaction',
      //     params: {
      //       signerAccountId: `hedera:testnet:${sender}`,
      //       transactionList: transactionBase64,
      //     },
      //   },
      //   'hedera:testnet'
      // )) as {
      //   nodeId: `0.0.${string}`;
      //   transactionHash: string;
      //   transactionId: `0.0.${string}`;
      // };

      console.log('Transaction result:', result);

      if (result) {
        setAfterTransferText(result.transactionId);
        setAfterTxLink(
          `https://hashscan.io/${NETWORK}/transaction/${result.transactionId}`
        );
      }
    } catch (error: unknown) {
      setIsLoading(false);

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

  const handleHederaSendHBAR = async () => {
    try {
      const operatorAccount = process.env.NEXT_PUBLIC_SYSTEM_ACCOUNT;
      const operatorPrivateKey = process.env.NEXT_PUBLIC_SYSTEM_PRIVATE_KEY;

      if (!provider || !connectedSession || accounts.length === 0) {
        throw new Error('지갑이 연결되지 않았습니다.');
      }

      if (!operatorAccount || !operatorPrivateKey) {
        console.error('operatorAccount or operatorPrivateKey is not found.');
        throw new Error('operatorAccount or operatorPrivateKey is not found.');
      }

      setIsLoading(true);

      const operatorAccountID = AccountId.fromString(operatorAccount);
      const operatorPK = PrivateKey.fromStringECDSA(operatorPrivateKey);
      const client = Client.forTestnet();
      client.setOperator(operatorAccountID, operatorPK);

      const sender = accounts[0];

      const hbarAmount = new Hbar(Number(amount));

      const transaction = new TransferTransaction()
        .setTransactionId(TransactionId.generate(sender))
        .addHbarTransfer(sender, hbarAmount.negated())
        .addHbarTransfer(receiptAddress, hbarAmount)
        .setTransactionMemo(txMemo)
        .freezeWith(client); // 트랜잭션 고정

      console.log('transaction::', transaction);

      // 트랜잭션 직렬화 (base64 인코딩)
      const transactionBytes = transaction.toBytes();
      const transactionBase64 =
        Buffer.from(transactionBytes).toString('base64');

      // const LEDGER_ID_MAPPINGS: [LedgerId, number, string][] = [
      //   [LedgerId.MAINNET, 295, 'hedera:mainnet'],
      //   [LedgerId.TESTNET, 296, 'hedera:testnet'],
      //   [LedgerId.PREVIEWNET, 297, 'hedera:previewnet'],
      //   [LedgerId.LOCAL_NODE, 298, 'hedera:devnet'],
      // ];
      // const DEFAULT_CAIP = LEDGER_ID_MAPPINGS[3][2];
      // const ledgerIdToCAIPChainId = (ledgerId: LedgerId): string => {
      //   for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
      //     const [ledgerId_, , chainId] = LEDGER_ID_MAPPINGS[i];
      //     if (ledgerId.toString() === ledgerId_.toString()) {
      //       return chainId;
      //     }
      //   }
      //   return DEFAULT_CAIP;
      // };

      // const result = (await provider.client.request({
      //   topic: connectedSession.topic,
      //   request: {
      //     method: 'hedera_signAndExecuteTransaction',
      //     params: {
      //       signerAccountId: `hedera:testnet:${sender}`,
      //       transactionList: transactionBase64,
      //     },
      //   },
      //   chainId: ledgerIdToCAIPChainId(LedgerId.TESTNET),
      // })) as {
      //   nodeId: `0.0.${string}`;
      //   transactionHash: string;
      //   transactionId: `0.0.${string}`;
      // };

      const result = (await provider.request(
        {
          method: 'hedera_signAndExecuteTransaction',
          params: {
            signerAccountId: `hedera:testnet:${sender}`,
            transactionList: transactionBase64,
          },
        },
        'hedera:testnet'
      )) as {
        nodeId: `0.0.${string}`;
        transactionHash: string;
        transactionId: `0.0.${string}`;
      };

      console.log('Transaction result:', result);

      if (result) {
        setAfterTransferText(result.transactionId);
        setAfterTxLink(
          `https://hashscan.io/${NETWORK}/transaction/${result.transactionId}`
        );
      }
    } catch (error: unknown) {
      setIsLoading(false);

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

  const handleHederaAssociagteUSDC = async () => {
    try {
      const operatorAccount = process.env.NEXT_PUBLIC_SYSTEM_ACCOUNT;
      // const operatorPrivateKey = process.env.NEXT_PUBLIC_SYSTEM_PRIVATE_KEY;

      if (!provider || !connectedSession || accounts.length === 0) {
        throw new Error('지갑이 연결되지 않았습니다.');
      }

      if (!operatorAccount) {
        console.error('operatorAccount is not found.');
        throw new Error('operatorAccount is not found.');
      }

      setIsLoading(true);

      const operatorAccountID = AccountId.fromString(operatorAccount);

      const client = Client.forTestnet();
      client.setOperator(operatorAccountID, PrivateKey.generate());

      const sender = accounts[0];

      const usdcTokenId = '0.0.429274';
      const transaction = new TokenAssociateTransaction()
        .setTransactionId(TransactionId.generate(sender))
        .setAccountId(sender)
        .setTokenIds([TokenId.fromString(usdcTokenId)])
        .setTransactionMemo('어쏘시에이트!')
        .freezeWith(client);

      console.log('transaction::', transaction);

      // 트랜잭션 직렬화 (base64 인코딩)
      const transactionBytes = transaction.toBytes();
      const transactionBase64 =
        Buffer.from(transactionBytes).toString('base64');

      const LEDGER_ID_MAPPINGS: [LedgerId, number, string][] = [
        [LedgerId.MAINNET, 295, 'hedera:mainnet'],
        [LedgerId.TESTNET, 296, 'hedera:testnet'],
        [LedgerId.PREVIEWNET, 297, 'hedera:previewnet'],
        [LedgerId.LOCAL_NODE, 298, 'hedera:devnet'],
      ];
      const DEFAULT_CAIP = LEDGER_ID_MAPPINGS[3][2];
      const ledgerIdToCAIPChainId = (ledgerId: LedgerId): string => {
        for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
          const [ledgerId_, , chainId] = LEDGER_ID_MAPPINGS[i];
          if (ledgerId.toString() === ledgerId_.toString()) {
            return chainId;
          }
        }
        return DEFAULT_CAIP;
      };

      const result = (await provider.client.request({
        topic: connectedSession.topic,
        request: {
          method: 'hedera_signAndExecuteTransaction',
          params: {
            signerAccountId: `hedera:testnet:${sender}`,
            transactionList: transactionBase64,
          },
        },
        chainId: ledgerIdToCAIPChainId(LedgerId.TESTNET),
      })) as {
        nodeId: `0.0.${string}`;
        transactionHash: string;
        transactionId: `0.0.${string}`;
      };

      console.log('Transaction result:', result);

      if (result) {
        setAfterTransferText(result.transactionId);
        setAfterTxLink(
          `https://hashscan.io/${NETWORK}/transaction/${result.transactionId}`
        );
      }
    } catch (error: unknown) {
      setIsLoading(false);

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

  useEffect(() => {
    if (afterTransferText) {
      setIsLoading(false);
    }
  }, [afterTransferText]);

  return (
    <div>
      <div className="border rounded-md p-3">
        <span className="font-semibold">참고</span>
        <ul className="list-disc list-inside">
          <li>
            WalletConnectV2 기반의 멀티체인을 지원하는 UniversalProvider{' '}
            <em>
              <b>{`"@walletconnect/universal-provider": "^2.17.3"`}</b>
            </em>
            와{' '}
            <em>
              <b>{`"@walletconnect/sign-client": "^2.17.3"`}</b>
            </em>{' '}
            라이브러리를 연동해서 사용
          </li>
          <li>
            HashPack과 Wallypto 지갑이 연결되는 것까지는 확인 가능. 하지만
            HashPack 연결시 토큰 전송이 정상적으로 동작하는 반면, Wallypto는
            트랜잭션 서명 시도시{' '}
            <em>
              <b>{`ReownCoreError(code: 4001, message: User rejected., data: null)`}</b>
            </em>{' '}
            에러 발생 <u>(2025.01.09 일자에서 확인)</u>
            <Image
              alt="error"
              height={0}
              loading="lazy"
              src="/assets/images/wallypto_tx_error.png"
              width={200}
              style={{
                height: '100%',
              }}
            />
          </li>
          <li>
            WalletConnect UniversalProvider 가이드
            <ul className="list-decimal list-inside px-2">
              <li>
                <Link
                  className="text-blue-500"
                  href="https://docs.reown.com/advanced/providers/universal"
                  target="_blank"
                >
                  https://docs.reown.com/advanced/providers/universal
                </Link>
              </li>
              <li>
                <Link
                  className="text-blue-500"
                  href="https://docs.reown.com/advanced/multichain/rpc-reference/hedera-rpc"
                  target="_blank"
                >
                  https://docs.reown.com/advanced/multichain/rpc-reference/hedera-rpc
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {!isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">지갑이 연결되지 않았습니다.</span>
          <button className="border px-2 py-1" onClick={handleConnect}>
            연결
          </button>
          <div className="flex flex-col justify-center items-center">
            <h3>Scan this QR code to connect your wallet:</h3>
            {sessionLink && (
              <Link
                href={`https://link.hashpack.app/${sessionLink}`}
                target="_blank"
              >
                <p className="text-blue-500">HashPack DeepLink</p>
              </Link>
            )}

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

      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">전송 전 데이터 입력</span>
          <div className="flex gap-1">
            <input
              className="border rounded-sm p-2 flex-grow"
              placeholder="전송받을 Account를 입력해주세요."
              value={receiptAddress}
              onChange={(event) => setReceiptAddress(event.target.value)}
            />
            <button
              className="border px-2 py-1"
              onClick={() =>
                setReceiptAddress('0x1e6b24a40e7a352da76ce059e39e874000fbdd4d')
              }
            >
              자동 완성
            </button>
          </div>
          <div className="flex gap-1">
            <input
              className="border rounded-sm p-2 flex-grow"
              placeholder="전송할 USDC/HBAR 수량을 입력해주세요."
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <button
              className="border px-2 py-1"
              onClick={() => setAmount('0.1')}
            >
              자동 완성
            </button>
          </div>
          <div className="flex gap-1">
            <input
              className="border rounded-sm p-2 flex-grow"
              placeholder="Transaction Memo를 입력해주세요."
              value={txMemo}
              onChange={(event) => setTxMemo(event.target.value)}
            />
            <button
              className="border px-2 py-1"
              onClick={() => setTxMemo('제대로 들어가니!?')}
            >
              자동 완성
            </button>
          </div>
        </div>
      )}
      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">hedera/sdk and HIP-820 기반</span>
          <button
            className="border px-2 py-1 bg-gray-700 text-white"
            onClick={handleHederaSendUSDC}
          >
            USDC 전송
          </button>
        </div>
      )}

      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">hedera/sdk and HIP-820 기반</span>
          <button
            className="border px-2 py-1 bg-gray-700 text-white"
            onClick={handleHederaSendHBAR}
          >
            HBAR 전송
          </button>
        </div>
      )}

      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">hedera/sdk and HIP-820 기반</span>
          <button
            className="border px-2 py-1 bg-gray-700 text-white"
            onClick={handleHederaAssociagteUSDC}
          >
            USDC Associate
          </button>
        </div>
      )}

      {isLoading && (
        <div className="font-semibold text-red-600">기다려주세요...</div>
      )}

      {afterTransferText && (
        <div className="mt-4">
          <span className="font-semibold">USDC 전송 결과</span>
          <Link href={afterTxLink} target="_blank">
            <p className="text-blue-500">{afterTransferText}</p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Connector;
