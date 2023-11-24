import type { OpenAI } from "openai";
import type { ZodIssue, ZodSchema } from "zod";

export type PromiseOr<T> = T | Promise<T>;

export type QueryEngine<QueryPayload> = (payload: QueryPayload) => PromiseOr<string>;

export type FormatEngine<TaskPayload, QueryPayload> = (
	payload: TaskPayload,
	schema: ZodSchema,
) => PromiseOr<QueryPayload>;

export type TaskBuilder<TaskGoal, CaseParam, TaskPayload> = (
	goal: TaskGoal,
	param: CaseParam | undefined,
	examples: [CaseParam, unknown][],
) => PromiseOr<TaskPayload>;

export type BaseChatParam =
	| string
	| {
			text: string;
	  };

export type VisionChatParam =
	| string
	| {
			text?: string;
			images?: OpenAI.Chat.ChatCompletionContentPartImage.ImageURL[];
	  };

/**
 * Options for a custom Aid Task.
 */
export interface AidTaskOptions<In, Out> {
	/**
	 * The few-shot prompt examples.
	 */
	examples?: [In, Out][];

	/**
	 * Whether to check the output against the schema.
	 * @default false
	 */
	check?: boolean;

	/**
	 * The default input (last user message) if no input is provided.
	 */
	default?: In;
}

export type AidTaskRunner<In, Out> = (input?: In) => Promise<{ result: Out; errors: ZodIssue[] }>;

export type BaseChatMessageRole = "system" | "user" | "assistant";

export type BaseChatMessage<R extends BaseChatMessageRole = BaseChatMessageRole> = {
	role: R;
	content: string;
};
