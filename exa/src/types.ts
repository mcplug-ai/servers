import { z } from 'zod';

// Exa API Types
export interface ExaSearchRequest {
	query: string;
	type: string;
	category?: string;
	numResults: number;
	contents: {
		text:
			| {
					maxCharacters?: number;
			  }
			| boolean;
		livecrawl?: 'always' | 'fallback';
	};
}

// Tool Types
export interface SearchArgs {
	query: string;
	numResults?: number;
	livecrawl?: 'always' | 'fallback';
}

const exaSearchResultSchema = z.object({
	id: z.string(),
	title: z.string(),
	url: z.string(),
	publishedDate: z.string(),
	author: z.string(),
	text: z.string(),
	image: z.string().optional(),
	favicon: z.string().optional(),
	score: z.number().optional(),
});

export const exaSearchResponseSchema = z.object({
	requestId: z.string(),
	autopromptString: z.string(),
	resolvedSearchType: z.string(),
	results: z.array(exaSearchResultSchema),
});

export type ExaSearchResult = z.infer<typeof exaSearchResultSchema>;
export type ExaSearchResponse = z.infer<typeof exaSearchResponseSchema>;
