import { getDailyLog, getWorkoutLog, getWorkoutPlan } from "@/lib/data"
import { getActiveUser } from "@/lib/user"
import { ActiveWorkoutView } from "./active-workout-view"

export const metadata = {
	title: "Active Workout | FitQuest",
}

function toDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default async function ActiveWorkoutPage() {
	const user = await getActiveUser()
	const [workoutPlan, workoutLog, dailyLog] = await Promise.all([
		getWorkoutPlan(user),
		getWorkoutLog(user),
		getDailyLog(user),
	])

	const todayStr = toDateStr(new Date())
	const todayDailyEntry = dailyLog.entries.find(e => e.date === todayStr) ?? null

	return (
		<ActiveWorkoutView
			workoutPlan={workoutPlan}
			workoutLog={workoutLog}
			user={user}
			todayDailyEntry={todayDailyEntry}
		/>
	)
}
