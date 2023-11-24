import type { ZodIssue } from "zod";

export type PromiseOr<T> = T | Promise<T>;

export type LLMQuery = (
	messages: {
		role: "system" | "user" | "assistant";
		content: string;
	}[],
) => PromiseOr<string>;

export type AidInput = string;

/**
 * Options for an custom Aid Task.
 */
export interface AidTaskOptions<Out> {
	/**
	 * The few-shot prompt examples.
	 */
	examples?: [AidInput, Out][];

	/**
	 * The output schema strategy.
	 * @default "json-schema"
	 */
	strategy?: "ts" | "json-schema";

	/**
	 * Whether to check the output against the schema.
	 * @default false
	 */
	check?: boolean;

	/**
	 * The default input (last user message) if no input is provided.
	 */
	default?: AidInput;
}

export type AidTaskRunner<Out> = (input?: AidInput) => Promise<{ result: Out; errors: ZodIssue[] }>;

export type MessageRole = "system" | "user" | "assistant";

export type Message<R extends MessageRole = MessageRole> = { role: R; content: string };
