"use client"

import { Activity, AlertCircle, Brain, Heart, Lightbulb, Moon, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
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
import { useActiveUser } from "@/components/user-context"
import { UserToggle } from "@/components/user-toggle"
import {
	estimateBodyFat,
	getDailyLog,
	getMeasurementLog,
	getNutritionLog,
	getProfile,
	getProgressPhotos,
	getWeightLog,
	type Profile,
	type ProgressPhotosData,
	weightChange,
} from "@/lib/data"

type Timespan = "1W" | "2W" | "1M" | "3M" | "All"

interface FilteredData {
	weight: Array<{ date: string; weightKg: number; weeklyAvgKg: number | null }>
	measurements: Array<{
		date: string
		waistCm: number
		hipsCm: number
		chestCm: number
		armsCm: number
		thighsCm: number
		neckCm: number
	}>
	nutrition: Array<{ date: string; proteinG: number; carbsG: number; fatG: number }>
	dailyLog: Array<{ date: string; sleepHours: number; energyLevel: number; mood: string; stressLevel: number }>
}

export default function ProgressPage() {
	const { activeUser } = useActiveUser()
	const [timespan, setTimespan] = useState<Timespan>("1M")
	const [profile, setProfile] = useState<Profile | null>(null)
	const [filteredData, setFilteredData] = useState<FilteredData>({
		weight: [],
		measurements: [],
		nutrition: [],
		dailyLog: [],
	})
	const [progressPhotos, setProgressPhotos] = useState<ProgressPhotosData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadData = async () => {
			if (!activeUser) return

			try {
				const [profileData, weightData, measurementData, nutritionData, dailyLogData, photosData] =
					await Promise.all([
						getProfile(activeUser),
						getWeightLog(activeUser),
						getMeasurementLog(activeUser),
						getNutritionLog(activeUser),
						getDailyLog(activeUser),
						getProgressPhotos(activeUser),
					])

				setProfile(profileData)
				setProgressPhotos(photosData)

				const now = new Date()
				const days = getTimespanDays(timespan)
				const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

				const filteredWeight =
					timespan === "All"
						? weightData.entries
						: weightData.entries.filter((e: any) => new Date(e.date) >= cutoffDate)

				const filteredMeasurements =
					timespan === "All"
						? measurementData.entries
						: measurementData.entries.filter((e: any) => new Date(e.date) >= cutoffDate)

				const filteredNutrition =
					timespan === "All"
						? nutritionData.days
						: nutritionData.days.filter((e: any) => new Date(e.date) >= cutoffDate)

				const filteredDailyLog =
					timespan === "All"
						? dailyLogData.entries
						: dailyLogData.entries.filter((e: any) => new Date(e.date) >= cutoffDate)

				setFilteredData({
					weight: filteredWeight.map((e: any) => ({
						date: formatDate(e.date),
						weightKg: e.weightKg,
						weeklyAvgKg: e.weeklyAvgKg,
					})),
					measurements: filteredMeasurements.map((e: any) => ({
						date: formatDate(e.date),
						waistCm: e.waistCm,
						hipsCm: e.hipsCm,
						chestCm: e.chestCm,
						armsCm: e.armsCm,
						thighsCm: e.thighsCm,
						neckCm: e.neckCm,
					})),
					nutrition: filteredNutrition.map((e: any) => ({
						date: formatDate(e.date),
						proteinG: e.dailyTotals.proteinG,
						carbsG: e.dailyTotals.carbsG,
						fatG: e.dailyTotals.fatG,
					})),
					dailyLog: filteredDailyLog.map((e: any) => ({
						date: formatDate(e.date),
						sleepHours: e.sleepHours,
						energyLevel: e.energyLevel,
						mood: e.mood,
						stressLevel: e.stressLevel,
					})),
				})

				setLoading(false)
			} catch (error) {
				/* fetch error */
				setLoading(false)
			}
		}

		loadData()
	}, [activeUser, timespan])

	const getTimespanDays = (span: Timespan): number => {
		const spans: Record<Timespan, number> = {
			"1W": 7,
			"2W": 14,
			"1M": 30,
			"3M": 90,
			All: 999999,
		}
		return spans[span]
	}

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString)
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
	}

	const calculateStats = () => {
		const startingWeight = profile?.startingWeightKg || 0
		const latestWeight =
			filteredData.weight.length > 0 ? filteredData.weight[filteredData.weight.length - 1]?.weightKg : 0
		const change = weightChange(
			filteredData.weight.map(e => ({
				weightKg: e.weightKg,
				date: e.date,
				weeklyAvgKg: e.weeklyAvgKg as number | null,
				notes: "",
			})),
		)

		const numWeeks = Math.ceil(filteredData.weight.length / 7) || 1
		const weeklyChange = change.change / numWeeks

		return {
			startingWeight,
			currentWeight: latestWeight,
			totalChange: change.change,
			totalChangePercent: change.percentage,
			weeklyAvgChange: weeklyChange,
		}
	}

	const calculateMacroAdherence = () => {
		if (!profile || filteredData.nutrition.length === 0) return 0

		const proteinTarget = profile.macros.proteinG
		const carbsTarget = profile.macros.carbsG
		const fatTarget = profile.macros.fatG

		const adherenceDays = filteredData.nutrition.filter(day => {
			const proteinMatch = Math.abs(day.proteinG - proteinTarget) / proteinTarget <= 0.1
			const carbsMatch = Math.abs(day.carbsG - carbsTarget) / carbsTarget <= 0.1
			const fatMatch = Math.abs(day.fatG - fatTarget) / fatTarget <= 0.1
			return proteinMatch && carbsMatch && fatMatch
		}).length

		return Math.round((adherenceDays / filteredData.nutrition.length) * 100)
	}

	const calculateAverageDailyLog = () => {
		if (filteredData.dailyLog.length === 0) return { avgSleep: 0, avgEnergy: 0, avgMood: "N/A", avgStress: 0 }

		const avgSleep =
			filteredData.dailyLog.reduce((sum, entry) => sum + entry.sleepHours, 0) / filteredData.dailyLog.length
		const avgEnergy =
			filteredData.dailyLog.reduce((sum, entry) => sum + entry.energyLevel, 0) / filteredData.dailyLog.length
		const avgStress =
			filteredData.dailyLog.reduce((sum, entry) => sum + entry.stressLevel, 0) / filteredData.dailyLog.length

		const moods = filteredData.dailyLog.map(e => e.mood).filter(m => m)
		const moodCounts: Record<string, number> = {}
		moods.forEach(mood => {
			moodCounts[mood] = (moodCounts[mood] || 0) + 1
		})
		const avgMood =
			Object.keys(moodCounts).length > 0
				? Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b))
				: "N/A"

		return {
			avgSleep: parseFloat(avgSleep.toFixed(1)),
			avgEnergy: parseFloat(avgEnergy.toFixed(1)),
			avgMood,
			avgStress: parseFloat(avgStress.toFixed(1)),
		}
	}

	const generateInsights = () => {
		const insights: string[] = []

		if (filteredData.weight.length > 1) {
			const firstWeight = filteredData.weight[0].weightKg
			const lastWeight = filteredData.weight[filteredData.weight.length - 1].weightKg
			const weightDiff = firstWeight - lastWeight
			const days = filteredData.weight.length
			const weeks = Math.max(1, Math.ceil(days / 7))
			const kgPerWeek = weightDiff / weeks

			if (Math.abs(weightDiff) < 0.5) {
				insights.push("Your weight has been stable throughout this period.")
			} else if (weightDiff > 0) {
				insights.push(
					`You've lost ${weightDiff.toFixed(1)} kg in ${weeks} weeks (${kgPerWeek.toFixed(2)} kg/week).`,
				)

				if (kgPerWeek > 1) {
					insights.push(
						"⚠️ Your weight loss rate exceeds 1 kg/week. Consider increasing calorie intake slightly to ensure sustainable progress.",
					)
				}
			} else {
				insights.push(`Your weight has increased by ${Math.abs(weightDiff).toFixed(1)} kg in ${weeks} weeks.`)
			}
		}

		if (filteredData.nutrition.length > 0) {
			const avgCalories =
				filteredData.nutrition.reduce((sum, day) => {
					const calsFromProtein = day.proteinG * 4
					const calsFromCarbs = day.carbsG * 4
					const calsFromFat = day.fatG * 9
					return sum + calsFromProtein + calsFromCarbs + calsFromFat
				}, 0) / filteredData.nutrition.length

			const target = profile?.dailyCalorieTarget || 2000

			insights.push(
				`You're averaging ${Math.round(avgCalories)} calories/day. Your target is ${target} calories.`,
			)

			if (avgCalories < target * 0.9) {
				insights.push("💡 You're eating significantly below your target. This may impact energy and recovery.")
			} else if (avgCalories > target * 1.1) {
				insights.push("💡 You're consuming above your target. Adjust portions to align with your goals.")
			}
		}

		if (filteredData.dailyLog.length > 0) {
			const avgSleep =
				filteredData.dailyLog.reduce((sum, entry) => sum + entry.sleepHours, 0) / filteredData.dailyLog.length
			const avgEnergy =
				filteredData.dailyLog.reduce((sum, entry) => sum + entry.energyLevel, 0) / filteredData.dailyLog.length

			insights.push(
				`You're averaging ${avgSleep.toFixed(1)} hours of sleep per night with ${avgEnergy.toFixed(1)}/5 energy.`,
			)

			if (avgSleep < 7) {
				insights.push(
					"💡 Getting less than 7 hours of sleep. Prioritize sleep quality for better recovery and progress.",
				)
			}
		}

		const macroAdherence = calculateMacroAdherence()
		if (macroAdherence < 50 && filteredData.nutrition.length > 0) {
			insights.push("⚠️ Macro adherence is low. Focus on hitting your protein and carb targets consistently.")
		}

		return insights
	}

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-card border border-border rounded-lg p-3 shadow-lg">
					<p className="text-foreground text-sm font-medium">{payload[0].payload.date}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }} className="text-sm">
							{entry.name}: {entry.value.toFixed(1)}
						</p>
					))}
				</div>
			)
		}
		return null
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Loading progress data...</p>
			</div>
		)
	}

	if (!profile) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">No profile data available</p>
			</div>
		)
	}

	const stats = calculateStats()
	const macroAdherence = calculateMacroAdherence()
	const dailyAvg = calculateAverageDailyLog()
	const hasMultipleMeasurements = filteredData.measurements.length > 1
	const latestMeasurement =
		filteredData.measurements.length > 0 ? filteredData.measurements[filteredData.measurements.length - 1] : null
	const insights = generateInsights()

	const getBodyFatEstimate = () => {
		if (!profile || !latestMeasurement) return null
		return estimateBodyFat(
			profile.gender as "male" | "female",
			latestMeasurement.waistCm,
			latestMeasurement.neckCm,
			profile.heightCm,
			latestMeasurement.hipsCm,
		)
	}

	const bodyFatEstimate = getBodyFatEstimate()

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold text-foreground">Progress</h1>
				<UserToggle />
			</div>

			{/* Timespan Filter */}
			<div className="flex gap-2 mb-8">
				{(["1W", "2W", "1M", "3M", "All"] as Timespan[]).map(span => (
					<button
						key={span}
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

			{/* Weight Trend Chart */}
			{filteredData.weight.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Weight Trend</h2>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={filteredData.weight}>
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

					{/* Measurements Grid */}
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground mb-1">Waist</p>
							<p className="text-2xl font-bold text-foreground">{latestMeasurement.waistCm.toFixed(1)}</p>
							<p className="text-xs text-muted-foreground">cm</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground mb-1">Hips</p>
							<p className="text-2xl font-bold text-foreground">{latestMeasurement.hipsCm.toFixed(1)}</p>
							<p className="text-xs text-muted-foreground">cm</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground mb-1">Chest</p>
							<p className="text-2xl font-bold text-foreground">{latestMeasurement.chestCm.toFixed(1)}</p>
							<p className="text-xs text-muted-foreground">cm</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground mb-1">Arms</p>
							<p className="text-2xl font-bold text-foreground">{latestMeasurement.armsCm.toFixed(1)}</p>
							<p className="text-xs text-muted-foreground">cm</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground mb-1">Thighs</p>
							<p className="text-2xl font-bold text-foreground">
								{latestMeasurement.thighsCm.toFixed(1)}
							</p>
							<p className="text-xs text-muted-foreground">cm</p>
						</div>
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs font-medium text-muted-foreground mb-1">Neck</p>
							<p className="text-2xl font-bold text-foreground">{latestMeasurement.neckCm.toFixed(1)}</p>
							<p className="text-xs text-muted-foreground">cm</p>
						</div>
					</div>

					{/* Measurements Chart */}
					{hasMultipleMeasurements && (
						<div className="mt-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">Measurement Trends</h3>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={filteredData.measurements}>
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
			{filteredData.nutrition.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-4">Nutrition Trend</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={filteredData.nutrition}>
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
			{filteredData.nutrition.length > 0 && (
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
								{
									filteredData.nutrition.filter(day => {
										const proteinTarget = profile.macros.proteinG
										const carbsTarget = profile.macros.carbsG
										const fatTarget = profile.macros.fatG
										const proteinMatch =
											Math.abs(day.proteinG - proteinTarget) / proteinTarget <= 0.1
										const carbsMatch = Math.abs(day.carbsG - carbsTarget) / carbsTarget <= 0.1
										const fatMatch = Math.abs(day.fatG - fatTarget) / fatTarget <= 0.1
										return proteinMatch && carbsMatch && fatMatch
									}).length
								}{" "}
								of {filteredData.nutrition.length} days within 10% of targets
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
			{filteredData.dailyLog.length > 0 && (
				<Card className="p-6">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Daily Log Trends</h2>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{/* Average Sleep */}
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Moon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Avg Sleep</p>
								<p className="text-2xl font-bold text-foreground">{dailyAvg.avgSleep}</p>
								<p className="text-xs text-muted-foreground">hours</p>
							</div>
						</div>

						{/* Average Energy */}
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Activity className="w-6 h-6 text-warning flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Avg Energy</p>
								<p className="text-2xl font-bold text-foreground">{dailyAvg.avgEnergy.toFixed(1)}</p>
								<p className="text-xs text-muted-foreground">out of 5</p>
							</div>
						</div>

						{/* Most Common Mood */}
						<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
							<Heart className="w-6 h-6 text-accent flex-shrink-0" />
							<div>
								<p className="text-xs font-medium text-muted-foreground">Most Common Mood</p>
								<p className="text-2xl font-bold text-foreground capitalize">{dailyAvg.avgMood}</p>
							</div>
						</div>

						{/* Average Stress */}
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
			{filteredData.weight.length === 0 && (
				<Card className="p-12 text-center">
					<p className="text-muted-foreground text-lg">No data available for the selected timespan</p>
					<p className="text-muted-foreground text-sm mt-2">Start logging your progress to see insights</p>
				</Card>
			)}
		</div>
	)
}
