import debug from "debug";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Aid, BaseChatMessage, QueryEngine } from "../src";
import { WIKI_AI } from "./fixtures/articles";

debug.enable("aid");

describe("Cohere", () => {
	it(
		"Custom Model",
		async (c) => {
			const api_token = process.env.COHERE_API_TOKEN;
			if (!api_token) {
				c.skip();
				return;
			}

			const q: QueryEngine<BaseChatMessage[]> = async (messages) => {
				const message = messages[messages.length - 1].content;
				const chat_history = messages.slice(0, -1).map((message) => ({
					role: message.role === "user" ? "User" : "Chatbot",
					message: message.content,
				}));
				const res = await fetch("https://api.cohere.ai/v1/chat", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${api_token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: "command",
						temperature: 0,
						connectors: [],
						documents: [],
						prompt_truncation: "auto",
						message,
						chat_history,
					}),
				});

				const result = (await res.json()) as { text: string };
				console.log(result);
				return result.text;
			};

			const aid = Aid.chat(q);

			const analyze = aid.task(
				"Summarize and extract keywords",
				z.object({
					summary: z.string().max(300),
					keywords: z.array(z.string().max(30)).max(10),
				}),
			);

			const { result } = await analyze(WIKI_AI);
			expect(result).toMatchSnapshot();
			expect(typeof result).toBe("object");
			expect(typeof result.summary).toBe("string");
			expect(Array.isArray(result.keywords)).toBe(true);
			result.keywords.forEach((keyword) => expect(typeof keyword).toBe("string"));
		},
		{ timeout: 60_000 },
	);
});
