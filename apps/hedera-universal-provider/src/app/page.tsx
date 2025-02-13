import Connector from './_components/connector';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="font-extrabold text-2xl">
        WalletConnect UniversalProvider and SignClient With Hedera
      </h1>
      <main className="flex flex-col gap-8 row-start-2 sm:items-start">
        <Connector />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {`© ${new Date().getFullYear()} wonseok-han's page`}
      </footer>
    </div>
  );
}
