import type { Metadata } from "next"
import {
	getDailyLog,
	getMeasurementLog,
	getNutritionLog,
	getProfile,
	getProgressPhotos,
	getWeightLog,
	getWorkoutLog,
} from "@/lib/data"
import { getActiveUser } from "@/lib/user"
import { ProgressView } from "./progress-view"

export const metadata: Metadata = { title: "Progress" }

export default async function ProgressPage() {
	const user = await getActiveUser()

	const [profile, weightLog, measurementLog, nutritionLog, dailyLog, progressPhotos, workoutLog] = await Promise.all([
		getProfile(user),
		getWeightLog(user),
		getMeasurementLog(user),
		getNutritionLog(user),
		getDailyLog(user),
		getProgressPhotos(user),
		getWorkoutLog(user),
	])

	return (
		<ProgressView
			profile={profile}
			weightLog={weightLog}
			measurementLog={measurementLog}
			nutritionLog={nutritionLog}
			dailyLog={dailyLog}
			progressPhotos={progressPhotos}
			workoutLog={workoutLog}
		/>
	)
}
