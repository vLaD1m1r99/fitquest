"use client"

import { ChevronDown, ChevronUp, Utensils } from "lucide-react"
import { useEffect, useState } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useActiveUser } from "@/components/user-context"
import {
	getNutritionLog,
	getProfile,
	getTodayNutrition,
	type NutritionDay,
	type NutritionLog,
	type Profile,
} from "@/lib/data"

type Timespan = "Today" | "1W" | "2W" | "1M" | "All"

export default function NutritionPage() {
	const { activeUser } = useActiveUser()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null)
	const [todayData, setTodayData] = useState<NutritionDay | null>(null)
	const [timespan, setTimespan] = useState<Timespan>("Today")
	const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!activeUser) return

		const loadData = async () => {
			try {
				const profileData = await getProfile(activeUser)
				const logData = await getNutritionLog(activeUser)
				setProfile(profileData)
				setNutritionLog(logData)

				const today = new Date().toISOString().split("T")[0]
				const todayNutrition = getTodayNutrition(logData, today)
				setTodayData(todayNutrition ?? null)
			} catch (error) {
				/* fetch error */
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [activeUser])

	const toggleDayExpanded = (date: string) => {
		const newExpanded = new Set(expandedDays)
		if (newExpanded.has(date)) {
			newExpanded.delete(date)
		} else {
			newExpanded.add(date)
		}
		setExpandedDays(newExpanded)
	}

	const getFilteredDays = (): NutritionDay[] => {
		if (!nutritionLog?.days) return []

		const today = new Date()
		const days = [...nutritionLog.days]

		switch (timespan) {
			case "Today": {
				const todayStr = today.toISOString().split("T")[0]
				return days.filter(d => d.date === todayStr)
			}
			case "1W": {
				const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
				return days.filter(d => new Date(d.date) >= oneWeekAgo)
			}
			case "2W": {
				const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
				return days.filter(d => new Date(d.date) >= twoWeeksAgo)
			}
			case "1M": {
				const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
				return days.filter(d => new Date(d.date) >= oneMonthAgo)
			}
			case "All":
			default:
				return days
		}
	}

	const filteredDays = getFilteredDays()

	const getPeriodStats = () => {
		if (filteredDays.length === 0) {
			return {
				totalCalories: 0,
				avgProtein: 0,
				avgCarbs: 0,
				avgFat: 0,
			}
		}

		const totalProtein = filteredDays.reduce((sum, day) => sum + day.dailyTotals.proteinG, 0)
		const totalCarbs = filteredDays.reduce((sum, day) => sum + day.dailyTotals.carbsG, 0)
		const totalFat = filteredDays.reduce((sum, day) => sum + day.dailyTotals.fatG, 0)

		return {
			totalCalories: filteredDays.reduce((sum, day) => sum + day.dailyTotals.calories, 0),
			avgProtein: Math.round(totalProtein / filteredDays.length),
			avgCarbs: Math.round(totalCarbs / filteredDays.length),
			avgFat: Math.round(totalFat / filteredDays.length),
		}
	}

	const getChartData = () => {
		return filteredDays.map(day => ({
			date: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
			calories: day.dailyTotals.calories,
			fullDate: day.date,
		}))
	}

	const getMacroPieData = () => {
		if (filteredDays.length === 0) return []

		const totalProteinCals = filteredDays.reduce((sum, day) => sum + day.dailyTotals.proteinG * 4, 0)
		const totalCarbsCals = filteredDays.reduce((sum, day) => sum + day.dailyTotals.carbsG * 4, 0)
		const totalFatCals = filteredDays.reduce((sum, day) => sum + day.dailyTotals.fatG * 9, 0)
		const totalMacroCals = totalProteinCals + totalCarbsCals + totalFatCals

		if (totalMacroCals === 0) return []

		return [
			{
				name: "Protein",
				value: Math.round((totalProteinCals / totalMacroCals) * 100),
				calories: totalProteinCals,
			},
			{
				name: "Carbs",
				value: Math.round((totalCarbsCals / totalMacroCals) * 100),
				calories: totalCarbsCals,
			},
			{
				name: "Fat",
				value: Math.round((totalFatCals / totalMacroCals) * 100),
				calories: totalFatCals,
			},
		]
	}

	const macroColors: Record<string, string> = {
		Protein: "var(--accent, #a78bfa)",
		Carbs: "var(--success, #4ade80)",
		Fat: "var(--warning, #fbbf24)",
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-card border border-border rounded-lg p-3 shadow-lg text-foreground">
					<p className="font-semibold">{payload[0].payload.date}</p>
					<p className="text-sm">
						Calories: <span className="font-medium">{payload[0].value}</span>
					</p>
				</div>
			)
		}
		return null
	}

	if (loading || !profile || !nutritionLog) {
		return (
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<h1 className="text-4xl font-bold text-foreground">Nutrition</h1>
				</div>
				<p className="text-muted-foreground">Loading nutrition data...</p>
			</div>
		)
	}

	const periodStats = getPeriodStats()
	const chartData = getChartData()
	const macroPieData = getMacroPieData()
	const { dailyCalorieTarget, macros: targetMacros } = profile

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold text-foreground">Nutrition</h1>
			</div>

			{/* Timespan Filter */}
			<div className="flex gap-2 flex-wrap">
				{(["Today", "1W", "2W", "1M", "All"] as Timespan[]).map(span => (
					<button
						key={span}
						onClick={() => setTimespan(span)}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							timespan === span
								? "bg-accent text-background"
								: "bg-card border border-border text-foreground hover:bg-surface-hover"
						}`}
					>
						{span}
					</button>
				))}
			</div>

			{/* Today's Summary (shown when timespan is Today) */}
			{timespan === "Today" && todayData && (
				<Card className="p-6 bg-card border-border">
					<div className="mb-6">
						<h2 className="text-2xl font-semibold text-foreground mb-6">Today's Summary</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
							{/* Calories Circle */}
							<div className="flex flex-col items-center justify-center">
								<div className="relative w-48 h-48 flex items-center justify-center mb-4">
									<div className="absolute inset-0 rounded-full border-8 border-muted"></div>
									<div
										className="absolute inset-0 rounded-full border-8"
										style={{
											borderColor: "transparent",
											borderTopColor: "var(--accent, #a78bfa)",
											borderRightColor: "var(--accent, #a78bfa)",
											transform: `rotate(${(todayData.dailyTotals.calories / dailyCalorieTarget) * 360}deg)`,
										}}
									></div>
									<div className="absolute inset-2 bg-background rounded-full flex flex-col items-center justify-center">
										<div className="text-4xl font-bold text-foreground">
											{Math.round(todayData.dailyTotals.calories)}
										</div>
										<div className="text-sm text-muted-foreground">/ {dailyCalorieTarget}</div>
									</div>
								</div>
								<p className="text-center text-muted-foreground text-sm">Calories</p>
							</div>

							{/* Macro Bars */}
							<div className="flex flex-col justify-center space-y-6">
								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="font-medium text-foreground">Protein</span>
										<span className="text-sm text-muted-foreground">
											{Math.round(todayData.dailyTotals.proteinG)}g / {targetMacros.proteinG}g
										</span>
									</div>
									<Progress
										value={Math.min(
											(todayData.dailyTotals.proteinG / targetMacros.proteinG) * 100,
											100,
										)}
										className="h-2"
									/>
								</div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="font-medium text-foreground">Carbs</span>
										<span className="text-sm text-muted-foreground">
											{Math.round(todayData.dailyTotals.carbsG)}g / {targetMacros.carbsG}g
										</span>
									</div>
									<Progress
										value={Math.min(
											(todayData.dailyTotals.carbsG / targetMacros.carbsG) * 100,
											100,
										)}
										className="h-2"
									/>
								</div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="font-medium text-foreground">Fat</span>
										<span className="text-sm text-muted-foreground">
											{Math.round(todayData.dailyTotals.fatG)}g / {targetMacros.fatG}g
										</span>
									</div>
									<Progress
										value={Math.min((todayData.dailyTotals.fatG / targetMacros.fatG) * 100, 100)}
										className="h-2"
									/>
								</div>

								{/* Remaining */}
								<div className="pt-4 border-t border-border">
									<p className="text-sm font-semibold text-foreground mb-3">Remaining</p>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Calories:</span>
											<span className="font-medium text-foreground">
												{Math.max(todayData.remaining.calories, 0)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Protein:</span>
											<span className="font-medium text-foreground">
												{Math.max(todayData.remaining.proteinG, 0)}g
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Carbs:</span>
											<span className="font-medium text-foreground">
												{Math.max(todayData.remaining.carbsG, 0)}g
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Fat:</span>
											<span className="font-medium text-foreground">
												{Math.max(todayData.remaining.fatG, 0)}g
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Period Overview */}
			{filteredDays.length > 0 ? (
				<Card className="p-6 bg-card border-border">
					<h2 className="text-2xl font-semibold text-foreground mb-6">
						{timespan === "Today" ? "Today" : `Last ${timespan}`} Overview
					</h2>

					{/* Chart */}
					<div className="mb-8">
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
								<XAxis dataKey="date" stroke="var(--muted-foreground, #6b7280)" />
								<YAxis stroke="var(--muted-foreground, #6b7280)" />
								<Tooltip content={<CustomTooltip />} />
								<Bar dataKey="calories" fill="var(--accent, #a78bfa)" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Macro Averages */}
					<div className="grid grid-cols-3 gap-4">
						<div className="bg-surface rounded-lg p-4">
							<div className="text-sm text-muted-foreground mb-1">Avg Protein</div>
							<div className="text-2xl font-bold text-foreground">{periodStats.avgProtein}g</div>
						</div>
						<div className="bg-surface rounded-lg p-4">
							<div className="text-sm text-muted-foreground mb-1">Avg Carbs</div>
							<div className="text-2xl font-bold text-foreground">{periodStats.avgCarbs}g</div>
						</div>
						<div className="bg-surface rounded-lg p-4">
							<div className="text-sm text-muted-foreground mb-1">Avg Fat</div>
							<div className="text-2xl font-bold text-foreground">{periodStats.avgFat}g</div>
						</div>
					</div>
				</Card>
			) : (
				<Card className="p-6 bg-card border-border">
					<div className="text-center py-8 text-muted-foreground">
						{timespan === "Today" ? "No meals logged today" : `No nutrition data for this period`}
					</div>
				</Card>
			)}

			{/* Macro Breakdown Pie Chart */}
			{filteredDays.length > 0 && macroPieData.length > 0 && (
				<Card className="p-6 bg-card border-border">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Macro Breakdown</h2>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8">
						<div className="flex-1 min-h-[300px]">
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={macroPieData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={100}
										paddingAngle={5}
										dataKey="value"
									>
										{macroPieData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={macroColors[entry.name]} />
										))}
									</Pie>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="flex-1 space-y-4">
							{macroPieData.map(macro => (
								<div key={macro.name} className="bg-surface rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: macroColors[macro.name] }}
											></div>
											<span className="font-medium text-foreground">{macro.name}</span>
										</div>
										<span className="text-lg font-bold text-foreground">{macro.value}%</span>
									</div>
									<div className="text-sm text-muted-foreground">
										{Math.round(macro.calories)} calories
									</div>
								</div>
							))}
						</div>
					</div>
				</Card>
			)}

			{/* Today's Meals (only when timespan is Today) */}
			{timespan === "Today" && (
				<Card className="p-6 bg-card border-border">
					<h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
						<Utensils className="w-6 h-6" />
						Today's Meals
					</h2>

					{todayData && todayData.meals && todayData.meals.length > 0 ? (
						<div className="space-y-4">
							{todayData.meals.map((meal, mealIndex) => (
								<div key={mealIndex} className="border border-border rounded-lg overflow-hidden">
									<div className="bg-surface p-4">
										<div className="font-semibold text-foreground capitalize">{meal.mealType}</div>
									</div>

									{meal.items && meal.items.length > 0 && (
										<div className="p-4 border-t border-border space-y-3">
											{meal.items.map((item, itemIndex) => (
												<div key={itemIndex} className="flex justify-between text-sm">
													<div>
														<p className="font-medium text-foreground">{item.food}</p>
														<p className="text-xs text-muted-foreground">
															{item.portionG}g
														</p>
													</div>
													<div className="text-right">
														<p className="font-medium text-foreground">
															{Math.round(item.calories)} cal
														</p>
														<p className="text-xs text-muted-foreground">
															P: {Math.round(item.proteinG)}g | C:{" "}
															{Math.round(item.carbsG)}g | F:
															{Math.round(item.fatG)}g
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-center py-8 text-muted-foreground">No meals logged today</p>
					)}
				</Card>
			)}

			{/* Meals History (all periods) */}
			{filteredDays.length > 0 && (
				<Card className="p-6 bg-card border-border">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Nutrition History</h2>

					<div className="space-y-2">
						{filteredDays
							.slice()
							.reverse()
							.map((day, index) => {
								const dayDate = new Date(day.date)
								const isExpanded = expandedDays.has(day.date)

								return (
									<div key={index} className="border border-border rounded-lg overflow-hidden">
										<button
											onClick={() => toggleDayExpanded(day.date)}
											className="w-full bg-surface p-4 hover:bg-surface-hover transition-colors flex items-center justify-between"
										>
											<div className="text-left">
												<p className="font-semibold text-foreground">
													{dayDate.toLocaleDateString("en-US", {
														weekday: "long",
														year: "numeric",
														month: "long",
														day: "numeric",
													})}
												</p>
												<p className="text-sm text-muted-foreground">
													{Math.round(day.dailyTotals.calories)} cal • P:{" "}
													{Math.round(day.dailyTotals.proteinG)}g • C:{" "}
													{Math.round(day.dailyTotals.carbsG)}g • F:{" "}
													{Math.round(day.dailyTotals.fatG)}g
												</p>
											</div>
											{isExpanded ? (
												<ChevronUp className="w-5 h-5 text-muted-foreground" />
											) : (
												<ChevronDown className="w-5 h-5 text-muted-foreground" />
											)}
										</button>

										{isExpanded && day.meals && day.meals.length > 0 && (
											<div className="p-4 border-t border-border space-y-4 bg-muted/30">
												{day.meals.map((meal, mealIndex) => (
													<div key={mealIndex}>
														<p className="font-medium text-foreground mb-2 capitalize">
															{meal.mealType}
														</p>
														<div className="space-y-2 ml-4">
															{meal.items && meal.items.length > 0 ? (
																meal.items.map((item, itemIndex) => (
																	<div
																		key={itemIndex}
																		className="flex justify-between text-sm"
																	>
																		<div>
																			<p className="text-foreground">
																				{item.food}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				{item.portionG}g
																			</p>
																		</div>
																		<div className="text-right">
																			<p className="text-foreground font-medium">
																				{Math.round(item.calories)} cal
																			</p>
																			<p className="text-xs text-muted-foreground">
																				P: {Math.round(item.proteinG)}g | C:{" "}
																				{Math.round(item.carbsG)}g | F:
																				{Math.round(item.fatG)}g
																			</p>
																		</div>
																	</div>
																))
															) : (
																<p className="text-xs text-muted-foreground">
																	No items
																</p>
															)}
														</div>
													</div>
												))}
											</div>
										)}

										{isExpanded && (!day.meals || day.meals.length === 0) && (
											<div className="p-4 border-t border-border text-center text-muted-foreground text-sm">
												No meals logged
											</div>
										)}
									</div>
								)
							})}
					</div>
				</Card>
			)}
		</div>
	)
}
