import { getDailyLog, getNutritionLog, getProfile, getWeightLog, getWorkoutLog } from "@/lib/data"
import { getActiveUser } from "@/lib/user"
import { CalendarView } from "./calendar-view"

export const metadata = { title: "Calendar | FitQuest" }

export default async function CalendarPage() {
	const user = await getActiveUser()

	const [profile, weightLog, dailyLog, workoutLog, nutritionLog] = await Promise.all([
		getProfile(user),
		getWeightLog(user),
		getDailyLog(user),
		getWorkoutLog(user),
		getNutritionLog(user),
	])

	return (
		<CalendarView
			profile={profile}
			weightLog={weightLog}
			dailyLog={dailyLog}
			workoutLog={workoutLog}
			nutritionLog={nutritionLog}
		/>
	)
}
