"use client"

import { ChevronDown, Dumbbell, LayoutDashboard, Target, TrendingUp, Utensils } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { useActiveUser, USER_DISPLAY_NAMES } from "./user-context"

export function Navigation() {
	const pathname = usePathname()
	const { activeUser, displayName, setActiveUser } = useActiveUser()
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	const isActive = (path: string) => {
		if (path === "/" && pathname === "/") return true
		if (path !== "/" && pathname.startsWith(path)) return true
		return false
	}

	const navItems = [
		{ href: "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/nutrition", label: "Nutrition", icon: Utensils },
		{ href: "/workouts", label: "Workouts", icon: Dumbbell },
		{ href: "/progress", label: "Progress", icon: TrendingUp },
		{ href: "/challenges", label: "Quests", icon: Target },
	]

	const otherUser = activeUser === "vlada" ? "sneska" : "vlada"

	return (
		<nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold text-accent flex items-center gap-2">
						<span>⚡</span>
						<span>FitQuest</span>
					</Link>

					<div className="flex items-center gap-1 sm:gap-2">
						{navItems.map(item => {
							const Icon = item.icon
							const active = isActive(item.href)
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
										active
											? "bg-accent text-accent-foreground shadow-sm shadow-accent/25"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									}`}
								>
									<Icon size={18} />
									<span className="hidden sm:inline">{item.label}</span>
								</Link>
							)
						})}

						<div className="ml-2 border-l border-border/50 pl-2 flex items-center gap-2">
							<ThemeToggle />

							{/* User Switcher Dropdown */}
							<div className="relative" ref={menuRef}>
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-accent/15 text-accent hover:bg-accent/25 transition-all"
								>
									<span>{displayName}</span>
									<ChevronDown
										size={14}
										className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
									/>
								</button>
								{userMenuOpen && (
									<>
										<div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
										<div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
											<button
												className="w-full px-4 py-2.5 text-left text-sm font-medium text-foreground bg-accent/10 flex items-center gap-2"
												disabled
											>
												<span className="w-2 h-2 rounded-full bg-accent" />
												{displayName}
											</button>
											<button
												onClick={() => {
													setActiveUser(otherUser as "vlada" | "sneska")
													setUserMenuOpen(false)
												}}
												className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
											>
												<span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
												{USER_DISPLAY_NAMES[otherUser as "vlada" | "sneska"]}
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
