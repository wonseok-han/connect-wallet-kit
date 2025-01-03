'use client';

import { connectWallet } from '@/utils/connect-wallet';
import { getSnapAccountInfo, installSnap, snapTransfer } from '@/utils/snap';
import { BrowserProvider } from 'ethers';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const NETWORK = 'testnet';
const SNAP_ID = 'npm:@hashgraph/hedera-wallet-snap';

const Connector = () => {
  const [account, setAccount] = useState('');
  const [, setConnectedProvider] = useState<BrowserProvider>();

  const [snapInstallText, setSnapInstallText] = useState('');
  const [snapInfoText, setInfoText] = useState('');
  const [snapAddressLink, setAddressLink] = useState('');

  const [receiptAddress, setReceiptAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txMemo, setTxMemo] = useState('');

  const [afterTransferText, setAfterTransferText] = useState('');
  const [afterTxLink, setAfterTxLink] = useState('');

  const handleConnectWallet = async () => {
    if (account) return;

    const { account: newAccount, provider } = await connectWallet(NETWORK);
    if (newAccount) {
      setAccount(newAccount);
      setConnectedProvider(provider);
    }
  };

  const handleInstallSnap = async () => {
    if (!account) return;

    const newSnapInstallText = await installSnap(SNAP_ID);
    if (newSnapInstallText) {
      setSnapInstallText(newSnapInstallText);
    }
  };

  const handleGetSnapAccountInfo = async () => {
    if (!account || !snapInstallText) return;

    const { snapAccountEvmAddress, outText } = await getSnapAccountInfo(
      NETWORK,
      SNAP_ID
    );

    if (snapAccountEvmAddress && outText) {
      setInfoText(outText);
      setAddressLink(
        `https://hashscan.io/${NETWORK}/address/${snapAccountEvmAddress}`
      );
    }
  };

  const handleTransferUSDC = async () => {
    if (!account || !snapInstallText || !snapAddressLink) return;

    const { response, outText } = await snapTransfer({
      network: NETWORK,
      snapId: SNAP_ID,
      to: receiptAddress,
      amount: amount,
      assetType: 'TOKEN',
      maxFee: 0.05,
      memo: txMemo,
    });

    if (response && outText) {
      setAfterTransferText(outText);
      setAfterTxLink(
        `https://hashscan.io/${NETWORK}/transaction/${response.receipt.transactionHash}`
      );
    }
  };

  useEffect(() => {
    if (account) {
      handleInstallSnap();
    }
  }, [account]);

  useEffect(() => {
    if (snapInstallText) {
      handleGetSnapAccountInfo();
    }
  }, [snapInstallText]);

  return (
    <div>
      <div className="border rounded-md p-3">
        <span className="font-semibold">참고</span>
        <Link
          href="https://docs.hedera.com/hedera/open-source-solutions/hedera-wallet-snap-by-metamask"
          target="_blank"
        >
          <p>
            https://docs.hedera.com/hedera/open-source-solutions/hedera-wallet-snap-by-metamask
          </p>
        </Link>
        <ul className="list-disc list-inside">
          <li>블록체인에 친숙하지 않은 유저들에 대해 사용이 복잡합니다.</li>
          <li>
            자신의 헤데라 지갑을 가지고 있으면서 Metamask에 스냅이 추가되며,
            Transfer시 가스비나 토큰이 스냅에 존재해야합니다. 즉, 관리 포인트가
            본인의 지갑과 스냅 2개가 됩니다.
          </li>
        </ul>
      </div>
      {!account ? (
        <button className="border px-2 py-1" onClick={handleConnectWallet}>
          연결
        </button>
      ) : (
        <div className="border rounded-md p-3">
          <span className="font-semibold">연결된 지갑</span>
          <p>{account}</p>
        </div>
      )}

      {account && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">Snap 설치 여부 및 지갑 정보</span>
          {snapInstallText ? (
            <div className="flex flex-col gap-3">
              <p>{snapInstallText}</p>
              <div>
                <span className="font-semibold">Snap 정보</span>
                <Link href={snapAddressLink} target="_blank">
                  <p className="text-blue-500">{snapInfoText}</p>
                </Link>
              </div>
            </div>
          ) : (
            <button className="border px-2 py-1" onClick={handleInstallSnap}>
              Snap 설치
            </button>
          )}
        </div>
      )}

      {account && snapAddressLink && (
        <div className="border rounded-md p-3 flex flex-col">
          <span className="font-semibold">USDC 전송</span>
          <div className="flex gap-1">
            <input
              className="border rounded-sm p-2"
              placeholder="전송받을 Account를 입력해주세요."
              value={receiptAddress}
              onChange={(event) => setReceiptAddress(event.target.value)}
            />
            <button
              className="border px-2 py-1"
              onClick={() => setReceiptAddress('0.0.3608562')}
            >
              자동 완성
            </button>
          </div>
          <div className="flex gap-1">
            <input
              className="border rounded-sm p-2"
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
              className="border rounded-sm p-2"
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
          <button
            className="border px-2 py-1 bg-gray-700 text-white mt-4"
            onClick={handleTransferUSDC}
          >
            USDC 전송
          </button>

          {afterTransferText && (
            <div className="mt-4">
              <span className="font-semibold">USDC 전송 결과</span>
              <Link href={afterTxLink} target="_blank">
                <p className="text-blue-500">{afterTransferText}</p>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Connector;
