import type { OpenAI } from "openai";
import type { TaskBuilder, VisionChatParam } from "../types";

export const VisionChatTask = (): TaskBuilder<
	string,
	VisionChatParam,
	OpenAI.Chat.ChatCompletionMessageParam[]
> => {
	return async (goal, input, examples) => {
		if (typeof input === "string") {
			input = { text: input };
		}

		const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: goal,
			},
		];

		for (let [input, output] of examples) {
			if (typeof input === "string") {
				input = { text: input };
			}
			const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
			if (input.text) {
				content.push({ type: "text", text: input.text });
			} else if (input.images) {
				for (let image of input.images) {
					content.push({ type: "image_url", image_url: image });
				}
			}
			if (content.length === 0) {
				continue;
			}

			messages.push({ role: "user", content });
			messages.push({ role: "assistant", content: JSON.stringify(output) });
		}

		if (input) {
			const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
			if (input.text) {
				content.push({ type: "text", text: input.text });
			} else if (input.images) {
				for (let image of input.images) {
					content.push({ type: "image_url", image_url: image });
				}
			}
			messages.push({ role: "user", content });
		} else {
			messages.push({
				role: "user",
				content: "Follow the instruction and give me the desired output.",
			});
		}

		return messages;
	};
};
