"use client"

import { ChevronDown, ChevronUp, Clock, Dumbbell, RotateCcw, X } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { type WorkoutLog, type WorkoutPlan } from "@/lib/data"

interface WorkoutsViewProps {
	workoutLog: WorkoutLog
	workoutPlan: WorkoutPlan
}

/** Extract YouTube video ID from a watch URL */
function getYouTubeId(url: string): string | null {
	const match = url.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
	return match ? match[1] : null
}

/** Inline YouTube thumbnail that expands to an iframe player on click */
function YouTubePlayer({ url }: { url: string }) {
	const [playing, setPlaying] = useState(false)
	const videoId = getYouTubeId(url)
	if (!videoId) return null

	if (playing) {
		return (
			<div className="relative mt-2 rounded-lg overflow-hidden bg-black aspect-video">
				<iframe
					src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="absolute inset-0 w-full h-full"
					title="Exercise form video"
				/>
				<button
					onClick={(e) => {
						e.stopPropagation()
						setPlaying(false)
					}}
					className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors"
				>
					<X size={14} />
				</button>
			</div>
		)
	}

	return (
		<button
			onClick={() => setPlaying(true)}
			className="relative mt-3 rounded-xl overflow-hidden bg-black group cursor-pointer w-full aspect-video"
		>
			{/* Full-width thumbnail */}
			<img
				src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
				alt="Video thumbnail"
				className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
			/>
			{/* Big play button overlay */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-14 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all shadow-lg">
					<svg width="18" height="18" viewBox="0 0 10 10" fill="white">
						<polygon points="2,0 10,5 2,10" />
					</svg>
				</div>
			</div>
			{/* Bottom label */}
			<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
				<span className="text-xs text-white/90 font-medium">Watch form video</span>
			</div>
		</button>
	)
}

export default function WorkoutsView({ workoutLog, workoutPlan }: WorkoutsViewProps) {
	const rotation = workoutPlan.schedule?.rotation || Object.keys(workoutPlan.workouts)
	const [activeTab, setActiveTab] = useState(rotation[0] || "")
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

	const totalSets = (key: string) => {
		const w = workoutPlan.workouts[key]
		if (!w) return 0
		return w.exercises.reduce((sum, ex) => sum + ex.sets, 0)
	}

	const totalExercises = (key: string) => {
		const w = workoutPlan.workouts[key]
		return w ? w.exercises.length : 0
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Workouts</h1>
				<div className="flex items-center gap-3 mt-1">
					<span className="text-muted-foreground">{workoutPlan.currentPlan}</span>
					{workoutPlan.schedule?.frequency && (
						<span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
							{workoutPlan.schedule.frequency}
						</span>
					)}
				</div>
			</div>

			{/* Rotation Strip */}
			<div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rotation.length}, 1fr)` }}>
				{rotation.map((key, idx) => {
					const workout = workoutPlan.workouts[key]
					if (!workout) return null
					const isActive = activeTab === key
					return (
						<button
							key={key}
							onClick={() => setActiveTab(key)}
							className={`rounded-xl p-3 text-left transition-all ${
								isActive
									? "bg-accent text-accent-foreground ring-2 ring-accent/50"
									: "bg-muted/30 hover:bg-muted/50 text-foreground"
							}`}
						>
							<div className="text-[10px] uppercase tracking-wider opacity-60 font-medium">
								{idx + 1}/{rotation.length}
							</div>
							<div className="text-sm font-bold mt-0.5 truncate">
								{workout.name.replace(/Day \d+ — /, "")}
							</div>
							<div className="text-[10px] opacity-50 mt-0.5">
								{totalExercises(key)} ex · {totalSets(key)} sets
							</div>
						</button>
					)
				})}
			</div>

			{/* Extra schedule info */}
			{(workoutPlan.schedule?.cardio || workoutPlan.schedule?.abs) && (
				<div className="flex flex-wrap gap-2">
					{workoutPlan.schedule.cardio && (
						<span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full">
							{workoutPlan.schedule.cardio}
						</span>
					)}
					{workoutPlan.schedule.abs && (
						<span className="text-xs bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full">
							{workoutPlan.schedule.abs}
						</span>
					)}
				</div>
			)}

			{/* Active Workout Detail */}
			{activeWorkout && (
				<Card className="bg-card border-border overflow-hidden">
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

					<div className="divide-y divide-border/30">
						{activeWorkout.exercises.map((exercise, idx) => {
							const isFST7 = exercise.name.toLowerCase().includes("fst-7") || exercise.sets === 7
							const isSuperset =
								exercise.notes?.toLowerCase().includes("superset") || exercise.reps.includes("+")

							return (
								<div key={idx} className="p-4 hover:bg-muted/10 transition-colors">
									<div className="flex items-start gap-3">
										{/* Number badge */}
										<div
											className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
												isFST7
													? "bg-orange-500/20 text-orange-400"
													: isSuperset
														? "bg-purple-500/20 text-purple-400"
														: "bg-muted/50 text-muted-foreground"
											}`}
										>
											{idx + 1}
										</div>

										{/* Exercise content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<h3 className="font-semibold text-sm">{exercise.name}</h3>
												{isFST7 && (
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 uppercase tracking-wide flex-shrink-0">
														FST-7
													</span>
												)}
												{isSuperset && (
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase tracking-wide flex-shrink-0">
														Superset
													</span>
												)}
											</div>

											{/* Sets / Reps / Rest */}
											<div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
												<span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded font-medium">
													{exercise.sets} sets
												</span>
												<span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded font-medium">
													{exercise.reps}
												</span>
												<span className="flex items-center gap-1 text-muted-foreground">
													<Clock size={11} />
													{exercise.rest} rest
												</span>
											</div>

											{/* Notes */}
											{exercise.notes && (
												<p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
													{exercise.notes}
												</p>
											)}

											{/* YouTube embedded mini-player */}
											{exercise.youtube && <YouTubePlayer url={exercise.youtube} />}
										</div>
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
					<p className="text-sm text-muted-foreground leading-relaxed">{workoutPlan.notes}</p>
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
