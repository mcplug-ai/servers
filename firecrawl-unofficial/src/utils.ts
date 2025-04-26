import FirecrawlApp from "@mendable/firecrawl-js";
import { CONFIG, delay, hasCredits } from "./config";
// Queue and batch operations
import PQueue from "p-queue";

// Queue system
export const batchQueue = new PQueue({ concurrency: 1 });
export const batchOperations = new Map<string, QueuedBatchOperation>();
export let operationCounter = 0;

// Batch operation interface
export interface QueuedBatchOperation {
  id: string;
  urls: string[];
  options?: any;
  status: "pending" | "processing" | "completed" | "failed";
  progress: {
    completed: number;
    total: number;
  };
  result?: any;
  error?: string;
}

// Credit usage tracking
export interface CreditUsage {
  total: number;
  lastCheck: number;
}

export const creditUsage: CreditUsage = {
  total: 0,
  lastCheck: Date.now()
};

// Log utility (for future use)
export function safeLog(
  level: "error" | "debug" | "info" | "notice" | "warning" | "critical" | "alert" | "emergency",
  data: any
): void {
  // For stdio transport, log to stderr to avoid protocol interference
  console.error(`[${level}] ${typeof data === "object" ? JSON.stringify(data) : data}`);
}

// Retry logic with exponential backoff
export async function withRetry<T>(operation: () => Promise<T>, context: string, attempt = 1): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const isRateLimit =
      error instanceof Error && (error.message.includes("rate limit") || error.message.includes("429"));

    if (isRateLimit && attempt < CONFIG.retry.maxAttempts) {
      const delayMs = Math.min(
        CONFIG.retry.initialDelay * Math.pow(CONFIG.retry.backoffFactor, attempt - 1),
        CONFIG.retry.maxDelay
      );

      safeLog(
        "warning",
        `Rate limit hit for ${context}. Attempt ${attempt}/${CONFIG.retry.maxAttempts}. Retrying in ${delayMs}ms`
      );

      await delay(delayMs);
      return withRetry(operation, context, attempt + 1);
    }

    throw error;
  }
}

// Credit usage update - returns new total
export function updateCreditUsage(creditsUsed: number, currentUsage: number = 0): number {
  const newTotal = currentUsage + creditsUsed;

  // Log credit usage
  safeLog("info", `Credit usage: ${newTotal} credits used total`);

  // Check thresholds
  if (newTotal >= CONFIG.credit.criticalThreshold) {
    safeLog("error", `CRITICAL: Credit usage has reached ${newTotal}`);
  } else if (newTotal >= CONFIG.credit.warningThreshold) {
    safeLog("warning", `WARNING: Credit usage has reached ${newTotal}`);
  }

  return newTotal;
}

// Function to create a Firecrawl client
export function createFirecrawlClient(apiKey: string, apiUrl?: string): FirecrawlApp {
  return new FirecrawlApp({
    apiKey: apiKey,
    ...(apiUrl ? { apiUrl } : {})
  });
}

// Batch operation handling
export async function processBatchOperation(
  client: FirecrawlApp,
  operation: QueuedBatchOperation,
  batchOperationsMap: Map<string, QueuedBatchOperation>
): Promise<void> {
  try {
    operation.status = "processing";
    let totalCreditsUsed = 0;

    // Use library's built-in batch processing
    const response = await withRetry(
      async () => client.asyncBatchScrapeUrls(operation.urls, operation.options),
      `batch ${operation.id} processing`
    );

    if (!response.success) {
      throw new Error(response.error || "Batch operation failed");
    }

    // Track credits if available
    if (hasCredits(response)) {
      totalCreditsUsed += response.creditsUsed;
    }

    operation.status = "completed";
    operation.result = response;
    batchOperationsMap.set(operation.id, operation);

    // Log final credit usage for the batch
    safeLog("info", `Batch ${operation.id} completed. Total credits used: ${totalCreditsUsed}`);
  } catch (error) {
    operation.status = "failed";
    operation.error = error instanceof Error ? error.message : String(error);
    batchOperationsMap.set(operation.id, operation);

    safeLog("error", `Batch ${operation.id} failed: ${operation.error}`);
  }
}

// // Function to get batch operations from storage or create new Map
// export async function getBatchOperations(): Promise<Map<string, QueuedBatchOperation>> {
//   return new Map<string, QueuedBatchOperation>();
// }

// // Function to save batch operations to storage
// export async function saveBatchOperation(
//   operationId: string,
//   operation: QueuedBatchOperation,
//   batchOperationsMap: Map<string, QueuedBatchOperation>
// ): Promise<void> {
//   batchOperationsMap.set(operationId, operation);
// }

// // Function to create batch queue
// export function createBatchQueue(): PQueue {
//   return new PQueue({ concurrency: 1 });
// }

// Function to generate operation ID
export function generateOperationId(prefix: string = "batch"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
