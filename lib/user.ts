import { cookies } from "next/headers"
import type { User } from "./data"

export async function getActiveUser(): Promise<User> {
	const cookieStore = await cookies()
	const user = cookieStore.get("activeUser")?.value
	if (user === "vlada" || user === "sneska") return user
	return "vlada"
}
