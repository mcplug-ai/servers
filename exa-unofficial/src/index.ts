import { type CreateCtx } from "@mcplug/server";
import { company_research } from "./companyResearch";
import { competitor_finder } from "./competitorFinder";
import { twitter_search } from "./twitterSearch";
import { web_search_tool } from "./webSearch";
import { research_paper_search_tool } from "./researchPaperSearch";
import { linkedin_search_tool } from "./linkedInResearch";

export default {
  tools: {
    company_research,
    competitor_finder,
    twitter_search,
    web_search_tool,
    research_paper_search_tool,
    linkedin_search_tool
  }
};
