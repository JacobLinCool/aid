# Aid: TypeScript Library for Typed LLM Interactions

A.I. :D

**Aid** is a TypeScript library designed for developers working with Large Language Models (LLMs) such as OpenAI's GPT-4 (including Vision) and GPT-3.5. The library focuses on ensuring **consistent, typed outputs** from LLM queries, enhancing the reliability and usability of LLM responses. Advanced users can leverage few-shot examples for more sophisticated use cases. It provides a structured and type-safe way to interact with LLMs.

## Features

- **Typed Response**: Aid leverages TypeScript and JSON Schema to ensure consistent, reliable outputs from LLMs, adheres to the predefined schema.
- **Task Based**: Easily define custom tasks with specific input and output types, streamlining the process of LLM interactions.
- **Few-Shot Learning Support**: Allows for the provision of few-shot prompt examples to guide the LLM in producing the desired output.
- **Visual Task Support**: Includes support for visual tasks with image inputs, harnessing the power of OpenAI's GPT-4 Vision. [Example](https://github.com/JacobLinCool/aid/blob/main/packages/aid/tests/vision.test.ts)
- **OpenAI Integration**: Integrates with OpenAI's official library to provide a seamless experience.
- **Customizable**: Allows for customization LLM models, just implement the `QueryEngine` function. [Example](https://github.com/JacobLinCool/aid/blob/main/packages/aid/tests/cohere.test.ts)

## Installation

```sh
pnpm install @ai-d/aid
```

## Usage

### Basic Setup

First, import the necessary modules and set up your OpenAI instance:

```ts
import { OpenAI } from "openai";
import { Aid } from "@ai-d/aid";

const openai = new OpenAI({ apiKey: "your-api-key" });
const aid = Aid.from(openai, { model: "gpt-4-1106-preview" });
```

<details>
<summary>Using GPT-4 Vision</summary>

```ts
import { OpenAI } from "openai";
import { Aid, OpenAIQuery } from "@ai-d/aid";

const openai = new OpenAI({ apiKey: "your-api-key" });
const aid = Aid.vision(
    OpenAIQuery(openai, { model: "gpt-4-vision-preview", max_tokens: 2048 }),
);
```

</details>

<details>
<summary>Using Other LLM</summary>

For example, [Cohere](https://cohere.ai/)'s Command.

```ts
import { Aid, CohereQuery } from "@ai-d/aid";

const aid = Aid.chat(
    CohereQuery(COHERE_TOKEN, { model: "command" }),
);
```

> You can implement your own `QueryEngine` function.

</details>

### Creating a Custom Task

Define a custom task with expected output types:

```ts
import { z } from "zod";

const analyze = aid.task(
    "Summarize and extract keywords",
    z.object({
        summary: z.string().max(300),
        keywords: z.array(z.string().max(30)).max(10),
    }),
);
```

<details>
<summary>Visual Task Example</summary>

```ts
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
```

</details>

### Executing a Task

Execute the task and handle the output:

```ts
const { result } = await analyze("Your input here, e.g. a news article");
console.log(result); // { summary: "...", keywords: ["...", "..."] }
```


<details>
<summary>Visual Task Example</summary>

```ts
const datauri = `data:image/png;base64,${fs.readFileSync("path/to/image.png" "base64")}`;

const { result } = await analyze({ images: [{ url: datauri }] });
console.log(result); // { "gender": "boy", "age": "teen", ... }
```

</details>

### Advanced Usage with Few-Shot Examples

For more complex scenarios, you can use few-shot examples:

```ts
const run_advanced_task = aid.task(
    "Some Advanced Task",
    z.object({
        // Define your output schema here
    }),
    {
        examples: [
            // Provide few-shot examples here
        ],
    }
);
```

## Formulation

Case Parameter -> (join) Task Defination -> (join) Format Constraint -> (perform) Query

`Query` and `Format Constraint` are defined and implemented by the `QueryEngine` and `FormatEngine`.

`Task Defination` is defined by the user with `task` method. Task Goal, Expected Schema, Examples, etc.

`Case Parameter` is defined by the user on each single call. Text, Image, etc.

## Contributing

Contributions are welcome! Please submit pull requests with any bug fixes or feature enhancements.
