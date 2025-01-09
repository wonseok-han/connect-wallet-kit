'use client';

import {
  AccountId,
  Client,
  EthereumTransaction,
  PrivateKey,
} from '@hashgraph/sdk';
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit/react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NETWORK = 'testnet';

const ABI_ERC_20 = [
  {
    constant: true,
    inputs: [
      {
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const Connector = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } =
    useAppKitProvider<ethers.Eip1193Provider>('eip155');

  const [receiptAddress, setReceiptAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txMemo, setTxMemo] = useState('');
  const [afterTransferText, setAfterTransferText] = useState('');
  const [afterTxLink, setAfterTxLink] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleAppkitSendTransaction = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();

    // const usdcContractAddress =
    //   '0x0000000000000000000000000000000000068cda'; // Hedera 네트워크에서 USDC 컨트랙트 주소로 교체하세요.

    // // ABI 인코딩: transfer(recipient, amount)
    // const transferMethod = '0xa9059cbb'; // transfer 함수의 4바이트 시그니처
    const paddedRecipient = receiptAddress;
    //   .replace('0x', '')
    //   .padStart(64, '0'); // 수신자 주소 64바이트로 패딩
    // const amountInWei = BigInt(Number('1') * 10 ** 6); // 1 USDC -> 최소 단위로 변환
    // const paddedAmount = amountInWei.toString(16).padStart(64, '0'); // 64바이트 패딩

    // const data = `${transferMethod}${paddedRecipient}${paddedAmount}`;

    // const txData = {
    //   from: accountId,
    //   to: usdcContractAddress,
    //   data: data,
    //   gas: '100000', // ERC-20 전송을 위한 적절한 가스 한도
    // };

    // const transaction = await signer.sendTransaction(txData);
    // const receipt = await transaction.wait();

    const USDCContract = new ethers.Contract(
      '0x0000000000000000000000000000000000068cda',
      ABI_ERC_20,
      signer
    );
    const parsedAmount = ethers.parseUnits(amount, 6);

    const data = USDCContract.interface.encodeFunctionData('transfer', [
      paddedRecipient,
      parsedAmount,
    ]);
    const tx = {
      to: '0x0000000000000000000000000000000000068cda', // 컨트랙트 주소
      data,
    };

    setIsLoading(true);
    const transaction = await signer.sendTransaction(tx);
    const receipt = await transaction.wait();

    console.log('결과::', receipt);

    if (receipt) {
      setAfterTransferText(receipt.hash);
      setAfterTxLink(
        `https://hashscan.io/${NETWORK}/transaction/${receipt.hash}`
      );
    }
  };

  const handleHederaSdkEthereumTransaction = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();

    const paddedRecipient = '0x1e6b24a40e7a352da76ce059e39e874000fbdd4d';
    const USDCContract = new ethers.Contract(
      '0x0000000000000000000000000000000000068cda',
      ABI_ERC_20,
      signer
    );
    const parsedAmount = ethers.parseUnits('1', 6);

    const data = USDCContract.interface.encodeFunctionData('transfer', [
      paddedRecipient,
      parsedAmount,
    ]);
    const dataAsUint8Array = ethers.getBytes(data);
    // const signedTransaction = await signer.signTransaction({
    //   to: '0x0000000000000000000000000000000000068cda',
    //   value: 0,
    //   gasLimit: 21000,
    //   gasPrice: ethers.parseUnits('20', 'gwei'),
    //   data: data,
    // });
    // const signedTransactionAsUint8Array = ethers.getBytes(signedTransaction);

    const operatorAccount = AccountId.fromString('0.0.536252');
    const operatorPrivateKey = PrivateKey.fromStringECDSA(
      '0xe1a36afd0416217b81001132e582292ac343c8623e962130ebc0f6056c8ad847'
    );
    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);
    const transaction = await new EthereumTransaction()
      .setEthereumData(dataAsUint8Array)
      .setTransactionMemo('과연되나')
      .freezeWith(client);
    // .addTokenTransfer(tokenId, signer.getAccountId(), -parsedAmount) // Negative for sender
    // .addTokenTransfer(tokenId, recipient, parsedAmount) // Positive for receiver
    // .setTransactionMemo('')
    // .freezeWithSigner(signer);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log('Transaction Receipt:', receipt);
    console.log('TransactionId:', txResponse.transactionId);
  };

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
            WalletConnectV2 기반의 Appkit{' '}
            <em>
              <b>{`"@reown/appkit": "^1.6.3"`}</b>
            </em>{' '}
            라이브러리 사용
          </li>
          <li>
            최신의 Appkit 버전에서 HashPack 브라우저 확장 프로그램은 감지되지도
            않고, 이더리움 트랜잭션이 기능하지 않습니다.
          </li>
          <li>
            HashPack 연결까지는 가능할지몰라도 이더리움 기반 Provider를 가지고
            있으며, Signer가 호환되지 않습니다.
          </li>
          <li>
            Wallypto 지갑 또한 설정에서는 지갑 연결을 지원하는 것 같이 보이지만
            2025.01.03 일자 스토어에 배포되있는 앱으로 확인했을 때 지원하지 않는
            블록체인 네트워크로 인식됩니다. 에러발생 <u>(2025.01.09 재확인)</u>
            <div className="flex gap-2">
              <Image
                alt="error1"
                height={0}
                loading="lazy"
                src="/assets/images/wallypto_connect_error_web.png"
                width={200}
                style={{
                  height: '100%',
                }}
              />
              <Image
                alt="error2"
                height={0}
                loading="lazy"
                src="/assets/images/wallypto_connect_error.png"
                width={200}
                style={{
                  height: '100%',
                }}
              />
            </div>
          </li>
          <li>
            작년에 사용했던 EthereumProvider 또한 더이상 사용되지 않는다고
            되어있습니다.
            <ul className="list-decimal list-inside px-2">
              <li>
                <Link
                  href="https://docs.reown.com/advanced/providers/ethereum#use-with-appkit"
                  target="_blank"
                >
                  https://docs.reown.com/advanced/providers/ethereum#use-with-appkit
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.reown.com/advanced/walletconnect-deprecations"
                  target="_blank"
                >
                  https://docs.reown.com/advanced/walletconnect-deprecations
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {!isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">지갑이 연결되지 않았습니다.</span>
          <button
            className="border px-2 py-1"
            onClick={() => {
              open();
            }}
          >
            연결
          </button>
        </div>
      )}

      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">연결된 지갑</span>
          <button
            className="border px-2 py-1"
            onClick={() => {
              open({ view: 'Account' });
            }}
          >
            <p className="text-blue-500">{address}</p>
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
              placeholder="전송할 USDC 수량을 입력해주세요."
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
          <span className="font-semibold">appkit 기반</span>
          <button
            className="border px-2 py-1 bg-gray-700 text-white"
            onClick={handleAppkitSendTransaction}
          >
            USDC 전송 (setTransactionMemo 안됨, HashPack 안됨)
          </button>
        </div>
      )}
      {isConnected && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">hedera sdk 기반</span>
          <button
            className="border px-2 py-1 bg-gray-700 text-red-500"
            onClick={handleHederaSdkEthereumTransaction}
          >
            USDC 전송 (현재 동작 안함)
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
