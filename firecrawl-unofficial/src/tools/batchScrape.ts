// import { tool } from "@mcplug/server";
// import { batchScrapeInputSchema } from "../types";
// import {
//   createBatchQueue,
//   createFirecrawlClient,
//   generateOperationId,
//   getBatchOperations,
//   processBatchOperation,
//   saveBatchOperation
// } from "../utils";

// export const firecrawl_batch_scrape = tool(
//   "Scrape multiple URLs in batch mode. Returns a job ID that can be used to check status."
// )
//   .input(batchScrapeInputSchema)
//   .handle(async ({ input, error }) => {
//     const { urls, options, _FIRECRAWL_API_KEY } = input;

//     try {
//       // Create client with the API key
//       const client = createFirecrawlClient(_FIRECRAWL_API_KEY);

//       // Get or create batch operations storage
//       const batchOperationsMap = await getBatchOperations();

//       // Create queue for this execution context
//       const batchQueue = createBatchQueue();

//       // Generate a unique operation ID
//       const operationId = generateOperationId();

//       // Create operation object
//       const operation = {
//         id: operationId,
//         urls,
//         options,
//         status: "pending" as const,
//         progress: {
//           completed: 0,
//           total: urls.length
//         }
//       };

//       // Save the operation to storage
//       await saveBatchOperation(operationId, operation, batchOperationsMap);

//       // Queue the operation
//       batchQueue.add(() => processBatchOperation(client, operation, batchOperationsMap));

//       console.log(`Queued batch operation ${operationId} with ${urls.length} URLs`);

//       return `Batch operation queued with ID: ${operationId}. Use firecrawl_check_batch_status to check progress.`;
//     } catch (err) {
//       return error(err instanceof Error ? err.message : `Batch operation failed: ${String(err)}`);
//     }
//   });
