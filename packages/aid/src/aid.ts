import debug from "debug";
import type { OpenAI } from "openai";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { printNode, zodToTs } from "zod-to-ts";
import type { AidInput, AidTaskOptions, AidTaskRunner, LLMQuery, Message } from "./types";

const log = debug("aid");

export class Aid {
	constructor(protected q: LLMQuery) {}

	task<Out>(
		goal: string,
		expected: z.ZodType<Out>,
		opt?: AidTaskOptions<Out>,
	): AidTaskRunner<Out> {
		const default_input: AidInput =
			opt?.default ?? "Follows the instruction and give me the disired output.";
		return async (input = default_input) => {
			const messages: Message[] = [
				{
					role: "system",
					content:
						goal +
						"\nResponse in JSON format:\n" +
						(opt?.strategy === "ts"
							? printNode(zodToTs(expected).node)
							: JSON.stringify(zodToJsonSchema(expected), null, 2)),
				},
			];

			if (opt?.examples) {
				for (const [input, output] of opt.examples) {
					messages.push({ role: "user", content: input });
					messages.push({ role: "assistant", content: JSON.stringify(output) });
				}
			}

			messages.push({ role: "user", content: input });

			log("messages", messages);
			const output = await this.q(messages);
			log("output", output);
			const json = JSON.parse(output);

			if (!opt?.check) {
				return { result: json, errors: [] };
			}

			const result = expected.safeParse(json);
			if (result.success) {
				return { result: json, errors: [] };
			} else {
				return { result: json, errors: result.error.issues };
			}
		};
	}

	static from(
		openai: OpenAI,
		param: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, "messages">,
	): Aid {
		const q: LLMQuery = async (
			messages: { role: "system" | "user" | "assistant"; content: string }[],
		) => {
			const payload: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
				temperature: 0,
				...param,
				messages,
				response_format: { type: "json_object" },
			};

			const res = await openai.chat.completions.create(payload);
			log({ fingerprint: res.system_fingerprint, usage: res.usage });

			const text = res.choices[0].message.content;
			if (!text) {
				throw new Error("No text returned from OpenAI");
			}

			return text;
		};
		return new Aid(q);
	}
}
