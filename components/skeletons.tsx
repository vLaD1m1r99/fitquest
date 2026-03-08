export function CardSkeleton({ className = "" }: { className?: string }) {
	return <div className={`bg-card border border-border rounded-xl animate-pulse ${className}`} />
}

export function DashboardSkeleton() {
	return (
		<div className="space-y-8">
			<div>
				<div className="h-10 w-48 bg-muted rounded-lg animate-pulse mb-2" />
				<div className="h-5 w-32 bg-muted rounded animate-pulse" />
			</div>
			<CardSkeleton className="h-40 p-6" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<CardSkeleton className="h-32" />
				<CardSkeleton className="h-32" />
				<CardSkeleton className="h-32" />
				<CardSkeleton className="h-32" />
			</div>
			<CardSkeleton className="h-48" />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<CardSkeleton className="h-56" />
				<CardSkeleton className="h-56" />
			</div>
			<CardSkeleton className="h-32" />
		</div>
	)
}

export function NutritionSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
			<div className="flex gap-2">
				{[1, 2, 3, 4, 5].map(i => (
					<div key={i} className="h-10 w-16 bg-muted rounded-lg animate-pulse" />
				))}
			</div>
			<CardSkeleton className="h-80" />
			<CardSkeleton className="h-64" />
		</div>
	)
}

export function WorkoutsSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
			<CardSkeleton className="h-24" />
			{[1, 2, 3].map(i => (
				<CardSkeleton key={i} className="h-20" />
			))}
		</div>
	)
}

export function ProgressSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
			<div className="flex gap-2">
				{[1, 2, 3, 4, 5].map(i => (
					<div key={i} className="h-10 w-16 bg-muted rounded-lg animate-pulse" />
				))}
			</div>
			<CardSkeleton className="h-72" />
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				<CardSkeleton className="h-24" />
				<CardSkeleton className="h-24" />
				<CardSkeleton className="h-24" />
			</div>
			<CardSkeleton className="h-64" />
			<CardSkeleton className="h-48" />
		</div>
	)
}

export function ProfileSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
			<CardSkeleton className="h-40 p-8" />
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
				{[1, 2, 3, 4, 5].map(i => (
					<CardSkeleton key={i} className="h-20" />
				))}
			</div>
			<CardSkeleton className="h-48" />
			<CardSkeleton className="h-48" />
			<CardSkeleton className="h-64" />
		</div>
	)
}

export function ChallengesSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
			<CardSkeleton className="h-28" />
			<div className="space-y-4">
				{[1, 2, 3].map(i => (
					<CardSkeleton key={i} className="h-24" />
				))}
			</div>
		</div>
	)
}
