import type { OpenAI } from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import { printNode, zodToTs } from "zod-to-ts";
import type { BaseChatMessage, FormatEngine } from "../types";

export const DefaultJSON = (opt: {
	strategy?: "ts" | "json-schema";
}): FormatEngine<BaseChatMessage[], BaseChatMessage[]> => {
	return async (messages, schema) => {
		// find system message and append the schema
		let system = messages.find((m) => m.role === "system");
		if (!system) {
			system = { role: "system", content: "" };
			messages.unshift(system);
		}
		system.content +=
			"\nResponse in JSON format that follows the schema:\n" +
			(opt?.strategy === "ts"
				? printNode(zodToTs(schema).node)
				: JSON.stringify(zodToJsonSchema(schema), null, 2));
		system.content = system.content.trim();

		return messages;
	};
};

export const VisionJSON = (opt: {
	strategy?: "ts" | "json-schema";
}): FormatEngine<
	OpenAI.Chat.ChatCompletionMessageParam[],
	OpenAI.Chat.ChatCompletionMessageParam[]
> => {
	return async (messages, schema) => {
		// find system message and append the schema
		let system = messages.find((m) => m.role === "system");
		if (!system) {
			system = { role: "system", content: "" };
			messages.unshift(system);
		}

		const prompt =
			`\nResponse in JSON format (without other words or code fences) that follows the ${
				opt.strategy === "ts" ? "TypeScript type" : "JSON Schema"
			}:\n` +
			(opt?.strategy === "ts"
				? printNode(zodToTs(schema).node)
				: JSON.stringify(zodToJsonSchema(schema), null, 2));

		if (typeof system.content === "string") {
			system.content += prompt;
			system.content = system.content.trim();
		} else {
			const content = system.content?.find((c) => c.type === "text");
			if (content?.type === "text") {
				content.text += prompt;
				content.text = content.text.trim();
			}
		}

		return messages;
	};
};
