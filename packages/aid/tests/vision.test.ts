import debug from "debug";
import fs from "node:fs";
import { OpenAI } from "openai";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Aid, OpenAIQuery } from "../src";

debug.enable("aid*");

describe("Vision", () => {
	it(
		"Vision Task",
		async (c) => {
			const api_key = process.env.OPENAI_API_KEY;
			if (!api_key) {
				c.skip();
				return;
			}

			const openai = new OpenAI({ apiKey: api_key });
			const aid = Aid.vision(
				OpenAIQuery(openai, { model: "gpt-4-vision-preview", max_tokens: 2048 }),
			);

			const analyze = aid.task(
				"Analyze the person in the image",
				z.object({
					gender: z.enum(["boy", "girl", "other"]),
					age: z.enum(["child", "teen", "adult", "elderly"]),
					emotion: z.enum(["happy", "sad", "angry", "surprised", "neutral"]),
					clothing: z.string().max(100),
					background: z.string().max(100),
				}),
			);

			const datauri = `data:image/png;base64,${fs.readFileSync(
				"packages/aid/tests/fixtures/dall-e.png",
				"base64",
			)}`;

			const { result } = await analyze({ images: [{ url: datauri }] });
			expect(typeof result).toBe("object");
			// expect(result).toMatchSnapshot();
		},
		{ timeout: 60_000 },
	);
});
