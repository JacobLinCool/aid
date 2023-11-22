import debug from "debug";
import { OpenAI } from "openai";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Aid } from "../src";
import { ESSAY, WIKI_AI } from "./fixtures/articles";

debug.enable("aid");

describe("Aid", () => {
	it(
		"Type Constraints",
		async (c) => {
			const api_key = process.env.OPENAI_API_KEY;
			if (!api_key) {
				c.skip();
				return;
			}

			const openai = new OpenAI({ apiKey: api_key });
			const aid = Aid.from(openai, {
				model: "gpt-4-1106-preview",
				seed: 20030317,
			});

			const analyze = aid.task(
				"Summarize and extract keywords",
				z.object({
					summary: z.string().max(300),
					keywords: z.array(z.string().max(30)).max(10),
				}),
			);

			const { result } = await analyze(WIKI_AI);
			expect(typeof result).toBe("object");
			expect(typeof result.summary).toBe("string");
			expect(Array.isArray(result.keywords)).toBe(true);
			result.keywords.forEach((keyword) => expect(typeof keyword).toBe("string"));
			// expect(result).toMatchSnapshot();
		},
		{ timeout: 60_000 },
	);

	it(
		"Few-Shot Learning",
		async (c) => {
			const api_key = process.env.OPENAI_API_KEY;
			if (!api_key) {
				c.skip();
				return;
			}

			const openai = new OpenAI({ apiKey: api_key });
			const aid = Aid.from(openai, {
				model: "gpt-4-1106-preview",
				seed: 20030317,
			});

			// question source: https://www.gept.org.tw/2022/geptscoreremark/icomposition.pdf
			const grade = aid.task(
				`主題：一般來說，孩子表現良好時，父母常會給孩子獎勵。請寫一篇文章說明 (1) 你表現好的時候，你的父母通常會用哪些方法獎勵你？你覺得這些方法有效、適當嗎？ (2) 如果有一天你為人父母，你會用相同的獎勵方式嗎？` +
					`評分重點包括內容、組織、文法、用字遣詞、標點 符號、大小寫。`,
				z.object({
					grade: z.number().int().min(1).max(5),
					feedback: z.string().max(300),
				}),
				{
					examples: [
						[ESSAY[5][0], { grade: 5, feedback: ESSAY[5][1] }],
						[ESSAY[4][0], { grade: 4, feedback: ESSAY[4][1] }],
						[ESSAY[2][0], { grade: 2, feedback: ESSAY[2][1] }],
						[ESSAY[3][0], { grade: 3, feedback: ESSAY[3][1] }],
					],
				},
			);

			const { result: result1 } = await grade(
				`When I exhibited good behavior, my parents typically rewarded me with verbal praise and extra privileges, like additional playtime or a special meal. These methods were effective, making me feel appreciated and teaching the value of hard work. As a future parent, I plan to use similar strategies but with a modern twist. I might involve children in setting their own goals and rewards, fostering autonomy and understanding of their actions. Adapting these techniques to suit individual needs and changing times seems essential.`,
			);
			expect(typeof result1).toBe("object");
			expect(typeof result1.grade).toBe("number");
			expect(typeof result1.feedback).toBe("string");
			// expect(result1).toMatchSnapshot();

			const { result: result2 } = await grade(
				`When I was good, my parents gave rewards like saying 'good job' or letting me play more. I think it worked okay. If I'm a parent, I'll probably do the same but maybe let kids choose their rewards. It's important to change with the times.`,
			);
			expect(typeof result2).toBe("object");
			expect(typeof result2.grade).toBe("number");
			expect(typeof result2.feedback).toBe("string");
			// expect(result2).toMatchSnapshot();
		},
		{ timeout: 60_000 },
	);
});
