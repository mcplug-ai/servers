import { tool, prompt, resource, type CreateCtx } from "@mcplug/server";
import { z } from "zod";
import { resolve_library_id } from "./resolveLibraryId";
import { get_library_docs } from "./getLibraryDocs";

// Context will be available in the handle functions. If you do not need it, you can remove it or comment it out.
export const createCtx = (({ env, sessionId }) => {
  return {
    hello: "world"
  };
}) satisfies CreateCtx;

export default {
  tools: {
    resolve_library_id,
    get_library_docs
  }
};
