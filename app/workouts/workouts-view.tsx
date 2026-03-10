"use client"

import { Dumbbell, Play, RotateCcw, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import type { WorkoutPlan } from "@/lib/data"

interface WorkoutsViewProps {
	workoutPlan: WorkoutPlan
}

/** Extract YouTube video ID from a watch URL */
function getYouTubeId(url: string): string | null {
	const match = url.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
	return match ? match[1] : null
}

/** Global state for which video is currently playing (by URL) */
const PlayingContext = { current: "" }

/** Small thumbnail that sits to the right of exercise info */
function YouTubePlayer({ url }: { url: string }) {
	const videoId = getYouTubeId(url)
	const [, forceUpdate] = useState(0)
	if (!videoId) return null

	const isPlaying = PlayingContext.current === url

	return (
		<button
			onClick={() => {
				PlayingContext.current = isPlaying ? "" : url
				forceUpdate(n => n + 1)
				// Dispatch event so ExpandedPlayer re-renders too
				window.dispatchEvent(new CustomEvent("yt-toggle", { detail: url }))
			}}
			className="relative rounded-lg overflow-hidden bg-black group cursor-pointer w-20 h-14 flex-shrink-0"
		>
			<img
				src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
				alt="Video thumbnail"
				className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-7 h-5 bg-red-600 rounded flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all shadow">
					<svg width="8" height="8" viewBox="0 0 10 10" fill="white" role="img" aria-label="Play">
						<polygon points="2,0 10,5 2,10" />
					</svg>
				</div>
			</div>
		</button>
	)
}

/** Expanded iframe player — renders below the exercise card when active */
function ExpandedPlayer({ url }: { url: string }) {
	const videoId = getYouTubeId(url)
	const [playing, setPlaying] = useState(false)

	// Listen for toggle events from the thumbnail
	useEffect(() => {
		const handler = (e: Event) => {
			const detail = (e as CustomEvent).detail
			if (detail === url) {
				setPlaying(PlayingContext.current === url)
			} else {
				setPlaying(false)
			}
		}
		window.addEventListener("yt-toggle", handler)
		return () => window.removeEventListener("yt-toggle", handler)
	}, [url])

	if (!videoId || !playing) return null

	return (
		<div className="relative mt-3 ml-10 rounded-lg overflow-hidden bg-black aspect-video max-w-md">
			<iframe
				src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="absolute inset-0 w-full h-full"
				title="Exercise form video"
			/>
			<button
				onClick={() => {
					PlayingContext.current = ""
					setPlaying(false)
				}}
				className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors"
			>
				<X size={14} />
			</button>
		</div>
	)
}

export default function WorkoutsView({ workoutPlan }: WorkoutsViewProps) {
	const rotation = workoutPlan.schedule?.rotation || Object.keys(workoutPlan.workouts)
	const [activeTab, setActiveTab] = useState(rotation[0] || "")
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
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-2xl sm:text-3xl font-bold">Workouts</h1>
					<Link
						href="/workouts/active"
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-colors flex-shrink-0"
					>
						<Play size={16} />
						<span className="hidden sm:inline">Start Workout</span>
						<span className="sm:hidden">Start</span>
					</Link>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm text-muted-foreground">{workoutPlan.currentPlan}</span>
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
							const isSuperset = exercise.notes?.toLowerCase().includes("superset") ?? false

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

										{/* Exercise content + YouTube side by side */}
										<div className="flex-1 min-w-0 flex items-start justify-between gap-3">
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

												{/* Sets / Reps */}
												<div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
													<span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded font-medium">
														{exercise.sets} sets
													</span>
													<span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded font-medium">
														{exercise.reps}
													</span>
												</div>

												{/* Notes */}
												{exercise.notes && (
													<p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
														{exercise.notes}
													</p>
												)}
											</div>

											{/* YouTube thumbnail on the right */}
											{exercise.youtube && <YouTubePlayer url={exercise.youtube} />}
										</div>
									</div>

									{/* Expanded YouTube player below the card */}
									{exercise.youtube && <ExpandedPlayer url={exercise.youtube} />}
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
		</div>
	)
}
