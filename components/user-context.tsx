"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

type User = "vlada" | "sneska"

interface UserContextType {
	activeUser: User
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

	return <UserContext.Provider value={{ activeUser, setActiveUser: switchUser }}>{children}</UserContext.Provider>
}

export function useActiveUser() {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error("useActiveUser must be used within UserProvider")
	}
	return context
}
