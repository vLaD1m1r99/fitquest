"use client"

import { Dumbbell, Flame, Footprints, Heart, Moon, Scale, Target, Trophy, Zap } from "lucide-react"
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
	type NutritionDay,
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

	if (!profile || !rpg || !weightLog || !dailyLog || !workoutLog || !nutritionLog) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	const dayNumber = daysSinceStart(profile.lastRecalculation)
	const xpData = xpProgress(rpg)
	const today = new Date().toISOString().split("T")[0]
	const todayNutrition = getTodayNutrition(nutritionLog, today)
	const todayDaily = getTodayDailyLog(dailyLog, today)
	const recentWorkouts = getRecentWorkouts(workoutLog, 3)

	const caloriesConsumed = todayNutrition?.dailyTotals.calories || 0
	const caloriesRemaining = Math.max(0, profile.dailyCalorieTarget - caloriesConsumed)
	const caloriesProgress = Math.min(100, (caloriesConsumed / profile.dailyCalorieTarget) * 100)

	const proteinConsumed = todayNutrition?.dailyTotals.proteinG || 0
	const proteinRemaining = Math.max(0, profile.macros.proteinG - proteinConsumed)
	const proteinProgress = Math.min(100, (proteinConsumed / profile.macros.proteinG) * 100)

	const carbsConsumed = todayNutrition?.dailyTotals.carbsG || 0
	const carbsRemaining = Math.max(0, profile.macros.carbsG - carbsConsumed)
	const carbsProgress = Math.min(100, (carbsConsumed / profile.macros.carbsG) * 100)

	const fatConsumed = todayNutrition?.dailyTotals.fatG || 0
	const fatRemaining = Math.max(0, profile.macros.fatG - fatConsumed)
	const fatProgress = Math.min(100, (fatConsumed / profile.macros.fatG) * 100)

	const currentWeight =
		weightLog.entries.length > 0
			? weightLog.entries[weightLog.entries.length - 1].weightKg
			: profile.startingWeightKg
	const weightChange = currentWeight - profile.startingWeightKg

	const currentSteps = todayDaily?.steps || 0
	const stepsProgress = Math.min(100, (currentSteps / 10000) * 100)

	const weeklyWorkouts = workoutLog.sessions.filter(s => {
		const sessionDate = new Date(s.date)
		const weekAgo = new Date()
		weekAgo.setDate(weekAgo.getDate() - 7)
		return sessionDate >= weekAgo
	}).length

	const weeklyAvgCalories =
		nutritionLog.days.length > 0
			? Math.round(
					nutritionLog.days.slice(0, 7).reduce((sum, day) => sum + day.dailyTotals.calories, 0) /
						Math.min(7, nutritionLog.days.length),
				)
			: 0

	const weeklyAvgSteps =
		dailyLog.entries.length > 0
			? Math.round(
					dailyLog.entries.slice(0, 7).reduce((sum, entry) => sum + entry.steps, 0) /
						Math.min(7, dailyLog.entries.length),
				)
			: 0

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-4xl font-bold mb-1">{profile.name}</h1>
						<p className="text-gray-400">Day {dayNumber} of the journey</p>
					</div>
					<UserToggle />
				</div>

				{/* RPG Bar Card */}
				<Card className="bg-gradient-to-r from-slate-700 to-slate-600 border-l-4 border-l-purple-500 p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="bg-purple-600 rounded-lg px-3 py-1 font-bold text-lg">LV {rpg.level}</div>
							<div>
								<p className="font-semibold">Experience Points</p>
								<p className="text-gray-300 text-sm">{rpg.totalXP.toLocaleString()} total</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-gray-300 text-sm">Next Level</p>
							<p className="font-bold">{rpg.xpToNextLevel.toLocaleString()} XP</p>
						</div>
					</div>

					<Progress value={xpData.progressPercent} className="h-3 mb-4 bg-slate-500" />

					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<p className="text-gray-300 text-sm">Current Streak</p>
							<p className="font-bold text-lg text-gold">{rpg.currentStreak} days</p>
						</div>
						<div className="text-center">
							<p className="text-gray-300 text-sm">Longest Streak</p>
							<p className="font-bold text-lg text-rose">{rpg.longestStreak} days</p>
						</div>
						<div className="text-center">
							<p className="text-gray-300 text-sm">Total PRs</p>
							<p className="font-bold text-lg text-success">{rpg.totalPRs}</p>
						</div>
					</div>
				</Card>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Calories */}
					<Card className="bg-slate-700 p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<Flame className="w-5 h-5 text-orange-400" />
								<span className="text-gray-300 text-sm font-medium">Calories</span>
							</div>
							<span className="text-orange-400 text-xs font-bold">TODAY</span>
						</div>
						<p className="text-2xl font-bold mb-2">{caloriesRemaining}</p>
						<p className="text-gray-400 text-xs mb-3">
							remaining ({caloriesConsumed}/{profile.dailyCalorieTarget})
						</p>
						<Progress value={caloriesProgress} className="h-2 bg-slate-600" />
					</Card>

					{/* Weight */}
					<Card className="bg-slate-700 p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<Scale className="w-5 h-5 text-blue-400" />
								<span className="text-gray-300 text-sm font-medium">Weight</span>
							</div>
							<span className={`text-xs font-bold ${weightChange <= 0 ? "text-success" : "text-rose"}`}>
								{weightChange > 0 ? "+" : ""}
								{weightChange.toFixed(1)} kg
							</span>
						</div>
						<p className="text-2xl font-bold mb-2">{currentWeight.toFixed(1)} kg</p>
						<p className="text-gray-400 text-xs mb-3">from {profile.startingWeightKg} kg</p>
						<div className="h-2 bg-slate-600 rounded-full overflow-hidden">
							<div className="h-full bg-blue-500 w-1/3" />
						</div>
					</Card>

					{/* Steps */}
					<Card className="bg-slate-700 p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<Footprints className="w-5 h-5 text-emerald-400" />
								<span className="text-gray-300 text-sm font-medium">Steps</span>
							</div>
							<span className="text-emerald-400 text-xs font-bold">TODAY</span>
						</div>
						<p className="text-2xl font-bold mb-2">{currentSteps.toLocaleString()}</p>
						<p className="text-gray-400 text-xs mb-3">of 10,000 goal</p>
						<Progress value={stepsProgress} className="h-2 bg-slate-600" />
					</Card>

					{/* Workouts */}
					<Card className="bg-slate-700 p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<Dumbbell className="w-5 h-5 text-purple-400" />
								<span className="text-gray-300 text-sm font-medium">Workouts</span>
							</div>
							<span className="text-purple-400 text-xs font-bold">TOTAL</span>
						</div>
						<p className="text-2xl font-bold mb-2">{rpg.totalWorkouts}</p>
						<p className="text-gray-400 text-xs mb-3">sessions completed</p>
						<div className="h-2 bg-slate-600 rounded-full overflow-hidden">
							<div className="h-full bg-purple-500 w-2/3" />
						</div>
					</Card>
				</div>

				{/* Macros Card */}
				<Card className="bg-slate-700 p-6">
					<h2 className="text-lg font-bold mb-5">Today's Macros</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Protein */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-rose">Protein</span>
								<span className="text-sm text-gray-400">
									{proteinConsumed}/{profile.macros.proteinG}g
								</span>
							</div>
							<Progress value={proteinProgress} className="h-3 mb-2 bg-slate-600" />
							<p className="text-xs text-gray-400">{proteinRemaining.toFixed(1)}g remaining</p>
						</div>

						{/* Carbs */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-gold">Carbs</span>
								<span className="text-sm text-gray-400">
									{carbsConsumed}/{profile.macros.carbsG}g
								</span>
							</div>
							<Progress value={carbsProgress} className="h-3 mb-2 bg-slate-600" />
							<p className="text-xs text-gray-400">{carbsRemaining.toFixed(1)}g remaining</p>
						</div>

						{/* Fat */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-success">Fat</span>
								<span className="text-sm text-gray-400">
									{fatConsumed}/{profile.macros.fatG}g
								</span>
							</div>
							<Progress value={fatProgress} className="h-3 mb-2 bg-slate-600" />
							<p className="text-xs text-gray-400">{fatRemaining.toFixed(1)}g remaining</p>
						</div>
					</div>
				</Card>

				{/* Bottom Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Daily Vitals */}
					<Card className="bg-slate-700 p-6">
						<h2 className="text-lg font-bold mb-4">Daily Vitals</h2>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Moon className="w-4 h-4 text-indigo-400" />
									<span className="text-sm text-gray-300">Sleep</span>
								</div>
								<span className="font-semibold">{todayDaily?.sleepHours.toFixed(1) || "—"} hours</span>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Zap className="w-4 h-4 text-yellow-400" />
									<span className="text-sm text-gray-300">Energy</span>
								</div>
								<span className="font-semibold text-gold">{todayDaily?.energyLevel || "—"}/10</span>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Heart className="w-4 h-4 text-rose" />
									<span className="text-sm text-gray-300">Mood</span>
								</div>
								<span className="font-semibold text-rose">{todayDaily?.mood || "—"}/10</span>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Target className="w-4 h-4 text-orange-400" />
									<span className="text-sm text-gray-300">Stress</span>
								</div>
								<span className="font-semibold text-orange-400">
									{todayDaily?.stressLevel || "—"}/10
								</span>
							</div>
						</div>
					</Card>

					{/* Recent Activity */}
					<Card className="bg-slate-700 p-6">
						<h2 className="text-lg font-bold mb-4">Recent Activity</h2>

						<div className="space-y-3">
							{recentWorkouts.length > 0 ? (
								recentWorkouts.map((session, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 bg-slate-600 rounded-lg"
									>
										<div className="flex items-center gap-3">
											<Dumbbell className="w-4 h-4 text-purple-400" />
											<div>
												<p className="text-sm font-medium">{session.sessionType}</p>
												<p className="text-xs text-gray-400">
													{new Date(session.date).toLocaleDateString()}
												</p>
											</div>
										</div>
										<span className="text-sm font-semibold text-purple-400">
											{session.durationMin}m
										</span>
									</div>
								))
							) : (
								<p className="text-gray-400 text-sm">No recent workouts</p>
							)}
						</div>
					</Card>
				</div>

				{/* Weekly Summary */}
				<Card className="bg-gradient-to-r from-slate-700 to-slate-600 border-l-4 border-l-gold p-6">
					<h2 className="text-lg font-bold mb-4">Weekly Summary</h2>

					<div className="grid grid-cols-3 gap-6">
						<div>
							<p className="text-gray-400 text-sm mb-2">Avg Daily Calories</p>
							<p className="text-2xl font-bold text-orange-400">{weeklyAvgCalories}</p>
						</div>

						<div>
							<p className="text-gray-400 text-sm mb-2">Workouts This Week</p>
							<p className="text-2xl font-bold text-purple-400">{weeklyWorkouts}</p>
						</div>

						<div>
							<p className="text-gray-400 text-sm mb-2">Avg Daily Steps</p>
							<p className="text-2xl font-bold text-emerald-400">{weeklyAvgSteps.toLocaleString()}</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
