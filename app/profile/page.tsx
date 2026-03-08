import type { Metadata } from "next"
import { getActiveUser } from "@/lib/user"
import { getProfile, getRPG } from "@/lib/data"
import { ProfileView } from "./profile-view"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
	const user = await getActiveUser()

	const [profile, rpg] = await Promise.all([getProfile(user), getRPG(user)])

	return <ProfileView profile={profile} rpg={rpg} />
}
