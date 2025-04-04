Adapted from https://github.com/kimtaeyoon83/mcp-server-youtube-transcript

# YouTube Transcript Tool

A Cloudflare worker that extracts transcripts from YouTube videos using the MCPlug server SDK.

## Features

- Extract transcripts from YouTube videos using video URLs or IDs
- Support for multiple languages (defaults to English)
- Returns formatted transcript text and metadata

## Usage

Send a request with:

- `url`: YouTube video URL or ID
- `lang`: Language code (optional, defaults to 'en')

## Development

1. Install dependencies: `npm install` or `pnpm install`
2. Start development server: `npm run dev` or `pnpm dev`
3. Deploy: `npm run deploy` or `pnpm deploy`
