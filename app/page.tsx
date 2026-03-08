import { getActiveUser } from "@/lib/user"
import {
	getDailyLog,
	getNutritionLog,
	getProfile,
	getRPG,
	getWeightLog,
	getWorkoutLog,
} from "@/lib/data"
import { DashboardView } from "./dashboard-view"

export const metadata = { title: "Dashboard" }

export default async function Dashboard() {
	const user = await getActiveUser()

	const [profile, rpg, weightLog, dailyLog, workoutLog, nutritionLog] = await Promise.all([
		getProfile(user),
		getRPG(user),
		getWeightLog(user),
		getDailyLog(user),
		getWorkoutLog(user),
		getNutritionLog(user),
	])

	return (
		<DashboardView
			profile={profile}
			rpg={rpg}
			weightLog={weightLog}
			dailyLog={dailyLog}
			workoutLog={workoutLog}
			nutritionLog={nutritionLog}
		/>
	)
}
