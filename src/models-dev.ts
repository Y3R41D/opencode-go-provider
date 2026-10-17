import { debugLog } from "./output-channel";

/**
 * models.dev is the community model catalog that the OpenCode CLI itself uses
 * to resolve model metadata (context window, capabilities, reasoning efforts,
 * pricing). The OpenCode Go HTTP API only returns model IDs, so we merge the
 * API's "enabled models" list with this catalog to recover accurate metadata.
 *
 * Source: https://models.dev/api.json
 */
const MODELS_DEV_URL = "https://models.dev/api.json";

/** Provider buckets within models.dev that belong to OpenCode.
 *
 * Order matters: later entries override earlier ones for shared model IDs.
 * The extension talks to the OpenCode Go endpoint
 * (https://opencode.ai/zen/go/v1), so opencode-go metadata is authoritative
 * and must win over the general opencode bucket. Example divergence:
 * deepseek-v4.1-flash costs $0.15 on opencode-go but $0.30 on opencode.
 */
const PROVIDER_IDS = ["opencode", "opencode-go"] as const;

export type ModelsDevProviderId = (typeof PROVIDER_IDS)[number];

const FETCH_TIMEOUT_MS = 10000;

export interface ModelsDevReasoningOption {
  type: string;
  values?: string[];
}

export interface ModelsDevModel {
  id: string;
  name?: string;
  description?: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  reasoning_options?: ModelsDevReasoningOption[];
  tool_call?: boolean;
  temperature?: boolean;
  modalities?: { input?: string[]; output?: string[] };
  limit?: { context?: number; input?: number; output?: number };
  cost?: {
    input?: number;
    output?: number;
    cache_read?: number;
    cache_write?: number;
  };
  release_date?: string;
  last_updated?: string;
  open_weights?: boolean;
  /** Which models.dev bucket this entry came from. */
  source?: ModelsDevProviderId;
}

interface ModelsDevProvider {
  id?: string;
  models?: Record<string, ModelsDevModel>;
}

export type ModelsDevCatalog = Map<string, ModelsDevModel>;

/**
 * Fetch the models.dev catalog for the OpenCode providers.
 * Returns a Map keyed by model ID. Never throws — returns an empty map on
 * failure so callers can fall back to inferred metadata.
 */
export async function fetchModelsDevCatalog(userAgent?: string): Promise<ModelsDevCatalog> {
  const catalog: ModelsDevCatalog = new Map();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(MODELS_DEV_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(userAgent ? { "User-Agent": userAgent } : {}),
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      debugLog("modelsDev", `HTTP ${response.status} ${response.statusText}`);
      return catalog;
    }

    const body = (await response.json()) as Record<string, ModelsDevProvider>;
    // Merge providers in order: opencode first, opencode-go overrides. The Go
    // bucket is authoritative for this extension's endpoint.
    for (const providerId of PROVIDER_IDS) {
      const provider = body[providerId];
      if (!provider?.models) continue;
      for (const [id, model] of Object.entries(provider.models)) {
        catalog.set(id, { ...model, id, source: providerId });
      }
    }
    debugLog("modelsDev", `Loaded ${catalog.size} models from models.dev`);
    return catalog;
  } catch (error) {
    debugLog("modelsDevError", `Failed to fetch catalog: ${error}`);
    return catalog;
  }
}
