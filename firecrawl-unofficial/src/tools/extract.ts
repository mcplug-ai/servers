import { tool } from "@mcplug/server";
import { extractInputSchema, extractOutputSchema, ExtractParams } from "../types";
import { createFirecrawlClient, updateCreditUsage, withRetry } from "../utils";
import { hasCredits } from "../config";

export const firecrawl_extract = tool(
  "Extract structured information from web pages using LLM. " + "Supports both cloud AI and self-hosted LLM extraction."
)
  .input(extractInputSchema)
  .output(extractOutputSchema)
  .handle(async ({ input, error }) => {
    const {
      urls,
      prompt,
      systemPrompt,
      schema,
      allowExternalLinks,
      enableWebSearch,
      includeSubdomains,
      _FIRECRAWL_API_KEY
    } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const extractStartTime = Date.now();
      console.log(`Starting extraction for URLs: ${urls.join(", ")}`);

      // Prepare extract params
      const extractParams: ExtractParams = {
        urls,
        ...(prompt !== undefined && { prompt }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(schema !== undefined && { schema }),
        ...(allowExternalLinks !== undefined && { allowExternalLinks }),
        ...(enableWebSearch !== undefined && { enableWebSearch }),
        ...(includeSubdomains !== undefined && { includeSubdomains }),
        origin: "mcp-server"
      };

      const response = await withRetry(async () => client.extract(urls, extractParams), "extract operation");

      // Type guard for successful response
      if (!("success" in response) || !response.success) {
        return error(response.error || "Extraction failed");
      }

      // Track credits if available
      if (hasCredits(response)) {
        updateCreditUsage(response.creditsUsed || 0);
      }

      // Log performance metrics
      console.log(`Extraction completed in ${Date.now() - extractStartTime}ms`);

      // Add warning to response if present
      if (response.warning) {
        console.warn(response.warning);
      }

      return JSON.stringify(response.data, null, 2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Special handling for self-hosted instance errors
      if (errorMessage.toLowerCase().includes("not supported")) {
        console.error("Extraction is not supported by this instance");
        return error("Extraction is not supported by this instance. Please ensure LLM support is configured.");
      }

      return error(errorMessage);
    }
  });
