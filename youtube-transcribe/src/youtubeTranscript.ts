import { z } from 'zod';
import { tool } from '@mcplug/server';
import { extractYoutubeId, getTranscript } from './utils';

export const get_transcript = tool('Extract transcript from a YouTube video URL or ID')
	.input(
		z.object({
			url: z.string().describe('YouTube video URL or ID'),
			lang: z.string().default('en').describe("Language code for transcript (e.g., 'ko', 'en')"),
		})
	)
	.handle(async ({ input, error }) => {
		const { url, lang } = input;

		if (!url || typeof url !== 'string') {
			return error('URL parameter is required and must be a string');
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
					charCount: transcript.length,
				},
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			return error(`Failed to process transcript: ${errorMessage}`);
		}
	});
