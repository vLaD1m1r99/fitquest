"use client"

import {
	Check,
	ChevronLeft,
	Flame,
	Minus,
	Play,
	Plus,
	RefreshCw,
	Square,
	Timer,
	Trash2,
	Trophy,
	Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import type {
	ActiveExerciseData,
	ActiveSetData,
	ActiveWorkoutSession,
	DailyLogEntry,
	ExerciseSet,
	SetType,
	User,
	WorkoutLog,
	WorkoutPlan,
	WorkoutSession,
} from "@/lib/data"
import {
	EXERCISE_DB,
	getExercisesByMuscle,
	getSwapSuggestions,
	getWeightNote,
	MUSCLE_GROUP_LABELS,
	type MuscleGroup,
} from "@/lib/exercises"

const LS_KEY = "fitquest_active_workout"

/** Personalized messages based on user, mood, period etc */
function getPrMessage(user: User, dailyEntry?: { mood?: string; menstrualFlow?: string | null }): string {
	const isSneska = user === "sneska"
	const onPeriod = isSneska && dailyEntry?.menstrualFlow && dailyEntry.menstrualFlow !== "none"
	const lowMood = dailyEntry?.mood === "bad" || dailyEntry?.mood === "neutral"

	if (onPeriod) {
		const msgs = [
			"PR on your period?! Absolute queen!",
			"Stronger than cramps! You're unstoppable!",
			"New record AND dealing with period? Legend!",
			"Your body is fighting AND winning. PR!",
		]
		return msgs[Math.floor(Math.random() * msgs.length)]
	}

	if (lowMood) {
		const msgs = [
			"Tough day but you still showed up AND hit a PR!",
			"Bad mood? Doesn't matter — PR secured!",
			"Turned a rough day into a record breaker!",
		]
		return msgs[Math.floor(Math.random() * msgs.length)]
	}

	if (isSneska) {
		const msgs = [
			"NEW PR! You're getting stronger!",
			"Look at you go! New personal record!",
			"Stronger every session — PR crushed!",
			"Queen of the gym! New PR!",
		]
		return msgs[Math.floor(Math.random() * msgs.length)]
	}

	const msgs = [
		"NEW PR! Beast mode activated!",
		"Stronger than last time! Let's go!",
		"PR crushed! Keep pushing!",
		"New record! The grind is paying off!",
		"Weight goes up, body fat goes down! PR!",
	]
	return msgs[Math.floor(Math.random() * msgs.length)]
}

const SET_TYPE_LABELS: Record<string, { label: string; color: string }> = {
	normal: { label: "", color: "" },
	dropset: { label: "DROP", color: "text-orange-400 bg-orange-500/10" },
	myorep: { label: "MYO", color: "text-purple-400 bg-purple-500/10" },
	warmup: { label: "W/UP", color: "text-blue-400 bg-blue-500/10" },
}

function parseDefaultReps(repsStr: string): number {
	const match = repsStr.match(/(\d+)/)
	return match ? Number.parseInt(match[1], 10) : 10
}

function getLastPerformance(
	exerciseName: string,
	serverLog: WorkoutLog,
): { weightKg: number; reps: number; rpe: number } | null {
	for (let i = serverLog.sessions.length - 1; i >= 0; i--) {
		const session = serverLog.sessions[i]
		const ex = session.exercises.find(e => e.name === exerciseName)
		if (ex && ex.sets.length > 0) {
			const bestSet = ex.sets.reduce((best, s) => (s.weightKg > best.weightKg ? s : best), ex.sets[0])
			if (bestSet && bestSet.weightKg > 0) {
				return { weightKg: bestSet.weightKg, reps: bestSet.reps, rpe: bestSet.rpe || session.overallRPE }
			}
		}
	}
	return null
}

function getBestWeight(exerciseName: string, serverLog: WorkoutLog): number {
	let best = 0
	for (const session of serverLog.sessions) {
		const ex = session.exercises.find(e => e.name === exerciseName)
		if (ex) {
			for (const s of ex.sets) {
				if (s.weightKg > best) best = s.weightKg
			}
		}
	}
	return best
}

function getSuggestedWeight(
	exerciseName: string,
	serverLog: WorkoutLog,
	targetRepsStr?: string,
): { weightKg: number; reps: number; hint: string } | null {
	const last = getLastPerformance(exerciseName, serverLog)
	if (!last) return null

	const rangeMatch = targetRepsStr?.match(/(\d+)\s*[-–]\s*(\d+)/)
	const maxReps = rangeMatch ? Number.parseInt(rangeMatch[2], 10) : null
	const minReps = rangeMatch ? Number.parseInt(rangeMatch[1], 10) : null

	if (maxReps && minReps && last.reps >= maxReps && last.rpe <= 7) {
		return {
			weightKg: last.weightKg + 2.5,
			reps: minReps,
			hint: `Maxed ${last.reps} reps @ ${last.weightKg}kg — go up!`,
		}
	}

	if (last.rpe <= 8) {
		return {
			weightKg: last.weightKg,
			reps: last.reps + 1,
			hint: `Last: ${last.weightKg}kg ×${last.reps} RPE${last.rpe} — add a rep`,
		}
	}

	return {
		weightKg: last.weightKg,
		reps: last.reps,
		hint: `Last: ${last.weightKg}kg ×${last.reps} RPE${last.rpe} — match it`,
	}
}

function buildExercises(workoutKey: string, plan: WorkoutPlan, serverLog: WorkoutLog): ActiveExerciseData[] {
	const template = plan.workouts[workoutKey]
	if (!template) return []
	return template.exercises.map(ex => {
		const suggestion = getSuggestedWeight(ex.name, serverLog, ex.reps)
		return {
			name: ex.name,
			youtube: ex.youtube,
			notes: ex.notes,
			sets: Array.from({ length: ex.sets }, () => ({
				weightKg: suggestion?.weightKg ?? 0,
				reps: suggestion?.reps ?? parseDefaultReps(ex.reps),
				completed: false,
			})),
		}
	})
}

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, "0")}`
}

function toDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function StepButton({
	onClick,
	icon,
	label,
	disabled,
}: {
	onClick: () => void
	icon: "plus" | "minus"
	label: string
	disabled?: boolean
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			disabled={disabled}
			className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
				disabled
					? "bg-muted/20 text-muted-foreground/30 cursor-not-allowed"
					: "bg-muted/50 hover:bg-muted active:bg-muted/80 text-foreground"
			}`}
		>
			{icon === "plus" ? <Plus size={18} /> : <Minus size={18} />}
		</button>
	)
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
	workoutPlan: WorkoutPlan
	workoutLog: WorkoutLog
	user: User
	todayDailyEntry?: DailyLogEntry | null
}

export function ActiveWorkoutView({ workoutPlan, workoutLog, user, todayDailyEntry }: Props) {
	const router = useRouter()
	const rotation = workoutPlan.schedule?.rotation || Object.keys(workoutPlan.workouts)

	const [session, setSession] = useState<ActiveWorkoutSession | null>(null)
	const [phase, setPhase] = useState<"pick" | "active" | "finish">("pick")
	const [elapsed, setElapsed] = useState(0)
	const [rpe, setRpe] = useState(7)
	const [finishNotes, setFinishNotes] = useState("")
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const startTimeRef = useRef<string | null>(null)
	const [prCelebrations, setPrCelebrations] = useState<Record<number, string | null>>({})
	const [swapMenuIdx, setSwapMenuIdx] = useState<number | null>(null)
	const [addMenuOpen, setAddMenuOpen] = useState(false)
	const [addSearch, setAddSearch] = useState("")
	const [addCategory, setAddCategory] = useState<MuscleGroup | null>(null)

	/** Calculate elapsed from real clock time, not tick count */
	const recalcElapsed = useCallback(() => {
		if (startTimeRef.current) {
			const startMs = new Date(startTimeRef.current).getTime()
			setElapsed(Math.floor((Date.now() - startMs) / 1000))
		}
	}, [])

	// Hydrate from localStorage on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(LS_KEY)
			if (saved) {
				const parsed: ActiveWorkoutSession = JSON.parse(saved)
				if (parsed.user === user && !parsed.finishedAt) {
					setSession(parsed)
					setPhase("active")
					startTimeRef.current = parsed.startTime
					recalcElapsed()
				}
			}
		} catch (_) {
			/* ignore */
		}
	}, [user, recalcElapsed])

	// Clock-based timer: recalculates from startTime every second
	// Survives phone lock because it uses real clock, not tick count
	useEffect(() => {
		if (phase === "active") {
			timerRef.current = setInterval(recalcElapsed, 1000)
			return () => {
				if (timerRef.current) clearInterval(timerRef.current)
			}
		}
		if (timerRef.current) clearInterval(timerRef.current)
	}, [phase, recalcElapsed])

	// Recalculate elapsed when tab regains focus (phone unlock, tab switch)
	useEffect(() => {
		const handleVisibility = () => {
			if (document.visibilityState === "visible" && phase === "active") {
				recalcElapsed()
			}
		}
		document.addEventListener("visibilitychange", handleVisibility)
		return () => document.removeEventListener("visibilitychange", handleVisibility)
	}, [phase, recalcElapsed])

	useEffect(() => {
		if (session && phase === "active") {
			localStorage.setItem(LS_KEY, JSON.stringify(session))
		}
	}, [session, phase])

	const bestWeights = useMemo(() => {
		if (!session) return {}
		const map: Record<string, number> = {}
		for (const ex of session.exercises) {
			map[ex.name] = getBestWeight(ex.name, workoutLog)
		}
		return map
	}, [session, workoutLog])

	const suggestions = useMemo(() => {
		if (!session) return {}
		const workoutKey = session.workoutKey
		const template = workoutPlan.workouts[workoutKey]
		const map: Record<string, string> = {}
		for (const ex of session.exercises) {
			const planEx = template?.exercises.find(e => e.name === ex.name)
			const sug = getSuggestedWeight(ex.name, workoutLog, planEx?.reps)
			if (sug) map[ex.name] = sug.hint
		}
		return map
	}, [session, workoutLog, workoutPlan])

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
				exercises: buildExercises(key, workoutPlan, workoutLog),
			}
			startTimeRef.current = newSession.startTime
			setSession(newSession)
			setPhase("active")
			setElapsed(0)
			setPrCelebrations({})
			setSaveError(null)
			localStorage.setItem(LS_KEY, JSON.stringify(newSession))
		},
		[workoutPlan, workoutLog, user],
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

	const toggleSetComplete = useCallback(
		(exIdx: number, setIdx: number) => {
			setSession(prev => {
				if (!prev) return prev
				const next = structuredClone(prev)
				const set = next.exercises[exIdx].sets[setIdx]
				set.completed = !set.completed

				if (set.completed) {
					const exName = next.exercises[exIdx].name
					const prevBest = bestWeights[exName] ?? 0
					if (set.weightKg > prevBest && set.weightKg > 0) {
						const msg = getPrMessage(user, todayDailyEntry ?? undefined)
						setPrCelebrations(prev => ({ ...prev, [exIdx]: msg }))
						setTimeout(() => {
							setPrCelebrations(prev => ({ ...prev, [exIdx]: null }))
						}, 3000)
					}
				}

				return next
			})
		},
		[bestWeights],
	)

	/** Add a regular set to an exercise */
	const addSet = useCallback((exIdx: number) => {
		setSession(prev => {
			if (!prev) return prev
			const next = structuredClone(prev)
			const lastSet = next.exercises[exIdx].sets[next.exercises[exIdx].sets.length - 1]
			next.exercises[exIdx].sets.push({
				weightKg: lastSet ? lastSet.weightKg : 0,
				reps: lastSet ? lastSet.reps : 10,
				completed: false,
			})
			return next
		})
	}, [])

	/** Toggle set type (normal → dropset → myorep → normal) */
	const cycleSetType = useCallback((exIdx: number, setIdx: number) => {
		setSession(prev => {
			if (!prev) return prev
			const next = structuredClone(prev)
			const set = next.exercises[exIdx].sets[setIdx]
			const cycle: (SetType | undefined)[] = [undefined, "dropset", "myorep"]
			const currentIdx = cycle.indexOf(set.setType)
			set.setType = cycle[(currentIdx + 1) % cycle.length]
			return next
		})
	}, [])

	/** Remove the last uncompleted set from an exercise */
	const removeLastSet = useCallback((exIdx: number) => {
		setSession(prev => {
			if (!prev) return prev
			const next = structuredClone(prev)
			const sets = next.exercises[exIdx].sets
			if (sets.length <= 1) return prev
			// Remove last uncompleted set, or last set if all completed
			const lastUncompletedIdx = sets
				.map((s, i) => ({ s, i }))
				.reverse()
				.find(x => !x.s.completed)?.i
			if (lastUncompletedIdx !== undefined) {
				sets.splice(lastUncompletedIdx, 1)
			}
			return next
		})
	}, [])

	/** Swap an exercise for another — pre-fill from history */
	const swapExercise = useCallback(
		(exIdx: number, newName: string) => {
			setSession(prev => {
				if (!prev) return prev
				const next = structuredClone(prev)
				const last = getLastPerformance(newName, workoutLog)
				next.exercises[exIdx].name = newName
				next.exercises[exIdx].notes = ""
				next.exercises[exIdx].youtube = undefined
				for (const set of next.exercises[exIdx].sets) {
					set.weightKg = last?.weightKg ?? 0
					set.reps = last?.reps ?? 10
					set.completed = false
					set.setType = undefined
				}
				return next
			})
			setSwapMenuIdx(null)
		},
		[workoutLog],
	)

	/** Delete an exercise from the session */
	const deleteExercise = useCallback((exIdx: number) => {
		setSession(prev => {
			if (!prev) return prev
			const next = structuredClone(prev)
			if (next.exercises.length <= 1) return prev
			next.exercises.splice(exIdx, 1)
			return next
		})
	}, [])

	/** Add a new exercise — pre-fill from history, default 3 sets */
	const addExercise = useCallback(
		(name: string) => {
			setSession(prev => {
				if (!prev) return prev
				const next = structuredClone(prev)
				const last = getLastPerformance(name, workoutLog)
				const weight = last?.weightKg ?? 0
				const reps = last?.reps ?? 10
				next.exercises.push({
					name,
					sets: Array.from({ length: 3 }, () => ({
						weightKg: weight,
						reps,
						completed: false,
					})),
				})
				return next
			})
			setAddMenuOpen(false)
			setAddSearch("")
			setAddCategory(null)
		},
		[workoutLog],
	)

	const finishWorkout = useCallback(async () => {
		if (!session) return
		setSaving(true)
		setSaveError(null)

		const durationMin = Math.round(elapsed / 60)

		const workoutSession: WorkoutSession = {
			date: toDateStr(new Date(session.startTime)),
			sessionType: session.workoutName,
			exercises: session.exercises.map(ex => ({
				name: ex.name,
				sets: ex.sets
					.filter(s => s.completed)
					.map(
						(s): ExerciseSet => ({
							reps: s.reps,
							weightKg: s.weightKg,
							rpe: rpe,
						}),
					),
			})),
			overallRPE: rpe,
			durationMin,
			notes: finishNotes,
		}

		try {
			const res = await fetch("/api/save-workout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user, session: workoutSession }),
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || "Failed to save")
			}

			localStorage.removeItem(LS_KEY)
			setSession(null)
			setPhase("pick")
			router.push("/workouts")
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error"
			setSaveError(msg)
		} finally {
			setSaving(false)
		}
	}, [session, rpe, elapsed, finishNotes, user, router])

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

				{saveError && (
					<div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
						Failed to save: {saveError}
					</div>
				)}

				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setPhase("active")}
						disabled={saving}
						className="flex-1 py-3 rounded-xl bg-muted/40 hover:bg-muted/60 font-medium text-sm transition-colors disabled:opacity-50"
					>
						Back
					</button>
					<button
						type="button"
						onClick={finishWorkout}
						disabled={saving}
						className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm transition-colors hover:bg-accent/90 disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save Workout"}
					</button>
				</div>
			</div>
		)
	}

	// ─── Active Phase ────────────────────────────────────

	if (!session) return null

	const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0)
	const completedSets = session.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0)

	const filteredAddExercises = (() => {
		const existing = new Set(session.exercises.map(e => e.name))
		let pool = EXERCISE_DB.filter(e => !existing.has(e.name))
		if (addCategory) {
			pool = pool.filter(e => e.muscleGroups.includes(addCategory))
		}
		if (addSearch.length > 0) {
			pool = pool.filter(e => e.name.toLowerCase().includes(addSearch.toLowerCase()))
		}
		return pool.slice(0, 12)
	})()

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
				const prMsg = prCelebrations[exIdx]
				const previousBest = bestWeights[exercise.name] ?? 0
				const hint = suggestions[exercise.name]
				const weightNote = getWeightNote(exercise.name)
				const isSwapOpen = swapMenuIdx === exIdx
				const swapOptions = isSwapOpen ? getSwapSuggestions(exercise.name) : []

				return (
					<Card key={exIdx} className={`overflow-hidden transition-all ${exCompleted ? "opacity-60" : ""}`}>
						{/* Exercise header */}
						<div className="p-4 pb-2">
							<div className="flex items-start justify-between gap-2">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<div
										className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
											exCompleted
												? "bg-green-500/20 text-green-400"
												: "bg-muted/50 text-muted-foreground"
										}`}
									>
										{exCompleted ? <Check size={14} /> : exIdx + 1}
									</div>
									<div className="min-w-0">
										<h3 className="font-semibold text-sm truncate">{exercise.name}</h3>
										{hint && <p className="text-[10px] text-accent mt-0.5">{hint}</p>}
										{!hint && previousBest > 0 && (
											<p className="text-[10px] text-muted-foreground mt-0.5">
												Previous best: {previousBest}kg
											</p>
										)}
										{weightNote && <p className="text-[10px] text-blue-400 mt-0.5">{weightNote}</p>}
									</div>
								</div>
								{/* Swap & Delete buttons */}
								<div className="flex gap-1 flex-shrink-0">
									<button
										type="button"
										onClick={() => setSwapMenuIdx(isSwapOpen ? null : exIdx)}
										className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
										aria-label="Swap exercise"
									>
										<RefreshCw size={14} />
									</button>
									<button
										type="button"
										onClick={() => deleteExercise(exIdx)}
										className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
										aria-label="Remove exercise"
									>
										<Trash2 size={14} />
									</button>
								</div>
							</div>

							{/* Swap menu */}
							{isSwapOpen && (
								<div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border space-y-1">
									<p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
										Swap with:
									</p>
									{swapOptions.map(opt => (
										<button
											key={opt.name}
											type="button"
											onClick={() => swapExercise(exIdx, opt.name)}
											className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
										>
											<span className="font-medium">{opt.name}</span>
											<span className="text-[10px] text-muted-foreground ml-2">
												{opt.equipment} · {opt.weightNote}
											</span>
										</button>
									))}
								</div>
							)}

							{exercise.notes && (
								<p className="text-xs text-muted-foreground mt-1 ml-9">{exercise.notes}</p>
							)}
						</div>

						{/* PR Celebration Banner */}
						{prMsg && (
							<div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2 animate-pulse">
								<Trophy size={16} className="text-yellow-400 flex-shrink-0" />
								<span className="text-sm font-bold text-yellow-400">{prMsg}</span>
							</div>
						)}

						{/* Sets — tap row to complete, tap set# to change type */}
						<div className="px-4 pb-3 space-y-2">
							<div className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">
								<span className="text-center">Set</span>
								<span className="text-center">Weight (kg)</span>
								<span className="text-center">Reps</span>
							</div>

							{exercise.sets.map((set, setIdx) => {
								const typeInfo = SET_TYPE_LABELS[set.setType || "normal"]
								return (
									<div
										key={setIdx}
										role="button"
										tabIndex={0}
										onClick={() => toggleSetComplete(exIdx, setIdx)}
										onKeyDown={e => {
											if (e.key === "Enter" || e.key === " ") toggleSetComplete(exIdx, setIdx)
										}}
										className={`grid grid-cols-[2.5rem_1fr_1fr] gap-2 items-center transition-all rounded-lg py-2 px-1 cursor-pointer ${
											set.completed
												? "bg-green-500/15 border-2 border-green-500/30"
												: "hover:bg-muted/20 border-2 border-transparent"
										}`}
									>
										{/* Set number — tap to cycle type (stopPropagation) */}
										<button
											type="button"
											onClick={e => {
												e.stopPropagation()
												cycleSetType(exIdx, setIdx)
											}}
											className="flex flex-col items-center gap-0.5"
											aria-label="Change set type"
										>
											{set.completed ? (
												<Check size={16} className="text-green-400" />
											) : (
												<span className="text-xs font-medium text-muted-foreground">
													{setIdx + 1}
												</span>
											)}
											{typeInfo.label && (
												<span className={`text-[8px] font-bold px-1 rounded ${typeInfo.color}`}>
													{typeInfo.label}
												</span>
											)}
										</button>

										{/* Weight */}
										<div
											className="flex items-center justify-center gap-1"
											onClick={e => e.stopPropagation()}
											onKeyDown={e => e.stopPropagation()}
										>
											<StepButton
												onClick={() => updateSet(exIdx, setIdx, "weightKg", -2.5)}
												icon="minus"
												label="Decrease weight"
												disabled={set.completed}
											/>
											<span
												className={`w-14 text-center text-sm font-bold tabular-nums ${set.completed ? "text-green-400" : ""}`}
											>
												{set.weightKg}
											</span>
											<StepButton
												onClick={() => updateSet(exIdx, setIdx, "weightKg", 2.5)}
												icon="plus"
												label="Increase weight"
												disabled={set.completed}
											/>
										</div>

										{/* Reps */}
										<div
											className="flex items-center justify-center gap-1"
											onClick={e => e.stopPropagation()}
											onKeyDown={e => e.stopPropagation()}
										>
											<StepButton
												onClick={() => updateSet(exIdx, setIdx, "reps", -1)}
												icon="minus"
												label="Decrease reps"
												disabled={set.completed}
											/>
											<span
												className={`w-8 text-center text-sm font-bold tabular-nums ${set.completed ? "text-green-400" : ""}`}
											>
												{set.reps}
											</span>
											<StepButton
												onClick={() => updateSet(exIdx, setIdx, "reps", 1)}
												icon="plus"
												label="Increase reps"
												disabled={set.completed}
											/>
										</div>
									</div>
								)
							})}

							{/* Add / Remove set */}
							<div className="flex gap-2 pt-1">
								<button
									type="button"
									onClick={() => addSet(exIdx)}
									className="flex-1 py-2 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center justify-center gap-1"
								>
									<Plus size={12} />
									Add Set
								</button>
								{exercise.sets.length > 1 && (
									<button
										type="button"
										onClick={() => removeLastSet(exIdx)}
										className="py-2 px-3 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors"
									>
										<Minus size={12} />
									</button>
								)}
							</div>
						</div>
					</Card>
				)
			})}

			{/* Add Exercise Button */}
			<Card className="p-4">
				{addMenuOpen ? (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">Add Exercise</p>
							<button
								type="button"
								onClick={() => {
									setAddMenuOpen(false)
									setAddSearch("")
									setAddCategory(null)
								}}
								className="text-xs text-muted-foreground hover:text-foreground"
							>
								Cancel
							</button>
						</div>
						<input
							type="text"
							value={addSearch}
							onChange={e => setAddSearch(e.target.value)}
							placeholder="Search exercises..."
							className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
							autoFocus
						/>
						{/* Muscle group category chips */}
						<div className="flex flex-wrap gap-1.5">
							{(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map(mg => (
								<button
									key={mg}
									type="button"
									onClick={() => setAddCategory(addCategory === mg ? null : mg)}
									className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
										addCategory === mg
											? "bg-accent text-accent-foreground"
											: "bg-muted/40 text-muted-foreground hover:bg-muted/60"
									}`}
								>
									{MUSCLE_GROUP_LABELS[mg]}
								</button>
							))}
						</div>
						{/* Results */}
						{(filteredAddExercises.length > 0 || addCategory) && (
							<div className="space-y-1 max-h-60 overflow-y-auto">
								{filteredAddExercises.map(ex => (
									<button
										key={ex.name}
										type="button"
										onClick={() => addExercise(ex.name)}
										className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
									>
										<span className="text-sm font-medium block">{ex.name}</span>
										<span className="text-[10px] text-muted-foreground">
											{ex.equipment} · {ex.muscleGroups.join(", ")} · {ex.weightNote}
										</span>
									</button>
								))}
								{filteredAddExercises.length === 0 && (
									<p className="text-xs text-muted-foreground text-center py-2">No exercises found</p>
								)}
							</div>
						)}
					</div>
				) : (
					<button
						type="button"
						onClick={() => setAddMenuOpen(true)}
						className="w-full py-3 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center justify-center gap-2"
					>
						<Plus size={16} />
						Add Exercise
					</button>
				)}
			</Card>
		</div>
	)
}
