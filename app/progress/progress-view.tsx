"use client"

import { Activity, Brain, Dumbbell, Heart, Lightbulb, Moon } from "lucide-react"
import { useState } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import {
	type DailyLog,
	estimateBodyFat,
	type MeasurementLog,
	type NutritionLog,
	type Profile,
	type ProgressPhotosData,
	type WeightLog,
	type WorkoutLog,
	weightChange,
} from "@/lib/data"

type Timespan = "1W" | "2W" | "1M" | "3M" | "All"

interface ProgressViewProps {
	profile: Profile
	weightLog: WeightLog
	measurementLog: MeasurementLog
	nutritionLog: NutritionLog
	dailyLog: DailyLog
	progressPhotos: ProgressPhotosData
	workoutLog: WorkoutLog
}

function getTimespanDays(span: Timespan): number {
	const spans: Record<Timespan, number> = { "1W": 7, "2W": 14, "1M": 30, "3M": 90, All: 999999 }
	return spans[span]
}

function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function filterByTimespan<T extends { date: string }>(entries: T[], timespan: Timespan): T[] {
	if (timespan === "All") return entries
	const now = new Date()
	const days = getTimespanDays(timespan)
	const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
	return entries.filter(e => new Date(e.date) >= cutoff)
}

export function ProgressView({
	profile,
	weightLog,
	measurementLog,
	nutritionLog,
	dailyLog,
	progressPhotos,
	workoutLog,
}: ProgressViewProps) {
	const [timespan, setTimespan] = useState<Timespan>("1M")

	const filteredWeight = filterByTimespan(weightLog.entries, timespan).map(e => ({
		date: formatDate(e.date),
		weightKg: e.weightKg,
		weeklyAvgKg: e.weeklyAvgKg,
	}))

	const filteredMeasurements = filterByTimespan(measurementLog.entries, timespan).map(e => ({
		date: formatDate(e.date),
		waistCm: e.waistCm,
		hipsCm: e.hipsCm,
		chestCm: e.chestCm,
		armsCm: e.armsCm,
		thighsCm: e.thighsCm,
		neckCm: e.neckCm,
	}))

	const filteredNutrition = filterByTimespan(nutritionLog.days, timespan).map(e => ({
		date: formatDate(e.date),
		proteinG: e.dailyTotals.proteinG,
		carbsG: e.dailyTotals.carbsG,
		fatG: e.dailyTotals.fatG,
	}))

	const filteredDailyLog = filterByTimespan(dailyLog.entries, timespan).map(e => ({
		date: formatDate(e.date),
		sleepHours: e.sleepHours,
		energyLevel: e.energyLevel,
		mood: e.mood,
		stressLevel: e.stressLevel,
	}))

	const filteredSessions = filterByTimespan(workoutLog.sessions, timespan)

	// Workout volume per session (total kg lifted)
	const workoutVolumeData = filteredSessions.map(s => {
		const totalVolume = s.exercises.reduce(
			(sum, ex) => sum + ex.sets.reduce((setSum, set) => setSum + set.weightKg * set.reps, 0),
			0,
		)
		return {
			date: formatDate(s.date),
			volumeKg: Math.round(totalVolume),
			durationMin: s.durationMin,
			rpe: s.overallRPE,
		}
	})

	// Workout frequency by week
	const workoutFrequencyData = (() => {
		const weekMap = new Map<string, { count: number; totalDuration: number }>()
		for (const s of filteredSessions) {
			const d = new Date(s.date)
			const weekStart = new Date(d)
			weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7))
			const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`
			const existing = weekMap.get(weekKey) || { count: 0, totalDuration: 0 }
			existing.count += 1
			existing.totalDuration += s.durationMin
			weekMap.set(weekKey, existing)
		}
		return Array.from(weekMap.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([week, data]) => ({
				date: formatDate(week),
				sessions: data.count,
				totalMinutes: data.totalDuration,
			}))
	})()

	const stats = (() => {
		const latestWeight = filteredWeight.length > 0 ? filteredWeight[filteredWeight.length - 1]?.weightKg : 0
		const change = weightChange(
			filteredWeight.map(e => ({
				weightKg: e.weightKg,
				date: e.date,
				weeklyAvgKg: e.weeklyAvgKg as number | null,
				notes: "",
			})),
		)
		const numWeeks = Math.ceil(filteredWeight.length / 7) || 1
		return {
			startingWeight: profile.startingWeightKg,
			currentWeight: latestWeight,
			totalChange: change.change,
			totalChangePercent: change.percentage,
			weeklyAvgChange: change.change / numWeeks,
		}
	})()

	const macroAdherence = (() => {
		if (filteredNutrition.length === 0) return 0
		const { proteinG: pt, carbsG: ct, fatG: ft } = profile.macros
		const adherenceDays = filteredNutrition.filter(day => {
			const pm = Math.abs(day.proteinG - pt) / pt <= 0.1
			const cm = Math.abs(day.carbsG - ct) / ct <= 0.1
			const fm = Math.abs(day.fatG - ft) / ft <= 0.1
			return pm && cm && fm
		}).length
		return Math.round((adherenceDays / filteredNutrition.length) * 100)
	})()

	const dailyAvg = (() => {
		if (filteredDailyLog.length === 0) return { avgSleep: 0, avgEnergy: 0, avgMood: "N/A", avgStress: 0 }
		const n = filteredDailyLog.length
		const avgSleep = filteredDailyLog.reduce((s, e) => s + e.sleepHours, 0) / n
		const avgEnergy = filteredDailyLog.reduce((s, e) => s + e.energyLevel, 0) / n
		const avgStress = filteredDailyLog.reduce((s, e) => s + e.stressLevel, 0) / n
		const moodCounts: Record<string, number> = {}
		for (const e of filteredDailyLog) {
			if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
		}
		const avgMood =
			Object.keys(moodCounts).length > 0
				? Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b))
				: "N/A"
		return {
			avgSleep: Number.parseFloat(avgSleep.toFixed(1)),
			avgEnergy: Number.parseFloat(avgEnergy.toFixed(1)),
			avgMood,
			avgStress: Number.parseFloat(avgStress.toFixed(1)),
		}
	})()

	const workoutStats = (() => {
		if (filteredSessions.length === 0) return { totalSessions: 0, avgDuration: 0, avgRPE: 0, totalVolume: 0 }
		const n = filteredSessions.length
		const avgDuration = filteredSessions.reduce((s, e) => s + e.durationMin, 0) / n
		const avgRPE = filteredSessions.reduce((s, e) => s + e.overallRPE, 0) / n
		const totalVolume = workoutVolumeData.reduce((s, e) => s + e.volumeKg, 0)
		return {
			totalSessions: n,
			avgDuration: Math.round(avgDuration),
			avgRPE: Number.parseFloat(avgRPE.toFixed(1)),
			totalVolume,
		}
	})()

	const insights = (() => {
		const result: string[] = []

		if (filteredWeight.length > 1) {
			const firstW = filteredWeight[0].weightKg
			const lastW = filteredWeight[filteredWeight.length - 1].weightKg
			const diff = firstW - lastW
			const weeks = Math.max(1, Math.ceil(filteredWeight.length / 7))
			const kgPerWeek = diff / weeks

			if (Math.abs(diff) < 0.5) {
				result.push("Your weight has been stable throughout this period.")
			} else if (diff > 0) {
				result.push(`You've lost ${diff.toFixed(1)} kg in ${weeks} weeks (${kgPerWeek.toFixed(2)} kg/week).`)
				if (kgPerWeek > 1) {
					result.push(
						"Your weight loss rate exceeds 1 kg/week. Consider increasing calorie intake slightly to ensure sustainable progress.",
					)
				}
			} else {
				result.push(`Your weight has increased by ${Math.abs(diff).toFixed(1)} kg in ${weeks} weeks.`)
			}
		}

		if (filteredNutrition.length > 0) {
			const avgCals =
				filteredNutrition.reduce((s, d) => s + d.proteinG * 4 + d.carbsG * 4 + d.fatG * 9, 0) /
				filteredNutrition.length
			const target = profile.dailyCalorieTarget || 2000
			result.push(`You're averaging ${Math.round(avgCals)} calories/day. Your target is ${target} calories.`)
			if (avgCals < target * 0.9)
				result.push("You're eating significantly below your target. This may impact energy and recovery.")
			else if (avgCals > target * 1.1)
				result.push("You're consuming above your target. Adjust portions to align with your goals.")
		}

		if (filteredDailyLog.length > 0) {
			const avgSleep = filteredDailyLog.reduce((s, e) => s + e.sleepHours, 0) / filteredDailyLog.length
			const avgEnergy = filteredDailyLog.reduce((s, e) => s + e.energyLevel, 0) / filteredDailyLog.length
			result.push(
				`You're averaging ${avgSleep.toFixed(1)} hours of sleep per night with ${avgEnergy.toFixed(1)}/5 energy.`,
			)
			if (avgSleep < 7)
				result.push(
					"Getting less than 7 hours of sleep. Prioritize sleep quality for better recovery and progress.",
				)
		}

		if (filteredSessions.length > 0) {
			result.push(
				`${workoutStats.totalSessions} workouts completed with avg RPE ${workoutStats.avgRPE} and avg duration ${workoutStats.avgDuration} min.`,
			)
			if (workoutVolumeData.length > 2) {
				const first3Avg = workoutVolumeData.slice(0, 3).reduce((s, e) => s + e.volumeKg, 0) / 3
				const last3Avg = workoutVolumeData.slice(-3).reduce((s, e) => s + e.volumeKg, 0) / 3
				if (last3Avg > first3Avg * 1.05) {
					result.push("Volume is trending up — progressive overload is working!")
				} else if (last3Avg < first3Avg * 0.9) {
					result.push("Volume has dropped recently. Check recovery, nutrition, or deload status.")
				}
			}
		}

		if (macroAdherence < 50 && filteredNutrition.length > 0)
			result.push("Macro adherence is low. Focus on hitting your protein and carb targets consistently.")

		return result
	})()

	const latestMeasurement =
		filteredMeasurements.length > 0 ? filteredMeasurements[filteredMeasurements.length - 1] : null
	const hasMultipleMeasurements = filteredMeasurements.length > 1

	const bodyFatEstimate = latestMeasurement
		? estimateBodyFat(
				profile.gender as "male" | "female",
				latestMeasurement.waistCm,
				latestMeasurement.neckCm,
				profile.heightCm,
				latestMeasurement.hipsCm,
			)
		: null

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-card border border-border rounded-lg p-3 shadow-lg">
					<p className="text-foreground text-sm font-medium">{payload[0].payload.date}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }} className="text-sm">
							{entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
						</p>
					))}
				</div>
			)
		}
		return null
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Progress</h1>
			</div>

			{/* Timespan Filter */}
			<div className="flex gap-2 flex-wrap">
				{(["1W", "2W", "1M", "3M", "All"] as Timespan[]).map(span => (
					<button
						key={span}
						type="button"
						onClick={() => setTimespan(span)}
						className={`px-4 py-2 rounded-full font-medium transition-all ${
							timespan === span
								? "bg-accent text-accent-foreground shadow-sm"
								: "bg-card text-foreground border border-border hover:border-accent/50"
						}`}
					>
						{span}
					</button>
				))}
			</div>

			{/* Workout Stats Summary */}
			{filteredSessions.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Workout Overview</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Dumbbell className="w-6 h-6 text-accent flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Sessions</p>
								<p className="text-2xl font-bold text-foreground">{workoutStats.totalSessions}</p>
							</div>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground">Avg Duration</p>
							<p className="text-2xl font-bold text-foreground">{workoutStats.avgDuration}</p>
							<p className="text-xs text-muted-foreground">minutes</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground">Avg RPE</p>
							<p className="text-2xl font-bold text-foreground">{workoutStats.avgRPE}</p>
							<p className="text-xs text-muted-foreground">out of 10</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground">Total Volume</p>
							<p className="text-2xl font-bold text-foreground">
								{workoutStats.totalVolume.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground">kg lifted</p>
						</div>
					</div>
				</Card>
			)}

			{/* Workout Volume Chart */}
			{workoutVolumeData.length > 1 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Workout Volume</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={workoutVolumeData}>
							<CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
							<XAxis dataKey="date" stroke="currentColor" opacity={0.6} />
							<YAxis stroke="currentColor" opacity={0.6} />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar dataKey="volumeKg" fill="#a78bfa" name="Volume (kg)" isAnimationActive={false} />
						</BarChart>
					</ResponsiveContainer>
				</Card>
			)}

			{/* Workout Frequency Chart */}
			{workoutFrequencyData.length > 1 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Weekly Frequency</h2>
					<ResponsiveContainer width="100%" height={250}>
						<BarChart data={workoutFrequencyData}>
							<CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
							<XAxis dataKey="date" stroke="currentColor" opacity={0.6} />
							<YAxis stroke="currentColor" opacity={0.6} allowDecimals={false} />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar dataKey="sessions" fill="#22d3ee" name="Sessions / week" isAnimationActive={false} />
						</BarChart>
					</ResponsiveContainer>
				</Card>
			)}

			{/* Weight Trend Chart */}
			{filteredWeight.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Weight Trend</h2>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={filteredWeight}>
							<CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
							<XAxis dataKey="date" stroke="currentColor" opacity={0.6} />
							<YAxis stroke="currentColor" opacity={0.6} />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Line
								type="monotone"
								dataKey="weightKg"
								stroke="#a78bfa"
								dot={{ fill: "#a78bfa", r: 4 }}
								name="Daily Weight"
								isAnimationActive={false}
							/>
							<Line
								type="monotone"
								dataKey="weeklyAvgKg"
								stroke="#22d3ee"
								strokeDasharray="5 5"
								dot={false}
								name="Weekly Average"
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</Card>
			)}

			{/* Body Fat % Estimate */}
			{latestMeasurement && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Body Fat % Estimate</h2>
					{bodyFatEstimate !== null ? (
						<div className="space-y-4">
							<div className="flex items-end gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">Estimated Body Fat</p>
									<p className="text-5xl font-bold text-foreground">{bodyFatEstimate.toFixed(1)}</p>
									<p className="text-sm text-muted-foreground">%</p>
								</div>
								<div className="flex-1 h-32 bg-muted rounded-lg p-4 flex flex-col justify-between">
									<div className="w-full bg-muted rounded-full h-4 overflow-hidden mb-2 border border-border">
										<div
											className="bg-accent h-full transition-all"
											style={{ width: `${Math.min(bodyFatEstimate, 100)}%` }}
										/>
									</div>
									<p className="text-xs text-muted-foreground text-center">
										Based on waist, neck, and height
									</p>
								</div>
							</div>
						</div>
					) : (
						<p className="text-muted-foreground">No measurement data yet</p>
					)}
				</Card>
			)}

			{/* Body Measurements */}
			{latestMeasurement && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Body Measurements</h2>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
						{[
							{ label: "Waist", value: latestMeasurement.waistCm },
							{ label: "Hips", value: latestMeasurement.hipsCm },
							{ label: "Chest", value: latestMeasurement.chestCm },
							{ label: "Arms", value: latestMeasurement.armsCm },
							{ label: "Thighs", value: latestMeasurement.thighsCm },
							{ label: "Neck", value: latestMeasurement.neckCm },
						].map(m => (
							<div key={m.label} className="bg-muted p-4 rounded-lg">
								<p className="text-xs font-medium text-muted-foreground mb-1">{m.label}</p>
								<p className="text-2xl font-bold text-foreground">{m.value.toFixed(1)}</p>
								<p className="text-xs text-muted-foreground">cm</p>
							</div>
						))}
					</div>

					{hasMultipleMeasurements && (
						<div className="mt-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">Measurement Trends</h3>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={filteredMeasurements}>
									<CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
									<XAxis dataKey="date" stroke="currentColor" opacity={0.6} />
									<YAxis stroke="currentColor" opacity={0.6} />
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Line
										type="monotone"
										dataKey="waistCm"
										stroke="#a78bfa"
										dot={{ r: 3 }}
										name="Waist"
										isAnimationActive={false}
									/>
									<Line
										type="monotone"
										dataKey="hipsCm"
										stroke="#f472b6"
										dot={{ r: 3 }}
										name="Hips"
										isAnimationActive={false}
									/>
									<Line
										type="monotone"
										dataKey="chestCm"
										stroke="#22d3ee"
										dot={{ r: 3 }}
										name="Chest"
										isAnimationActive={false}
									/>
									<Line
										type="monotone"
										dataKey="armsCm"
										stroke="#fbbf24"
										dot={{ r: 3 }}
										name="Arms"
										isAnimationActive={false}
									/>
									<Line
										type="monotone"
										dataKey="thighsCm"
										stroke="#4ade80"
										dot={{ r: 3 }}
										name="Thighs"
										isAnimationActive={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</Card>
			)}

			{/* Nutrition Trend Chart */}
			{filteredNutrition.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Nutrition Trend</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={filteredNutrition}>
							<CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
							<XAxis dataKey="date" stroke="currentColor" opacity={0.6} />
							<YAxis stroke="currentColor" opacity={0.6} />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar
								dataKey="proteinG"
								stackId="a"
								fill="#4ade80"
								name="Protein (g)"
								isAnimationActive={false}
							/>
							<Bar
								dataKey="carbsG"
								stackId="a"
								fill="#fbbf24"
								name="Carbs (g)"
								isAnimationActive={false}
							/>
							<Bar dataKey="fatG" stackId="a" fill="#f87171" name="Fat (g)" isAnimationActive={false} />
						</BarChart>
					</ResponsiveContainer>
				</Card>
			)}

			{/* Macro Adherence */}
			{filteredNutrition.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Macro Adherence</h2>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="flex items-center justify-between mb-2">
								<p className="text-sm font-medium text-foreground">Days Hit Target</p>
								<p className="text-sm font-semibold text-accent">{macroAdherence}%</p>
							</div>
							<div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border">
								<div
									className="bg-accent h-full transition-all"
									style={{ width: `${macroAdherence}%` }}
								/>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								{(() => {
									const { proteinG: pt, carbsG: ct, fatG: ft } = profile.macros
									return filteredNutrition.filter(day => {
										const pm = Math.abs(day.proteinG - pt) / pt <= 0.1
										const cm = Math.abs(day.carbsG - ct) / ct <= 0.1
										const fm = Math.abs(day.fatG - ft) / ft <= 0.1
										return pm && cm && fm
									}).length
								})()} of {filteredNutrition.length} days within 10% of targets
							</p>
						</div>
					</div>
				</Card>
			)}

			{/* Insights Section */}
			{insights.length > 0 && (
				<Card className="p-6 border-l-4 border-accent">
					<div className="flex gap-3 items-start">
						<Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
						<div className="space-y-2">
							<h2 className="text-lg font-semibold text-foreground">Insights</h2>
							<div className="space-y-2">
								{insights.map((insight, idx) => (
									<p key={idx} className="text-sm text-foreground leading-relaxed">
										{insight}
									</p>
								))}
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Daily Log Trends */}
			{filteredDailyLog.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Daily Log Trends</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Moon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Avg Sleep</p>
								<p className="text-2xl font-bold text-foreground">{dailyAvg.avgSleep}</p>
								<p className="text-xs text-muted-foreground">hours</p>
							</div>
						</div>
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Activity className="w-6 h-6 text-warning flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Avg Energy</p>
								<p className="text-2xl font-bold text-foreground">{dailyAvg.avgEnergy.toFixed(1)}</p>
								<p className="text-xs text-muted-foreground">out of 5</p>
							</div>
						</div>
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Heart className="w-6 h-6 text-accent flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Most Common Mood</p>
								<p className="text-2xl font-bold text-foreground capitalize">{dailyAvg.avgMood}</p>
							</div>
						</div>
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Brain className="w-6 h-6 text-accent flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Avg Stress</p>
								<p className="text-2xl font-bold text-foreground">{dailyAvg.avgStress.toFixed(1)}</p>
								<p className="text-xs text-muted-foreground">out of 5</p>
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Progress Photos */}
			<Card className="p-6">
				<h2 className="text-2xl font-semibold text-foreground mb-6">Progress Photos</h2>
				{progressPhotos && progressPhotos.photos && progressPhotos.photos.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{progressPhotos.photos.map((photo, idx) => (
							<div key={idx} className="bg-muted rounded-lg overflow-hidden">
								<img
									src={photo.url}
									alt={photo.caption || "Progress photo"}
									className="w-full aspect-square object-cover"
								/>
								<div className="p-3">
									<p className="text-sm font-medium text-foreground">{formatDate(photo.date)}</p>
									{photo.caption && (
										<p className="text-xs text-muted-foreground mt-1">{photo.caption}</p>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							No progress photos yet — send your photos to Claude to add them here
						</p>
					</div>
				)}
			</Card>

			{/* Empty State */}
			{filteredWeight.length === 0 && filteredSessions.length === 0 && (
				<Card className="p-12 text-center">
					<p className="text-muted-foreground text-lg">No data available for the selected timespan</p>
					<p className="text-muted-foreground text-sm mt-2">Start logging your progress to see insights</p>
				</Card>
			)}
		</div>
	)
}
