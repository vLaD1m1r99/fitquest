import { getWorkoutLog, getWorkoutPlan } from "@/lib/data"
import { getActiveUser } from "@/lib/user"
import WorkoutsView from "./workouts-view"

export const metadata = { title: "Workouts" }

export default async function WorkoutsPage() {
	const user = await getActiveUser()
	const [workoutLog, workoutPlan] = await Promise.all([getWorkoutLog(user), getWorkoutPlan(user)])

	if (!workoutLog || !workoutPlan) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	return <WorkoutsView workoutLog={workoutLog} workoutPlan={workoutPlan} />
}
