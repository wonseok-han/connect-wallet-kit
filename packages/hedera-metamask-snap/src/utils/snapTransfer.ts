type SnapTransferArgsType = {
  network: 'testnet' | 'previewnet' | 'mainnet';
  snapId: any;
  to: string;
  amount: string;
  assetType: 'TOKEN' | 'HBAR';
  maxFee: number;
  memo: string;
  mirrorNodeUrl: string;
};

export const snapTransfer = async ({
  network,
  snapId,
  to,
  amount,
  assetType,
  maxFee,
  memo,
  mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com',
}: SnapTransferArgsType) => {
  console.log(`\n=======================================`);
  console.log(`- Invoking transferCrypto...🟠`);

  let outText;

  const parsedAmount = parseFloat(amount);

  const transfers = [
    {
      assetType,
      to,
      amount: parsedAmount,
    },
  ];

  try {
    const response = await window.ethereum?.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: {
          method: 'transferCrypto',
          params: {
            network,
            mirrorNodeUrl,
            transfers,
            memo,
            maxFee,
            // accountIdOrEvmAddress: receiverAddress,
            // curve: "ECDSA_SECP256K1",
          },
        },
      },
    });

    console.log('Transfer Response::', response);

    outText = `Transfer successful ✅ | Get the snap account info again to see the updated balance!`;
    console.log(`- ${outText}`);
  } catch (e) {
    outText = `Transaction failed. Try again 🛑`;
    console.log(`- Transfer failed 🛑: ${JSON.stringify(e, null, 4)}`);
  }

  return outText;
};
