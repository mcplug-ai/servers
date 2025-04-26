import { z } from "zod";
import { tool } from "@mcplug/server";
import { API_CONFIG } from "./config";
import { ExaSearchRequest, exaSearchResponseSchema } from "./types";

export const competitor_finder = tool(
  "Find competitors of a company using Exa AI - performs targeted searches to identify businesses that offer similar products or services. Describe what the company does (without mentioning its name) and optionally provide the company's website to exclude it from results."
)
  .input(
    z.object({
      query: z
        .string()
        .describe(
          "Describe what the company/product in a few words (e.g., 'web search API', 'AI image generation', 'cloud storage service'). Keep it simple. Do not include the company name."
        ),
      excludeDomain: z
        .string()
        .optional()
        .describe("Optional: The company's website to exclude from results (e.g., 'exa.ai')"),
      numResults: z.number().optional().describe("Number of competitors to return (default: 10)"),
      _EXA_API_KEY: z.string().describe("Exa API key")
    })
  )
  .output(exaSearchResponseSchema)
  .handle(async ({ input, error }) => {
    const { query, excludeDomain, numResults, _EXA_API_KEY } = input;

    try {
      const searchRequest: ExaSearchRequest = {
        query,
        type: "auto",
        numResults: numResults || 10,
        contents: {
          text: {
            maxCharacters: API_CONFIG.DEFAULT_MAX_CHARACTERS
          },
          livecrawl: "always"
        }
      };

      // Add exclude domain if provided
      if (excludeDomain) {
        searchRequest.excludeDomains = [excludeDomain];
      }

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

      const data = await response.json();

      if (!data || !data.results) {
        return "No competitors found. Please try a different query.";
      }

      return data;
    } catch (err) {
      return error(`Competitor finder error: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
