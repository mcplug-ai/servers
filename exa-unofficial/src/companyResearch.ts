import { z } from "zod";
import { tool } from "@mcplug/server";
import { API_CONFIG } from "./config";
import { ExaSearchRequest, exaSearchResponseSchema } from "./types";

export const company_research = tool(
  "Research companies using Exa AI - performs targeted searches of company websites to gather comprehensive information about businesses. Returns detailed information from company websites including about pages, pricing, FAQs, blogs, and other relevant content. Specify the company URL and optionally target specific sections of their website."
)
  .input(
    z.object({
      query: z.string().describe("Company website URL (e.g., 'exa.ai' or 'https://exa.ai')"),
      subpages: z.number().optional().describe("Number of subpages to crawl (default: 10)"),
      subpageTarget: z
        .array(z.string())
        .optional()
        .describe(
          "Specific sections to target (e.g., ['about', 'pricing', 'faq', 'blog']). If not provided, will crawl the most relevant pages."
        ),
      _EXA_API_KEY: z.string().describe("Exa API key")
    })
  )
  .output(exaSearchResponseSchema)
  .handle(async ({ input, error }) => {
    const { query, subpages, subpageTarget, _EXA_API_KEY } = input;

    try {
      // Extract domain from query if it's a URL
      let domain = query;
      if (query.includes("http")) {
        try {
          const url = new URL(query);
          domain = url.hostname.replace("www.", "");
        } catch (e) {
          console.log(`Warning: Could not parse URL from query: ${query}`);
        }
      }

      const searchRequest: ExaSearchRequest = {
        query,
        category: "company",
        includeDomains: [query],
        type: "auto",
        numResults: 1,
        contents: {
          text: {
            maxCharacters: API_CONFIG.DEFAULT_MAX_CHARACTERS
          },
          livecrawl: "always",
          subpages: subpages || 10
        }
      };

      // Add subpage targets if provided
      if (subpageTarget && subpageTarget.length > 0) {
        searchRequest.contents.subpageTarget = subpageTarget;
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
        return "No company information found. Please try a different query.";
      }

      return data;
    } catch (err) {
      return error(`Company research error: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
