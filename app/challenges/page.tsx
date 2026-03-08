import { getActiveUser } from "@/lib/user"
import { getChallenges, getRPG, type ChallengesData, type RPG } from "@/lib/data"
import { ChallengesView } from "./challenges-view"

export const metadata = { title: "Quests" }

export default async function ChallengesPage() {
	const user = await getActiveUser()
	const [challenges, rpg] = await Promise.all([getChallenges(user), getRPG(user)])

	return <ChallengesView challengesData={challenges} rpg={rpg} />
}
