"use client"

import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Dumbbell,
	Footprints,
	Heart,
	Moon,
	Target,
	Utensils,
	Zap,
} from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type {
	DailyLog,
	DailyLogEntry,
	NutritionDay,
	NutritionLog,
	Profile,
	WeightLog,
	WorkoutLog,
	WorkoutSession,
} from "@/lib/data"

interface CalendarViewProps {
	profile: Profile
	weightLog: WeightLog
	dailyLog: DailyLog
	workoutLog: WorkoutLog
	nutritionLog: NutritionLog
}

function toDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getMonthGrid(year: number, month: number): Date[] {
	const firstDay = new Date(year, month, 1)
	const lastDay = new Date(year, month + 1, 0)
	const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

	const days: Date[] = []
	for (let i = startOffset - 1; i >= 0; i--) {
		days.push(new Date(year, month, -i))
	}
	for (let d = 1; d <= lastDay.getDate(); d++) {
		days.push(new Date(year, month, d))
	}
	while (days.length < 42) {
		const nextIdx = days.length - startOffset - lastDay.getDate()
		days.push(new Date(year, month + 1, nextIdx + 1))
	}
	return days
}

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
]

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function CalendarView({ profile, weightLog, dailyLog, workoutLog, nutritionLog }: CalendarViewProps) {
	const today = new Date()
	const todayStr = toDateStr(today)
	const [selectedDate, setSelectedDate] = useState(todayStr)
	const [viewMonth, setViewMonth] = useState(today.getMonth())
	const [viewYear, setViewYear] = useState(today.getFullYear())

	// Build lookup maps
	const workoutsByDate = new Map<string, WorkoutSession[]>()
	for (const session of workoutLog.sessions) {
		const existing = workoutsByDate.get(session.date) || []
		existing.push(session)
		workoutsByDate.set(session.date, existing)
	}

	const nutritionByDate = new Map<string, NutritionDay>()
	for (const day of nutritionLog.days) {
		nutritionByDate.set(day.date, day)
	}

	const dailyByDate = new Map<string, DailyLogEntry>()
	for (const entry of dailyLog.entries) {
		dailyByDate.set(entry.date, entry)
	}

	const weightByDate = new Map<string, number>()
	for (const entry of weightLog.entries) {
		weightByDate.set(entry.date, entry.weightKg)
	}

	const selectedWorkouts = workoutsByDate.get(selectedDate) || []
	const selectedNutrition = nutritionByDate.get(selectedDate)
	const selectedDaily = dailyByDate.get(selectedDate)
	const selectedWeight = weightByDate.get(selectedDate)

	const monthDays = getMonthGrid(viewYear, viewMonth)

	const prevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11)
			setViewYear(y => y - 1)
		} else setViewMonth(m => m - 1)
	}

	const nextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0)
			setViewYear(y => y + 1)
		} else setViewMonth(m => m + 1)
	}

	const goToToday = () => {
		setSelectedDate(todayStr)
		setViewMonth(today.getMonth())
		setViewYear(today.getFullYear())
	}

	const hasData = (dateStr: string) =>
		workoutsByDate.has(dateStr) ||
		nutritionByDate.has(dateStr) ||
		dailyByDate.has(dateStr) ||
		weightByDate.has(dateStr)

	const hasSick = (dateStr: string) => dailyByDate.get(dateStr)?.sickness === true
	const hasPeriod = (dateStr: string) => {
		const entry = dailyByDate.get(dateStr)
		return entry?.menstrualFlow != null && entry.menstrualFlow !== "none"
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl sm:text-3xl font-bold">Calendar</h1>

			{/* Calendar Grid */}
			<Card className="p-4 sm:p-5 bg-card">
				<div className="flex items-center justify-between mb-4">
					<button
						type="button"
						onClick={prevMonth}
						className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						type="button"
						onClick={goToToday}
						className="text-lg font-bold hover:text-accent transition-colors"
					>
						{MONTH_NAMES[viewMonth]} {viewYear}
					</button>
					<button
						type="button"
						onClick={nextMonth}
						className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
					>
						<ChevronRight size={18} />
					</button>
				</div>

				<div className="grid grid-cols-7 gap-1 mb-1">
					{WEEKDAYS.map(d => (
						<div
							key={d}
							className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
						>
							{d}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-1">
					{monthDays.map((day, idx) => {
						const dateStr = toDateStr(day)
						const isCurrentMonth = day.getMonth() === viewMonth
						const isToday = dateStr === todayStr
						const isSelected = dateStr === selectedDate
						const dayHasData = hasData(dateStr)
						const dayIsSick = hasSick(dateStr)
						const dayHasPeriod = hasPeriod(dateStr)
						const dayHasWorkout = workoutsByDate.has(dateStr)
						const dayHasNutrition = nutritionByDate.has(dateStr)

						return (
							<button
								key={idx}
								type="button"
								onClick={() => setSelectedDate(dateStr)}
								className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
									isCurrentMonth
										? isSelected
											? "bg-accent text-accent-foreground font-bold ring-2 ring-accent/50"
											: isToday
												? "bg-accent/15 text-accent font-bold"
												: dayHasData
													? "hover:bg-muted/50 text-foreground"
													: "hover:bg-muted/30 text-muted-foreground"
										: "text-muted-foreground/30"
								}`}
							>
								<span className="text-xs sm:text-sm">{day.getDate()}</span>
								{isCurrentMonth && dayHasData && (
									<div className="flex gap-0.5 mt-0.5">
										{dayHasWorkout && (
											<span
												className={`w-1 h-1 rounded-full ${isSelected ? "bg-accent-foreground" : "bg-accent"}`}
											/>
										)}
										{dayHasNutrition && (
											<span
												className={`w-1 h-1 rounded-full ${isSelected ? "bg-accent-foreground/70" : "bg-blue-400"}`}
											/>
										)}
										{dayIsSick && (
											<span
												className={`w-1 h-1 rounded-full ${isSelected ? "bg-accent-foreground/70" : "bg-red-400"}`}
											/>
										)}
										{dayHasPeriod && (
											<span
												className={`w-1 h-1 rounded-full ${isSelected ? "bg-accent-foreground/70" : "bg-pink-400"}`}
											/>
										)}
									</div>
								)}
							</button>
						)
					})}
				</div>

				<div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
					<span className="flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-accent" /> Workout
					</span>
					<span className="flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Nutrition
					</span>
					<span className="flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Sick
					</span>
					<span className="flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-pink-400" /> Period
					</span>
				</div>
			</Card>

			{/* Selected Day Detail */}
			<div className="space-y-4">
				<h2 className="text-lg font-bold">
					{selectedDate === todayStr
						? "Today"
						: new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
								weekday: "long",
								month: "short",
								day: "numeric",
							})}
				</h2>

				{!selectedWorkouts.length && !selectedNutrition && !selectedDaily && !selectedWeight && (
					<Card className="p-6 text-center">
						<p className="text-muted-foreground text-sm">Nothing logged for this day</p>
					</Card>
				)}

				{/* Daily log */}
				{selectedDaily && (
					<Card className="p-4 space-y-3">
						<div className="flex items-center gap-2 text-sm font-semibold">
							<Heart size={16} className="text-accent" />
							Daily Log
						</div>

						{selectedDaily.sickness && (
							<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
								<AlertCircle size={14} />
								Sick day
							</div>
						)}

						{selectedDaily.menstrualFlow && selectedDaily.menstrualFlow !== "none" && (
							<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 text-pink-400 text-sm">
								<Heart size={14} />
								Period — Day {selectedDaily.menstrualDay || "?"} ({selectedDaily.menstrualFlow} flow)
							</div>
						)}

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{selectedDaily.steps > 0 && (
								<div className="flex items-center gap-2">
									<Footprints size={14} className="text-green-400" />
									<div>
										<p className="text-xs text-muted-foreground">Steps</p>
										<p className="text-sm font-bold">{selectedDaily.steps.toLocaleString()}</p>
									</div>
								</div>
							)}
							{selectedDaily.sleepHours > 0 && (
								<div className="flex items-center gap-2">
									<Moon size={14} className="text-blue-400" />
									<div>
										<p className="text-xs text-muted-foreground">Sleep</p>
										<p className="text-sm font-bold">
											{selectedDaily.sleepHours}h ({selectedDaily.sleepQuality})
										</p>
									</div>
								</div>
							)}
							{selectedDaily.energyLevel > 0 && (
								<div className="flex items-center gap-2">
									<Zap size={14} className="text-yellow-400" />
									<div>
										<p className="text-xs text-muted-foreground">Energy</p>
										<p className="text-sm font-bold">{selectedDaily.energyLevel}/5</p>
									</div>
								</div>
							)}
							{selectedDaily.mood && (
								<div className="flex items-center gap-2">
									<Target size={14} className="text-purple-400" />
									<div>
										<p className="text-xs text-muted-foreground">Mood</p>
										<p className="text-sm font-bold capitalize">{selectedDaily.mood}</p>
									</div>
								</div>
							)}
						</div>

						{selectedDaily.notes && (
							<p className="text-xs text-muted-foreground italic">{selectedDaily.notes}</p>
						)}
					</Card>
				)}

				{/* Weight */}
				{selectedWeight && (
					<Card className="p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-semibold">⚖️ Weight</span>
							<span className="text-lg font-bold">{selectedWeight} kg</span>
						</div>
					</Card>
				)}

				{/* Workouts — full detail */}
				{selectedWorkouts.map((session, idx) => {
					const totalVolume = session.exercises.reduce(
						(sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weightKg * set.reps, 0),
						0,
					)

					// Find previous session with same sessionType
					let previousVolume: number | null = null
					for (let i = workoutLog.sessions.length - 1; i >= 0; i--) {
						const s = workoutLog.sessions[i]
						if (s.sessionType === session.sessionType && s.date < selectedDate) {
							previousVolume = s.exercises.reduce(
								(sum, ex) => sum + ex.sets.reduce((st, set) => st + set.weightKg * set.reps, 0),
								0,
							)
							break
						}
					}

					const volumeChange = previousVolume ? ((totalVolume - previousVolume) / previousVolume) * 100 : null
					const volumeComparisonColor =
						volumeChange !== null ? (volumeChange >= 0 ? "text-green-400" : "text-red-400") : ""
					const volumeComparisonSign = volumeChange !== null ? (volumeChange >= 0 ? "+" : "") : ""

					return (
						<Card key={idx} className="p-4 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-sm font-semibold">
									<Dumbbell size={16} className="text-accent" />
									{session.sessionType}
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									<span>{session.durationMin}m</span>
									<span className="text-accent font-bold">RPE {session.overallRPE}</span>
								</div>
							</div>

							{/* Volume summary */}
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<span>{session.exercises.length} exercises</span>
								<span>{session.exercises.reduce((s, e) => s + e.sets.length, 0)} total sets</span>
								<span className="font-medium text-foreground">
									{totalVolume.toLocaleString()}kg volume
								</span>
								{volumeChange !== null && (
									<span
										className={`font-semibold ${volumeComparisonColor} bg-opacity-10 px-2 py-1 rounded`}
									>
										Volume: {volumeComparisonSign}
										{volumeChange.toFixed(1)}% vs last
									</span>
								)}
							</div>

							{/* Exercise details */}
							<div className="space-y-3">
								{session.exercises.map((ex, exIdx) => (
									<div key={exIdx} className="space-y-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">{ex.name}</span>
											<span className="text-xs text-muted-foreground">
												best: {Math.max(...ex.sets.map(s => s.weightKg))}kg
											</span>
										</div>
										{/* Individual sets */}
										<div className="flex flex-wrap gap-1.5">
											{ex.sets.map((set, sIdx) => (
												<span
													key={sIdx}
													className="text-[11px] px-2 py-0.5 rounded bg-muted/40 text-foreground"
												>
													{set.weightKg}kg × {set.reps}
												</span>
											))}
										</div>
									</div>
								))}
							</div>

							{session.notes && <p className="text-xs text-muted-foreground italic">{session.notes}</p>}
						</Card>
					)
				})}

				{/* Nutrition */}
				{selectedNutrition && (
					<Card className="p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm font-semibold">
								<Utensils size={16} className="text-blue-400" />
								Nutrition
							</div>
							<span className="text-sm font-bold">{selectedNutrition.dailyTotals.calories} cal</span>
						</div>

						<div className="grid grid-cols-3 gap-3">
							<div>
								<div className="flex justify-between text-[10px] mb-1">
									<span className="text-muted-foreground">Protein</span>
									<span className="font-medium">{selectedNutrition.dailyTotals.proteinG}g</span>
								</div>
								<Progress
									value={Math.min(
										100,
										(selectedNutrition.dailyTotals.proteinG / profile.macros.proteinG) * 100,
									)}
									className="h-1.5 bg-muted"
								/>
								<div className="text-[10px] mt-1">
									{(() => {
										const diff = selectedNutrition.dailyTotals.proteinG - profile.macros.proteinG
										const isOver = diff > 0
										return (
											<span className={isOver ? "text-red-400" : "text-green-400"}>
												{isOver ? "+" : ""}
												{diff.toFixed(0)}g {isOver ? "over" : "under"}
											</span>
										)
									})()}
								</div>
							</div>
							<div>
								<div className="flex justify-between text-[10px] mb-1">
									<span className="text-muted-foreground">Carbs</span>
									<span className="font-medium">{selectedNutrition.dailyTotals.carbsG}g</span>
								</div>
								<Progress
									value={Math.min(
										100,
										(selectedNutrition.dailyTotals.carbsG / profile.macros.carbsG) * 100,
									)}
									className="h-1.5 bg-muted"
								/>
								<div className="text-[10px] mt-1">
									{(() => {
										const diff = selectedNutrition.dailyTotals.carbsG - profile.macros.carbsG
										const isOver = diff > 0
										return (
											<span className={isOver ? "text-red-400" : "text-green-400"}>
												{isOver ? "+" : ""}
												{diff.toFixed(0)}g {isOver ? "over" : "under"}
											</span>
										)
									})()}
								</div>
							</div>
							<div>
								<div className="flex justify-between text-[10px] mb-1">
									<span className="text-muted-foreground">Fat</span>
									<span className="font-medium">{selectedNutrition.dailyTotals.fatG}g</span>
								</div>
								<Progress
									value={Math.min(
										100,
										(selectedNutrition.dailyTotals.fatG / profile.macros.fatG) * 100,
									)}
									className="h-1.5 bg-muted"
								/>
								<div className="text-[10px] mt-1">
									{(() => {
										const diff = selectedNutrition.dailyTotals.fatG - profile.macros.fatG
										const isOver = diff > 0
										return (
											<span className={isOver ? "text-red-400" : "text-green-400"}>
												{isOver ? "+" : ""}
												{diff.toFixed(0)}g {isOver ? "over" : "under"}
											</span>
										)
									})()}
								</div>
							</div>
						</div>

						{/* Calories summary */}
						<div className="flex items-center gap-4 text-xs text-muted-foreground">
							<span>Target: {profile.dailyCalorieTarget} cal</span>
							{(() => {
								const caloriesDiff = selectedNutrition.dailyTotals.calories - profile.dailyCalorieTarget
								const isOver = caloriesDiff > 0
								return (
									<span className={`font-semibold ${isOver ? "text-red-400" : "text-green-400"}`}>
										{isOver ? "+" : ""}
										{caloriesDiff} cal {isOver ? "over target" : "under target"}
									</span>
								)
							})()}
						</div>

						{selectedNutrition.meals.map((meal, mIdx) => (
							<div key={mIdx}>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
									{(meal as any).mealName || meal.mealType}
								</p>
								<div className="space-y-1">
									{meal.items.map((item, iIdx) => (
										<div key={iIdx} className="flex items-center justify-between text-xs gap-2">
											<span className="truncate">
												{item.food} ({item.portionG}g)
											</span>
											<span className="text-muted-foreground whitespace-nowrap">
												{item.calories}cal · {item.proteinG}P · {item.carbsG}C · {item.fatG}F
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</Card>
				)}
			</div>
		</div>
	)
}
