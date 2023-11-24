import debug from "debug";
import type { OpenAI } from "openai";
import type { LLMQuery, Message } from "../types";

const log = debug("aid:openai");

export const OpenAIQuery = (
	openai: OpenAI,
	param: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, "messages">,
): LLMQuery => {
	const q: LLMQuery = async (messages: Message[]) => {
		const payload: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
			temperature: 0,
			...param,
			messages,
			response_format: { type: "json_object" },
		};

		log("payload", payload);
		const res = await openai.chat.completions.create(payload);
		log({ id: res.id, fingerprint: res.system_fingerprint, usage: res.usage });

		const text = res.choices[0].message.content;
		if (!text) {
			throw new Error("No text returned from OpenAI");
		}
		log("text", text);

		return text;
	};
	return q;
};
