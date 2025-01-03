'use client';

import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit/react';
import {
  AccountId,
  Client,
  EthereumTransaction,
  PrivateKey,
  TokenId,
} from '@hashgraph/sdk';
import { ethers } from 'ethers';
import { useState } from 'react';

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

const Connect = () => {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const { walletProvider } =
    useAppKitProvider<ethers.Eip1193Provider>('eip155');

  const [txHash, setTxHash] = useState('');

  const handleAppkitSendTransaction = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const accountId = signer.getAddress();

    // const usdcContractAddress =
    //   '0x0000000000000000000000000000000000068cda'; // Hedera 네트워크에서 USDC 컨트랙트 주소로 교체하세요.

    // // ABI 인코딩: transfer(recipient, amount)
    // const transferMethod = '0xa9059cbb'; // transfer 함수의 4바이트 시그니처
    const paddedRecipient = '0x1e6b24a40e7a352da76ce059e39e874000fbdd4d';
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
    const parsedAmount = ethers.parseUnits('1', 6);

    const data = USDCContract.interface.encodeFunctionData('transfer', [
      paddedRecipient,
      parsedAmount,
    ]);
    const tx = {
      to: '0x0000000000000000000000000000000000068cda', // 컨트랙트 주소
      data,
    };

    const transaction = await signer.sendTransaction(tx);
    const receipt = await transaction.wait();

    console.log('결과::', receipt);

    // if (hash) {
    //   setTxHash(hash);
    // }
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <h1>Appkit</h1>
      <div
        style={{
          display: 'flex',
          gap: '10px',
        }}
      >
        {!isConnected && (
          <button
            onClick={() => {
              open();
            }}
          >
            연결
          </button>
        )}
        {isConnected && (
          <button
            onClick={() => {
              open({ view: 'Account' });
            }}
          >
            해제
          </button>
        )}
        {isConnected && (
          <button onClick={handleAppkitSendTransaction}>
            appkit 기반 1 USDC 전송
          </button>
        )}
        {isConnected && (
          <button onClick={handleHederaSdkEthereumTransaction}>
            hedera sdk 기반 1 USDC 전송
          </button>
        )}
        <div>{txHash}</div>
      </div>
    </div>
  );
};

export default Connect;
