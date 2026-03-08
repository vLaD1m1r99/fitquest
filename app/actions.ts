"use server"

import { cookies } from "next/headers"

export async function switchUser(user: "vlada" | "sneska") {
	const cookieStore = await cookies()
	cookieStore.set("activeUser", user, {
		path: "/",
		maxAge: 60 * 60 * 24 * 365,
		sameSite: "lax",
	})
}
