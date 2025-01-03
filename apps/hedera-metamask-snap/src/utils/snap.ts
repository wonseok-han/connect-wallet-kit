export const installSnap = async (snapId: string) => {
  if (!snapId) return;

  console.log(`\n=======================================`);
  console.log(`- Installing Hedera Wallet Snap...🟠`);

  console.log(`SnapId: ${snapId}`);

  let outText;
  let snaps = await window.ethereum.request({
    method: 'wallet_getSnaps',
  });
  console.log('Installed snaps...', snaps);

  try {
    if (!(snapId in snaps)) {
      console.log('Hedera Wallet Snap is not yet installed. Installing now...');
      const result = await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
          [snapId]: {},
        },
      });
      console.log('result: ', result);
      snaps = await window.ethereum.request({
        method: 'wallet_getSnaps',
      });
    }
  } catch (e) {
    console.log(
      `Failed to obtain installed snap: ${JSON.stringify(e, null, 4)}`
    );
    alert(`Failed to obtain installed snap: ${JSON.stringify(e, null, 4)}`);
  }

  if (snapId in snaps) {
    outText = 'Snap installed ✅';
    console.log(`- Snap installed successfully ✅`);
    alert('Snap installed successfully!');
  } else {
    console.log('Could not connect successfully. Please try again!');
    alert('Could not connect successfully. Please try again!');
  }
  return outText;
};

export const getSnapAccountInfo = async (network: string, snapId: string) => {
  console.log(`\n=======================================`);
  console.log(`- Invoking GetAccountInfo...🟠`);

  let outText;
  let snapAccountEvmAddress;
  let snapAccountBalance;

  try {
    const response = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: {
          method: 'getAccountInfo',
          params: {
            network: network,
            mirrorNodeUrl: `https://${network}.mirrornode.hedera.com`,
          },
        },
      },
    });

    snapAccountEvmAddress = response.accountInfo.evmAddress;
    snapAccountBalance = response.accountInfo.balance.hbars;
    outText = `${snapAccountEvmAddress} has ${snapAccountBalance} ℏ ✅`;
  } catch (e: any) {
    snapAccountEvmAddress = e.message.match(/0x[a-fA-F0-9]{40}/)[0];
    outText = `Go to MetaMask and transfer HBAR to the snap address to activate it: ${snapAccountEvmAddress} 📤`;
  }

  console.log(`- ${outText}}`);
  console.log(`- Got account info ✅`);

  return { snapAccountEvmAddress, outText };
};

type SnapTransferArgsType = {
  network: 'testnet' | 'previewnet' | 'mainnet';
  snapId: string;
  to: string;
  amount: string;
  assetType: 'TOKEN' | 'HBAR';
  maxFee: number;
  memo: string;
  mirrorNodeUrl?: string;
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
  let outResponse;

  const parsedAmount = parseFloat(amount);

  const transfers = [
    {
      assetType,
      to,
      amount: parsedAmount,
      assetId: '0.0.429274',
    },
  ];

  try {
    const response = await window.ethereum.request({
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

    outText = `Transfer successful ✅ txHash is ${response.receipt.transactionHash}`;
    outResponse = response;

    console.log(`- ${outText}`);
  } catch (e) {
    outText = `Transaction failed. Try again 🛑`;
    console.log(`- Transfer failed 🛑: ${JSON.stringify(e, null, 4)}`);
  }

  return { response: outResponse, outText };
};
