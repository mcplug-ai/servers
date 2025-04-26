import { z } from "zod";
import { tool } from "@mcplug/server";
import { ExaSearchRequest, ExaSearchResponse, exaSearchResponseSchema } from "./types";
import { API_CONFIG } from "./config";

export const linkedin_search_tool = tool(
  "Search LinkedIn for companies using Exa AI. Simply include company URL, or company name, with 'company page' appended in your query."
)
  .input(
    z.object({
      query: z.string().describe("Search query for LinkedIn (e.g., <url> company page OR <company name> company page)"),
      numResults: z.number().optional().describe("Number of search results to return (default: 5)"),
      _EXA_API_KEY: z.string().describe("Exa API key")
    })
  )
  .output(exaSearchResponseSchema)
  .handle(async ({ input, error }) => {
    const { query, numResults, _EXA_API_KEY } = input;

    try {
      // Create search request
      const searchRequest: ExaSearchRequest = {
        query,
        type: "auto",
        includeDomains: ["linkedin.com"],
        numResults: numResults || API_CONFIG.DEFAULT_NUM_RESULTS,
        contents: {
          text: {
            maxCharacters: API_CONFIG.DEFAULT_MAX_CHARACTERS
          },
          livecrawl: "always"
        }
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-api-key": _EXA_API_KEY
        },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        return error(`HTTP error! Status: ${response.status}`);
      }

      const data = (await response.json()) as ExaSearchResponse;

      if (!data || !data.results) {
        return "No LinkedIn results found. Please try a different query.";
      }

      return data;
    } catch (err) {
      return error(`LinkedIn search error: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
