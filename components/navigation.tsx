"use client"

import { Dumbbell, LayoutDashboard, TrendingUp, User, Utensils } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

export function Navigation() {
	const pathname = usePathname()

	const isActive = (path: string) => {
		if (path === "/" && pathname === "/") return true
		if (path !== "/" && pathname.startsWith(path)) return true
		return false
	}

	const navItems = [
		{
			href: "/",
			label: "Dashboard",
			icon: LayoutDashboard,
		},
		{
			href: "/nutrition",
			label: "Nutrition",
			icon: Utensils,
		},
		{
			href: "/workouts",
			label: "Workouts",
			icon: Dumbbell,
		},
		{
			href: "/progress",
			label: "Progress",
			icon: TrendingUp,
		},
		{
			href: "/profile",
			label: "Profile",
			icon: User,
		},
	]

	return (
		<nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold text-rose flex items-center gap-2">
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
									className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										active ? "bg-rose text-card" : "text-foreground hover:bg-muted"
									}`}
								>
									<Icon size={18} />
									<span className="hidden sm:inline">{item.label}</span>
								</Link>
							)
						})}
						<div className="ml-2 border-l border-border/50 pl-2">
							<ThemeToggle />
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
