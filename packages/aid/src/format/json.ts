import type { OpenAI } from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import type { BaseChatMessage, FormatEngine } from "../types";

const instruction = (strategy?: "ts" | "json-schema") =>
	`\nResponse in JSON format (without other words or code fences) that follows the ${
		strategy === "ts" ? "TypeScript type" : "JSON Schema"
	}:\n`;

export const DefaultJSON = (opt: {
	strategy?: "ts" | "json-schema";
}): FormatEngine<BaseChatMessage[], BaseChatMessage[]> => {
	return async (messages, schema) => {
		const ts_module = "zod-to-ts";
		const ts = opt?.strategy === "ts" ? await import(ts_module) : {};

		// find system message and append the schema
		let system = messages.find((m) => m.role === "system");
		if (!system) {
			system = { role: "system", content: "" };
			messages.unshift(system);
		}
		system.content +=
			instruction(opt?.strategy) +
			(opt?.strategy === "ts"
				? ts.printNode(ts.zodToTs(schema).node)
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
		const ts_module = "zod-to-ts";
		const ts = opt?.strategy === "ts" ? await import(ts_module) : {};

		// find system message and append the schema
		let system = messages.find((m) => m.role === "system");
		if (!system) {
			system = { role: "system", content: "" };
			messages.unshift(system);
		}

		const prompt =
			instruction(opt?.strategy) +
			(opt?.strategy === "ts"
				? ts.printNode(ts.zodToTs(schema).node)
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
