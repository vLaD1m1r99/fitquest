"use client"

import { AlertCircle, Dumbbell, Flame, Footprints, Heart, Moon, Target, Utensils, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type {
	DailyLog,
	DailyLogEntry,
	NutritionDay,
	NutritionLog,
	Profile,
	RPG,
	WeightLog,
	WorkoutLog,
	WorkoutPlan,
	WorkoutSession,
} from "@/lib/data"
import { xpProgress } from "@/lib/data"

interface DashboardViewProps {
	profile: Profile
	rpg: RPG
	weightLog: WeightLog
	dailyLog: DailyLog
	workoutLog: WorkoutLog
	nutritionLog: NutritionLog
	workoutPlan: WorkoutPlan | null
}

function toDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function DashboardView({
	profile,
	rpg,
	weightLog,
	dailyLog,
	workoutLog,
	nutritionLog,
	workoutPlan,
}: DashboardViewProps) {
	const today = new Date()
	const todayStr = toDateStr(today)

	// Today's data
	const todayNutrition: NutritionDay | undefined = nutritionLog.days.find(d => d.date === todayStr)
	const todayDaily: DailyLogEntry | undefined = dailyLog.entries.find(e => e.date === todayStr)
	const todayWeight = weightLog.entries.find(e => e.date === todayStr)?.weightKg
	const todayWorkouts: WorkoutSession[] = workoutLog.sessions.filter(s => s.date === todayStr)
	const latestWeight = weightLog.entries.length > 0 ? weightLog.entries[weightLog.entries.length - 1] : null

	const xpData = xpProgress(rpg)

	// Figure out today's planned workout from rotation
	const todayPlannedWorkout = (() => {
		if (!workoutPlan?.schedule?.rotation) return null
		const startDate = new Date(workoutPlan.startDate)
		const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
		const rotation = workoutPlan.schedule.rotation
		if (rotation.length === 0) return null
		const idx = ((daysSinceStart % rotation.length) + rotation.length) % rotation.length
		const workoutKey = rotation[idx]
		if (workoutKey === "rest") return { key: "rest", name: "Rest Day", exercises: [] }
		const template = workoutPlan.workouts[workoutKey]
		if (!template) return null
		return { key: workoutKey, name: template.name, exercises: template.exercises }
	})()

	return (
		<div className="space-y-6">
			{/* Header with XP */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Hey {profile.name} 👋</h1>
					<div className="flex items-center gap-3 mt-1">
						<span className="bg-accent rounded px-2 py-0.5 text-xs font-bold text-accent-foreground">
							LV {rpg.level}
						</span>
						<div className="flex items-center gap-2">
							<div className="w-24 h-1.5 rounded-full bg-muted/30 overflow-hidden">
								<div
									className="h-full bg-accent rounded-full"
									style={{ width: `${xpData.progressPercent}%` }}
								/>
							</div>
							<span className="text-[10px] text-muted-foreground">{rpg.totalXP} XP</span>
						</div>
					</div>
				</div>
				<div className="text-right">
					<div className="flex items-center gap-1 justify-end">
						<Flame size={16} className="text-accent" />
						<p className="text-sm font-bold text-accent">{rpg.currentStreak} day streak</p>
					</div>
					<p className="text-[10px] text-muted-foreground">{rpg.totalWorkouts} total workouts</p>
				</div>
			</div>

			{/* Quick Stats Row */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{/* Calories */}
				<Card className="p-3">
					<div className="flex items-center gap-2 mb-2">
						<Utensils size={14} className="text-blue-400" />
						<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Calories</span>
					</div>
					{todayNutrition ? (
						<>
							<p className="text-xl font-bold">{todayNutrition.dailyTotals.calories}</p>
							<p className="text-[10px] text-muted-foreground">of {profile.dailyCalorieTarget} target</p>
							<Progress
								value={Math.min(
									100,
									(todayNutrition.dailyTotals.calories / profile.dailyCalorieTarget) * 100,
								)}
								className="h-1 mt-1.5 bg-muted"
							/>
						</>
					) : (
						<p className="text-sm text-muted-foreground">Not logged</p>
					)}
				</Card>

				{/* Steps */}
				<Card className="p-3">
					<div className="flex items-center gap-2 mb-2">
						<Footprints size={14} className="text-green-400" />
						<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Steps</span>
					</div>
					{todayDaily && todayDaily.steps > 0 ? (
						<>
							<p className="text-xl font-bold">{todayDaily.steps.toLocaleString()}</p>
							<p className="text-[10px] text-muted-foreground">of 10,000 goal</p>
							<Progress
								value={Math.min(100, (todayDaily.steps / 10000) * 100)}
								className="h-1 mt-1.5 bg-muted"
							/>
						</>
					) : (
						<p className="text-sm text-muted-foreground">Not logged</p>
					)}
				</Card>

				{/* Weight */}
				<Card className="p-3">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-sm">⚖️</span>
						<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Weight</span>
					</div>
					{todayWeight ? (
						<>
							<p className="text-xl font-bold">{todayWeight} kg</p>
							<p className="text-[10px] text-muted-foreground">today</p>
						</>
					) : latestWeight ? (
						<>
							<p className="text-xl font-bold">{latestWeight.weightKg} kg</p>
							<p className="text-[10px] text-muted-foreground">last: {latestWeight.date}</p>
						</>
					) : (
						<p className="text-sm text-muted-foreground">No data</p>
					)}
				</Card>

				{/* Energy/Sleep */}
				<Card className="p-3">
					<div className="flex items-center gap-2 mb-2">
						<Zap size={14} className="text-yellow-400" />
						<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Vitals</span>
					</div>
					{todayDaily ? (
						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<span className="text-[10px] text-muted-foreground">Energy</span>
								<span className="text-sm font-bold">{todayDaily.energyLevel}/5</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-[10px] text-muted-foreground">Sleep</span>
								<span className="text-sm font-bold">{todayDaily.sleepHours}h</span>
							</div>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">Not logged</p>
					)}
				</Card>
			</div>

			{/* Today's Macros */}
			{todayNutrition && (
				<Card className="p-4 space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm font-semibold">
							<Utensils size={16} className="text-blue-400" />
							Today&apos;s Macros
						</div>
						<span className="text-xs text-muted-foreground">{todayNutrition.dailyTotals.calories} cal</span>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<div>
							<div className="flex justify-between text-[10px] mb-1">
								<span className="text-muted-foreground">Protein</span>
								<span className="font-medium">
									{todayNutrition.dailyTotals.proteinG}g / {profile.macros.proteinG}g
								</span>
							</div>
							<Progress
								value={Math.min(
									100,
									(todayNutrition.dailyTotals.proteinG / profile.macros.proteinG) * 100,
								)}
								className="h-2 bg-muted"
							/>
						</div>
						<div>
							<div className="flex justify-between text-[10px] mb-1">
								<span className="text-muted-foreground">Carbs</span>
								<span className="font-medium">
									{todayNutrition.dailyTotals.carbsG}g / {profile.macros.carbsG}g
								</span>
							</div>
							<Progress
								value={Math.min(100, (todayNutrition.dailyTotals.carbsG / profile.macros.carbsG) * 100)}
								className="h-2 bg-muted"
							/>
						</div>
						<div>
							<div className="flex justify-between text-[10px] mb-1">
								<span className="text-muted-foreground">Fat</span>
								<span className="font-medium">
									{todayNutrition.dailyTotals.fatG}g / {profile.macros.fatG}g
								</span>
							</div>
							<Progress
								value={Math.min(100, (todayNutrition.dailyTotals.fatG / profile.macros.fatG) * 100)}
								className="h-2 bg-muted"
							/>
						</div>
					</div>
				</Card>
			)}

			{/* Today's Workout */}
			<Card className="p-4 space-y-3">
				<div className="flex items-center gap-2 text-sm font-semibold">
					<Dumbbell size={16} className="text-accent" />
					Today&apos;s Workout
				</div>

				{todayWorkouts.length > 0 ? (
					todayWorkouts.map((session, idx) => (
						<div key={idx} className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">{session.sessionType}</span>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									<span>{session.durationMin}m</span>
									<span className="text-accent font-bold">RPE {session.overallRPE}</span>
								</div>
							</div>
							{session.exercises.map((ex, exIdx) => (
								<div
									key={exIdx}
									className="flex items-center justify-between py-1 border-b border-border/30 last:border-0"
								>
									<span className="text-xs">{ex.name}</span>
									<span className="text-xs text-muted-foreground">
										{ex.sets.length}×{Math.max(...ex.sets.map(s => s.weightKg))}kg
									</span>
								</div>
							))}
						</div>
					))
				) : todayPlannedWorkout ? (
					<div className="space-y-2">
						{todayPlannedWorkout.key === "rest" ? (
							<div className="text-center py-4">
								<p className="text-lg">😴</p>
								<p className="text-sm text-muted-foreground">
									Rest day — recover and come back stronger
								</p>
							</div>
						) : (
							<>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">{todayPlannedWorkout.name}</span>
									<span className="text-xs px-2 py-0.5 rounded bg-accent/15 text-accent font-medium">
										Planned
									</span>
								</div>
								{todayPlannedWorkout.exercises.map((ex, exIdx) => (
									<div
										key={exIdx}
										className="flex items-center justify-between py-1 border-b border-border/30 last:border-0"
									>
										<span className="text-xs">{ex.name}</span>
										<span className="text-xs text-muted-foreground">
											{ex.sets}×{ex.reps}
										</span>
									</div>
								))}
							</>
						)}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No workout planned for today</p>
				)}
			</Card>

			{/* Daily Log Detail */}
			{todayDaily && (
				<Card className="p-4 space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold">
						<Heart size={16} className="text-accent" />
						Today&apos;s Log
					</div>

					{todayDaily.sickness && (
						<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
							<AlertCircle size={14} />
							Sick day
						</div>
					)}

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{todayDaily.sleepHours > 0 && (
							<div className="flex items-center gap-2">
								<Moon size={14} className="text-blue-400" />
								<div>
									<p className="text-xs text-muted-foreground">Sleep</p>
									<p className="text-sm font-bold">
										{todayDaily.sleepHours}h ({todayDaily.sleepQuality})
									</p>
								</div>
							</div>
						)}
						{todayDaily.mood && (
							<div className="flex items-center gap-2">
								<Target size={14} className="text-purple-400" />
								<div>
									<p className="text-xs text-muted-foreground">Mood</p>
									<p className="text-sm font-bold capitalize">{todayDaily.mood}</p>
								</div>
							</div>
						)}
						{todayDaily.stressLevel > 0 && (
							<div className="flex items-center gap-2">
								<Heart size={14} className="text-red-400" />
								<div>
									<p className="text-xs text-muted-foreground">Stress</p>
									<p className="text-sm font-bold">{todayDaily.stressLevel}/5</p>
								</div>
							</div>
						)}
					</div>

					{todayDaily.notes && <p className="text-xs text-muted-foreground italic">{todayDaily.notes}</p>}
				</Card>
			)}

			{/* No data state */}
			{!todayNutrition && !todayDaily && todayWorkouts.length === 0 && !todayWeight && (
				<Card className="p-8 text-center">
					<p className="text-lg font-medium mb-1">Nothing logged yet today</p>
					<p className="text-sm text-muted-foreground">
						Start tracking your day — log meals, workouts, and vitals
					</p>
				</Card>
			)}
		</div>
	)
}
