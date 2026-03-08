"use client"

import { Flame, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useActiveUser } from "@/components/user-context"
import { UserToggle } from "@/components/user-toggle"
import {
	type DailyLog,
	daysSinceStart,
	getDailyLog,
	getNutritionLog,
	getProfile,
	getRecentWorkouts,
	getRPG,
	getTodayDailyLog,
	getTodayNutrition,
	getWeightLog,
	getWorkoutLog,
	type NutritionLog,
	type Profile,
	type RPG,
	type WeightLog,
	type WorkoutLog,
	xpProgress,
} from "@/lib/data"

export default function Dashboard() {
	const { activeUser } = useActiveUser()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [rpg, setRpg] = useState<RPG | null>(null)
	const [weightLog, setWeightLog] = useState<WeightLog | null>(null)
	const [dailyLog, setDailyLog] = useState<DailyLog | null>(null)
	const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null)
	const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			try {
				const [prof, rpgData, weights, daily, workouts, nutrition] = await Promise.all([
					getProfile(activeUser),
					getRPG(activeUser),
					getWeightLog(activeUser),
					getDailyLog(activeUser),
					getWorkoutLog(activeUser),
					getNutritionLog(activeUser),
				])
				setProfile(prof)
				setRpg(rpgData)
				setWeightLog(weights)
				setDailyLog(daily)
				setWorkoutLog(workouts)
				setNutritionLog(nutrition)
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

	if (!profile || !rpg || !weightLog || !dailyLog || !workoutLog) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	const dayNumber = daysSinceStart(profile.lastRecalculation)
	const xpData = xpProgress(rpg)
	const today = new Date().toISOString().split("T")[0]
	const todayNutrition = nutritionLog ? getTodayNutrition(nutritionLog, today) : undefined
	const todayDaily = getTodayDailyLog(dailyLog, today)
	const recentWorkouts = getRecentWorkouts(workoutLog, 3)

	const currentCalories = todayNutrition?.dailyTotals.calories || 0
	const currentSteps = todayDaily?.steps || 0

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{profile.name}</h1>
					<p className="text-muted-foreground mt-1">Day {dayNumber} of the journey</p>
				</div>
				<UserToggle />
			</div>

			{/* RPG Bar */}
			<Card className="p-6 bg-card border-border">
				<div className="flex items-center gap-6 flex-wrap">
					{/* Level Badge */}
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-rose flex items-center justify-center">
							<span className="text-2xl font-bold text-card">{rpg.level}</span>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Level</p>
							<p className="text-lg font-semibold">{rpg.totalXP} XP</p>
						</div>
					</div>

					{/* XP Progress */}
					<div className="flex-1 min-w-48">
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">XP</span>
							<span className="text-muted-foreground">
								{xpData.currentLevelXP} /{xpData.nextLevelXP}
							</span>
						</div>
						<Progress value={xpData.progressPercent} className="h-2" />
					</div>

					{/* Streak */}
					<div className="flex items-center gap-2">
						<Flame size={20} className="text-gold" />
						<div>
							<p className="text-sm text-muted-foreground">Streak</p>
							<p className="text-lg font-semibold">{rpg.currentStreak}</p>
						</div>
					</div>

					{/* PRs */}
					<div className="flex items-center gap-2">
						<Trophy size={20} className="text-gold" />
						<div>
							<p className="text-sm text-muted-foreground">PRs</p>
							<p className="text-lg font-semibold">{rpg.totalPRs}</p>
						</div>
					</div>
				</div>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Calories */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-sm font-semibold text-muted-foreground mb-2">Calories Today</h3>
					<p className="text-2xl font-bold mb-3">
						{currentCalories} /{profile.dailyCalorieTarget}
					</p>
					<Progress value={(currentCalories / profile.dailyCalorieTarget) * 100} className="h-2" />
				</Card>

				{/* Current Weight */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-sm font-semibold text-muted-foreground mb-2">Current Weight</h3>
					<p className="text-2xl font-bold mb-3">
						{weightLog.entries[weightLog.entries.length - 1]?.weightKg || "—"} kg
					</p>
					<p className="text-xs text-muted-foreground">From {profile.startingWeightKg} kg</p>
				</Card>

				{/* Steps */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-sm font-semibold text-muted-foreground mb-2">Steps Today</h3>
					<p className="text-2xl font-bold mb-3">{currentSteps} / 10000</p>
					<Progress value={(currentSteps / 10000) * 100} className="h-2" />
				</Card>

				{/* Total Workouts */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-sm font-semibold text-muted-foreground mb-2">Total Workouts</h3>
					<p className="text-2xl font-bold mb-3">{rpg.totalWorkouts}</p>
					<p className="text-xs text-muted-foreground">Longest streak: {rpg.longestStreak}</p>
				</Card>
			</div>

			{/* Macros Section */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-6">Today's Macros</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Protein */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">Protein</span>
							<span>
								{todayNutrition?.dailyTotals.proteinG || 0} /{profile.macros.proteinG}g
							</span>
						</div>
						<Progress
							value={((todayNutrition?.dailyTotals.proteinG || 0) / profile.macros.proteinG) * 100}
							className="h-2 bg-card/50"
						/>
					</div>

					{/* Carbs */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">Carbs</span>
							<span>
								{todayNutrition?.dailyTotals.carbsG || 0} /{profile.macros.carbsG}g
							</span>
						</div>
						<Progress
							value={((todayNutrition?.dailyTotals.carbsG || 0) / profile.macros.carbsG) * 100}
							className="h-2 bg-card/50"
						/>
					</div>

					{/* Fat */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">Fat</span>
							<span>
								{todayNutrition?.dailyTotals.fatG || 0} /{profile.macros.fatG}g
							</span>
						</div>
						<Progress
							value={((todayNutrition?.dailyTotals.fatG || 0) / profile.macros.fatG) * 100}
							className="h-2 bg-card/50"
						/>
					</div>
				</div>
			</Card>

			{/* Bottom Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Daily Vitals */}
				<Card className="p-6 bg-card border-border">
					<h2 className="text-lg font-semibold mb-4">Daily Vitals</h2>
					{todayDaily ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm">Sleep</span>
								<span className="font-semibold">{todayDaily.sleepHours}h</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm">Energy</span>
								<span className="font-semibold text-gold">{todayDaily.energyLevel}/5</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm">Mood</span>
								<span className="font-semibold text-rose">{todayDaily.mood}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm">Stress</span>
								<span className="font-semibold">{todayDaily.stressLevel}/5</span>
							</div>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No vitals logged yet</p>
					)}
				</Card>

				{/* Recent Activity */}
				<Card className="p-6 bg-card border-border">
					<h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
					{recentWorkouts.length > 0 ? (
						<div className="space-y-3">
							{recentWorkouts.map((workout, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between text-sm border-b border-border/50 pb-3"
								>
									<div>
										<p className="font-medium">{workout.sessionType}</p>
										<p className="text-xs text-muted-foreground">{workout.date}</p>
									</div>
									<span className="text-xs text-muted-foreground">{workout.durationMin}m</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No workouts logged yet</p>
					)}
				</Card>
			</div>
		</div>
	)
}
