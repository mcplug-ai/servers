import { z } from "zod";
import { tool } from "@mcplug/server";
import { API_CONFIG } from "./config";
import { exaSearchResponseSchema } from "./types";

export const twitter_search = tool(
  "Search Twitter/X.com posts and accounts using Exa AI - performs targeted searches of Twitter (X.com) content including tweets, profiles, and discussions. Returns relevant tweets, profile information, and conversation threads based on your query. You can search for a user by x.com/username or from:username"
)
  .input(
    z.object({
      query: z.string().describe("Twitter username, hashtag, or search term (e.g., 'x.com/username' or search term)"),
      numResults: z.number().optional().describe("Number of Twitter results to return (default: 5)"),
      startPublishedDate: z
        .string()
        .optional()
        .describe(
          "Optional ISO date string (e.g., '2023-04-01T00:00:00.000Z') to filter tweets published after this date. Use only when necessary."
        ),
      endPublishedDate: z
        .string()
        .optional()
        .describe(
          "Optional ISO date string (e.g., '2023-04-30T23:59:59.999Z') to filter tweets published before this date. Use only when necessary."
        ),
      _EXA_API_KEY: z.string().describe("Exa API key")
    })
  )
  .output(exaSearchResponseSchema)
  .handle(async ({ input, error }) => {
    const { query, numResults, startPublishedDate, endPublishedDate, _EXA_API_KEY } = input;

    try {
      const searchRequest: {
        query: string;
        includeDomains: string[];
        type: string;
        numResults: number;
        startPublishedDate?: string;
        endPublishedDate?: string;
        contents: {
          text: {
            maxCharacters: number;
          };
          livecrawl: string;
        };
      } = {
        query,
        includeDomains: ["x.com", "twitter.com"],
        type: "auto",
        numResults: numResults || API_CONFIG.DEFAULT_NUM_RESULTS,
        contents: {
          text: {
            maxCharacters: API_CONFIG.DEFAULT_MAX_CHARACTERS
          },
          livecrawl: "always"
        }
      };

      // Add date filters only if they're provided
      if (startPublishedDate) {
        searchRequest.startPublishedDate = startPublishedDate;
      }

      if (endPublishedDate) {
        searchRequest.endPublishedDate = endPublishedDate;
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
        return "No Twitter results found. Please try a different query.";
      }

      return data;
    } catch (err) {
      return error(`Twitter search error: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
