# Connect Wallet Kit

- 다양한 방법으로 hedera 지갑을 연결하고, 토큰 전송 트랜잭션이 정상 동작하는지를 확인하기 위한 토이 프로젝트

## 개발 환경

- NodeJS: `v22.12.0` (LTS)
- PackageManager: `pnpm`

## Getting Started

### 실행

```bash
# Module Install
pnpm install

# Server start Hedera Wallet Test Sites
pnpm run dev:web

# Server start WalletConnect Appkit With Hedera
pnpm run dev:appkit

# Server start Hedera Metamask Wallet Snap
pnpm run dev:snap

# Server start WalletConnect UniversalProvider and SignClient With Hedera
pnpm run dev:provider
```

### 배포 환경

- [**vercel**](https://vercel.com/)

### 배포 사이트

- [케이스별 URL 정리 사이트](https://connect-wallet-kit-guide-web.vercel.app/)
- [WalletConnect Appkit With Hedera](https://connect-wallet-kit-appkit.vercel.app/)
- [Hedera Metamask Wallet Snap](https://connect-wallet-kit-metamask-snap.vercel.app/)
- [WalletConnect UniversalProvider and SignClient With Hedera](https://connect-wallet-kit-universal-provider.vercel.app/)

## Reference

* [https://docs.reown.com/appkit/next/core/installation](https://docs.reown.com/appkit/next/core/installation)
* [https://github.com/hashgraph/hedera-metamask-snaps](https://github.com/hashgraph/hedera-metamask-snaps)
* [https://docs.hedera.com/hedera/open-source-solutions/hedera-wallet-snap-by-metamask](https://docs.hedera.com/hedera/open-source-solutions/hedera-wallet-snap-by-metamask)
* [https://docs.reown.com/advanced/providers/universal](https://docs.reown.com/advanced/providers/universal)
* [https://docs.reown.com/advanced/multichain/rpc-reference/hedera-rpc](https://docs.reown.com/advanced/multichain/rpc-reference/hedera-rpc)
