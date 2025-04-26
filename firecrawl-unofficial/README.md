# Firecrawl MCP Server

A Model Context Protocol (MCP) server for web crawling, scraping, search, and information extraction powered by Firecrawl.

## Description

This MCP server provides a comprehensive set of tools for web data retrieval and analysis. It includes capabilities for single page scraping, URL discovery, multi-page crawling, batch operations, search, and AI-powered extraction.

## Tools

- **firecrawl_scrape**: Scrape a single webpage with advanced options for content extraction. Supports various formats including markdown, HTML, and screenshots. Can execute custom actions like clicking or scrolling before scraping.

- **firecrawl_map**: Discover URLs from a starting point. Can use both sitemap.xml and HTML link discovery.

- **firecrawl_crawl**: Start an asynchronous crawl of multiple pages from a starting URL. Supports depth control, path filtering, and webhook notifications.

- **firecrawl_check_crawl_status**: Check the status of a crawl job.

- **firecrawl_search**: Search and retrieve content from web pages with optional scraping. Returns SERP results by default (url, title, description) or full page content when scrapeOptions are provided.

- **firecrawl_extract**: Extract structured information from web pages using LLM. Supports both cloud AI and self-hosted LLM extraction.

- **firecrawl_deep_research**: Conduct deep research on a query using web crawling, search, and AI analysis.

- **firecrawl_generate_llmstxt**: Generate standardized LLMs.txt file for a given URL, which provides context about how LLMs should interact with the website.

- **firecrawl_batch_scrape**: Not implemented.

- **firecrawl_check_batch_status**: Not implemented.

## Requirements

All tools require the following constant:

- **FIRECRAWL_API_KEY**: Your Firecrawl API key
