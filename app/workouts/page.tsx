"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useActiveUser } from "@/components/user-context"
import { UserToggle } from "@/components/user-toggle"
import { getWorkoutLog, getWorkoutPlan, type WorkoutLog, type WorkoutPlan } from "@/lib/data"

export default function WorkoutsPage() {
	const { activeUser } = useActiveUser()
	const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null)
	const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
	const [loading, setLoading] = useState(true)
	const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
	const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			try {
				const [workouts, plan] = await Promise.all([getWorkoutLog(activeUser), getWorkoutPlan()])
				setWorkoutLog(workouts)
				setWorkoutPlan(plan)
			} catch (_error) {
				/* fetch error */
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [activeUser])

	const toggleSession = (date: string) => {
		const newSet = new Set(expandedSessions)
		if (newSet.has(date)) {
			newSet.delete(date)
		} else {
			newSet.add(date)
		}
		setExpandedSessions(newSet)
	}

	const toggleExercise = (key: string) => {
		const newSet = new Set(expandedExercises)
		if (newSet.has(key)) {
			newSet.delete(key)
		} else {
			newSet.add(key)
		}
		setExpandedExercises(newSet)
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>Loading...</p>
			</div>
		)
	}

	if (!workoutLog || !workoutPlan) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Workouts</h1>
				<UserToggle />
			</div>

			{/* Workout Plan */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-4">Current Workout Plan</h2>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Plan</span>
						<span className="font-semibold">{workoutPlan.currentPlan}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Start Date</span>
						<span className="font-semibold">{workoutPlan.startDate}</span>
					</div>
					{workoutPlan.notes && (
						<div className="mt-4 p-3 rounded-md bg-muted/30">
							<p className="text-sm">{workoutPlan.notes}</p>
						</div>
					)}
				</div>
			</Card>

			{/* Recent Workouts */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-4">Recent Workouts</h2>
				{workoutLog.sessions.length > 0 ? (
					<div className="space-y-2">
						{[...workoutLog.sessions]
							.reverse()
							.slice(0, 10)
							.map((session, idx) => (
								<div key={idx}>
									<button
										onClick={() => toggleSession(session.date)}
										className="w-full flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
									>
										<div>
											<p className="font-semibold">{session.sessionType}</p>
											<p className="text-sm text-muted-foreground">
												{session.date} · {session.durationMin}m · {session.exercises.length}{" "}
												exercises
											</p>
										</div>
										{expandedSessions.has(session.date) ? (
											<ChevronUp size={18} />
										) : (
											<ChevronDown size={18} />
										)}
									</button>
									{expandedSessions.has(session.date) && (
										<div className="mt-2 ml-4 space-y-3 border-l border-border/50 pl-4">
											{session.exercises.map((exercise, exIdx) => (
												<div key={exIdx}>
													<button
														onClick={() => toggleExercise(`${idx}-${exIdx}`)}
														className="w-full flex items-center justify-between text-left"
													>
														<p className="font-semibold text-sm">{exercise.name}</p>
														{expandedExercises.has(`${idx}-${exIdx}`) ? (
															<ChevronUp size={16} />
														) : (
															<ChevronDown size={16} />
														)}
													</button>
													{expandedExercises.has(`${idx}-${exIdx}`) && (
														<div className="mt-1 space-y-1 text-xs text-muted-foreground">
															{exercise.sets.map((set, setIdx) => (
																<div key={setIdx} className="flex items-center gap-2">
																	<span>Set {setIdx + 1}:</span>
																	<span>
																		{set.reps} reps @ {set.weightKg}kg
																	</span>
																	<span className="text-accent">RPE {set.rpe}</span>
																</div>
															))}
														</div>
													)}
												</div>
											))}
											{session.notes && (
												<div className="text-sm text-muted-foreground italic pt-2 border-t border-border/30">
													{session.notes}
												</div>
											)}
										</div>
									)}
								</div>
							))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No workouts logged yet</p>
				)}
			</Card>
		</div>
	)
}
