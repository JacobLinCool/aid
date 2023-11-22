export type PromiseOr<T> = T | Promise<T>;

export type LLMQuery = (
	messages: {
		role: "system" | "user" | "assistant";
		content: string;
	}[],
) => PromiseOr<string>;

/**
 * Options for an custom Aid Task.
 */
export interface AidTaskOptions<In extends string, Out> {
	/**
	 * The few-shot prompt examples.
	 */
	examples?: [string, Out][];
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
}
