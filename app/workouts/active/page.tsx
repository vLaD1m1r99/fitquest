import { getWorkoutPlan } from "@/lib/data"
import { getActiveUser } from "@/lib/user"
import { ActiveWorkoutView } from "./active-workout-view"

export const metadata = {
	title: "Active Workout | FitQuest",
}

export default async function ActiveWorkoutPage() {
	const user = await getActiveUser()
	const workoutPlan = await getWorkoutPlan(user)

	return <ActiveWorkoutView workoutPlan={workoutPlan} user={user} />
}
