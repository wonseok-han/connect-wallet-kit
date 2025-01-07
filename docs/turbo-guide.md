# Turborepo starter

This is an official starter Turborepo.

## Getting Started

```sh
npm install -g pnpm
pnpm install
```

## Turborepo Initializing

```sh
npx create-turbo@latest
```

## 앱 생성

```sh
npx create-next-app apps/앱명
```

## 워크스페이스 생성

- 어떤 경로에서든 실행 가능

```sh
npx turbo gen workspace --name 워크스페이스명
```

## 종속성 추가

- root 경로에서 실행

```sh
pnpm add 패키지명 --filter 앱명
```

## root 경로에서 글로벌 패키지 설치

```sh
pnpm add -w 패키지명
```

## 패키지/앱에 종속되는 패키지 설치

- 해당 패키지/앱 경로로 이동해서 실행

```sh
pnpm add 패키지명
```

## 실행

```sh
pnpm run dev:ad
```
