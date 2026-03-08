"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-context"

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme()

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
		>
			{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
		</button>
	)
}
