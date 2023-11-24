import type { BaseChatMessage, BaseChatParam, TaskBuilder } from "../types";

export const ChatTask = (): TaskBuilder<string, BaseChatParam, BaseChatMessage[]> => {
	return async (goal, input, examples) => {
		if (typeof input === "string") {
			input = { text: input };
		}

		const messages: BaseChatMessage[] = [
			{
				role: "system",
				content: goal,
			},
		];

		for (let [input, output] of examples) {
			if (typeof input === "string") {
				input = { text: input };
			}
			messages.push({ role: "user", content: input.text });
			messages.push({ role: "assistant", content: JSON.stringify(output) });
		}

		if (input) {
			messages.push({ role: "user", content: input.text });
		} else {
			messages.push({
				role: "user",
				content: "Follow the instruction and give me the desired output.",
			});
		}

		return messages;
	};
};
