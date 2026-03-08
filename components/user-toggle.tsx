"use client"

import { Button } from "./ui/button"
import { useActiveUser } from "./user-context"

export function UserToggle() {
	const { activeUser, setActiveUser } = useActiveUser()

	return (
		<div className="flex gap-2">
			<Button
				onClick={() => setActiveUser("vlada")}
				variant={activeUser === "vlada" ? "default" : "outline"}
				className={activeUser === "vlada" ? "bg-rose" : ""}
			>
				Vlada
			</Button>
			<Button
				onClick={() => setActiveUser("sneska")}
				variant={activeUser === "sneska" ? "default" : "outline"}
				className={activeUser === "sneska" ? "bg-rose" : ""}
			>
				Sneska
			</Button>
		</div>
	)
}
