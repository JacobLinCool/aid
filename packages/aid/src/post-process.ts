// post process the output from the large language model, and make it parseable by the JSON parser
export function post_process(llm_output: string): string {
	llm_output = llm_output.trim();

	// remove possible markdown code fence at the beginning and end
	llm_output = llm_output.replace(/^```.*\n/m, "").replace(/```\n?$/m, "");

	return llm_output;
}
