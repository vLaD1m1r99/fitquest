import { NextResponse } from "next/server"
import type { WorkoutSession } from "@/lib/data"

const GITHUB_OWNER = "vLaD1m1r99"
const GITHUB_REPO = "fitquest"
const GITHUB_BRANCH = "master"

interface GitHubFileResponse {
	content: string
	sha: string
}

async function getGitHubFile(path: string, token: string): Promise<GitHubFileResponse> {
	const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github.v3+json",
		},
		cache: "no-store",
	})
	if (!res.ok) {
		throw new Error(`Failed to get file ${path}: ${res.status} ${res.statusText}`)
	}
	return res.json()
}

async function updateGitHubFile(path: string, content: string, sha: string, message: string, token: string) {
	const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
	const res = await fetch(url, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github.v3+json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message,
			content: Buffer.from(content).toString("base64"),
			sha,
			branch: GITHUB_BRANCH,
		}),
	})
	if (!res.ok) {
		const errorBody = await res.text()
		throw new Error(`Failed to update file ${path}: ${res.status} ${errorBody}`)
	}
	return res.json()
}

export async function POST(request: Request) {
	try {
		const token = process.env.GITHUB_TOKEN
		if (!token) {
			return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 })
		}

		const body = await request.json()
		const { user, session } = body as { user: string; session: WorkoutSession }

		if (!user || !session) {
			return NextResponse.json({ error: "Missing user or session data" }, { status: 400 })
		}

		if (user !== "vlada" && user !== "sneska") {
			return NextResponse.json({ error: "Invalid user" }, { status: 400 })
		}

		const filePath = `public/data/${user}/workout-log.json`

		// Get current file from GitHub
		const file = await getGitHubFile(filePath, token)
		const currentContent = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"))

		// Append new session
		currentContent.sessions.push(session)

		// Save back to GitHub
		const updatedContent = JSON.stringify(currentContent, null, 2)
		await updateGitHubFile(
			filePath,
			updatedContent,
			file.sha,
			`Log workout: ${session.sessionType} on ${session.date}`,
			token,
		)

		return NextResponse.json({ success: true, sessionsCount: currentContent.sessions.length })
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : "Unknown error"
		return NextResponse.json({ error: msg }, { status: 500 })
	}
}
