import { tool } from "@mcplug/server";
import { z } from "zod";
import { searchLibraries } from "./lib/api";
import { formatSearchResults } from "./lib/utils";

export const resolve_library_id = tool(
  "Required first step: Resolves a general package name into a Context7-compatible library ID. Must be called before using 'get-library-docs'"
)
  .input(
    z.object({
      libraryName: z.string().describe("Library name to search for and retrieve a Context7-compatible library ID.")
    })
  )
  .output(z.string().describe("A formatted list of available libraries and their Context7-compatible library IDs"))
  .handle(async ({ input, error }) => {
    const searchResponse = await searchLibraries(input.libraryName);

    if (!searchResponse || !searchResponse.results) {
      return error("Failed to retrieve library documentation data from Context7");
    }

    if (searchResponse.results.length === 0) {
      return error("No documentation libraries available");
    }

    const resultsText = formatSearchResults(searchResponse);
    return `Available libraries and their Context7-compatible library IDs:\n\n${resultsText}`;
  });
