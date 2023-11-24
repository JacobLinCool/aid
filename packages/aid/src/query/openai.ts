import debug from "debug";
import type { OpenAI } from "openai";
import type { BaseChatMessage, QueryEngine } from "../types";

const log = debug("aid:openai");

export const OpenAIQuery = (
	openai: OpenAI,
	param: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, "messages">,
): QueryEngine<BaseChatMessage[] | OpenAI.Chat.ChatCompletionMessageParam[]> => {
	const q: QueryEngine<BaseChatMessage[] | OpenAI.Chat.ChatCompletionMessageParam[]> = async (
		messages,
	) => {
		const payload: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
			temperature: 0,
			...param,
			messages,
		};

		log("payload", payload);
		const res = await openai.chat.completions.create(payload);
		log({
			id: res.id,
			fingerprint: res.system_fingerprint,
			usage: res.usage,
			reply: res.choices[0],
		});

		const text = res.choices[0].message.content;
		if (!text) {
			throw new Error("No text returned from OpenAI");
		}
		log("text", text);

		return text;
	};
	return q;
};
