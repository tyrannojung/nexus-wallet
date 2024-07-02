import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@/css/globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'], // 사용할 weight 설정
  style: 'normal', // 사용할 스타일 설정
  subsets: ['latin'], // 필요한 언어 서브셋 설정
  preload: true, // 사전 로드 옵션
});

export const metadata: Metadata = {
  title: 'Nexus Wallet',
  description:
    'Nexus Wallet is an advanced hybrid cryptocurrency wallet that integrates EOA (Externally Owned Accounts)' +
    'and ERC-4337 standards with FIDO2 authentication. ' +
    'Designed for enhanced security and seamless user experience,' +
    'Nexus Wallet provides a robust platform for managing digital assets with cutting-edge account abstraction and web authentication technologies.',
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
};

// # test2
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
