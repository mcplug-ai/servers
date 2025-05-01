import { tool } from "@mcplug/server";
import { z } from "zod";
import { fetchLibraryDocumentation } from "./lib/api";

const DEFAULT_MINIMUM_TOKENS = 5000;

export const get_library_docs = tool(
  "Fetches up-to-date documentation for a library. You must call 'resolve-library-id' first to obtain the exact Context7-compatible library ID."
)
  .input(
    z.object({
      context7CompatibleLibraryID: z
        .string()
        .describe(
          "Exact Context7-compatible library ID (e.g., 'mongodb/docs', 'vercel/nextjs') retrieved from 'resolve-library-id'."
        ),
      topic: z.string().optional().describe("Topic to focus documentation on (e.g., 'hooks', 'routing')."),
      tokens: z
        .preprocess((val) => (typeof val === "string" ? Number(val) : val), z.number())
        .transform((val) => (val < DEFAULT_MINIMUM_TOKENS ? DEFAULT_MINIMUM_TOKENS : val))
        .optional()
        .describe(`Maximum number of tokens of documentation to retrieve (default: ${DEFAULT_MINIMUM_TOKENS}).`)
    })
  )
  .output(z.string().describe("The documentation content for the specified library"))
  .handle(async ({ input, error }) => {
    const { context7CompatibleLibraryID, tokens = DEFAULT_MINIMUM_TOKENS, topic = "" } = input;

    console.log("context7CompatibleLibraryID", context7CompatibleLibraryID);
    // Extract folders parameter if present in the ID
    let folders = "";
    let libraryId = context7CompatibleLibraryID;

    if (context7CompatibleLibraryID.includes("?folders=")) {
      const [id, foldersParam] = context7CompatibleLibraryID.split("?folders=");
      libraryId = id;
      folders = foldersParam;
    }

    const documentationText = await fetchLibraryDocumentation(libraryId, {
      tokens,
      topic,
      folders
    });

    if (!documentationText) {
      return error(
        "Documentation not found or not finalized for this library. Make sure you're using a valid Context7-compatible library ID from 'resolve-library-id'."
      );
    }

    return documentationText;
  });
