import { tool } from "@mcplug/server";
import { deepResearchInputSchema, deepResearchOutputSchema } from "../types";
import { createFirecrawlClient } from "../utils";
import { safeLog } from "../utils";

export const firecrawl_deep_research = tool(
  "Conduct deep research on a query using web crawling, search, and AI analysis."
)
  .input(deepResearchInputSchema)
  .output(deepResearchOutputSchema)
  .handle(async ({ input, error }) => {
    const { query, maxDepth, timeLimit, maxUrls, _FIRECRAWL_API_KEY } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const researchStartTime = Date.now();
      console.log(`Starting deep research for query: ${query}`);

      const response = await client.deepResearch(
        query,
        {
          maxDepth,
          timeLimit,
          maxUrls,
          // @ts-expect-error Extended API options including origin
          origin: "mcp-server"
        },
        // Activity callback
        (activity) => {
          safeLog("info", `Research activity: ${activity.message} (Depth: ${activity.depth})`);
        },
        // Source callback
        (source) => {
          safeLog("info", `Research source found: ${source.url}${source.title ? ` - ${source.title}` : ""}`);
        }
      );

      // Log performance metrics
      console.log(`Deep research completed in ${Date.now() - researchStartTime}ms`);

      if (!response.success) {
        return error(response.error || "Deep research failed");
      }

      // Format the results

      return response.data;
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  });
