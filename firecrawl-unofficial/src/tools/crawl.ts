import { tool } from "@mcplug/server";
import { crawlInputSchema, crawlOutputSchema } from "../types";
import { createFirecrawlClient, updateCreditUsage, withRetry } from "../utils";
import { hasCredits } from "../config";

export const firecrawl_crawl = tool(
  "Start an asynchronous crawl of multiple pages from a starting URL. " +
    "Supports depth control, path filtering, and webhook notifications."
)
  .input(crawlInputSchema)
  .output(crawlOutputSchema)
  .handle(async ({ input, error }) => {
    const { url, _FIRECRAWL_API_KEY, ...options } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const response = await withRetry(
        async () =>
          // @ts-expect-error Extended API options including origin
          client.asyncCrawlUrl(url, { ...options, origin: "mcp-server" }),
        "crawl operation"
      );

      if (!response.success) {
        return error(response.error);
      }

      // Track credits if available
      if (hasCredits(response)) {
        // Update credit usage (no need to store the result in this case)
        updateCreditUsage(response.creditsUsed);
      }

      return {
        id: response.id,
        message: `Started crawl for ${url} with job ID: ${response.id}`
      };
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  });
