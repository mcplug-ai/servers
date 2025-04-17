import { z } from 'zod';
import { ExaSearchRequest, ExaSearchResponse, exaSearchResponseSchema } from './types';
import { tool } from '@mcplug/server';
import { API_CONFIG } from './config';

// Register the web search tool
export const web_search_tool = tool(
	'Search the web using Exa AI - performs real-time web searches and can scrape content from specific URLs. Supports configurable result counts and returns the content from the most relevant websites.'
)
	.input(
		z.object({
			query: z.string().describe('Search query'),
			numResults: z.number().optional().describe('Number of search results to return (default: 5)'),
			_EXA_API_KEY: z.string().describe('Exa API key'),
		})
	)
	.output(exaSearchResponseSchema)
	.handle(async ({ input, error: e }) => {
		const { query, numResults, _EXA_API_KEY } = input;
		try {
			const searchRequest: ExaSearchRequest = {
				query,
				type: 'auto',
				numResults: numResults || API_CONFIG.DEFAULT_NUM_RESULTS,
				contents: {
					text: {
						maxCharacters: API_CONFIG.DEFAULT_MAX_CHARACTERS,
					},
					livecrawl: 'always',
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
				return 'No search results found. Please try a different query.';
			}

			return data;
		} catch (error) {
			return e(`Web search error: ${error instanceof Error ? error.message : String(error)}`);
		}
	});
