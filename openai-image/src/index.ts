import { tool } from "@mcplug/server";
import OpenAI from "openai";
import { z } from "zod";

export default {
  tools: {
    "generate-image": tool("Use this tool to generate an image")
      .input(
        z.object({
          _OPENAI_API_KEY: z.string(),
          prompt: z.string(),
          format: z
            .enum(["portrait", "square", "landscape"])
            .optional()
            .default("square")
            .describe("The format of the image, default is square, default is square"),
          quality: z
            .enum(["low", "high", "medium"])
            .optional()
            .default("low")
            .describe("The quality of the image. Prefer low unless the user asks for high quality")
        })
      )
      .output(
        z.object({
          type: z.literal("image"),
          mimeType: z.literal("image/png"),
          data: z.string()
        })
      )
      .handle(async ({ input, error, blob }) => {
        const client = new OpenAI({
          apiKey: input._OPENAI_API_KEY
        });

        const formatToSize = {
          portrait: "1024x1536",
          square: "1024x1024",
          landscape: "1536x1024"
        } as const;

        const img = await client.images.generate({
          model: "gpt-image-1",
          prompt: input.prompt,
          output_format: "png",
          n: 1,
          size: formatToSize[input.format],
          quality: input.quality
        });

        if (!img.data?.[0]?.b64_json) {
          return error("Failed to generate image");
        }
        const blobResponse = await blob(img.data[0].b64_json, "image/png");

        return blobResponse;
      })
  }
};
