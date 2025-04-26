// Configuration for retries and monitoring
export const CONFIG = {
  retry: {
    maxAttempts: Number(process.env.FIRECRAWL_RETRY_MAX_ATTEMPTS) || 3,
    initialDelay: Number(process.env.FIRECRAWL_RETRY_INITIAL_DELAY) || 1000,
    maxDelay: Number(process.env.FIRECRAWL_RETRY_MAX_DELAY) || 10000,
    backoffFactor: Number(process.env.FIRECRAWL_RETRY_BACKOFF_FACTOR) || 2
  },
  credit: {
    warningThreshold: Number(process.env.FIRECRAWL_CREDIT_WARNING_THRESHOLD) || 1000,
    criticalThreshold: Number(process.env.FIRECRAWL_CREDIT_CRITICAL_THRESHOLD) || 100
  }
};

// Function to create delay
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility function to trim trailing whitespace from text responses
export function trimResponseText(text: string): string {
  return text.trim();
}

// Type guard for credit usage
export function hasCredits(response: any): response is { creditsUsed: number } {
  return "creditsUsed" in response && typeof response.creditsUsed === "number";
}

// Format results helper
export function formatResults(data: any[]): string {
  return data
    .map((doc) => {
      const content = doc.markdown || doc.html || doc.rawHtml || "No content";
      return `URL: ${doc.url || "Unknown URL"}
Content: ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}
${doc.metadata?.title ? `Title: ${doc.metadata.title}` : ""}`;
    })
    .join("\n\n");
}
