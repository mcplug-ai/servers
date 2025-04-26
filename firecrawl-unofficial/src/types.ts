import { z } from "zod";

// Shared types
export interface FirecrawlDocument {
  url?: string;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  screenshot?: string;
  links?: string[];
  extract?: any;
  metadata?: {
    title?: string;
    [key: string]: any;
  };
}

// Firecrawl scrape parameters
export interface ScrapeParams {
  url?: string;
  formats?: string[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
  timeout?: number;
  actions?: {
    type: string;
    selector?: string;
    milliseconds?: number;
    text?: string;
    key?: string;
    direction?: "up" | "down";
    script?: string;
    fullPage?: boolean;
  }[];
  extract?: {
    schema?: object;
    systemPrompt?: string;
    prompt?: string;
  };
  mobile?: boolean;
  skipTlsVerification?: boolean;
  removeBase64Images?: boolean;
  location?: {
    country?: string;
    languages?: string[];
  };
}

// Map parameters
export interface MapParams {
  url?: string;
  search?: string;
  ignoreSitemap?: boolean;
  sitemapOnly?: boolean;
  includeSubdomains?: boolean;
  limit?: number;
}

// Crawl parameters
export interface CrawlParams {
  url?: string;
  excludePaths?: string[];
  includePaths?: string[];
  maxDepth?: number;
  ignoreSitemap?: boolean;
  limit?: number;
  allowBackwardLinks?: boolean;
  allowExternalLinks?: boolean;
  webhook?:
    | string
    | {
        url: string;
        headers?: Record<string, string>;
      };
  deduplicateSimilarURLs?: boolean;
  ignoreQueryParameters?: boolean;
  scrapeOptions?: Omit<ScrapeParams, "url">;
}

// Batch scrape options
export interface BatchScrapeOptions {
  urls: string[];
  options?: Omit<ScrapeParams, "url">;
}

// Status check options
export interface StatusCheckOptions {
  id: string;
}

// Search options
export interface SearchOptions {
  query: string;
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string;
  filter?: string;
  location?: {
    country?: string;
    languages?: string[];
  };
  scrapeOptions?: {
    formats?: string[];
    onlyMainContent?: boolean;
    waitFor?: number;
    includeTags?: string[];
    excludeTags?: string[];
    timeout?: number;
  };
}

// Extract parameters
export interface ExtractParams<T = any> {
  urls: string[];
  prompt?: string;
  systemPrompt?: string;
  schema?: T | object;
  allowExternalLinks?: boolean;
  enableWebSearch?: boolean;
  includeSubdomains?: boolean;
  origin?: string;
}

// LLMs text parameters
export interface GenerateLLMsTextParams {
  url: string;
  maxUrls?: number;
  showFullText?: boolean;
  __experimental_stream?: boolean;
}

// Zod schemas for tool input validation
export const scrapeInputSchema = z.object({
  url: z.string().describe("The URL to scrape"),
  formats: z
    .array(z.enum(["markdown", "html", "rawHtml", "screenshot", "links", "screenshot@fullPage", "extract"]))
    .optional()
    .describe("Content formats to extract (default: ['markdown'])"),
  onlyMainContent: z
    .boolean()
    .optional()
    .describe("Extract only the main content, filtering out navigation, footers, etc."),
  includeTags: z.array(z.string()).optional().describe("HTML tags to specifically include in extraction"),
  excludeTags: z.array(z.string()).optional().describe("HTML tags to exclude from extraction"),
  waitFor: z.number().optional().describe("Time in milliseconds to wait for dynamic content to load"),
  timeout: z.number().optional().describe("Maximum time in milliseconds to wait for the page to load"),
  actions: z
    .array(
      z.object({
        type: z.enum(["wait", "click", "screenshot", "write", "press", "scroll", "scrape", "executeJavascript"]),
        selector: z.string().optional(),
        milliseconds: z.number().optional(),
        text: z.string().optional(),
        key: z.string().optional(),
        direction: z.enum(["up", "down"]).optional(),
        script: z.string().optional(),
        fullPage: z.boolean().optional()
      })
    )
    .optional()
    .describe("List of actions to perform before scraping"),
  extract: z
    .object({
      schema: z.any().optional(),
      systemPrompt: z.string().optional(),
      prompt: z.string().optional()
    })
    .optional()
    .describe("Configuration for structured data extraction"),
  mobile: z.boolean().optional().describe("Use mobile viewport"),
  skipTlsVerification: z.boolean().optional().describe("Skip TLS certificate verification"),
  removeBase64Images: z.boolean().optional().describe("Remove base64 encoded images from output"),
  location: z
    .object({
      country: z.string().optional(),
      languages: z.array(z.string()).optional()
    })
    .optional()
    .describe("Location settings for scraping"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const mapInputSchema = z.object({
  url: z.string().describe("Starting URL for URL discovery"),
  search: z.string().optional().describe("Optional search term to filter URLs"),
  ignoreSitemap: z.boolean().optional().describe("Skip sitemap.xml discovery and only use HTML links"),
  sitemapOnly: z.boolean().optional().describe("Only use sitemap.xml for discovery, ignore HTML links"),
  includeSubdomains: z.boolean().optional().describe("Include URLs from subdomains in results"),
  limit: z.number().optional().describe("Maximum number of URLs to return"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const crawlInputSchema = z.object({
  url: z.string().describe("Starting URL for the crawl"),
  excludePaths: z.array(z.string()).optional().describe("URL paths to exclude from crawling"),
  includePaths: z.array(z.string()).optional().describe("Only crawl these URL paths"),
  maxDepth: z.number().optional().describe("Maximum link depth to crawl"),
  ignoreSitemap: z.boolean().optional().describe("Skip sitemap.xml discovery"),
  limit: z.number().optional().describe("Maximum number of pages to crawl"),
  allowBackwardLinks: z.boolean().optional().describe("Allow crawling links that point to parent directories"),
  allowExternalLinks: z.boolean().optional().describe("Allow crawling links to external domains"),
  webhook: z
    .union([
      z.string(),
      z.object({
        url: z.string(),
        headers: z.record(z.string()).optional()
      })
    ])
    .optional()
    .describe("Webhook URL or config to notify when crawl is complete"),
  deduplicateSimilarURLs: z.boolean().optional().describe("Remove similar URLs during crawl"),
  ignoreQueryParameters: z.boolean().optional().describe("Ignore query parameters when comparing URLs"),
  scrapeOptions: z
    .object({
      formats: z
        .array(z.enum(["markdown", "html", "rawHtml", "screenshot", "links", "screenshot@fullPage", "extract"]))
        .optional(),
      onlyMainContent: z.boolean().optional(),
      includeTags: z.array(z.string()).optional(),
      excludeTags: z.array(z.string()).optional(),
      waitFor: z.number().optional()
    })
    .optional()
    .describe("Options for scraping each page"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const batchScrapeInputSchema = z.object({
  urls: z.array(z.string()).describe("List of URLs to scrape"),
  options: z
    .object({
      formats: z
        .array(z.enum(["markdown", "html", "rawHtml", "screenshot", "links", "screenshot@fullPage", "extract"]))
        .optional(),
      onlyMainContent: z.boolean().optional(),
      includeTags: z.array(z.string()).optional(),
      excludeTags: z.array(z.string()).optional(),
      waitFor: z.number().optional()
    })
    .optional()
    .describe("Options for scraping"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const statusCheckInputSchema = z.object({
  id: z.string().describe("Job ID to check"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const searchInputSchema = z.object({
  query: z.string().describe("Search query string"),
  limit: z.number().optional().describe("Maximum number of results to return (default: 5)"),
  lang: z.string().optional().describe("Language code for search results (default: en)"),
  country: z.string().optional().describe("Country code for search results (default: us)"),
  tbs: z.string().optional().describe("Time-based search filter"),
  filter: z.string().optional().describe("Search filter"),
  location: z
    .object({
      country: z.string().optional(),
      languages: z.array(z.string()).optional()
    })
    .optional()
    .describe("Location settings for search"),
  scrapeOptions: z
    .object({
      formats: z.array(z.enum(["markdown", "html", "rawHtml"])).optional(),
      onlyMainContent: z.boolean().optional(),
      waitFor: z.number().optional()
    })
    .optional()
    .describe("Options for scraping search results"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const extractInputSchema = z.object({
  urls: z.array(z.string()).describe("List of URLs to extract information from"),
  prompt: z.string().optional().describe("Prompt for the LLM extraction"),
  systemPrompt: z.string().optional().describe("System prompt for LLM extraction"),
  schema: z.any().optional().describe("JSON schema for structured data extraction"),
  allowExternalLinks: z.boolean().optional().describe("Allow extraction from external links"),
  enableWebSearch: z.boolean().optional().describe("Enable web search for additional context"),
  includeSubdomains: z.boolean().optional().describe("Include subdomains in extraction"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const deepResearchInputSchema = z.object({
  query: z.string().describe("The query to research"),
  maxDepth: z.number().optional().describe("Maximum depth of research iterations (1-10)"),
  timeLimit: z.number().optional().describe("Time limit in seconds (30-300)"),
  maxUrls: z.number().optional().describe("Maximum number of URLs to analyze (1-1000)"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

export const generateLLMsTextInputSchema = z.object({
  url: z.string().describe("The URL to generate LLMs.txt from"),
  maxUrls: z.number().optional().describe("Maximum number of URLs to process (1-100, default: 10)"),
  showFullText: z.boolean().optional().describe("Whether to show the full LLMs-full.txt in the response"),
  _FIRECRAWL_API_KEY: z.string().describe("Firecrawl API key")
});

// Output schema definitions
export const scrapeOutputSchema = z.string().describe("Scraped content from the URL");

export const mapOutputSchema = z.object({
  links: z.array(z.string()).describe("List of discovered URLs")
});

export const crawlOutputSchema = z.object({
  id: z.string().describe("Job ID for the crawl operation"),
  message: z.string().describe("Status message for the crawl operation")
});

export const checkCrawlStatusOutputSchema = z.string().describe("Status of the crawl operation");

export const batchScrapeOutputSchema = z.object({
  id: z.string().describe("Job ID for the batch scrape operation"),
  message: z.string().describe("Status message for the batch scrape operation")
});

export const checkBatchStatusOutputSchema = z.string().describe("Status of the batch scrape operation");

export const searchOutputSchema = z.array(
  z.object({
    url: z.string().describe("URL of the search result"),
    title: z.string().describe("Title of the search result"),
    description: z.string().describe("Description of the search result"),
    markdown: z.string().describe("Markdown content of the search result")
  })
);

export const extractOutputSchema = z.string().describe("Extracted structured information from the URLs");

export const deepResearchOutputSchema = z.object({
  finalAnalysis: z.string().describe("Final analysis of the research results"),
  activities: z
    .array(
      z.object({
        type: z.string().describe("Type of research activity"),
        status: z.string().describe("Status of the research activity"),
        timestamp: z.string().describe("Timestamp of the research activity"),
        message: z.string().describe("Research activity message"),
        depth: z.number().describe("Depth level of the research activity")
      })
    )
    .describe("Research activities with messages and depths"),
  sources: z
    .array(
      z.object({
        url: z.string().describe("Source URL"),
        title: z.string().describe("Source title"),
        description: z.string().describe("Source description")
      })
    )
    .describe("Sources with URLs, titles, and descriptions")
});

export const generateLLMsTextOutputSchema = z.string().describe("Generated LLMs.txt content for the website");
