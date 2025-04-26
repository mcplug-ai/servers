import { tool } from "@mcplug/server";
import { generateLLMsTextInputSchema, generateLLMsTextOutputSchema } from "../types";
import { createFirecrawlClient, withRetry } from "../utils";

export const firecrawl_generate_llmstxt = tool(
  "Generate standardized LLMs.txt file for a given URL, which provides context about how LLMs should interact with the website."
)
  .input(generateLLMsTextInputSchema)
  .output(generateLLMsTextOutputSchema)
  .handle(async ({ input, error }) => {
    const { url, maxUrls, showFullText, _FIRECRAWL_API_KEY } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const generateStartTime = Date.now();
      console.log(`Starting LLMs.txt generation for URL: ${url}`);

      // Start the generation process
      const response = await withRetry(
        async () =>
          // @ts-expect-error Extended API options including origin
          client.generateLLMsText(url, { maxUrls, showFullText, origin: "mcp-server" }),
        "LLMs.txt generation"
      );

      if (!response.success) {
        return error(response.error || "LLMs.txt generation failed");
      }

      // Log performance metrics
      console.log(`LLMs.txt generation completed in ${Date.now() - generateStartTime}ms`);

      // Format the response
      let resultText = "";

      if ("data" in response) {
        resultText = `LLMs.txt content:\n\n${response.data.llmstxt}`;

        if (showFullText && response.data.llmsfulltxt) {
          resultText += `\n\nLLMs-full.txt content:\n\n${response.data.llmsfulltxt}`;
        }
      }

      return resultText;
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  });
