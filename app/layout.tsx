import './globals.css'

export const metadata = {
  title: 'Solana NFT Transfer App',
  description: 'This project is a simple web application that allows users to connect their Phantom wallet to the Solana blockchain and transfer an NFT to a target address.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="night">
      <body>{children}</body>
    </html>
  )
}
