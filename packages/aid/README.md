# Aid: TypeScript Library for Typed LLM Interactions

A.I. :D

**Aid** is a TypeScript library designed for developers working with Large Language Models (LLMs) such as OpenAI's GPT-4 and GPT-3.5. The library focuses on ensuring **consistent, typed outputs** from LLM queries, enhancing the reliability and usability of LLM responses in TypeScript projects. Advanced users can leverage few-shot examples for more sophisticated use cases. It provides a structured and type-safe way to interact with LLMs (may requires upstream support for JSON model output).

## Features

- **Type Safety**: Utilizes TypeScript and JSON Schema to ensure that the outputs from LLMs are consistent with defined types.
- **Custom Task Creation**: Define custom tasks with specific input and output types.
- **Few-Shot Learning Support**: Allows for the provision of few-shot prompt examples to guide the LLM in producing the desired output.
- **Flexible Schema Definition**: Supports both TypeScript and JSON schema for defining the output structure of LLM responses.
- **OpenAI Integration**: Integrates with OpenAI's official library to provide a seamless experience.
- **Customizable**: Allows for customization LLM models, just implement the `LLMQuery` function.

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

### Executing a Task

Execute the task and handle the output:

```ts
const { result } = await analyze("Your input here, e.g. a news article");
console.log(result); // { summary: "...", keywords: ["...", "..."] }
```

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

## Contributing

Contributions are welcome! Please submit pull requests with any bug fixes or feature enhancements.
