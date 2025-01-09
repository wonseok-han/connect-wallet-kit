import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="font-extrabold text-2xl">My Hedera Wallet Test Sites</h1>
      <main className="flex flex-col gap-8 row-start-2 sm:items-start w-full">
        <div className="border rounded-md p-3 w-full">
          <span className="font-semibold">
            WalletConnect Appkit With Hedera
          </span>
          <ul className="list-inside list-disc">
            <li>
              <Link
                href="https://connect-wallet-kit-appkit.vercel.app/"
                target="_blank"
              >
                이동하기
              </Link>
            </li>
          </ul>
        </div>
        <div className="border rounded-md p-3 w-full">
          <span className="font-semibold">Hedera Metamask Snap Test</span>
          <ul className="list-inside list-disc">
            <li>
              <Link
                href="https://connect-wallet-kit-metamask-snap.vercel.app/"
                target="_blank"
              >
                이동하기
              </Link>
            </li>
          </ul>
        </div>
        <div className="border rounded-md p-3 w-full">
          <span className="font-semibold">
            WalletConnect UniversalProvider and SignClient With Hedera Test
          </span>
          <ul className="list-inside list-disc">
            <li>
              <Link
                href="https://connect-wallet-kit-universal-provider.vercel.app/"
                target="_blank"
              >
                이동하기
              </Link>
            </li>
          </ul>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {`© ${new Date().getFullYear()} wonseok-han's page`}
      </footer>
    </div>
  );
}
