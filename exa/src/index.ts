import { createHandler } from '@mcplug/server/cloudflare';
import { env } from 'cloudflare:workers';
import { research_paper_sexarch_tool } from './researchPaperSearch';
import { web_search_tool } from './webSearch';

export default createHandler({
	secret: env.MCP_SECRET,
	versions: {
		'1.0.0': {
			tools: {
				research_paper_sexarch_tool,
				web_search_tool,
			},
		},
	},
});
