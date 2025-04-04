import { createHandler } from '@mcplug/server/cloudflare';
import { env } from 'cloudflare:workers';
import { get_transcript } from './youtubeTranscript';

export default createHandler({
	secret: env.MCP_SECRET,
	versions: {
		'1.0.0': {
			tools: {
				get_transcript,
			},
		},
	},
});
