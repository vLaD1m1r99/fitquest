"use client"

import { Trophy, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useActiveUser } from "@/components/user-context"
import { getProfile, getRPG, type Profile, type RPG, xpProgress } from "@/lib/data"

export default function ProfilePage() {
	const { activeUser } = useActiveUser()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [rpg, setRpg] = useState<RPG | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			try {
				const [prof, rpgData] = await Promise.all([getProfile(activeUser), getRPG(activeUser)])
				setProfile(prof)
				setRpg(rpgData)
			} catch (_error) {
				/* fetch error */
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [activeUser])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>Loading...</p>
			</div>
		)
	}

	if (!profile || !rpg) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	const xpData = xpProgress(rpg)

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-foreground">Profile</h1>
			</div>

			{/* Character Card */}
			<Card className="p-8 bg-card border-border">
				<div className="flex items-start gap-8 flex-wrap">
					<div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
						<span className="text-4xl font-bold text-accent-foreground">{rpg.level}</span>
					</div>
					<div className="flex-1">
						<h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
						<p className="text-lg text-muted-foreground mb-4">Level {rpg.level}</p>

						{/* XP Bar */}
						<div className="mb-4">
							<div className="flex justify-between text-sm mb-2">
								<span className="text-muted-foreground">Experience</span>
								<span className="text-muted-foreground">{rpg.totalXP} XP</span>
							</div>
							<Progress value={xpData.progressPercent} className="h-3" />
							<p className="text-xs text-muted-foreground mt-1">
								{xpData.currentLevelXP} / {xpData.nextLevelXP} to next level
							</p>
						</div>
					</div>
				</div>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
				<Card className="p-4 bg-card border-border">
					<p className="text-xs text-muted-foreground mb-2">Total Workouts</p>
					<p className="text-2xl font-bold">{rpg.totalWorkouts}</p>
				</Card>

				<Card className="p-4 bg-card border-border">
					<p className="text-xs text-muted-foreground mb-2">Total PRs</p>
					<p className="text-2xl font-bold text-accent">{rpg.totalPRs}</p>
				</Card>

				<Card className="p-4 bg-card border-border">
					<p className="text-xs text-muted-foreground mb-2">Perfect Macro Days</p>
					<p className="text-2xl font-bold text-warning">{rpg.perfectMacroDays}</p>
				</Card>

				<Card className="p-4 bg-card border-border">
					<p className="text-xs text-muted-foreground mb-2">Longest Streak</p>
					<p className="text-2xl font-bold">{rpg.longestStreak}</p>
				</Card>

				<Card className="p-4 bg-card border-border">
					<p className="text-xs text-muted-foreground mb-2">Current Streak</p>
					<p className="text-2xl font-bold text-accent">{rpg.currentStreak}</p>
				</Card>
			</div>

			{/* XP History */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Zap size={20} className="text-warning" />
					XP History
				</h2>
				{rpg.xpHistory.length > 0 ? (
					<div className="space-y-2">
						{[...rpg.xpHistory].reverse().map((entry, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between p-3 rounded-md bg-muted/30 text-sm"
							>
								<div>
									<p className="font-semibold">{entry.reason}</p>
									<p className="text-xs text-muted-foreground">{entry.date}</p>
								</div>
								<span className="font-bold text-warning">+{entry.xpGained}</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No XP history yet</p>
				)}
			</Card>

			{/* Achievements */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Trophy size={20} className="text-warning" />
					Achievements
				</h2>
				{rpg.achievements.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{rpg.achievements.map((achievement, idx) => (
							<div key={idx} className="p-4 rounded-md bg-muted/30 border border-accent/30">
								<p className="font-semibold text-accent">{achievement}</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No achievements unlocked yet</p>
				)}
			</Card>

			{/* Profile Details */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-6">Details</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Personal Info */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm text-muted-foreground mb-4">Personal Information</h3>
						<div>
							<p className="text-sm text-muted-foreground">Gender</p>
							<p className="font-semibold capitalize">{profile.gender}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Age</p>
							<p className="font-semibold">{profile.age}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Height</p>
							<p className="font-semibold">{profile.heightCm} cm</p>
						</div>
					</div>

					{/* Goals & Targets */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm text-muted-foreground mb-4">Goals & Targets</h3>
						<div>
							<p className="text-sm text-muted-foreground">Daily Calorie Target</p>
							<p className="font-semibold">{profile.dailyCalorieTarget} kcal</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Caloric Deficit</p>
							<p className="font-semibold">{profile.deficit} kcal</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Activity Factor</p>
							<p className="font-semibold">{profile.activityFactor}x</p>
						</div>
					</div>

					{/* Macros */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm text-muted-foreground mb-4">Daily Macros</h3>
						<div>
							<p className="text-sm text-muted-foreground">Protein</p>
							<p className="font-semibold">{profile.macros.proteinG} g</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Carbs</p>
							<p className="font-semibold">{profile.macros.carbsG} g</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Fat</p>
							<p className="font-semibold">{profile.macros.fatG} g</p>
						</div>
					</div>

					{/* Metabolic Info */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm text-muted-foreground mb-4">Metabolic Info</h3>
						<div>
							<p className="text-sm text-muted-foreground">BMR</p>
							<p className="font-semibold">{profile.bmr} kcal</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">TDEE</p>
							<p className="font-semibold">{profile.tdee} kcal</p>
						</div>
					</div>
				</div>

				{/* Supplements & Restrictions */}
				{(profile.supplements.length > 0 || profile.restrictions.length > 0) && (
					<div className="mt-6 pt-6 border-t border-border/50">
						{profile.supplements.length > 0 && (
							<div className="mb-4">
								<p className="text-sm font-semibold text-muted-foreground mb-2">Supplements</p>
								<div className="space-y-1">
									{profile.supplements.map((supp, idx) => (
										<p key={idx} className="text-sm">
											{supp}
										</p>
									))}
								</div>
							</div>
						)}
						{profile.restrictions.length > 0 && (
							<div>
								<p className="text-sm font-semibold text-muted-foreground mb-2">Restrictions</p>
								<div className="space-y-1">
									{profile.restrictions.map((restriction, idx) => (
										<p key={idx} className="text-sm">
											{restriction}
										</p>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</Card>
		</div>
	)
}
