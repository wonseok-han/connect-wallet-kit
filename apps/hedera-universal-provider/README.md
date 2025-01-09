# Getting Started

- @walletconnect/universal-provider 라이브러리로 hedera 지갑을 연결해 hedera sdk 기반으로 전송 트랜잭션이 정상 동작하는지 확인하기 위한 초간단 앱

## 환경변수

- `.env` 파일에 하기 명시된 환경변수를 적용합니다.

```plaintext
NEXT_PUBLIC_PROJECT_ID=WalletConnect Project ID
NEXT_PUBLIC_SYSTEM_ACCOUNT=Hedera Wallet Operator Account
NEXT_PUBLIC_SYSTEM_PRIVATE_KEY=Hedera Wallet Operator PrivateKey
```

## 실행

```bash
# Module Install
pnpm install

# Server start
pnpm run dev
```
