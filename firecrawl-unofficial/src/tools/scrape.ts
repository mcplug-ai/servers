import { tool } from "@mcplug/server";
import { trimResponseText } from "../config";
import { scrapeInputSchema, scrapeOutputSchema } from "../types";
import { createFirecrawlClient } from "../utils";

export const firecrawl_scrape = tool(
  "Scrape a single webpage with advanced options for content extraction. Supports various formats including markdown, HTML, and screenshots. Can execute custom actions like clicking or scrolling before scraping."
)
  .input(scrapeInputSchema)
  .output(scrapeOutputSchema)
  .handle(async ({ input, error }) => {
    const { url, _FIRECRAWL_API_KEY, ...options } = input;

    try {
      // Create client with the API key
      const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

      const scrapeStartTime = Date.now();
      console.log(`Starting scrape for URL: ${url} with options: ${JSON.stringify(options)}`);

      const response = await client.scrapeUrl(url, {
        ...options,
        // @ts-expect-error Extended API options including origin
        origin: "mcp-server"
      });

      // Log performance metrics
      console.log(`Scrape completed in ${Date.now() - scrapeStartTime}ms`);

      if ("success" in response && !response.success) {
        return error(response.error || "Scraping failed");
      }

      // Format content based on requested formats
      const contentParts = [];

      if (options.formats?.includes("markdown") && response.markdown) {
        contentParts.push(response.markdown);
      }
      if (options.formats?.includes("html") && response.html) {
        contentParts.push(response.html);
      }
      if (options.formats?.includes("rawHtml") && response.rawHtml) {
        contentParts.push(response.rawHtml);
      }
      if (options.formats?.includes("links") && response.links) {
        contentParts.push(response.links.join("\n"));
      }
      if (options.formats?.includes("screenshot") && response.screenshot) {
        contentParts.push(response.screenshot);
      }
      if (options.formats?.includes("extract") && response.extract) {
        contentParts.push(JSON.stringify(response.extract, null, 2));
      }

      // If options.formats is empty, default to markdown
      if (!options.formats || options.formats.length === 0) {
        options.formats = ["markdown"];
      }

      // Add warning to response if present
      if (response.warning) {
        console.warn(response.warning);
      }

      return contentParts.join("\n\n") || "No content available";
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  });
