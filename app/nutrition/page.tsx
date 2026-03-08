"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useActiveUser } from "@/components/user-context"
import { UserToggle } from "@/components/user-toggle"
import { getNutritionLog, getProfile, getTodayNutrition, type NutritionLog, type Profile } from "@/lib/data"

export default function NutritionPage() {
	const { activeUser } = useActiveUser()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null)
	const [loading, setLoading] = useState(true)
	const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			try {
				const [prof, nutrition] = await Promise.all([getProfile(activeUser), getNutritionLog(activeUser)])
				setProfile(prof)
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

	if (!profile || !nutritionLog) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	const today = new Date().toISOString().split("T")[0]
	const todayNutrition = getTodayNutrition(nutritionLog, today)

	const toggleDay = (date: string) => {
		const newSet = new Set(expandedDays)
		if (newSet.has(date)) {
			newSet.delete(date)
		} else {
			newSet.add(date)
		}
		setExpandedDays(newSet)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Nutrition</h1>
				<UserToggle />
			</div>

			{/* Today's Summary */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-6">Today's Summary</h2>
				{todayNutrition ? (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{/* Calories */}
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-muted-foreground">Calories</span>
								<span>
									{todayNutrition.dailyTotals.calories} /{profile.dailyCalorieTarget}
								</span>
							</div>
							<Progress
								value={(todayNutrition.dailyTotals.calories / profile.dailyCalorieTarget) * 100}
								className="h-2"
							/>
						</div>

						{/* Protein */}
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-muted-foreground">Protein</span>
								<span>
									{todayNutrition.dailyTotals.proteinG} /{profile.macros.proteinG}g
								</span>
							</div>
							<Progress
								value={(todayNutrition.dailyTotals.proteinG / profile.macros.proteinG) * 100}
								className="h-2"
							/>
						</div>

						{/* Carbs */}
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-muted-foreground">Carbs</span>
								<span>
									{todayNutrition.dailyTotals.carbsG} /{profile.macros.carbsG}g
								</span>
							</div>
							<Progress
								value={(todayNutrition.dailyTotals.carbsG / profile.macros.carbsG) * 100}
								className="h-2"
							/>
						</div>

						{/* Fat */}
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-muted-foreground">Fat</span>
								<span>
									{todayNutrition.dailyTotals.fatG} /{profile.macros.fatG}g
								</span>
							</div>
							<Progress
								value={(todayNutrition.dailyTotals.fatG / profile.macros.fatG) * 100}
								className="h-2"
							/>
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No meals logged yet</p>
				)}
			</Card>

			{/* Today's Meals */}
			{todayNutrition && (
				<Card className="p-6 bg-card border-border">
					<h2 className="text-lg font-semibold mb-4">Today's Meals</h2>
					<div className="space-y-2">
						{todayNutrition.meals.length > 0 ? (
							todayNutrition.meals.map((meal, idx) => (
								<div key={idx}>
									<button
										onClick={() => toggleDay(`meal-${idx}`)}
										className="w-full flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
									>
										<div>
											<p className="font-semibold">{meal.mealType}</p>
											<p className="text-sm text-muted-foreground">{meal.items.length} items</p>
										</div>
										{expandedDays.has(`meal-${idx}`) ? (
											<ChevronUp size={18} />
										) : (
											<ChevronDown size={18} />
										)}
									</button>
									{expandedDays.has(`meal-${idx}`) && (
										<div className="mt-2 ml-4 space-y-2 border-l border-border/50 pl-4">
											{meal.items.map((item, itemIdx) => (
												<div
													key={itemIdx}
													className="flex items-center justify-between text-sm"
												>
													<div>
														<p>{item.food}</p>
														<p className="text-xs text-muted-foreground">
															{item.portionG}g
														</p>
													</div>
													<div className="text-right">
														<p className="font-semibold">{item.calories} cal</p>
														<p className="text-xs text-muted-foreground">
															P:{item.proteinG}g C:{item.carbsG}g F:{item.fatG}g
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							))
						) : (
							<p className="text-sm text-muted-foreground">No meals logged yet</p>
						)}
					</div>
				</Card>
			)}

			{/* Historical View */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-4">History</h2>
				<div className="space-y-2">
					{nutritionLog.days.length > 0 ? (
						[...nutritionLog.days].reverse().map((day, idx) => (
							<button
								key={idx}
								onClick={() => toggleDay(day.date)}
								className="w-full flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
							>
								<div>
									<p className="font-semibold">{day.date}</p>
									<p className="text-sm text-muted-foreground">
										{day.dailyTotals.calories} cal | P:
										{day.dailyTotals.proteinG}g C:
										{day.dailyTotals.carbsG}g F:
										{day.dailyTotals.fatG}g
									</p>
								</div>
								{expandedDays.has(day.date) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
							</button>
						))
					) : (
						<p className="text-sm text-muted-foreground">No nutrition history yet</p>
					)}
				</div>
			</Card>
		</div>
	)
}
