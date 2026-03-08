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
import { UserToggle } from "@/components/user-toggle"
import {
	getNutritionLog,
	getProfile,
	getTodayNutrition,
	type NutritionDay,
	type NutritionLog,
	type Profile,
} from "@/lib/data"

export default function NutritionPage() {
	const { activeUser } = useActiveUser()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null)
	const [todayData, setTodayData] = useState<NutritionDay | null>(null)
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

	if (loading || !profile || !nutritionLog) {
		return (
			<div className="min-h-screen bg-background p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-between mb-8">
						<h1 className="text-4xl font-bold text-foreground">Nutrition</h1>
						<UserToggle />
					</div>
					<p className="text-muted-foreground">Loading nutrition data...</p>
				</div>
			</div>
		)
	}

	const { dailyCalorieTarget, macros: targetMacros } = profile

	const weeklyData = (nutritionLog.days || []).slice(-7).map(day => ({
		date: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
		calories: day.dailyTotals.calories,
		target: dailyCalorieTarget,
	}))

	const todayMacroTotal = todayData
		? todayData.dailyTotals.proteinG * 4 + todayData.dailyTotals.carbsG * 4 + todayData.dailyTotals.fatG * 9
		: 0

	const macroPieData = todayData
		? [
				{
					name: "Protein",
					value:
						todayData.dailyTotals.proteinG > 0
							? Math.round(((todayData.dailyTotals.proteinG * 4) / todayMacroTotal) * 100)
							: 0,
					calories: todayData.dailyTotals.proteinG * 4,
				},
				{
					name: "Carbs",
					value:
						todayData.dailyTotals.carbsG > 0
							? Math.round(((todayData.dailyTotals.carbsG * 4) / todayMacroTotal) * 100)
							: 0,
					calories: todayData.dailyTotals.carbsG * 4,
				},
				{
					name: "Fat",
					value:
						todayData.dailyTotals.fatG > 0
							? Math.round(((todayData.dailyTotals.fatG * 9) / todayMacroTotal) * 100)
							: 0,
					calories: todayData.dailyTotals.fatG * 9,
				},
			]
		: []

	const macroColors: Record<string, string> = {
		Protein: "oklch(0.65 0.14 15)",
		Carbs: "oklch(0.72 0.12 75)",
		Fat: "oklch(0.62 0.17 145)",
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

	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-4xl font-bold text-foreground">Nutrition</h1>
					<UserToggle />
				</div>

				{todayData && (
					<Card className="mb-8 p-6 bg-card border-border">
						<div className="mb-6">
							<h2 className="text-2xl font-semibold text-foreground mb-6">Today's Summary</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								<div className="flex flex-col items-center justify-center">
									<div className="relative w-48 h-48 flex items-center justify-center mb-4">
										<div className="absolute inset-0 rounded-full border-8 border-muted"></div>
										<div
											className="absolute inset-0 rounded-full border-8"
											style={{
												borderColor: "transparent",
												borderTopColor: "oklch(0.65 0.14 15)",
												borderRightColor: "oklch(0.65 0.14 15)",
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
											value={Math.min(
												(todayData.dailyTotals.fatG / targetMacros.fatG) * 100,
												100,
											)}
											className="h-2"
										/>
									</div>

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

				<Card className="mb-8 p-6 bg-card border-border">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Weekly Overview</h2>

					<div className="mb-8">
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={weeklyData}>
								<CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
								<XAxis dataKey="date" stroke="oklch(0.5 0 0)" />
								<YAxis stroke="oklch(0.5 0 0)" />
								<Tooltip content={<CustomTooltip />} />
								<Bar dataKey="calories" fill="oklch(0.65 0.14 15)" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="bg-background rounded-lg p-4">
							<div className="text-sm text-muted-foreground mb-1">Avg Protein</div>
							<div className="text-2xl font-bold text-foreground">
								{nutritionLog.days && nutritionLog.days.length > 0
									? Math.round(
											nutritionLog.days.reduce((sum, day) => sum + day.dailyTotals.proteinG, 0) /
												nutritionLog.days.length,
										)
									: 0}
								g
							</div>
						</div>
						<div className="bg-background rounded-lg p-4">
							<div className="text-sm text-muted-foreground mb-1">Avg Carbs</div>
							<div className="text-2xl font-bold text-foreground">
								{nutritionLog.days && nutritionLog.days.length > 0
									? Math.round(
											nutritionLog.days.reduce((sum, day) => sum + day.dailyTotals.carbsG, 0) /
												nutritionLog.days.length,
										)
									: 0}
								g
							</div>
						</div>
						<div className="bg-background rounded-lg p-4">
							<div className="text-sm text-muted-foreground mb-1">Avg Fat</div>
							<div className="text-2xl font-bold text-foreground">
								{nutritionLog.days && nutritionLog.days.length > 0
									? Math.round(
											nutritionLog.days.reduce((sum, day) => sum + day.dailyTotals.fatG, 0) /
												nutritionLog.days.length,
										)
									: 0}
								g
							</div>
						</div>
					</div>
				</Card>

				{todayData && (
					<Card className="mb-8 p-6 bg-card border-border">
						<h2 className="text-2xl font-semibold text-foreground mb-6">Macro Breakdown</h2>

						{macroPieData.some(m => m.value > 0) ? (
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
										<div key={macro.name} className="bg-background rounded-lg p-4">
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<div
														className="w-3 h-3 rounded-full"
														style={{ backgroundColor: macroColors[macro.name] }}
													></div>
													<span className="font-medium text-foreground">{macro.name}</span>
												</div>
												<span className="text-lg font-bold text-foreground">
													{macro.value}%
												</span>
											</div>
											<div className="text-sm text-muted-foreground">
												{Math.round(macro.calories)} calories
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">No meals logged yet</div>
						)}
					</Card>
				)}

				{todayData && (
					<Card className="mb-8 p-6 bg-card border-border">
						<h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
							<Utensils className="w-6 h-6" />
							Today's Meals
						</h2>

						{todayData.meals && todayData.meals.length > 0 ? (
							<div className="space-y-4">
								{todayData.meals.map((meal, mealIndex) => (
									<div key={mealIndex} className="border border-border rounded-lg overflow-hidden">
										<div className="bg-background p-4 cursor-pointer">
											<div className="font-semibold text-foreground capitalize">
												{meal.mealType}
											</div>
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
							<p className="text-center py-8 text-muted-foreground">No meals logged yet</p>
						)}
					</Card>
				)}

				<Card className="p-6 bg-card border-border">
					<h2 className="text-2xl font-semibold text-foreground mb-6">Nutrition History</h2>

					{nutritionLog.days && nutritionLog.days.length > 0 ? (
						<div className="space-y-2">
							{nutritionLog.days
								.slice()
								.reverse()
								.map((day, index) => {
									const dayDate = new Date(day.date)
									const isExpanded = expandedDays.has(day.date)

									return (
										<div key={index} className="border border-border rounded-lg overflow-hidden">
											<button
												onClick={() => toggleDayExpanded(day.date)}
												className="w-full bg-background p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
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
					) : (
						<p className="text-center py-8 text-muted-foreground">No nutrition history yet</p>
					)}
				</Card>
			</div>
		</div>
	)
}
