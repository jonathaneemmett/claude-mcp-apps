import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'MCP Dashboard',
	description: 'AI-powered artifact dashboard',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className={`${inter.className} h-full antialiased`}>
			<body className='h-full overflow-hidden'>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
