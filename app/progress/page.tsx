"use client"

import { Activity, Brain, Heart, Moon, TrendingDown, TrendingUp } from "lucide-react"
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
	getDailyLog,
	getMeasurementLog,
	getNutritionLog,
	getProfile,
	getWeightLog,
	type Profile,
	weightChange,
} from "@/lib/data"

type Timespan = "1W" | "2W" | "1M" | "3M" | "All"

interface FilteredData {
	weight: Array<{ date: string; weightKg: number; weeklyAvgKg: number }>
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
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadData = async () => {
			if (!activeUser) return

			try {
				const [profileData, weightData, measurementData, nutritionData, dailyLogData] = await Promise.all([
					getProfile(activeUser),
					getWeightLog(activeUser),
					getMeasurementLog(activeUser),
					getNutritionLog(activeUser),
					getDailyLog(activeUser),
				])

				setProfile(profileData)

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

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-6xl mx-auto">
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
									? "bg-rose-500 text-white"
									: "bg-card text-foreground border border-border hover:border-rose-300"
							}`}
						>
							{span}
						</button>
					))}
				</div>

				{/* Weight Chart */}
				{filteredData.weight.length > 0 && (
					<Card className="p-6 mb-8">
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
									stroke="hsl(var(--rose-500))"
									dot={{ fill: "hsl(var(--rose-500))", r: 4 }}
									name="Daily Weight"
									isAnimationActive={false}
								/>
								<Line
									type="monotone"
									dataKey="weeklyAvgKg"
									stroke="hsl(var(--blue-500))"
									strokeDasharray="5 5"
									dot={false}
									name="Weekly Average"
									isAnimationActive={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</Card>
				)}

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{/* Starting Weight */}
					<Card className="p-6">
						<p className="text-sm font-medium text-muted-foreground mb-2">Starting Weight</p>
						<p className="text-3xl font-bold text-foreground">{stats.startingWeight.toFixed(1)}</p>
						<p className="text-xs text-muted-foreground mt-2">kg</p>
					</Card>

					{/* Current Weight */}
					<Card className="p-6">
						<p className="text-sm font-medium text-muted-foreground mb-2">Current Weight</p>
						<p className="text-3xl font-bold text-foreground">{stats.currentWeight.toFixed(1)}</p>
						<p className="text-xs text-muted-foreground mt-2">kg</p>
					</Card>

					{/* Total Change */}
					<Card className="p-6">
						<p className="text-sm font-medium text-muted-foreground mb-2">Total Change</p>
						<div className="flex items-center gap-2">
							<p className="text-3xl font-bold text-foreground">{stats.totalChange.toFixed(1)}</p>
							{stats.totalChange < 0 ? (
								<TrendingDown className="w-6 h-6 text-green-500" />
							) : (
								<TrendingUp className="w-6 h-6 text-red-500" />
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							{stats.totalChangePercent > 0 ? "+" : ""}
							{stats.totalChangePercent.toFixed(1)}%
						</p>
					</Card>

					{/* Weekly Avg Change */}
					<Card className="p-6">
						<p className="text-sm font-medium text-muted-foreground mb-2">Weekly Avg Change</p>
						<p className="text-3xl font-bold text-foreground">{stats.weeklyAvgChange.toFixed(2)}</p>
						<p className="text-xs text-muted-foreground mt-2">kg/week</p>
					</Card>
				</div>

				{/* Body Measurements */}
				{latestMeasurement && (
					<Card className="p-6 mb-8">
						<h2 className="text-2xl font-semibold text-foreground mb-6">Body Measurements</h2>

						{/* Measurements Grid */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
							<div className="bg-muted p-4 rounded-lg">
								<p className="text-xs font-medium text-muted-foreground mb-1">Waist</p>
								<p className="text-2xl font-bold text-foreground">
									{latestMeasurement.waistCm.toFixed(1)}
								</p>
								<p className="text-xs text-muted-foreground">cm</p>
							</div>
							<div className="bg-muted p-4 rounded-lg">
								<p className="text-xs font-medium text-muted-foreground mb-1">Hips</p>
								<p className="text-2xl font-bold text-foreground">
									{latestMeasurement.hipsCm.toFixed(1)}
								</p>
								<p className="text-xs text-muted-foreground">cm</p>
							</div>
							<div className="bg-muted p-4 rounded-lg">
								<p className="text-xs font-medium text-muted-foreground mb-1">Chest</p>
								<p className="text-2xl font-bold text-foreground">
									{latestMeasurement.chestCm.toFixed(1)}
								</p>
								<p className="text-xs text-muted-foreground">cm</p>
							</div>
							<div className="bg-muted p-4 rounded-lg">
								<p className="text-xs font-medium text-muted-foreground mb-1">Arms</p>
								<p className="text-2xl font-bold text-foreground">
									{latestMeasurement.armsCm.toFixed(1)}
								</p>
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
								<p className="text-2xl font-bold text-foreground">
									{latestMeasurement.neckCm.toFixed(1)}
								</p>
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
											stroke="hsl(var(--purple-500))"
											dot={{ r: 3 }}
											name="Waist"
											isAnimationActive={false}
										/>
										<Line
											type="monotone"
											dataKey="hipsCm"
											stroke="hsl(var(--pink-500))"
											dot={{ r: 3 }}
											name="Hips"
											isAnimationActive={false}
										/>
										<Line
											type="monotone"
											dataKey="chestCm"
											stroke="hsl(var(--cyan-500))"
											dot={{ r: 3 }}
											name="Chest"
											isAnimationActive={false}
										/>
										<Line
											type="monotone"
											dataKey="armsCm"
											stroke="hsl(var(--orange-500))"
											dot={{ r: 3 }}
											name="Arms"
											isAnimationActive={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						)}
					</Card>
				)}

				{/* Macro Adherence */}
				{filteredData.nutrition.length > 0 && (
					<Card className="p-6 mb-8">
						<h2 className="text-2xl font-semibold text-foreground mb-4">Macro Adherence</h2>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium text-foreground">Days Hit Target</p>
									<p className="text-sm font-semibold text-rose-500">{macroAdherence}%</p>
								</div>
								<div className="w-full bg-muted rounded-full h-3 overflow-hidden">
									<div
										className="bg-rose-500 h-full transition-all"
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

				{/* Daily Log Trends */}
				{filteredData.dailyLog.length > 0 && (
					<Card className="p-6">
						<h2 className="text-2xl font-semibold text-foreground mb-6">Daily Log Trends</h2>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{/* Average Sleep */}
							<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
								<Moon className="w-6 h-6 text-blue-500 flex-shrink-0" />
								<div>
									<p className="text-xs font-medium text-muted-foreground">Avg Sleep</p>
									<p className="text-2xl font-bold text-foreground">{dailyAvg.avgSleep}</p>
									<p className="text-xs text-muted-foreground">hours</p>
								</div>
							</div>

							{/* Average Energy */}
							<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
								<Activity className="w-6 h-6 text-yellow-500 flex-shrink-0" />
								<div>
									<p className="text-xs font-medium text-muted-foreground">Avg Energy</p>
									<p className="text-2xl font-bold text-foreground">
										{dailyAvg.avgEnergy.toFixed(1)}
									</p>
									<p className="text-xs text-muted-foreground">out of 5</p>
								</div>
							</div>

							{/* Most Common Mood */}
							<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
								<Heart className="w-6 h-6 text-rose-500 flex-shrink-0" />
								<div>
									<p className="text-xs font-medium text-muted-foreground">Most Common Mood</p>
									<p className="text-2xl font-bold text-foreground capitalize">{dailyAvg.avgMood}</p>
								</div>
							</div>

							{/* Average Stress */}
							<div className="bg-muted p-4 rounded-lg flex items-center gap-3">
								<Brain className="w-6 h-6 text-purple-500 flex-shrink-0" />
								<div>
									<p className="text-xs font-medium text-muted-foreground">Avg Stress</p>
									<p className="text-2xl font-bold text-foreground">
										{dailyAvg.avgStress.toFixed(1)}
									</p>
									<p className="text-xs text-muted-foreground">out of 5</p>
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* Empty State */}
				{filteredData.weight.length === 0 && (
					<Card className="p-12 text-center">
						<p className="text-muted-foreground text-lg">No data available for the selected timespan</p>
						<p className="text-muted-foreground text-sm mt-2">
							Start logging your progress to see insights
						</p>
					</Card>
				)}
			</div>
		</div>
	)
}
