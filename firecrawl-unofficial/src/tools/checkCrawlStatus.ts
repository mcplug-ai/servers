import { tool } from "@mcplug/server";
import { statusCheckInputSchema, checkCrawlStatusOutputSchema } from "../types";
import { createFirecrawlClient } from "../utils";
import { formatResults } from "../config";

export const firecrawl_check_crawl_status = tool("Check the status of a crawl job.")
  .input(statusCheckInputSchema)
  .output(checkCrawlStatusOutputSchema)
  .handle(async ({ input, error }) => {
    const { id, _FIRECRAWL_API_KEY } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const response = await client.checkCrawlStatus(id);
      if (!response.success) {
        return error(response.error);
      }

      const status = `Crawl Status:
Status: ${response.status}
Progress: ${response.completed}/${response.total}
Credits Used: ${response.creditsUsed}
Expires At: ${response.expiresAt}
${response.data.length > 0 ? "\nResults:\n" + formatResults(response.data) : ""}`;

      return status;
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  });
