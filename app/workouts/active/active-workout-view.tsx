"use client"

import { Check, ChevronLeft, Minus, Play, Plus, Square, Timer } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import type { ActiveExerciseData, ActiveSetData, ActiveWorkoutSession, User, WorkoutPlan } from "@/lib/data"

const LS_KEY = "fitquest_active_workout"
const LS_COMPLETED_KEY = "fitquest_completed_workouts"

/** Parse a reps string like "10-12", "15 each leg", "pyramid" into a default number */
function parseDefaultReps(repsStr: string): number {
	const match = repsStr.match(/(\d+)/)
	return match ? Number.parseInt(match[1], 10) : 10
}

/** Get last used weight for an exercise from completed workouts in localStorage */
function getLastWeight(exerciseName: string, user: string): number {
	if (typeof window === "undefined") return 0
	try {
		const raw = localStorage.getItem(LS_COMPLETED_KEY)
		if (!raw) return 0
		const completed: ActiveWorkoutSession[] = JSON.parse(raw)
		// Search backwards (most recent first)
		for (let i = completed.length - 1; i >= 0; i--) {
			if (completed[i].user !== user) continue
			const ex = completed[i].exercises.find(e => e.name === exerciseName)
			if (ex) {
				const lastSet = ex.sets.find(s => s.completed && s.weightKg > 0)
				if (lastSet) return lastSet.weightKg
			}
		}
	} catch (_) {
		/* ignore */
	}
	return 0
}

/** Build initial exercise data from a workout template */
function buildExercises(workoutKey: string, plan: WorkoutPlan, user: string): ActiveExerciseData[] {
	const template = plan.workouts[workoutKey]
	if (!template) return []
	return template.exercises.map(ex => ({
		name: ex.name,
		youtube: ex.youtube,
		notes: ex.notes,
		sets: Array.from({ length: ex.sets }, () => ({
			weightKg: getLastWeight(ex.name, user),
			reps: parseDefaultReps(ex.reps),
			completed: false,
		})),
	}))
}

/** Format elapsed seconds as MM:SS */
function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, "0")}`
}

/** Increment/decrement button */
function StepButton({ onClick, icon, label }: { onClick: () => void; icon: "plus" | "minus"; label: string }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className="w-11 h-11 rounded-lg bg-muted/50 hover:bg-muted active:bg-muted/80 flex items-center justify-center text-foreground transition-colors flex-shrink-0"
		>
			{icon === "plus" ? <Plus size={18} /> : <Minus size={18} />}
		</button>
	)
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
	workoutPlan: WorkoutPlan
	user: User
}

export function ActiveWorkoutView({ workoutPlan, user }: Props) {
	const router = useRouter()
	const rotation = workoutPlan.schedule?.rotation || Object.keys(workoutPlan.workouts)

	// Session state
	const [session, setSession] = useState<ActiveWorkoutSession | null>(null)
	const [phase, setPhase] = useState<"pick" | "active" | "finish">("pick")
	const [elapsed, setElapsed] = useState(0)
	const [rpe, setRpe] = useState(7)
	const [finishNotes, setFinishNotes] = useState("")
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	// Hydrate from localStorage on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(LS_KEY)
			if (saved) {
				const parsed: ActiveWorkoutSession = JSON.parse(saved)
				if (parsed.user === user && !parsed.finishedAt) {
					setSession(parsed)
					setPhase("active")
					// Restore elapsed time
					const startMs = new Date(parsed.startTime).getTime()
					setElapsed(Math.floor((Date.now() - startMs) / 1000))
				}
			}
		} catch (_) {
			/* ignore */
		}
	}, [user])

	// Timer tick
	useEffect(() => {
		if (phase === "active") {
			timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
			return () => {
				if (timerRef.current) clearInterval(timerRef.current)
			}
		}
		if (timerRef.current) clearInterval(timerRef.current)
	}, [phase])

	// Persist session to localStorage on every change
	useEffect(() => {
		if (session && phase === "active") {
			localStorage.setItem(LS_KEY, JSON.stringify(session))
		}
	}, [session, phase])

	// ─── Actions ──────────────────────────────────────────

	const startWorkout = useCallback(
		(key: string) => {
			const template = workoutPlan.workouts[key]
			if (!template) return
			const newSession: ActiveWorkoutSession = {
				user,
				workoutKey: key,
				workoutName: template.name,
				startTime: new Date().toISOString(),
				exercises: buildExercises(key, workoutPlan, user),
			}
			setSession(newSession)
			setPhase("active")
			setElapsed(0)
			localStorage.setItem(LS_KEY, JSON.stringify(newSession))
		},
		[workoutPlan, user],
	)

	const updateSet = useCallback((exIdx: number, setIdx: number, field: keyof ActiveSetData, delta: number) => {
		setSession(prev => {
			if (!prev) return prev
			const next = structuredClone(prev)
			const set = next.exercises[exIdx].sets[setIdx]
			if (field === "weightKg") set.weightKg = Math.max(0, set.weightKg + delta)
			if (field === "reps") set.reps = Math.max(0, set.reps + delta)
			return next
		})
	}, [])

	const toggleSetComplete = useCallback((exIdx: number, setIdx: number) => {
		setSession(prev => {
			if (!prev) return prev
			const next = structuredClone(prev)
			next.exercises[exIdx].sets[setIdx].completed = !next.exercises[exIdx].sets[setIdx].completed
			return next
		})
	}, [])

	const finishWorkout = useCallback(() => {
		if (!session) return
		const finished: ActiveWorkoutSession = {
			...session,
			overallRPE: rpe,
			durationMin: Math.round(elapsed / 60),
			notes: finishNotes,
			finishedAt: new Date().toISOString(),
		}
		// Save to completed list
		try {
			const raw = localStorage.getItem(LS_COMPLETED_KEY)
			const completed: ActiveWorkoutSession[] = raw ? JSON.parse(raw) : []
			completed.push(finished)
			localStorage.setItem(LS_COMPLETED_KEY, JSON.stringify(completed))
		} catch (_) {
			/* ignore */
		}
		// Clear active session
		localStorage.removeItem(LS_KEY)
		setSession(null)
		setPhase("pick")
		router.push("/workouts")
	}, [session, rpe, elapsed, finishNotes, router])

	const cancelWorkout = useCallback(() => {
		localStorage.removeItem(LS_KEY)
		setSession(null)
		setPhase("pick")
		if (timerRef.current) clearInterval(timerRef.current)
	}, [])

	// ─── Pick Workout Phase ──────────────────────────────

	if (phase === "pick") {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Link href="/workouts" className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
						<ChevronLeft size={20} />
					</Link>
					<h1 className="text-2xl font-bold">Start Workout</h1>
				</div>
				<p className="text-muted-foreground text-sm">Pick which workout to start:</p>
				<div className="grid gap-3">
					{rotation.map(key => {
						const w = workoutPlan.workouts[key]
						if (!w) return null
						return (
							<button
								key={key}
								type="button"
								onClick={() => startWorkout(key)}
								className="text-left p-4 rounded-xl bg-card border border-border hover:border-accent/50 hover:bg-accent/5 transition-all"
							>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-bold">{w.name}</h3>
										<p className="text-sm text-muted-foreground mt-1">
											{w.exercises.length} exercises ·{" "}
											{w.exercises.reduce((s, e) => s + e.sets, 0)} sets
										</p>
									</div>
									<Play size={20} className="text-accent" />
								</div>
							</button>
						)
					})}
				</div>
			</div>
		)
	}

	// ─── Finish Phase ────────────────────────────────────

	if (phase === "finish" && session) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold">Finish Workout</h1>
				<p className="text-muted-foreground text-sm">
					{session.workoutName} · {formatTime(elapsed)}
				</p>

				{/* RPE selector */}
				<div>
					<span className="text-sm font-medium block mb-2">How hard was it? (RPE)</span>
					<div className="flex gap-1.5 flex-wrap">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
							<button
								key={n}
								type="button"
								onClick={() => setRpe(n)}
								className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
									rpe === n
										? "bg-accent text-accent-foreground ring-2 ring-accent/50"
										: "bg-muted/40 hover:bg-muted/60 text-foreground"
								}`}
							>
								{n}
							</button>
						))}
					</div>
				</div>

				{/* Notes */}
				<div>
					<label htmlFor="finish-notes" className="text-sm font-medium block mb-2">
						Notes (optional)
					</label>
					<textarea
						id="finish-notes"
						value={finishNotes}
						onChange={e => setFinishNotes(e.target.value)}
						placeholder="How did it feel?"
						rows={3}
						className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
					/>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setPhase("active")}
						className="flex-1 py-3 rounded-xl bg-muted/40 hover:bg-muted/60 font-medium text-sm transition-colors"
					>
						Back
					</button>
					<button
						type="button"
						onClick={finishWorkout}
						className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm transition-colors hover:bg-accent/90"
					>
						Save Workout
					</button>
				</div>
			</div>
		)
	}

	// ─── Active Phase ────────────────────────────────────

	if (!session) return null

	const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0)
	const completedSets = session.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0)

	return (
		<div className="space-y-4 pb-24">
			{/* Sticky header */}
			<div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/50">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-bold">{session.workoutName}</h1>
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<span className="flex items-center gap-1">
								<Timer size={14} />
								{formatTime(elapsed)}
							</span>
							<span>
								{completedSets}/{totalSets} sets
							</span>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={cancelWorkout}
							className="px-3 py-2 rounded-lg text-xs bg-muted/40 hover:bg-muted/60 transition-colors"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={() => setPhase("finish")}
							className="px-4 py-2 rounded-lg text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
						>
							Finish
						</button>
					</div>
				</div>
				{/* Progress bar */}
				<div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
					<div
						className="h-full bg-accent rounded-full transition-all duration-300"
						style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
					/>
				</div>
			</div>

			{/* Exercise cards */}
			{session.exercises.map((exercise, exIdx) => {
				const exCompleted = exercise.sets.every(s => s.completed)
				return (
					<Card key={exIdx} className={`overflow-hidden transition-all ${exCompleted ? "opacity-60" : ""}`}>
						{/* Exercise header */}
						<div className="p-4 pb-2 flex items-start justify-between gap-2">
							<div className="flex items-center gap-2">
								<div
									className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
										exCompleted
											? "bg-green-500/20 text-green-400"
											: "bg-muted/50 text-muted-foreground"
									}`}
								>
									{exCompleted ? <Check size={14} /> : exIdx + 1}
								</div>
								<div>
									<h3 className="font-semibold text-sm">{exercise.name}</h3>
									{exercise.notes && (
										<p className="text-xs text-muted-foreground mt-0.5">{exercise.notes}</p>
									)}
								</div>
							</div>
						</div>

						{/* Sets */}
						<div className="px-4 pb-4 space-y-2">
							{/* Header row */}
							<div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">
								<span>Set</span>
								<span className="text-center">Weight (kg)</span>
								<span className="text-center">Reps</span>
								<span />
							</div>

							{exercise.sets.map((set, setIdx) => (
								<div
									key={setIdx}
									className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center ${
										set.completed ? "opacity-50" : ""
									}`}
								>
									{/* Set number */}
									<span className="text-xs font-medium text-muted-foreground text-center">
										{setIdx + 1}
									</span>

									{/* Weight control */}
									<div className="flex items-center justify-center gap-1">
										<StepButton
											onClick={() => updateSet(exIdx, setIdx, "weightKg", -2.5)}
											icon="minus"
											label="Decrease weight"
										/>
										<span className="w-14 text-center text-sm font-bold tabular-nums">
											{set.weightKg}
										</span>
										<StepButton
											onClick={() => updateSet(exIdx, setIdx, "weightKg", 2.5)}
											icon="plus"
											label="Increase weight"
										/>
									</div>

									{/* Reps control */}
									<div className="flex items-center justify-center gap-1">
										<StepButton
											onClick={() => updateSet(exIdx, setIdx, "reps", -1)}
											icon="minus"
											label="Decrease reps"
										/>
										<span className="w-8 text-center text-sm font-bold tabular-nums">
											{set.reps}
										</span>
										<StepButton
											onClick={() => updateSet(exIdx, setIdx, "reps", 1)}
											icon="plus"
											label="Increase reps"
										/>
									</div>

									{/* Complete toggle */}
									<button
										type="button"
										onClick={() => toggleSetComplete(exIdx, setIdx)}
										className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
											set.completed
												? "bg-green-500/20 text-green-400"
												: "bg-muted/30 text-muted-foreground hover:bg-muted/50"
										}`}
									>
										{set.completed ? <Check size={16} /> : <Square size={14} />}
									</button>
								</div>
							))}
						</div>
					</Card>
				)
			})}
		</div>
	)
}
