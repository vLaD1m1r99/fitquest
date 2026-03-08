"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

export type User = "vlada" | "sneska"

export const USER_DISPLAY_NAMES: Record<User, string> = {
	vlada: "Vlada",
	sneska: "Sneška",
}

interface UserContextType {
	activeUser: User
	displayName: string
	setActiveUser: (user: User) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [activeUser, setActiveUser] = useState<User>("vlada")

	useEffect(() => {
		document.documentElement.setAttribute("data-user", activeUser)
	}, [activeUser])

	const switchUser = useCallback((user: User) => {
		setActiveUser(user)
	}, [])

	const displayName = USER_DISPLAY_NAMES[activeUser]

	return (
		<UserContext.Provider value={{ activeUser, displayName, setActiveUser: switchUser }}>
			{children}
		</UserContext.Provider>
	)
}

export function useActiveUser() {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error("useActiveUser must be used within UserProvider")
	}
	return context
}
