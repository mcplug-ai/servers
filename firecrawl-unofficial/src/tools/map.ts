import { tool } from "@mcplug/server";
import { mapInputSchema, mapOutputSchema } from "../types";
import { createFirecrawlClient } from "../utils";

export const firecrawl_map = tool(
  "Discover URLs from a starting point. Can use both sitemap.xml and HTML link discovery."
)
  .input(mapInputSchema)
  .output(mapOutputSchema)
  .handle(async ({ input, error }) => {
    const { url, _FIRECRAWL_API_KEY, ...options } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const response = await client.mapUrl(url, {
        ...options,
        // @ts-expect-error Extended API options including origin
        origin: "mcp-server"
      });

      if ("error" in response) {
        return error(response.error);
      }

      if (!response.links) {
        return error("No links received from Firecrawl API");
      }

      return {
        links: response.links
      };
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  });
