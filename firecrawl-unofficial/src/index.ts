import { firecrawl_scrape } from "./tools/scrape";
import { firecrawl_map } from "./tools/map";
import { firecrawl_crawl } from "./tools/crawl";
// import { firecrawl_batch_scrape } from "./tools/batchScrape";
// import { firecrawl_check_batch_status } from "./tools/checkBatchStatus";
import { firecrawl_check_crawl_status } from "./tools/checkCrawlStatus";
import { firecrawl_search } from "./tools/search";
import { firecrawl_extract } from "./tools/extract";
import { firecrawl_deep_research } from "./tools/deepResearch";
import { firecrawl_generate_llmstxt } from "./tools/generateLLMsTxt";

export default {
  tools: {
    firecrawl_scrape,
    firecrawl_map,
    firecrawl_crawl,
    // firecrawl_batch_scrape,
    // firecrawl_check_batch_status,
    firecrawl_check_crawl_status,
    firecrawl_search,
    firecrawl_extract,
    firecrawl_deep_research,
    firecrawl_generate_llmstxt
  }
};
