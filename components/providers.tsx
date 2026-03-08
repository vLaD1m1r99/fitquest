"use client"

import { ThemeProvider } from "@/components/theme-context"
import { UserProvider } from "@/components/user-context"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<UserProvider>{children}</UserProvider>
		</ThemeProvider>
	)
}
