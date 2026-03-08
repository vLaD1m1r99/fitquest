"use client"

import { ChevronDown, ChevronUp, Clock, Dumbbell, ExternalLink, Play, RotateCcw } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { type WorkoutLog, type WorkoutPlan } from "@/lib/data"

interface WorkoutsViewProps {
	workoutLog: WorkoutLog
	workoutPlan: WorkoutPlan
}

export default function WorkoutsView({ workoutLog, workoutPlan }: WorkoutsViewProps) {
	const workoutKeys = Object.keys(workoutPlan.workouts)
	const [activeTab, setActiveTab] = useState(workoutKeys[0] || "")
	const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
	const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())

	const toggleSession = (key: string) => {
		const next = new Set(expandedSessions)
		if (next.has(key)) next.delete(key)
		else next.add(key)
		setExpandedSessions(next)
	}

	const toggleExercise = (key: string) => {
		const next = new Set(expandedExercises)
		if (next.has(key)) next.delete(key)
		else next.add(key)
		setExpandedExercises(next)
	}

	const activeWorkout = workoutPlan.workouts[activeTab]

	// Build schedule display
	const scheduleWeek = workoutPlan.schedule?.week || {}
	const scheduleDays = Object.entries(scheduleWeek).filter(([key]) => key.startsWith("day"))

	// Count total sets for a workout
	const totalSets = (key: string) => {
		const w = workoutPlan.workouts[key]
		if (!w) return 0
		return w.exercises.reduce((sum, ex) => sum + ex.sets, 0)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Workouts</h1>
				<p className="text-muted-foreground mt-1">{workoutPlan.currentPlan}</p>
			</div>

			{/* Weekly Schedule Strip */}
			{scheduleDays.length > 0 && (
				<Card className="p-4 bg-card border-border">
					<div className="flex items-center gap-2 mb-3">
						<RotateCcw size={16} className="text-muted-foreground" />
						<span className="text-sm font-medium text-muted-foreground">Weekly Rotation</span>
						<span className="text-xs text-muted-foreground ml-auto">Started {workoutPlan.startDate}</span>
					</div>
					<div className="grid grid-cols-7 gap-1.5">
						{scheduleDays.map(([key, value]) => {
							const dayNum = key.replace("day", "")
							const isRest = value === "Rest"
							const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
							const label = dayLabels[Number(dayNum) - 1] || `D${dayNum}`
							return (
								<button
									key={key}
									onClick={() => !isRest && setActiveTab(value)}
									disabled={isRest}
									className={`rounded-lg py-2 px-1 text-center transition-colors ${
										activeTab === value
											? "bg-accent text-accent-foreground"
											: isRest
												? "bg-muted/20 text-muted-foreground/50"
												: "bg-muted/40 hover:bg-muted/60 text-foreground cursor-pointer"
									}`}
								>
									<div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
									<div className="text-xs font-semibold mt-0.5 truncate">
										{isRest ? "Rest" : workoutPlan.workouts[value]?.name?.replace(/Day \d+ — /, "").split(" ")[0] || value}
									</div>
								</button>
							)
						})}
					</div>
					{/* Extra schedule info */}
					{(workoutPlan.schedule?.cardio || workoutPlan.schedule?.abs) && (
						<div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-muted-foreground">
							{workoutPlan.schedule.cardio && <span>{workoutPlan.schedule.cardio}</span>}
							{workoutPlan.schedule.abs && <span>{workoutPlan.schedule.abs}</span>}
						</div>
					)}
				</Card>
			)}

			{/* Workout Day Tabs */}
			<div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
				{workoutKeys.map((key) => {
					const workout = workoutPlan.workouts[key]
					const isActive = activeTab === key
					return (
						<button
							key={key}
							onClick={() => setActiveTab(key)}
							className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
								isActive
									? "bg-accent text-accent-foreground"
									: "bg-muted/30 hover:bg-muted/50 text-muted-foreground"
							}`}
						>
							{workout.name.replace(/Day \d+ — /, "")}
							<span className="ml-1.5 text-xs opacity-60">{workout.exercises.length}</span>
						</button>
					)
				})}
			</div>

			{/* Active Workout Detail */}
			{activeWorkout && (
				<Card className="bg-card border-border overflow-hidden">
					{/* Workout header */}
					<div className="p-5 border-b border-border/50">
						<h2 className="text-lg font-bold">{activeWorkout.name}</h2>
						<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<Dumbbell size={14} />
								{activeWorkout.exercises.length} exercises
							</span>
							<span className="flex items-center gap-1.5">
								<RotateCcw size={14} />
								{totalSets(activeTab)} total sets
							</span>
						</div>
					</div>

					{/* Exercise list */}
					<div className="divide-y divide-border/30">
						{activeWorkout.exercises.map((exercise, idx) => {
							const isFST7 = exercise.name.toLowerCase().includes("fst-7") || exercise.sets === 7
							const isSuperset = exercise.notes?.toLowerCase().includes("superset")

							return (
								<div key={idx} className="p-4 hover:bg-muted/10 transition-colors">
									<div className="flex items-start gap-3">
										{/* Exercise number */}
										<div
											className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
												isFST7
													? "bg-orange-500/20 text-orange-400"
													: isSuperset
														? "bg-purple-500/20 text-purple-400"
														: "bg-muted/50 text-muted-foreground"
											}`}
										>
											{idx + 1}
										</div>

										{/* Exercise info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold text-sm">{exercise.name}</h3>
												{isFST7 && (
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 uppercase tracking-wide">
														FST-7
													</span>
												)}
												{isSuperset && (
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase tracking-wide">
														Superset
													</span>
												)}
											</div>

											{/* Sets / Reps / Rest row */}
											<div className="flex items-center gap-3 mt-1.5 text-xs">
												<span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded">
													<strong>{exercise.sets}</strong> sets
												</span>
												<span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded">
													<strong>{exercise.reps}</strong> reps
												</span>
												<span className="flex items-center gap-1 text-muted-foreground">
													<Clock size={11} />
													{exercise.rest}
												</span>
											</div>

											{/* Notes */}
											{exercise.notes && (
												<p className="text-xs text-muted-foreground mt-1.5">{exercise.notes}</p>
											)}
										</div>

										{/* YouTube link */}
										{exercise.youtube && (
											<a
												href={exercise.youtube}
												target="_blank"
												rel="noopener noreferrer"
												className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
												title="Watch form video"
											>
												<Play size={14} fill="currentColor" />
											</a>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</Card>
			)}

			{/* Program Notes */}
			{workoutPlan.notes && (
				<Card className="p-4 bg-card border-border">
					<p className="text-sm text-muted-foreground">{workoutPlan.notes}</p>
				</Card>
			)}

			{/* Recent Workouts Log */}
			<Card className="p-5 bg-card border-border">
				<h2 className="text-lg font-semibold mb-4">Recent Workouts</h2>
				{workoutLog.sessions.length > 0 ? (
					<div className="space-y-2">
						{[...workoutLog.sessions]
							.reverse()
							.slice(0, 10)
							.map((session, idx) => (
								<div key={idx}>
									<button
										onClick={() => toggleSession(`log-${idx}`)}
										className="w-full flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
									>
										<div>
											<p className="font-semibold text-sm">{session.sessionType}</p>
											<p className="text-xs text-muted-foreground">
												{session.date} · {session.durationMin}m · {session.exercises.length}{" "}
												exercises · RPE {session.overallRPE}
											</p>
										</div>
										{expandedSessions.has(`log-${idx}`) ? (
											<ChevronUp size={16} />
										) : (
											<ChevronDown size={16} />
										)}
									</button>
									{expandedSessions.has(`log-${idx}`) && (
										<div className="mt-2 ml-4 space-y-3 border-l-2 border-border/50 pl-4">
											{session.exercises.map((exercise, exIdx) => (
												<div key={exIdx}>
													<button
														onClick={() => toggleExercise(`log-${idx}-${exIdx}`)}
														className="w-full flex items-center justify-between text-left"
													>
														<p className="font-semibold text-xs">{exercise.name}</p>
														{expandedExercises.has(`log-${idx}-${exIdx}`) ? (
															<ChevronUp size={14} />
														) : (
															<ChevronDown size={14} />
														)}
													</button>
													{expandedExercises.has(`log-${idx}-${exIdx}`) && (
														<div className="mt-1 space-y-1">
															{exercise.sets.map((set, setIdx) => (
																<div
																	key={setIdx}
																	className="flex items-center gap-3 text-xs text-muted-foreground"
																>
																	<span className="w-12">Set {setIdx + 1}</span>
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
												<p className="text-xs text-muted-foreground italic pt-2 border-t border-border/30">
													{session.notes}
												</p>
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
