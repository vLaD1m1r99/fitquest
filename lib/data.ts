export interface Macros {
	proteinG: number
	fatG: number
	carbsG: number
}

export interface Profile {
	name: string
	gender: "male" | "female"
	age: number
	heightCm: number
	currentWeightKg: number
	startingWeightKg: number
	goalWeightKg: number | null
	bmr: number
	tdee: number
	dailyCalorieTarget: number
	macros: Macros
	deficit: number
	activityFactor: number
	supplements: string[]
	restrictions: string[]
	lastRecalculation: string
	notes: string
}

export interface XPHistoryEntry {
	date: string
	xpGained: number
	reason: string
}

export interface RPG {
	level: number
	totalXP: number
	xpToNextLevel: number
	currentStreak: number
	longestStreak: number
	totalWorkouts: number
	totalPRs: number
	perfectMacroDays: number
	xpHistory: XPHistoryEntry[]
	achievements: string[]
}

export interface WeightEntry {
	date: string
	weightKg: number
	weeklyAvgKg: number | null
	notes: string
}

export interface WeightLog {
	entries: WeightEntry[]
}

export interface MeasurementEntry {
	date: string
	waistCm: number
	hipsCm: number
	chestCm: number
	armsCm: number
	thighsCm: number
	neckCm: number
	notes: string
}

export interface MeasurementLog {
	entries: MeasurementEntry[]
}

export interface FoodItem {
	food: string
	portionG: number
	calories: number
	proteinG: number
	carbsG: number
	fatG: number
}

export interface Meal {
	mealType: string
	items: FoodItem[]
}

export interface NutritionDay {
	date: string
	meals: Meal[]
	dailyTotals: {
		calories: number
		proteinG: number
		carbsG: number
		fatG: number
	}
	remaining: {
		calories: number
		proteinG: number
		carbsG: number
		fatG: number
	}
}

export interface NutritionLog {
	days: NutritionDay[]
}

export interface ExerciseSet {
	reps: number
	weightKg: number
	rpe: number
}

export interface Exercise {
	name: string
	sets: ExerciseSet[]
}

export interface WorkoutSession {
	date: string
	sessionType: string
	exercises: Exercise[]
	overallRPE: number
	durationMin: number
	notes: string
}

export interface WorkoutLog {
	sessions: WorkoutSession[]
}

export interface DailyLogEntry {
	date: string
	steps: number
	sleepHours: number
	sleepQuality: "poor" | "fair" | "good" | "excellent"
	energyLevel: 1 | 2 | 3 | 4 | 5
	mood: "bad" | "neutral" | "good" | "great"
	stressLevel: 1 | 2 | 3 | 4 | 5
	sickness: boolean
	workoutCompleted: boolean
	missedWorkoutReason: string
	notes: string
}

export interface DailyLog {
	entries: DailyLogEntry[]
}

export interface MealDatabaseEntry {
	name: string
	calories: number
	proteinG: number
	carbsG: number
	fatG: number
	portionG: number
}

export interface MealDatabase {
	entries: MealDatabaseEntry[]
}

export interface WorkoutTemplate {
	name: string
	exercises: Array<{
		name: string
		sets: number
		reps: string
		rest: string
	}>
}

export interface WorkoutPlan {
	currentPlan: string
	startDate: string
	schedule: Record<string, Record<string, string>>
	workouts: Record<string, WorkoutTemplate>
	notes: string
}

export interface Config {
	startDate: string
	appVersion: string
	recalculationFrequency: string
	weighInFrequency: string
	measurementFrequency: string
	stepsGoal: number
	theme: string
}

export type User = "vlada" | "sneska"

async function fetchData<T>(path: string): Promise<T> {
	const response = await fetch(path, {
		cache: "no-store",
	})
	if (!response.ok) {
		throw new Error(`Failed to fetch ${path}: ${response.statusText}`)
	}
	return response.json()
}

export async function getProfile(user: User): Promise<Profile> {
	return fetchData(`/data/${user}/profile.json`)
}

export async function getRPG(user: User): Promise<RPG> {
	return fetchData(`/data/${user}/rpg.json`)
}

export async function getWeightLog(user: User): Promise<WeightLog> {
	return fetchData(`/data/${user}/weight-log.json`)
}

export async function getMeasurementLog(user: User): Promise<MeasurementLog> {
	return fetchData(`/data/${user}/measurements.json`)
}

export async function getNutritionLog(user: User): Promise<NutritionLog> {
	return fetchData(`/data/${user}/nutrition-log.json`)
}

export async function getWorkoutLog(user: User): Promise<WorkoutLog> {
	return fetchData(`/data/${user}/workout-log.json`)
}

export async function getDailyLog(user: User): Promise<DailyLog> {
	return fetchData(`/data/${user}/daily-log.json`)
}

export async function getMealDatabase(): Promise<MealDatabase> {
	return fetchData(`/data/shared/meal-database.json`)
}

export async function getWorkoutPlan(): Promise<WorkoutPlan> {
	return fetchData(`/data/shared/workout-plan.json`)
}

export async function getConfig(): Promise<Config> {
	return fetchData(`/data/shared/config.json`)
}

export function daysSinceStart(startDate: string): number {
	const start = new Date(startDate)
	const today = new Date()
	const diffMs = today.getTime() - start.getTime()
	return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function weightChange(entries: WeightEntry[]): {
	change: number
	percentage: number
} {
	if (entries.length === 0) {
		return { change: 0, percentage: 0 }
	}

	const startWeight = entries[0].weightKg
	const currentWeight = entries[entries.length - 1].weightKg
	const change = currentWeight - startWeight
	const percentage = (change / startWeight) * 100

	return { change, percentage }
}

export function xpProgress(rpg: RPG): {
	currentLevelXP: number
	nextLevelXP: number
	progressPercent: number
} {
	const xpInCurrentLevel = rpg.totalXP - (rpg.level - 1) * 500
	const nextLevelXP = rpg.xpToNextLevel
	const progressPercent = (xpInCurrentLevel / nextLevelXP) * 100

	return {
		currentLevelXP: xpInCurrentLevel,
		nextLevelXP: nextLevelXP,
		progressPercent: Math.min(progressPercent, 100),
	}
}

export function getTodayNutrition(nutrition: NutritionLog, today: string): NutritionDay | undefined {
	return nutrition.days.find(day => day.date === today)
}

export function getTodayDailyLog(daily: DailyLog, today: string): DailyLogEntry | undefined {
	return daily.entries.find(entry => entry.date === today)
}

export function getRecentWorkouts(workouts: WorkoutLog, count: number = 3): WorkoutSession[] {
	return workouts.sessions.slice(-count).reverse()
}

export function getLatestMeasurements(measurements: MeasurementLog): MeasurementEntry | undefined {
	return measurements.entries[measurements.entries.length - 1]
}
