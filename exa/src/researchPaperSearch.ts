import { z } from 'zod';
import { ExaSearchRequest, ExaSearchResponse, exaSearchResponseSchema } from './types';
import { tool } from '@mcplug/server';
import { API_CONFIG } from './config';

// Register the research paper search tool
export const research_paper_sexarch_tool = tool(
	'Search across 100M+ research papers with full text access using Exa AI - performs targeted academic paper searches with deep research content coverage. Returns detailed information about relevant academic papers including titles, authors, publication dates, and full text excerpts. Control the number of results and character counts returned to balance comprehensiveness with conciseness based on your task requirements.'
)
	.input(
		z.object({
			query: z.string().describe('Research topic or keyword to search for'),
			numResults: z.number().optional().describe('Number of research papers to return (default: 5)'),
			maxCharacters: z
				.number()
				.optional()
				.describe("Maximum number of characters to return for each result's text content (Default: 3000)"),
			_EXA_API_KEY: z.string().describe('Exa API key'),
		})
	)
	.output(exaSearchResponseSchema)
	.handle(async ({ input, error: e }) => {
		const { query, numResults, maxCharacters, _EXA_API_KEY } = input;
		try {
			const searchRequest: ExaSearchRequest = {
				query,
				category: 'research paper',
				type: 'auto',
				numResults: numResults || API_CONFIG.DEFAULT_NUM_RESULTS,
				contents: {
					text: {
						maxCharacters: maxCharacters || API_CONFIG.DEFAULT_MAX_CHARACTERS,
					},
					livecrawl: 'fallback',
				},
			};

			const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}`, {
				method: 'POST',
				headers: {
					accept: 'application/json',
					'content-type': 'application/json',
					'x-api-key': _EXA_API_KEY,
				},
				body: JSON.stringify(searchRequest),
			});

			if (!response.ok) {
				return e(`HTTP error! Status: ${response.status}`);
			}

			const data = (await response.json()) as ExaSearchResponse;

			if (!data || !data.results) {
				return 'No research papers found. Please try a different query.';
			}

			return data;
		} catch (error) {
			return e(`Research paper search error: ${error instanceof Error ? error.message : String(error)}`);
		}
	});
