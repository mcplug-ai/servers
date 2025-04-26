// import { tool } from "@mcplug/server";
// import { statusCheckInputSchema } from "../types";
// import { getBatchOperations } from "../utils";

// export const firecrawl_check_batch_status = tool("Check the status of a batch scraping job.")
//   .input(statusCheckInputSchema)
//   .handle(async ({ input, error }) => {
//     const { id } = input;

//     try {
//       // Get batch operations from storage
//       const batchOperationsMap = await getBatchOperations();

//       const operation = batchOperationsMap.get(id);
//       if (!operation) {
//         return error(`No batch operation found with ID: ${id}`);
//       }

//       const status = `Batch Status:
// Status: ${operation.status}
// Progress: ${operation.progress.completed}/${operation.progress.total}
// ${operation.error ? `Error: ${operation.error}` : ""}
// ${operation.result ? `Results: ${JSON.stringify(operation.result, null, 2)}` : ""}`;

//       return status;
//     } catch (err) {
//       return error(err instanceof Error ? err.message : String(err));
//     }
//   });
