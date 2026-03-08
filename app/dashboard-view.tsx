"use client"

import { Dumbbell, Flame, Footprints, Heart, Moon, Scale, Target, Trophy, Zap } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
	type DailyLog,
	daysSinceStart,
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

interface DashboardViewProps {
	profile: Profile
	rpg: RPG
	weightLog: WeightLog
	dailyLog: DailyLog
	workoutLog: WorkoutLog
	nutritionLog: NutritionLog
}

export function DashboardView({
	profile,
	rpg,
	weightLog,
	dailyLog,
	workoutLog,
	nutritionLog,
}: DashboardViewProps) {
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
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold mb-1 text-foreground">
					Hey {profile.name} 👋
				</h1>
				<p className="text-muted-foreground">Day {dayNumber} of the journey</p>
			</div>

			{/* RPG Bar Card */}
			<Card className="bg-card border border-border border-l-4 border-l-accent p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="bg-accent rounded-lg px-3 py-1 font-bold text-lg text-foreground">
							LV {rpg.level}
						</div>
						<div>
							<p className="font-semibold text-foreground">Experience Points</p>
							<p className="text-muted-foreground text-sm">{rpg.totalXP.toLocaleString()} total</p>
						</div>
					</div>
					<div className="text-right">
						<p className="text-muted-foreground text-sm">Next Level</p>
						<p className="font-bold text-foreground">{rpg.xpToNextLevel.toLocaleString()} XP</p>
					</div>
				</div>

				<Progress value={xpData.progressPercent} className="h-3 mb-4 bg-muted" />

				<div className="grid grid-cols-3 gap-4">
					<div className="text-center">
						<p className="text-muted-foreground text-sm">Current Streak</p>
						<p className="font-bold text-lg text-warning">{rpg.currentStreak} days</p>
					</div>
					<div className="text-center">
						<p className="text-muted-foreground text-sm">Longest Streak</p>
						<p className="font-bold text-lg text-danger">{rpg.longestStreak} days</p>
					</div>
					<div className="text-center">
						<p className="text-muted-foreground text-sm">Total PRs</p>
						<p className="font-bold text-lg text-success">{rpg.totalPRs}</p>
					</div>
				</div>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Calories */}
				<Card className="bg-card p-5">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Flame className="w-5 h-5 text-warning" />
							<span className="text-muted-foreground text-sm font-medium">Calories</span>
						</div>
						<span className="text-warning text-xs font-bold">TODAY</span>
					</div>
					<p className="text-2xl font-bold mb-2 text-foreground">{caloriesRemaining}</p>
					<p className="text-muted-foreground text-xs mb-3">
						remaining ({caloriesConsumed}/{profile.dailyCalorieTarget})
					</p>
					<Progress value={caloriesProgress} className="h-2 bg-muted" />
				</Card>

				{/* Weight */}
				<Card className="bg-card p-5">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Scale className="w-5 h-5 text-accent" />
							<span className="text-muted-foreground text-sm font-medium">Weight</span>
						</div>
						<span className={`text-xs font-bold ${weightChange <= 0 ? "text-success" : "text-danger"}`}>
							{weightChange > 0 ? "+" : ""}
							{weightChange.toFixed(1)} kg
						</span>
					</div>
					<p className="text-2xl font-bold mb-2 text-foreground">{currentWeight.toFixed(1)} kg</p>
					<p className="text-muted-foreground text-xs mb-3">from {profile.startingWeightKg} kg</p>
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div className="h-full bg-accent w-1/3" />
					</div>
				</Card>

				{/* Steps */}
				<Card className="bg-card p-5">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Footprints className="w-5 h-5 text-success" />
							<span className="text-muted-foreground text-sm font-medium">Steps</span>
						</div>
						<span className="text-success text-xs font-bold">TODAY</span>
					</div>
					<p className="text-2xl font-bold mb-2 text-foreground">{currentSteps.toLocaleString()}</p>
					<p className="text-muted-foreground text-xs mb-3">of 10,000 goal</p>
					<Progress value={stepsProgress} className="h-2 bg-muted" />
				</Card>

				{/* Workouts */}
				<Card className="bg-card p-5">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Dumbbell className="w-5 h-5 text-accent" />
							<span className="text-muted-foreground text-sm font-medium">Workouts</span>
						</div>
						<span className="text-accent text-xs font-bold">TOTAL</span>
					</div>
					<p className="text-2xl font-bold mb-2 text-foreground">{rpg.totalWorkouts}</p>
					<p className="text-muted-foreground text-xs mb-3">sessions completed</p>
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div className="h-full bg-accent w-2/3" />
					</div>
				</Card>
			</div>

			{/* Macros Card */}
			<Card className="bg-card p-6">
				<h2 className="text-lg font-bold mb-5 text-foreground">Today's Macros</h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Protein */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-danger">Protein</span>
							<span className="text-sm text-muted-foreground">
								{proteinConsumed}/{profile.macros.proteinG}g
							</span>
						</div>
						<Progress value={proteinProgress} className="h-3 mb-2 bg-muted" />
						<p className="text-xs text-muted-foreground">{proteinRemaining.toFixed(1)}g remaining</p>
					</div>

					{/* Carbs */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-warning">Carbs</span>
							<span className="text-sm text-muted-foreground">
								{carbsConsumed}/{profile.macros.carbsG}g
							</span>
						</div>
						<Progress value={carbsProgress} className="h-3 mb-2 bg-muted" />
						<p className="text-xs text-muted-foreground">{carbsRemaining.toFixed(1)}g remaining</p>
					</div>

					{/* Fat */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-success">Fat</span>
							<span className="text-sm text-muted-foreground">
								{fatConsumed}/{profile.macros.fatG}g
							</span>
						</div>
						<Progress value={fatProgress} className="h-3 mb-2 bg-muted" />
						<p className="text-xs text-muted-foreground">{fatRemaining.toFixed(1)}g remaining</p>
					</div>
				</div>
			</Card>

			{/* Nutrition Trend Chart */}
			{nutritionLog.days.length > 0 && (
				<Card className="bg-card p-6">
					<h2 className="text-lg font-bold mb-4 text-foreground">Calorie Trend (Last 7 Days)</h2>
					<div className="h-48">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={nutritionLog.days.slice(-7).map(d => ({
									date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
									protein: Math.round(d.dailyTotals.proteinG * 4),
									carbs: Math.round(d.dailyTotals.carbsG * 4),
									fat: Math.round(d.dailyTotals.fatG * 9),
									target: profile.dailyCalorieTarget,
								}))}
							>
								<XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
								<YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
								<Tooltip
									contentStyle={{
										background: "var(--color-card)",
										border: "1px solid var(--color-border)",
										borderRadius: "8px",
										fontSize: "12px",
									}}
								/>
								<Bar dataKey="protein" stackId="cals" fill="var(--color-danger)" name="Protein" radius={[0, 0, 0, 0]} />
								<Bar dataKey="carbs" stackId="cals" fill="var(--color-warning)" name="Carbs" radius={[0, 0, 0, 0]} />
								<Bar dataKey="fat" stackId="cals" fill="var(--color-success)" name="Fat" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" /> Protein</span>
						<span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warning inline-block" /> Carbs</span>
						<span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success inline-block" /> Fat</span>
					</div>
				</Card>
			)}

			{/* Bottom Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Daily Vitals */}
				<Card className="bg-card p-6">
					<h2 className="text-lg font-bold mb-4 text-foreground">Daily Vitals</h2>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Moon className="w-4 h-4 text-accent" />
								<span className="text-sm text-muted-foreground">Sleep</span>
							</div>
							<span className="font-semibold text-foreground">
								{todayDaily?.sleepHours.toFixed(1) || "—"} hours
							</span>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Zap className="w-4 h-4 text-warning" />
								<span className="text-sm text-muted-foreground">Energy</span>
							</div>
							<span className="font-semibold text-foreground">{todayDaily?.energyLevel || "—"}/5</span>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Heart className="w-4 h-4 text-danger" />
								<span className="text-sm text-muted-foreground">Mood</span>
							</div>
							<span className="font-semibold text-foreground capitalize">{todayDaily?.mood || "—"}</span>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Target className="w-4 h-4 text-warning" />
								<span className="text-sm text-muted-foreground">Stress</span>
							</div>
							<span className="font-semibold text-foreground">{todayDaily?.stressLevel || "—"}/5</span>
						</div>
					</div>
				</Card>

				{/* Recent Workouts */}
				<Card className="bg-card p-6">
					<h2 className="text-lg font-bold mb-4 text-foreground">Recent Workouts</h2>

					<div className="space-y-3">
						{recentWorkouts.length > 0 ? (
							recentWorkouts.map((session, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-surface rounded-lg"
								>
									<div className="flex items-center gap-3">
										<Dumbbell className="w-4 h-4 text-accent" />
										<div>
											<p className="text-sm font-medium text-foreground">{session.sessionType}</p>
											<p className="text-xs text-muted-foreground">
												{new Date(session.date).toLocaleDateString()} · {session.exercises.length} exercises
											</p>
										</div>
									</div>
									<span className="text-sm font-semibold text-accent">{session.durationMin}m</span>
								</div>
							))
						) : (
							<p className="text-muted-foreground text-sm">No recent workouts</p>
						)}
					</div>
				</Card>
			</div>

			{/* Weekly Summary */}
			<Card className="bg-card border border-border border-l-4 border-l-warning p-6">
				<h2 className="text-lg font-bold mb-4 text-foreground">Weekly Summary</h2>

				<div className="grid grid-cols-3 gap-6">
					<div>
						<p className="text-muted-foreground text-sm mb-2">Avg Daily Calories</p>
						<p className="text-2xl font-bold text-warning">{weeklyAvgCalories}</p>
					</div>

					<div>
						<p className="text-muted-foreground text-sm mb-2">Workouts This Week</p>
						<p className="text-2xl font-bold text-accent">{weeklyWorkouts}</p>
					</div>

					<div>
						<p className="text-muted-foreground text-sm mb-2">Avg Daily Steps</p>
						<p className="text-2xl font-bold text-success">{weeklyAvgSteps.toLocaleString()}</p>
					</div>
				</div>
			</Card>
		</div>
	)
}
