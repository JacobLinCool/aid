import debug from "debug";
import type { LLMQuery } from "../types";

const log = debug("aid:cohere");

export interface CohereQueryOptions {
	model: string;
	temperature: number;
	connectors: unknown[];
	documents: unknown[];
	prompt_truncation: string;
}

export const CohereQuery = (token: string, opt: Partial<CohereQueryOptions>): LLMQuery => {
	const q: LLMQuery = async (messages) => {
		const message = messages[messages.length - 1].content;
		const chat_history = messages.slice(0, -1).map((message) => ({
			role: message.role === "user" ? "User" : "Chatbot",
			message: message.content,
		}));

		const payload = {
			model: "command",
			temperature: 0,
			connectors: [],
			documents: [],
			prompt_truncation: "auto",
			...opt,
			message,
			chat_history,
		};
		log("payload", payload);

		const res = await fetch("https://api.cohere.ai/v1/chat", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		log("status", res.status);

		const result = (await res.json()) as { text: string };
		log("result", result);
		return result.text;
	};

	return q;
};
