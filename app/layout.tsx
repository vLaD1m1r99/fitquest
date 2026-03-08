import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-context"
import type { User } from "@/lib/data"

const geistSans = Geist({
	variable: "--font-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: {
		default: "FitQuest — Vlada & Sneška",
		template: "%s | FitQuest",
	},
	description: "Fitness tracker with RPG elements for Vlada & Sneška",
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const cookieStore = await cookies()
	const activeUser = (cookieStore.get("activeUser")?.value || "vlada") as User

	return (
		<html lang="en" data-user={activeUser} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
				<ThemeProvider>
					<Navigation activeUser={activeUser} />
					<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
				</ThemeProvider>
			</body>
		</html>
	)
}
