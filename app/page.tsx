import {
	getDailyLog,
	getNutritionLog,
	getProfile,
	getRPG,
	getWeightLog,
	getWorkoutLog,
	getWorkoutPlan,
} from "@/lib/data"
import { getActiveUser } from "@/lib/user"
import { DashboardView } from "./dashboard-view"

export const metadata = { title: "Dashboard" }

export default async function Dashboard() {
	const user = await getActiveUser()

	const [profile, rpg, weightLog, dailyLog, workoutLog, nutritionLog, workoutPlan] = await Promise.all([
		getProfile(user),
		getRPG(user),
		getWeightLog(user),
		getDailyLog(user),
		getWorkoutLog(user),
		getNutritionLog(user),
		getWorkoutPlan(user),
	])

	return (
		<DashboardView
			profile={profile}
			rpg={rpg}
			weightLog={weightLog}
			dailyLog={dailyLog}
			workoutLog={workoutLog}
			nutritionLog={nutritionLog}
			workoutPlan={workoutPlan}
		/>
	)
}
