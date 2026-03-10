"use client"

import { Calendar, ChevronDown, Dumbbell, LayoutDashboard, Menu, Target, TrendingUp, Utensils } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { switchUser } from "@/app/actions"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { USER_DISPLAY_NAMES, type User } from "@/lib/data"
import { ThemeToggle } from "./theme-toggle"

export function Navigation({ activeUser }: { activeUser: User }) {
	const pathname = usePathname()
	const router = useRouter()
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)
	const [isPending, startTransition] = useTransition()
	const menuRef = useRef<HTMLDivElement>(null)

	const displayName = USER_DISPLAY_NAMES[activeUser]
	const otherUser: User = activeUser === "vlada" ? "sneska" : "vlada"

	const isActive = (path: string) => {
		if (path === "/" && pathname === "/") return true
		if (path !== "/" && pathname.startsWith(path)) return true
		return false
	}

	const navItems = [
		{ href: "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/nutrition", label: "Nutrition", icon: Utensils },
		{ href: "/workouts", label: "Workouts", icon: Dumbbell },
		{ href: "/calendar", label: "Calendar", icon: Calendar },
		{ href: "/progress", label: "Progress", icon: TrendingUp },
		{ href: "/challenges", label: "Quests", icon: Target },
	]

	const handleSwitchUser = () => {
		setUserMenuOpen(false)
		setMobileOpen(false)
		startTransition(async () => {
			await switchUser(otherUser)
			router.refresh()
		})
	}

	return (
		<nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold text-accent flex items-center gap-2">
						<span>⚡</span>
						<span>FitQuest</span>
					</Link>

					{/* Desktop nav */}
					<div className="hidden md:flex items-center gap-1 sm:gap-2">
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
									<span>{item.label}</span>
								</Link>
							)
						})}

						<div className="ml-2 border-l border-border/50 pl-2 flex items-center gap-2">
							<ThemeToggle />

							{/* User Switcher Dropdown */}
							<div className="relative" ref={menuRef}>
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									disabled={isPending}
									className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-accent/15 text-accent hover:bg-accent/25 transition-all ${isPending ? "opacity-50" : ""}`}
								>
									<span>{isPending ? "..." : displayName}</span>
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
												onClick={handleSwitchUser}
												className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
											>
												<span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
												{USER_DISPLAY_NAMES[otherUser]}
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Mobile: user badge + theme + hamburger */}
					<div className="flex md:hidden items-center gap-2">
						<span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent/15 text-accent">
							{isPending ? "..." : displayName}
						</span>
						<ThemeToggle />
						<button
							onClick={() => setMobileOpen(true)}
							className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-foreground"
							aria-label="Open menu"
						>
							<Menu size={22} />
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Sheet */}
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetContent side="right" className="w-[280px] p-0">
					<SheetHeader className="border-b border-border/50 px-5 py-4">
						<SheetTitle className="text-accent font-bold flex items-center gap-2">
							<span>⚡</span> FitQuest
						</SheetTitle>
					</SheetHeader>

					<div className="flex flex-col py-2">
						{navItems.map(item => {
							const Icon = item.icon
							const active = isActive(item.href)
							return (
								<SheetClose key={item.href} render={<span />}>
									<Link
										href={item.href}
										onClick={() => setMobileOpen(false)}
										className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all ${
											active
												? "bg-accent/10 text-accent border-r-2 border-accent"
												: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
										}`}
									>
										<Icon size={20} />
										{item.label}
									</Link>
								</SheetClose>
							)
						})}
					</div>

					{/* User switcher at bottom of sheet */}
					<div className="mt-auto border-t border-border/50 p-4">
						<p className="text-xs text-muted-foreground mb-2">Switch user</p>
						<div className="flex gap-2">
							<span className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-center bg-accent/15 text-accent">
								{displayName}
							</span>
							<button
								onClick={handleSwitchUser}
								disabled={isPending}
								className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-center bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
							>
								{USER_DISPLAY_NAMES[otherUser]}
							</button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	)
}
