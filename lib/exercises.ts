/**
 * Exercise database for swap suggestions and adding exercises.
 * Organized by muscle group. Each exercise has a name, equipment type,
 * and weight convention note.
 *
 * WEIGHT CONVENTIONS:
 * - Dumbbells: weight PER dumbbell (2×15kg = log 15)
 * - Barbells: total weight INCLUDING the bar (bar=20kg, EZ bar=10kg)
 * - Machines/Cables: weight on the stack
 */

export type MuscleGroup =
	| "chest"
	| "back"
	| "shoulders"
	| "biceps"
	| "triceps"
	| "quads"
	| "hamstrings"
	| "glutes"
	| "calves"
	| "core"
	| "compound"

export type Equipment = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "ez-bar" | "smith"

export interface ExerciseInfo {
	name: string
	muscleGroups: MuscleGroup[]
	equipment: Equipment
	weightNote: string
}

export const EXERCISE_DB: ExerciseInfo[] = [
	// ─── CHEST ─────────────────────────
	{
		name: "Machine Incline Bench Press",
		muscleGroups: ["chest", "shoulders", "triceps"],
		equipment: "machine",
		weightNote: "Stack weight",
	},
	{
		name: "Bench Press",
		muscleGroups: ["chest", "shoulders", "triceps"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{
		name: "Incline Dumbbell Press",
		muscleGroups: ["chest", "shoulders"],
		equipment: "dumbbell",
		weightNote: "Per dumbbell",
	},
	{
		name: "Dumbbell Bench Press",
		muscleGroups: ["chest", "triceps"],
		equipment: "dumbbell",
		weightNote: "Per dumbbell",
	},
	{
		name: "Flys (Machine or Dumbbell Flat)",
		muscleGroups: ["chest"],
		equipment: "machine",
		weightNote: "Stack or per DB",
	},
	{ name: "Cable Flys", muscleGroups: ["chest"], equipment: "cable", weightNote: "Per side" },
	{
		name: "Chest Dips",
		muscleGroups: ["chest", "triceps"],
		equipment: "bodyweight",
		weightNote: "Body + added weight",
	},
	{ name: "Push-Ups", muscleGroups: ["chest", "triceps"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{
		name: "Smith Machine Bench Press",
		muscleGroups: ["chest", "shoulders"],
		equipment: "smith",
		weightNote: "Plates only (bar ~5-10kg)",
	},

	// ─── BACK ──────────────────────────
	{
		name: "Inverted Rows (Barbell Rack)",
		muscleGroups: ["back", "biceps"],
		equipment: "bodyweight",
		weightNote: "Bodyweight",
	},
	{ name: "Lat Pulldowns", muscleGroups: ["back", "biceps"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Straight-Arm Pulldowns / Rows", muscleGroups: ["back"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Straight-Arm Cable Pulldowns", muscleGroups: ["back"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Seated Cable Row", muscleGroups: ["back"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Barbell Row", muscleGroups: ["back", "biceps"], equipment: "barbell", weightNote: "Include bar (20kg)" },
	{ name: "Dumbbell Row", muscleGroups: ["back", "biceps"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "T-Bar Row", muscleGroups: ["back"], equipment: "barbell", weightNote: "Plates only" },
	{ name: "Pull-Ups", muscleGroups: ["back", "biceps"], equipment: "bodyweight", weightNote: "Body + added weight" },
	{ name: "Chin-Ups", muscleGroups: ["back", "biceps"], equipment: "bodyweight", weightNote: "Body + added weight" },
	{
		name: "Hyperextensions",
		muscleGroups: ["back", "hamstrings"],
		equipment: "bodyweight",
		weightNote: "Body + plate",
	},

	// ─── SHOULDERS ─────────────────────
	{ name: "Dumbbell Lateral Raises", muscleGroups: ["shoulders"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Cable Lateral Raises", muscleGroups: ["shoulders"], equipment: "cable", weightNote: "Stack weight" },
	{
		name: "Overhead Press",
		muscleGroups: ["shoulders", "triceps"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{
		name: "Dumbbell Shoulder Press",
		muscleGroups: ["shoulders", "triceps"],
		equipment: "dumbbell",
		weightNote: "Per dumbbell",
	},
	{ name: "Machine Shoulder Press", muscleGroups: ["shoulders"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Face Pulls", muscleGroups: ["shoulders", "back"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Front Raises", muscleGroups: ["shoulders"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Reverse Flys", muscleGroups: ["shoulders", "back"], equipment: "dumbbell", weightNote: "Per dumbbell" },

	// ─── BICEPS ────────────────────────
	{
		name: "Preacher Curls (Barbell)",
		muscleGroups: ["biceps"],
		equipment: "barbell",
		weightNote: "Include bar (EZ=10kg)",
	},
	{ name: "Incline Dumbbell Curls", muscleGroups: ["biceps"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Hammer Curls", muscleGroups: ["biceps"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Cable Curls", muscleGroups: ["biceps"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Barbell Curls", muscleGroups: ["biceps"], equipment: "barbell", weightNote: "Include bar (EZ=10kg)" },
	{ name: "Concentration Curls", muscleGroups: ["biceps"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{
		name: "Skull Crushers + Biceps Curls",
		muscleGroups: ["triceps", "biceps"],
		equipment: "ez-bar",
		weightNote: "Include EZ bar (10kg)",
	},

	// ─── TRICEPS ───────────────────────
	{ name: "Skull Crushers", muscleGroups: ["triceps"], equipment: "ez-bar", weightNote: "Include EZ bar (10kg)" },
	{ name: "Cable Triceps Pushdowns", muscleGroups: ["triceps"], equipment: "cable", weightNote: "Stack weight" },
	{
		name: "Overhead Triceps Extension",
		muscleGroups: ["triceps"],
		equipment: "dumbbell",
		weightNote: "Per dumbbell or total",
	},
	{
		name: "Close-Grip Bench Press",
		muscleGroups: ["triceps", "chest"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{
		name: "Triceps Dips",
		muscleGroups: ["triceps", "chest"],
		equipment: "bodyweight",
		weightNote: "Body + added weight",
	},

	// ─── QUADS ─────────────────────────
	{ name: "Leg Press", muscleGroups: ["quads", "glutes"], equipment: "machine", weightNote: "Plates on machine" },
	{ name: "Machine Leg Extensions", muscleGroups: ["quads"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Leg Extensions", muscleGroups: ["quads"], equipment: "machine", weightNote: "Stack weight" },
	{
		name: "Barbell Squats",
		muscleGroups: ["quads", "glutes", "compound"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{ name: "Hack Squat", muscleGroups: ["quads", "glutes"], equipment: "machine", weightNote: "Plates on machine" },
	{
		name: "Reverse Hack Squat",
		muscleGroups: ["quads", "glutes"],
		equipment: "machine",
		weightNote: "Plates on machine",
	},
	{ name: "Lunges", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Reverse Lunges", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Elevated Lunges", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{
		name: "Bulgarian Split Squats",
		muscleGroups: ["quads", "glutes"],
		equipment: "dumbbell",
		weightNote: "Per dumbbell",
	},
	{ name: "Goblet Squats", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", weightNote: "Single dumbbell" },

	// ─── HAMSTRINGS ────────────────────
	{
		name: "Romanian Deadlifts",
		muscleGroups: ["hamstrings", "glutes"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{ name: "Lying Leg Curl", muscleGroups: ["hamstrings"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Seated Leg Curl", muscleGroups: ["hamstrings"], equipment: "machine", weightNote: "Stack weight" },
	{
		name: "Good Morning",
		muscleGroups: ["hamstrings", "back"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{
		name: "Stiff-Leg Deadlifts",
		muscleGroups: ["hamstrings", "glutes"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},

	// ─── GLUTES ────────────────────────
	{ name: "Hip Thrust", muscleGroups: ["glutes"], equipment: "barbell", weightNote: "Include bar (20kg)" },
	{
		name: "Hip Thrust + Jump Squats",
		muscleGroups: ["glutes", "quads"],
		equipment: "barbell",
		weightNote: "Hip thrust weight",
	},
	{ name: "Cable Kickbacks", muscleGroups: ["glutes"], equipment: "cable", weightNote: "Stack weight" },
	{
		name: "Glute Back Extensions",
		muscleGroups: ["glutes", "hamstrings"],
		equipment: "bodyweight",
		weightNote: "Body + plate",
	},
	{
		name: "Abductor Machine (Leaning Forward + Seated)",
		muscleGroups: ["glutes"],
		equipment: "machine",
		weightNote: "Stack weight",
	},
	{ name: "Abductor Machine", muscleGroups: ["glutes"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Glute Bridge", muscleGroups: ["glutes"], equipment: "bodyweight", weightNote: "Body + plate" },

	// ─── CALVES ────────────────────────
	{ name: "Standing Calf Raises", muscleGroups: ["calves"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Seated Calf Raises", muscleGroups: ["calves"], equipment: "machine", weightNote: "Stack weight" },
	{
		name: "Calves + Lateral Raises (Superset)",
		muscleGroups: ["calves", "shoulders"],
		equipment: "machine",
		weightNote: "Stack / per DB",
	},

	// ─── CORE ──────────────────────────
	{ name: "Plank", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Hanging Leg Raises", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Cable Crunches", muscleGroups: ["core"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Ab Wheel Rollouts", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Russian Twists", muscleGroups: ["core"], equipment: "dumbbell", weightNote: "Single weight" },
	{ name: "Crunches", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Leg Raises", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Dead Bug", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Mountain Climbers", muscleGroups: ["core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Pallof Press", muscleGroups: ["core"], equipment: "cable", weightNote: "Stack weight" },

	// ─── ADDITIONAL CHEST ──────────────
	{
		name: "Incline Machine Press",
		muscleGroups: ["chest", "shoulders"],
		equipment: "machine",
		weightNote: "Stack weight",
	},
	{
		name: "Decline Bench Press",
		muscleGroups: ["chest", "triceps"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{ name: "Pec Deck Machine", muscleGroups: ["chest"], equipment: "machine", weightNote: "Stack weight" },
	{
		name: "Dumbbell Pullover",
		muscleGroups: ["chest", "back"],
		equipment: "dumbbell",
		weightNote: "Single dumbbell",
	},

	// ─── ADDITIONAL BACK ───────────────
	{ name: "Cable Row (Single Arm)", muscleGroups: ["back"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Meadows Row", muscleGroups: ["back"], equipment: "barbell", weightNote: "Plates only" },
	{ name: "Machine Row", muscleGroups: ["back"], equipment: "machine", weightNote: "Stack weight" },
	{
		name: "Rack Pulls",
		muscleGroups: ["back", "hamstrings"],
		equipment: "barbell",
		weightNote: "Include bar (20kg)",
	},
	{ name: "Pendlay Row", muscleGroups: ["back", "biceps"], equipment: "barbell", weightNote: "Include bar (20kg)" },

	// ─── ADDITIONAL SHOULDERS ──────────
	{ name: "Arnold Press", muscleGroups: ["shoulders"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Machine Lateral Raise", muscleGroups: ["shoulders"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Upright Row", muscleGroups: ["shoulders"], equipment: "barbell", weightNote: "Include bar (20kg)" },
	{
		name: "Rear Delt Fly Machine",
		muscleGroups: ["shoulders", "back"],
		equipment: "machine",
		weightNote: "Stack weight",
	},
	{ name: "Shrugs", muscleGroups: ["shoulders"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Barbell Shrugs", muscleGroups: ["shoulders"], equipment: "barbell", weightNote: "Include bar (20kg)" },

	// ─── ADDITIONAL ARMS ───────────────
	{ name: "Bayesian Curls (Cable)", muscleGroups: ["biceps"], equipment: "cable", weightNote: "Stack weight" },
	{ name: "Spider Curls", muscleGroups: ["biceps"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Reverse Curls", muscleGroups: ["biceps"], equipment: "barbell", weightNote: "Include bar (EZ=10kg)" },
	{
		name: "Cable Overhead Triceps Extension",
		muscleGroups: ["triceps"],
		equipment: "cable",
		weightNote: "Stack weight",
	},
	{ name: "Diamond Push-Ups", muscleGroups: ["triceps", "chest"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Kickbacks", muscleGroups: ["triceps"], equipment: "dumbbell", weightNote: "Per dumbbell" },

	// ─── ADDITIONAL LEGS ───────────────
	{ name: "Smith Machine Squat", muscleGroups: ["quads", "glutes"], equipment: "smith", weightNote: "Plates only" },
	{ name: "Front Squat", muscleGroups: ["quads"], equipment: "barbell", weightNote: "Include bar (20kg)" },
	{ name: "Sissy Squat", muscleGroups: ["quads"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Step-Ups", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", weightNote: "Per dumbbell" },
	{ name: "Wall Sit", muscleGroups: ["quads"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Sumo Squat", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", weightNote: "Single dumbbell" },
	{ name: "Nordic Hamstring Curl", muscleGroups: ["hamstrings"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{
		name: "Single-Leg Romanian Deadlift",
		muscleGroups: ["hamstrings", "glutes"],
		equipment: "dumbbell",
		weightNote: "Per dumbbell",
	},
	{ name: "Leg Curl (Single Leg)", muscleGroups: ["hamstrings"], equipment: "machine", weightNote: "Stack weight" },
	{ name: "Smith Machine Hip Thrust", muscleGroups: ["glutes"], equipment: "smith", weightNote: "Plates only" },
	{ name: "Frog Pumps", muscleGroups: ["glutes"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Donkey Kicks", muscleGroups: ["glutes"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Fire Hydrants", muscleGroups: ["glutes"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{ name: "Calf Press (Leg Press)", muscleGroups: ["calves"], equipment: "machine", weightNote: "Plates on machine" },

	// ─── CARDIO / CONDITIONING ─────────
	{ name: "Treadmill", muscleGroups: ["quads", "calves"], equipment: "machine", weightNote: "Time/distance" },
	{
		name: "Stair Climber",
		muscleGroups: ["quads", "glutes", "calves"],
		equipment: "machine",
		weightNote: "Time/distance",
	},
	{ name: "Rowing Machine", muscleGroups: ["back", "biceps"], equipment: "machine", weightNote: "Time/distance" },
	{ name: "Battle Ropes", muscleGroups: ["shoulders", "core"], equipment: "bodyweight", weightNote: "Time-based" },
	{ name: "Jump Squats", muscleGroups: ["quads", "glutes"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{
		name: "Box Jumps",
		muscleGroups: ["quads", "glutes", "calves"],
		equipment: "bodyweight",
		weightNote: "Bodyweight",
	},
	{ name: "Burpees", muscleGroups: ["compound", "core"], equipment: "bodyweight", weightNote: "Bodyweight" },
	{
		name: "Kettlebell Swings",
		muscleGroups: ["glutes", "hamstrings", "core"],
		equipment: "dumbbell",
		weightNote: "Single KB",
	},
]

/** All unique muscle group names for category browsing */
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
	chest: "Chest",
	back: "Back",
	shoulders: "Shoulders",
	biceps: "Biceps",
	triceps: "Triceps",
	quads: "Quads",
	hamstrings: "Hamstrings",
	glutes: "Glutes",
	calves: "Calves",
	core: "Core",
	compound: "Compound",
}

/** Get exercises filtered by muscle group */
export function getExercisesByMuscle(muscle: MuscleGroup): ExerciseInfo[] {
	return EXERCISE_DB.filter(e => e.muscleGroups.includes(muscle))
}

/** Get exercises that share at least one muscle group with the given exercise */
export function getSwapSuggestions(exerciseName: string, limit = 5): ExerciseInfo[] {
	const current = EXERCISE_DB.find(e => e.name === exerciseName)
	if (!current) return EXERCISE_DB.slice(0, limit)

	// Score by how many muscle groups overlap
	const scored = EXERCISE_DB.filter(e => e.name !== exerciseName)
		.map(e => {
			const overlap = e.muscleGroups.filter(mg => current.muscleGroups.includes(mg)).length
			return { exercise: e, score: overlap }
		})
		.filter(s => s.score > 0)
		.sort((a, b) => b.score - a.score)

	return scored.slice(0, limit).map(s => s.exercise)
}

/** Get the weight convention note for an exercise */
export function getWeightNote(exerciseName: string): string | null {
	const ex = EXERCISE_DB.find(e => e.name === exerciseName)
	return ex?.weightNote ?? null
}
