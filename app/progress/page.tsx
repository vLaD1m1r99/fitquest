"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import { useActiveUser } from "@/components/user-context"
import { UserToggle } from "@/components/user-toggle"
import {
	getMeasurementLog,
	getProfile,
	getWeightLog,
	type MeasurementLog,
	type Profile,
	type WeightLog,
	weightChange,
} from "@/lib/data"

export default function ProgressPage() {
	const { activeUser } = useActiveUser()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [weightLog, setWeightLog] = useState<WeightLog | null>(null)
	const [measurementLog, setMeasurementLog] = useState<MeasurementLog | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			try {
				const [prof, weights, measurements] = await Promise.all([
					getProfile(activeUser),
					getWeightLog(activeUser),
					getMeasurementLog(activeUser),
				])
				setProfile(prof)
				setWeightLog(weights)
				setMeasurementLog(measurements)
			} catch (_error) {
				/* fetch error */
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [activeUser])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>Loading...</p>
			</div>
		)
	}

	if (!profile || !weightLog || !measurementLog) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>No data available</p>
			</div>
		)
	}

	const changes = weightChange(weightLog.entries)
	const chartData = weightLog.entries.map(entry => ({
		date: entry.date,
		weight: entry.weightKg,
		avg: entry.weeklyAvgKg || entry.weightKg,
	}))

	const latestMeasurement = measurementLog.entries[measurementLog.entries.length - 1]

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Progress</h1>
				<UserToggle />
			</div>

			{/* Weight Chart */}
			<Card className="p-6 bg-card border-border">
				<h2 className="text-lg font-semibold mb-6">Weight Trend</h2>
				{chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart
							data={chartData}
							margin={{
								top: 5,
								right: 30,
								left: 0,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
							<XAxis
								dataKey="date"
								tick={{
									fill: "rgba(255, 255, 255, 0.5)",
									fontSize: 12,
								}}
							/>
							<YAxis
								tick={{
									fill: "rgba(255, 255, 255, 0.5)",
									fontSize: 12,
								}}
								domain={["dataMin - 2", "dataMax + 2"]}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "oklch(0.17 0.008 350)",
									border: "1px solid oklch(0.25 0.01 350)",
									borderRadius: "8px",
								}}
								labelStyle={{
									color: "oklch(0.95 0.01 350)",
								}}
							/>
							<Line
								type="monotone"
								dataKey="weight"
								stroke="oklch(0.75 0.08 30)"
								strokeWidth={2}
								dot={{
									fill: "oklch(0.75 0.08 30)",
									r: 4,
								}}
								activeDot={{
									r: 6,
								}}
							/>
							<Line
								type="monotone"
								dataKey="avg"
								stroke="oklch(0.82 0.08 80)"
								strokeWidth={2}
								strokeDasharray="5 5"
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<p className="text-sm text-muted-foreground text-center py-8">No weight data yet</p>
				)}
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Starting Weight */}
				<Card className="p-6 bg-card border-border">
					<p className="text-sm text-muted-foreground mb-2">Starting Weight</p>
					<p className="text-2xl font-bold">{profile.startingWeightKg} kg</p>
				</Card>

				{/* Current Weight */}
				<Card className="p-6 bg-card border-border">
					<p className="text-sm text-muted-foreground mb-2">Current Weight</p>
					<p className="text-2xl font-bold">
						{weightLog.entries[weightLog.entries.length - 1]?.weightKg || "—"} kg
					</p>
				</Card>

				{/* Total Change */}
				<Card className="p-6 bg-card border-border">
					<p className="text-sm text-muted-foreground mb-2">Total Change</p>
					<div className="flex items-center gap-2">
						{changes.change < 0 ? (
							<TrendingDown size={20} className="text-rose" />
						) : (
							<TrendingUp size={20} className="text-gold" />
						)}
						<p className="text-2xl font-bold">
							{changes.change > 0 ? "+" : ""}
							{changes.change.toFixed(1)} kg
						</p>
					</div>
					<p className="text-xs text-muted-foreground mt-1">{changes.percentage.toFixed(1)}%</p>
				</Card>

				{/* Weekly Avg Change */}
				<Card className="p-6 bg-card border-border">
					<p className="text-sm text-muted-foreground mb-2">Weekly Avg Change</p>
					<p className="text-2xl font-bold">{latestMeasurement ? latestMeasurement.waistCm : "—"}</p>
					<p className="text-xs text-muted-foreground mt-1">Last measurement</p>
				</Card>
			</div>

			{/* Measurements */}
			{latestMeasurement && (
				<Card className="p-6 bg-card border-border">
					<h2 className="text-lg font-semibold mb-4">Latest Measurements</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						<div>
							<p className="text-xs text-muted-foreground mb-1">Waist</p>
							<p className="text-lg font-semibold">{latestMeasurement.waistCm} cm</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">Hips</p>
							<p className="text-lg font-semibold">{latestMeasurement.hipsCm} cm</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">Chest</p>
							<p className="text-lg font-semibold">{latestMeasurement.chestCm} cm</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">Arms</p>
							<p className="text-lg font-semibold">{latestMeasurement.armsCm} cm</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">Thighs</p>
							<p className="text-lg font-semibold">{latestMeasurement.thighsCm} cm</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">Neck</p>
							<p className="text-lg font-semibold">{latestMeasurement.neckCm} cm</p>
						</div>
					</div>
					<p className="text-xs text-muted-foreground mt-4">Recorded: {latestMeasurement.date}</p>
				</Card>
			)}
		</div>
	)
}
