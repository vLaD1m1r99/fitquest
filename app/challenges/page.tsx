"use client"

import { Award, ChevronDown, ChevronUp, Lock, Target, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useActiveUser } from "@/components/user-context"
import { type ChallengesData, getChallenges, getRPG, type RPG } from "@/lib/data"

const categoryIcons: Record<string, string> = {
	steps: "🚶",
	nutrition: "🍎",
	workouts: "💪",
	wellness: "🧘",
	tracking: "📊",
}

export default function ChallengesPage() {
	const { activeUser } = useActiveUser()
	const [challenges, setChallenges] = useState<ChallengesData | null>(null)
	const [rpg, setRpg] = useState<RPG | null>(null)
	const [loading, setLoading] = useState(true)
	const [showCompleted, setShowCompleted] = useState(false)

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			try {
				const [c, r] = await Promise.all([getChallenges(activeUser), getRPG(activeUser)])
				setChallenges(c)
				setRpg(r)
			} catch {
				/* fetch error */
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [activeUser])

	if (loading || !challenges || !rpg) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-muted-foreground">{loading ? "Loading challenges..." : "No data available"}</p>
			</div>
		)
	}

	const xpPercent = rpg.xpToNextLevel > 0 ? (rpg.totalXP / rpg.xpToNextLevel) * 100 : 0

	// Find current title from level rewards (keys are "2", "5", "10", etc.)
	const rewardLevels = Object.keys(challenges.levelRewards)
		.map(Number)
		.sort((a, b) => a - b)
	const currentRewardLevel = rewardLevels.filter(l => l <= rpg.level).pop()
	const currentReward = currentRewardLevel ? challenges.levelRewards[String(currentRewardLevel)] : null

	const monthlyData = challenges.monthlyChallenges
	const totalMonthlyXP = monthlyData.challenges.reduce((sum, c) => sum + c.xpReward, 0)
	const monthName = new Date(monthlyData.month + "-01").toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	})

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold text-foreground">Quests & Rewards</h1>
				<p className="text-muted-foreground mt-1">Complete challenges, earn XP, level up</p>
			</div>

			{/* Level & XP Card */}
			<Card className="p-8 overflow-hidden">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
					<div className="flex items-center gap-6">
						<div className="text-center">
							<div className="text-5xl font-black text-accent">{rpg.level}</div>
							<div className="text-3xl mt-1">{currentReward?.badge || "🌟"}</div>
						</div>
						<div>
							<h2 className="text-2xl font-bold text-foreground">
								{currentReward?.title || `Level ${rpg.level}`}
							</h2>
							<p className="text-muted-foreground text-sm">{currentReward?.perk || "Keep grinding!"}</p>
							<div className="mt-4 w-64">
								<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
									<span>XP to next level</span>
									<span className="font-semibold text-accent">
										{rpg.totalXP} / {rpg.xpToNextLevel}
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-3 overflow-hidden">
									<div
										className="h-full bg-accent transition-all duration-500"
										style={{ width: `${Math.min(xpPercent, 100)}%` }}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="flex gap-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-success">{rpg.currentStreak}</div>
							<p className="text-xs text-muted-foreground">Current Streak</p>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-accent">{rpg.longestStreak}</div>
							<p className="text-xs text-muted-foreground">Best Streak</p>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-warning">{rpg.totalWorkouts}</div>
							<p className="text-xs text-muted-foreground">Workouts</p>
						</div>
					</div>
				</div>
			</Card>

			{/* Active Challenges */}
			<div>
				<h2 className="text-2xl font-bold text-foreground mb-4">Active Challenges</h2>
				<div className="grid gap-4 md:grid-cols-2">
					{challenges.activeChallenges.map(ch => {
						const pct = ch.target > 0 ? (ch.current / ch.target) * 100 : 0
						return (
							<Card key={ch.id} className="p-5 hover:border-accent/50 transition-colors">
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-start gap-3 flex-1">
										<span className="text-xl">{categoryIcons[ch.category] || "📍"}</span>
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-foreground">{ch.name}</h3>
											<p className="text-sm text-muted-foreground mt-0.5">{ch.description}</p>
										</div>
									</div>
									<div className="flex items-center gap-1 bg-accent/10 rounded-lg px-2.5 py-1 ml-2 flex-shrink-0">
										<Zap className="w-3.5 h-3.5 text-accent" />
										<span className="text-xs font-bold text-accent">{ch.xpReward} XP</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span className="capitalize">
											{ch.type === "single" ? "One-time" : ch.type}
										</span>
										<span className="font-semibold text-foreground">
											{ch.current.toLocaleString()} / {ch.target.toLocaleString()} {ch.unit}
										</span>
									</div>
									<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
										<div
											className="h-full bg-accent transition-all duration-300"
											style={{ width: `${Math.min(pct, 100)}%` }}
										/>
									</div>
								</div>
							</Card>
						)
					})}
				</div>
			</div>

			{/* Monthly Challenges */}
			<div>
				<h2 className="text-2xl font-bold text-foreground mb-4">{monthName} Challenges</h2>
				<Card className="p-4 mb-4 bg-accent/5 border-accent/20">
					<div className="flex items-center gap-2">
						<Target className="w-5 h-5 text-accent" />
						<span className="text-sm font-semibold text-accent">
							{totalMonthlyXP.toLocaleString()} XP available this month
						</span>
					</div>
				</Card>
				<div className="grid gap-4 md:grid-cols-2">
					{monthlyData.challenges.map(ch => {
						const pct = ch.target > 0 ? (ch.current / ch.target) * 100 : 0
						return (
							<Card key={ch.id} className="p-5 hover:border-accent/50 transition-colors">
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-start gap-3 flex-1">
										<span className="text-xl">{categoryIcons[ch.category] || "📍"}</span>
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-foreground">{ch.name}</h3>
											<p className="text-sm text-muted-foreground mt-0.5">{ch.description}</p>
										</div>
									</div>
									<div className="flex items-center gap-1 bg-accent/10 rounded-lg px-2.5 py-1 ml-2 flex-shrink-0">
										<Zap className="w-3.5 h-3.5 text-accent" />
										<span className="text-xs font-bold text-accent">{ch.xpReward} XP</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>Cumulative</span>
										<span className="font-semibold text-foreground">
											{ch.current.toLocaleString()} / {ch.target.toLocaleString()} {ch.unit}
										</span>
									</div>
									<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
										<div
											className={`h-full transition-all duration-300 ${ch.completed ? "bg-success" : "bg-accent"}`}
											style={{ width: `${Math.min(pct, 100)}%` }}
										/>
									</div>
									{ch.completed && (
										<div className="flex items-center gap-1.5 text-success text-xs font-semibold">
											<Award className="w-3.5 h-3.5" />
											<span>Completed!</span>
										</div>
									)}
								</div>
							</Card>
						)
					})}
				</div>
			</div>

			{/* Level Roadmap */}
			<div>
				<h2 className="text-2xl font-bold text-foreground mb-4">Level Roadmap</h2>
				<Card className="p-6">
					<div className="space-y-3">
						{rewardLevels.map(lvl => {
							const reward = challenges.levelRewards[String(lvl)]
							const reached = rpg.level >= lvl
							const isCurrent =
								rpg.level >= lvl &&
								(rewardLevels.indexOf(lvl) === rewardLevels.length - 1 ||
									rpg.level < rewardLevels[rewardLevels.indexOf(lvl) + 1])

							return (
								<div
									key={lvl}
									className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
										isCurrent
											? "bg-accent/10 border border-accent"
											: reached
												? "bg-muted/40"
												: "opacity-40"
									}`}
								>
									<div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
										{reached ? (
											<span className="text-2xl">{reward.badge}</span>
										) : (
											<Lock className="w-5 h-5 text-muted-foreground" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-bold text-foreground">Lvl {lvl}</span>
											<span className="text-sm text-muted-foreground">—</span>
											<span className="font-semibold text-foreground">{reward.title}</span>
											{isCurrent && (
												<span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-bold uppercase">
													Current
												</span>
											)}
										</div>
										<p className="text-sm text-muted-foreground">{reward.perk}</p>
									</div>
									{reached && <Award className="w-4 h-4 text-success flex-shrink-0" />}
								</div>
							)
						})}
					</div>
				</Card>
			</div>

			{/* Completed Challenges */}
			{challenges.completedChallenges.length > 0 && (
				<div>
					<button
						onClick={() => setShowCompleted(!showCompleted)}
						className="flex items-center gap-2 text-lg font-bold text-foreground hover:text-accent transition-colors mb-4"
					>
						{showCompleted ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
						Completed ({challenges.completedChallenges.length})
					</button>
					{showCompleted && (
						<div className="grid gap-4 md:grid-cols-2">
							{challenges.completedChallenges.map(ch => (
								<Card key={ch.id} className="p-5 bg-muted/20 border-success/30">
									<div className="flex items-start gap-3">
										<span className="text-xl">{categoryIcons[ch.category] || "📍"}</span>
										<div className="flex-1">
											<h3 className="font-bold text-foreground">{ch.name}</h3>
											<p className="text-sm text-muted-foreground">{ch.description}</p>
											{ch.completedDate && (
												<p className="text-xs text-success mt-2 font-semibold">
													Completed {new Date(ch.completedDate).toLocaleDateString()}
												</p>
											)}
										</div>
										<div className="flex items-center gap-1 bg-success/10 rounded-lg px-2.5 py-1">
											<Award className="w-3.5 h-3.5 text-success" />
											<span className="text-xs font-bold text-success">+{ch.xpReward}</span>
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</div>
			)}

			{/* Empty state if no challenges at all */}
			{challenges.activeChallenges.length === 0 && challenges.completedChallenges.length === 0 && (
				<Card className="p-12 text-center">
					<Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-lg font-semibold text-foreground">No challenges yet</p>
					<p className="text-muted-foreground mt-2">Challenges will appear as you start your journey</p>
				</Card>
			)}
		</div>
	)
}
