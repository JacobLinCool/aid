import debug from "debug";
import type { OpenAI } from "openai";
import type { z } from "zod";
import { DefaultJSON, VisionJSON } from "./format/json";
import { post_process } from "./post-process";
import { OpenAIQuery } from "./query/openai";
import { ChatTask } from "./task/chat";
import { VisionChatTask } from "./task/vision-chat";
import type {
	AidTaskOptions,
	AidTaskRunner,
	BaseChatMessage,
	BaseChatParam,
	FormatEngine,
	QueryEngine,
	TaskBuilder,
	VisionChatParam,
} from "./types";

const log = debug("aid");

export class Aid<TaskGoal, CaseParam, FormatPayload, QueryPayload> {
	protected qe: QueryEngine<QueryPayload>;
	protected fe: FormatEngine<FormatPayload, QueryPayload>;
	protected tb: TaskBuilder<TaskGoal, CaseParam, FormatPayload>;

	constructor(
		qe: QueryEngine<QueryPayload>,
		fe: FormatEngine<FormatPayload, QueryPayload>,
		tb: TaskBuilder<TaskGoal, CaseParam, FormatPayload>,
	) {
		this.qe = qe;
		this.fe = fe;
		this.tb = tb;
	}

	task<Out>(
		goal: TaskGoal,
		expected: z.ZodType<Out>,
		opt?: AidTaskOptions<CaseParam, Out>,
	): AidTaskRunner<CaseParam, Out> {
		return async (input = opt?.default) => {
			const fp = await this.tb(goal, input, opt?.examples ?? []);
			log("fp", fp);

			const qp = await this.fe(fp, expected);
			log("qp", qp);

			const output = await this.qe(qp);
			log("output", output);

			const post = post_process(output);
			log("post-processed", post);

			const json = JSON.parse(post);

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
	): Aid<string, BaseChatParam, BaseChatMessage[], BaseChatMessage[]> {
		const qe = OpenAIQuery(openai, param);
		const fe = DefaultJSON({ strategy: "json-schema" });
		const tb = ChatTask();
		return new Aid(qe, fe, tb);
	}

	static chat(
		qe: QueryEngine<BaseChatMessage[]>,
		{
			tb = ChatTask(),
			fe = DefaultJSON({ strategy: "json-schema" }),
		}: {
			tb?: TaskBuilder<string, BaseChatParam, BaseChatMessage[]>;
			fe?: FormatEngine<BaseChatMessage[], BaseChatMessage[]>;
		} = {},
	): Aid<string, BaseChatParam, BaseChatMessage[], BaseChatMessage[]> {
		return new Aid(qe, fe, tb);
	}

	static vision(
		qe: QueryEngine<OpenAI.Chat.ChatCompletionMessageParam[]>,
		{
			tb = VisionChatTask(),
			fe = VisionJSON({ strategy: "json-schema" }),
		}: {
			tb?: TaskBuilder<string, VisionChatParam, OpenAI.Chat.ChatCompletionMessageParam[]>;
			fe?: FormatEngine<
				OpenAI.Chat.ChatCompletionMessageParam[],
				OpenAI.Chat.ChatCompletionMessageParam[]
			>;
		} = {},
	): Aid<
		string,
		VisionChatParam,
		OpenAI.Chat.ChatCompletionMessageParam[],
		OpenAI.Chat.ChatCompletionMessageParam[]
	> {
		return new Aid(qe, fe, tb);
	}
}
