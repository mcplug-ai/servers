import { z } from "zod";
import { tool } from "@mcplug/server";
import { extractYoutubeId, getTranscript } from "./utils";

export const get_youtube_transcript = tool("Extract transcript from a YouTube video URL or ID")
  .input(
    z.object({
      url: z.string().describe("YouTube video URL or ID"),
      lang: z.string().default("en").describe("Language code for transcript (e.g., 'ko', 'en')")
    })
  )
  .output(
    z.object({
      transcript: z.string().describe("Transcript text"),
      metadata: z.object({
        videoId: z.string().describe("YouTube video ID"),
        language: z.string().describe("Language code for transcript"),
        timestamp: z.string().describe("Timestamp of transcript retrieval"),
        charCount: z.number().describe("Number of characters in transcript")
      })
    })
  )
  .handle(async ({ input, error }) => {
    const { url, lang } = input;

    if (!url || typeof url !== "string") {
      return error("URL parameter is required and must be a string");
    }

    try {
      const videoId = extractYoutubeId(url);
      const transcript = await getTranscript(videoId, lang);

      return {
        transcript,
        metadata: {
          videoId,
          language: lang,
          timestamp: new Date().toISOString(),
          charCount: transcript.length
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(`Failed to process transcript: ${errorMessage}`);
    }
  });
