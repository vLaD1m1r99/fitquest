import { getActiveUser } from "@/lib/user"
import { getProfile, getNutritionLog, getTodayNutrition } from "@/lib/data"
import { NutritionView } from "./nutrition-view"

export const metadata = {
	title: "Nutrition",
}

export default async function NutritionPage() {
	const activeUser = await getActiveUser()

	if (!activeUser) {
		return (
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<h1 className="text-4xl font-bold text-foreground">Nutrition</h1>
				</div>
				<p className="text-muted-foreground">Please log in to view nutrition data</p>
			</div>
		)
	}

	const profile = await getProfile(activeUser)
	const nutritionLog = await getNutritionLog(activeUser)

	const today = new Date().toISOString().split("T")[0]
	const todayData = getTodayNutrition(nutritionLog, today)

	return (
		<NutritionView
			profile={profile}
			nutritionLog={nutritionLog}
			todayData={todayData ?? null}
		/>
	)
}
