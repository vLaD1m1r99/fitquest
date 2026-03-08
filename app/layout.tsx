import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Providers } from "@/components/providers"

const geistSans = Geist({
	variable: "--font-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "FitQuest — Vlada & Sneska",
	description: "Dark-themed fitness tracker with RPG elements",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
				<Providers>
					<Navigation />
					<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
				</Providers>
			</body>
		</html>
	)
}
