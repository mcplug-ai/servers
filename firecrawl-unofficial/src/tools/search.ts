import { tool } from "@mcplug/server";
import { searchInputSchema, searchOutputSchema } from "../types";
import { createFirecrawlClient, updateCreditUsage, withRetry } from "../utils";
import { hasCredits } from "../config";

export const firecrawl_search = tool(
  "Search and retrieve content from web pages with optional scraping. " +
    "Returns SERP results by default (url, title, description) or full page content when scrapeOptions are provided."
)
  .input(searchInputSchema)
  .output(searchOutputSchema)
  .handle(async ({ input, error }) => {
    const { _FIRECRAWL_API_KEY, ...searchOptions } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const response = await withRetry(
        async () => client.search(searchOptions.query, { ...searchOptions, origin: "mcp-server" }),
        "search operation"
      );

      if (!response.success) {
        return error(`Search failed: ${response.error || "Unknown error"}`);
      }

      // Track credits if available
      if (hasCredits(response)) {
        updateCreditUsage(response.creditsUsed);
      }

      return response.data.map((result) => ({
        url: result.url,
        title: result.title,
        description: result.description,
        markdown: result.markdown || null
      }));
    } catch (err) {
      return error(err instanceof Error ? err.message : `Search failed: ${String(err)}`);
    }
  });
