export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type JsonObject = { [k: string]: Json };

export interface OcGoContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export interface OcGoChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | OcGoContentPart[];
  name?: string;
  tool_calls?: OcGoToolCall[];
  tool_call_id?: string;
  reasoning_content?: string;
}

export interface OcGoToolCall {
  id: string;
  /** Optional index used in streaming tool call deltas */
  index?: number;
  type: "function";
  function: { name: string; arguments: string };
}

export interface OcGoTool {
  type: "function";
  function: { name: string; description?: string; parameters?: JsonObject };
}

export interface OcGoChatRequest {
  model: string;
  messages: OcGoChatMessage[];
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  stream?: boolean;
  top_p?: number;
  stop?: string | string[];
  tools?: OcGoTool[];
  tool_choice?: "auto" | "none" | "required" | { type: string; function: { name: string } };
  reasoning_effort?: string;
}

export interface OcGoStreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
    reasoning_content?: string;
    tool_calls?: OcGoToolCall[];
  };
  finish_reason: string | null;
}

export interface OcGoStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OcGoStreamChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface OcGoChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/** API format used by a model */
export type OcGoApiFormat = "openai" | "anthropic" | "responses";

/** Reasoning effort level for models that support it (e.g. DeepSeek) */
export type ReasoningEffort = "xhigh" | "high" | "medium" | "low" | "minimal" | "max";

/** Ordered list for UI and fallback logic */
export const REASONING_EFFORT_ORDER: readonly ReasoningEffort[] = [
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

export interface OcGoModelInfo {
  id: string;
  name: string;
  displayName: string;
  contextWindow: number;
  maxOutput: number;
  supportsTools: boolean;
  supportsVision: boolean;
  /** API format: "openai" (default) or "anthropic" (MiniMax models) */
  apiFormat?: OcGoApiFormat;
  /** If set, this exact temperature value is sent for every request */
  fixedTemperature?: number;
  /**
   * If set, this exact top_p value is sent for every request.
   * Matches the OpenCode CLI's per-model sampling defaults
   * (e.g. qwen top_p=1, kimi-k2.5 / minimax-m2 top_p=0.95).
   */
  fixedTopP?: number;
  /** If true, a Thinking Effort dropdown is shown in the model picker */
  supportsThinking?: boolean;
  /** Per-model allowed reasoning efforts (excluding "default"). If undefined and supportsThinking, generic fallback is used. */
  supportedReasoningEfforts?: ReasoningEffort[];
  /** True if model is free tier */
  isFree?: boolean;
  /** models.dev bucket the metadata came from ("opencode" | "opencode-go") */
  metadataSource?: string;
  /** Real cost per 1M tokens from models.dev, when known */
  costInput?: number;
  costOutput?: number;
}

export const FALLBACK_MODELS: OcGoModelInfo[] = [
  {
    id: "glm-5",
    name: "GLM-5",
    displayName: "GLM-5",
    contextWindow: 202752,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["high", "max"],
  },
  {
    id: "glm-5.1",
    name: "GLM-5.1",
    displayName: "GLM-5.1",
    contextWindow: 202752,
    maxOutput: 32768,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["high", "max"],
  },
  {
    id: "glm-5.2",
    name: "GLM-5.2",
    displayName: "GLM-5.2",
    contextWindow: 1000000,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["high", "max"],
  },
  {
    id: "glm-5.3",
    name: "GLM-5.3",
    displayName: "GLM-5.3",
    contextWindow: 1000000,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "high", "max"],
  },
  {
    id: "kimi-k2.5",
    name: "Kimi K2.5",
    displayName: "Kimi K2.5",
    contextWindow: 262144,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    fixedTemperature: 1,
    fixedTopP: 0.95,
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    displayName: "Kimi K2.6",
    contextWindow: 262144,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    fixedTemperature: 1,
    supportsThinking: false,
  },
  {
    id: "kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    displayName: "Kimi K2.7 Code",
    contextWindow: 262144,
    maxOutput: 262144,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    fixedTemperature: 1,
    supportsThinking: false,
  },
  {
    id: "kimi-k3",
    name: "Kimi K3",
    displayName: "Kimi K3",
    contextWindow: 1048576,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    fixedTemperature: 1,
    supportsThinking: true,
    supportedReasoningEfforts: ["max"],
  },
  {
    id: "mimo-v2-pro",
    name: "MiMo-V2-Pro",
    displayName: "MiMo-V2-Pro",
    contextWindow: 1048576,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "mimo-v2-omni",
    name: "MiMo-V2-Omni",
    displayName: "MiMo-V2-Omni",
    contextWindow: 262144,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "mimo-v2.5-pro",
    name: "MiMo-V2.5-Pro",
    displayName: "MiMo-V2.5-Pro",
    contextWindow: 1048576,
    maxOutput: 128000,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "mimo-v2.5",
    name: "MiMo-V2.5",
    displayName: "MiMo-V2.5",
    contextWindow: 1000000,
    maxOutput: 128000,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "minimax-m2.5",
    name: "MiniMax M2.5",
    displayName: "MiniMax M2.5",
    contextWindow: 196608,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "anthropic",
    fixedTemperature: 1,
    fixedTopP: 0.95,
  },
  {
    id: "minimax-m2.7",
    name: "MiniMax M2.7",
    displayName: "MiniMax M2.7",
    contextWindow: 204800,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "anthropic",
    fixedTemperature: 1,
    fixedTopP: 0.95,
  },
  {
    id: "minimax-m3",
    name: "MiniMax M3",
    displayName: "MiniMax M3",
    contextWindow: 1000000,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "anthropic",
  },
  {
    id: "qwen3.5-plus",
    name: "Qwen3.5 Plus",
    displayName: "Qwen3.5 Plus",
    contextWindow: 1000000,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    fixedTemperature: 0.55,
    fixedTopP: 1,
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "qwen3.6-plus",
    name: "Qwen3.6 Plus",
    displayName: "Qwen3.6 Plus",
    contextWindow: 1000000,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    fixedTemperature: 0.55,
    fixedTopP: 1,
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "qwen3.7-plus",
    name: "Qwen3.7 Plus",
    displayName: "Qwen3.7 Plus",
    contextWindow: 1000000,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "anthropic",
    fixedTemperature: 0.55,
    fixedTopP: 1,
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "qwen3.7-max",
    name: "Qwen3.7 Max",
    displayName: "Qwen3.7 Max",
    contextWindow: 1000000,
    maxOutput: 65536,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    fixedTemperature: 0.55,
    fixedTopP: 1,
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "qwen3.8-max",
    name: "Qwen3.8 Max",
    displayName: "Qwen3.8 Max",
    contextWindow: 1000000,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "anthropic",
    fixedTemperature: 0.55,
    fixedTopP: 1,
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "xhigh"],
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    displayName: "DeepSeek V4 Pro",
    contextWindow: 1000000,
    maxOutput: 384000,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["high", "max"],
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    displayName: "DeepSeek V4 Flash",
    contextWindow: 1000000,
    maxOutput: 384000,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "high", "max"],
  },
  {
    id: "deepseek-v4-flash-vision-exp",
    name: "DeepSeek V4 Flash Vision Exp",
    displayName: "DeepSeek V4 Flash Vision Exp",
    contextWindow: 1000000,
    maxOutput: 384000,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "high", "max"],
  },
  {
    id: "hy3",
    name: "Hy3",
    displayName: "Hy3",
    contextWindow: 256000,
    maxOutput: 128000,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "high"],
  },
  {
    id: "hy3-preview",
    name: "HY3 Preview",
    displayName: "HY3 Preview",
    contextWindow: 256000,
    maxOutput: 64000,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "high"],
  },
  {
    id: "grok-4.5",
    name: "Grok 4.5",
    displayName: "Grok 4.5",
    contextWindow: 500000,
    maxOutput: 500000,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "responses",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
  {
    id: "gpt-5.6-luna",
    name: "GPT 5.6 Luna",
    displayName: "GPT 5.6 Luna",
    contextWindow: 1050000,
    maxOutput: 128000,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "responses",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high", "xhigh", "max"],
  },
  {
    id: "ox-alpha-free",
    name: "Ox Alpha Free",
    displayName: "Ox Alpha Free",
    contextWindow: 1000000,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "high", "max"],
  },
  {
    id: "muse-spark-1.2-contributor",
    name: "Muse Spark 1.2 Contributor",
    displayName: "Muse Spark 1.2 Contributor",
    contextWindow: 1048576,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: true,
    apiFormat: "responses",
    supportsThinking: true,
    supportedReasoningEfforts: ["minimal", "low", "medium", "high", "xhigh"],
  },
  {
    id: "longcat-2.0",
    name: "LongCat 2.0",
    displayName: "LongCat 2.0",
    contextWindow: 1000000,
    maxOutput: 131072,
    supportsTools: true,
    supportsVision: false,
    apiFormat: "openai",
    supportsThinking: true,
    supportedReasoningEfforts: ["low", "medium", "high"],
  },
];

export function inferModelInfo(id: string): OcGoModelInfo {
  const known = FALLBACK_MODELS.find((m) => m.id === id);
  if (known) {
    return known;
  }

  const isKimi = id.startsWith("kimi-");
  const isGlm = id.startsWith("glm-");
  const isMinimax = id.startsWith("minimax-");
  const isDeepseek = id.startsWith("deepseek-");
  const isQwen = id.startsWith("qwen");
  const isMimo = id.startsWith("mimo-");
  const isHy3 = id === "hy3" || id.startsWith("hy3-");
  const isGrok = id.startsWith("grok-");
  const isGpt = id.startsWith("gpt-5.6") || id.startsWith("gpt-5.") || id.startsWith("gpt-6");
  const isMuse = id.startsWith("muse-");
  const isLongcat = id.startsWith("longcat-");
  const isOx = id.startsWith("ox-");
  const isNemotron = id.startsWith("nemotron-");
  const isGptNew = id.startsWith("gpt-") && !id.startsWith("gpt-5.6");
  const isClaude = id.startsWith("claude-");
  const isGemini = id.startsWith("gemini-");
  const isGrokBuild = id.startsWith("grok-build-");
  const isJev = id.startsWith("jev-");
  const isOmen = id.startsWith("omen-");
  const isSpaceBunny = id.startsWith("space-bunny");
  const isStep = id.startsWith("step-");
  const isCatJam = id.startsWith("cat-jam");
  const isBigPickle = id.startsWith("big-pickle");
  const isBeam = id.startsWith("beam-");
  const isMistral = id.startsWith("mistral-");

  let contextWindow = 262144;
  let maxOutput = 65536;
  const supportsTools = true;
  let supportsVision = false;
  let apiFormat: OcGoApiFormat = "openai";
  let fixedTemperature: number | undefined = undefined;
  let fixedTopP: number | undefined = undefined;
  let supportsThinking = false;
  let supportedReasoningEfforts: ReasoningEffort[] | undefined = undefined;

  if (isMinimax) {
    apiFormat = "anthropic";
    if (id === "minimax-m3") {
      contextWindow = 1000000;
      supportsVision = true;
    } else if (id.includes("m2.7")) {
      contextWindow = 204800;
    } else {
      contextWindow = 196608;
    }
    maxOutput = 131072;
    if (id.includes("m2")) {
      fixedTemperature = 1;
      fixedTopP = 0.95;
    }
    // MiniMax: no reasoning ui (anthropic adaptive thinking is internal)
  } else if (isKimi) {
    fixedTemperature = 1;
    if (id.includes("k2.5")) {
      fixedTopP = 0.95;
      supportsVision = true;
      supportsThinking = true;
      supportedReasoningEfforts = ["low", "medium", "high"];
      contextWindow = 262144;
      maxOutput = 65536;
    } else if (id.includes("k2.6")) {
      supportsVision = true;
      supportsThinking = false;
      contextWindow = 262144;
      maxOutput = 65536;
    } else if (id.includes("k2.7")) {
      supportsVision = true;
      supportsThinking = false;
      contextWindow = 262144;
      maxOutput = 262144;
    } else if (id.includes("k3")) {
      supportsVision = true;
      supportsThinking = true;
      supportedReasoningEfforts = ["max"];
      contextWindow = 1048576;
      maxOutput = 131072;
    } else {
      supportsVision = true;
      supportsThinking = true;
      supportedReasoningEfforts = ["low", "medium", "high"];
      contextWindow = 262144;
      maxOutput = 262144;
    }
  } else if (isGlm) {
    supportsThinking = true;
    contextWindow = id.includes("5.3") ? 1000000 : id.includes("5.2") ? 1000000 : 202752;
    maxOutput = id.includes("5.1") ? 32768 : 131072;
    if (id.includes("5.3")) {
      if (id.includes("flash")) {
        contextWindow = 1000000;
        maxOutput = 65536;
        supportedReasoningEfforts = ["low", "high", "max"];
      } else {
        supportedReasoningEfforts = ["low", "high", "max"];
      }
    } else if (id.includes("5.2") || id === "glm-5" || id.includes("5.1")) {
      supportedReasoningEfforts = ["high", "max"];
    }
  } else if (isDeepseek) {
    supportsThinking = true;
    supportsVision = id.includes("vision");
    contextWindow = 1000000;
    maxOutput = 384000;
    if (id.includes("v4-pro")) {
      supportedReasoningEfforts = ["high", "max"];
    } else {
      supportedReasoningEfforts = ["low", "high", "max"];
    }
  } else if (isQwen) {
    fixedTemperature = 0.55;
    fixedTopP = 1;
    supportsVision = true;
    supportsThinking = true;
    if (id.includes("3.8")) {
      if (id.includes("flash")) {
        // Qwen 3.8 Flash
        maxOutput = 65536;
        supportedReasoningEfforts = ["low", "medium", "high"];
      } else if (id.includes("max")) {
        // Qwen 3.8 Max
        maxOutput = 131072;
        supportedReasoningEfforts = ["low", "medium", "xhigh"];
      } else {
        maxOutput = 131072;
        supportedReasoningEfforts = ["low", "medium", "high"];
      }
    } else {
      maxOutput = 65536;
      supportedReasoningEfforts = ["low", "medium", "high"];
    }
    contextWindow = 1000000;
  } else if (isMimo) {
    supportsThinking = true;
    supportsVision = !id.includes("v2-pro");
    if (id.includes("v2.6")) {
      // Mimo v2.6 models (flash and pro)
      contextWindow = id.includes("pro") ? 1048576 : 1000000;
      maxOutput = id.includes("pro") ? 128000 : 65536;
      if (id.includes("flash")) {
        // Flash variant is free
        supportsVision = true;
      }
    } else {
      contextWindow = id.includes("pro") ? 1048576 : 1000000;
      maxOutput = id.includes("pro") ? 128000 : 128000;
    }
    supportedReasoningEfforts = ["low", "medium", "high"];
  } else if (isHy3) {
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "high"];
    contextWindow = 256000;
    maxOutput = 128000;
    if (id === "hy4-preview") {
      contextWindow = 1000000;
      maxOutput = 131072;
      supportedReasoningEfforts = ["low", "high", "max"];
    }
  } else if (isGrok) {
    // grok-4.5 uses Responses API in Pi (openai-responses)
    apiFormat = "responses";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 500000;
    maxOutput = 500000;
  } else if (isGpt) {
    apiFormat = "responses";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high", "xhigh", "max"];
    contextWindow = 1050000;
    maxOutput = 128000;
  } else if (isMuse) {
    apiFormat = "responses";
    supportsVision = true;
    supportsThinking = true;
    if (id.includes("1.3")) {
      // Muse Spark 1.3 - contributor model
      contextWindow = 1048576;
      maxOutput = 131072;
      supportedReasoningEfforts = ["minimal", "low", "medium", "high", "xhigh", "max"];
    } else {
      // Muse Spark 1.2
      contextWindow = 1048576;
      maxOutput = 131072;
      supportedReasoningEfforts = ["minimal", "low", "medium", "high", "xhigh"];
    }
  } else if (isLongcat) {
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 1000000;
    maxOutput = 131072;
    if (id.includes("2.5-preview-free")) {
      // LongCat 2.5 preview free - free tier
      contextWindow = 1000000;
      maxOutput = 131072;
    }
  } else if (isOx) {
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "high", "max"];
    contextWindow = 1000000;
    maxOutput = 131072;
  } else if (isNemotron) {
    // NVIDIA Nemotron models - free tier
    apiFormat = "openai";
    supportsVision = id.includes("vl") || id.includes("super");
    supportsThinking = false;
    contextWindow = 128000;
    maxOutput = 8192;
  } else if (isClaude) {
    // Anthropic Claude models
    apiFormat = "anthropic";
    supportsVision = true;
    supportsThinking = true;
    if (id.includes("opus")) {
      contextWindow = 200000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("sonnet")) {
      contextWindow = 200000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("haiku")) {
      contextWindow = 200000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("fable")) {
      contextWindow = 200000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else {
      contextWindow = 200000;
      maxOutput = 8192;
    }
  } else if (isGemini) {
    // Google Gemini models
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = true;
    if (id.includes("4-argon")) {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("3.8")) {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("3.7")) {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("3.6")) {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("3.5")) {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else if (id.includes("3.1")) {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    } else {
      contextWindow = 1000000;
      maxOutput = 8192;
      supportedReasoningEfforts = ["low", "medium", "high"];
    }
  } else if (isGrok || isGrokBuild) {
    // Grok models (including grok-build)
    apiFormat = "responses";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 500000;
    maxOutput = 500000;
  } else if (isJev) {
    // JEV models - free
    apiFormat = "openai";
    supportsThinking = false;
    supportsVision = false;
    contextWindow = 8192;
    maxOutput = 4096;
  } else if (isOmen) {
    // Omen models
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 1000000;
    maxOutput = 131072;
  } else if (isSpaceBunny) {
    // Space Bunny - free
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 1000000;
    maxOutput = 131072;
  } else if (isStep) {
    // Step models
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 1000000;
    maxOutput = 131072;
  } else if (isCatJam) {
    // Cat Jam models - free
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 262144;
    maxOutput = 65536;
  } else if (isBigPickle) {
    // Big Pickle - free
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 262144;
    maxOutput = 65536;
  } else if (isBeam) {
    // Beam - free tier
    apiFormat = "openai";
    supportsVision = false;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high"];
    contextWindow = 262144;
    maxOutput = 65536;
  } else if (isMistral) {
    // Mistral Large
    apiFormat = "openai";
    supportsVision = true;
    supportsThinking = false;
    contextWindow = 262144;
    maxOutput = 65536;
  } else if (isGptNew) {
    // GPT-5.x and GPT-6.x models (non-Luna/Sol/Terra)
    apiFormat = "responses";
    supportsVision = true;
    supportsThinking = true;
    supportedReasoningEfforts = ["low", "medium", "high", "xhigh", "max"];
    contextWindow = 1050000;
    maxOutput = 128000;
  }

  const displayName = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Free tier is decided by models.dev pricing (cost 0). As a fallback for
  // models missing from the catalog, honor the API's "-free" name suffix.
  const isFree = id.endsWith("-free");

  return applyFreeLabel({
    id,
    name: displayName,
    displayName,
    contextWindow,
    maxOutput,
    supportsTools,
    supportsVision,
    apiFormat,
    fixedTemperature,
    fixedTopP,
    supportsThinking,
    isFree,
    ...(supportedReasoningEfforts ? { supportedReasoningEfforts } : {}),
  });
}

/** Strip any existing badge suffix (e.g. " [free · go]") from a display name. */
function stripBadges(name: string): string {
  return name
    .replace(/\s*\[[^\]]*\]\s*$/g, "")
    .replace(/\s*\(xfree\)$/i, "")
    .trim();
}

/**
 * Build the human-readable display name with capability badges:
 *   "Beam Free [free · go]"
 * Badges:  "free" when cost is zero, "go"/"opencode" for the metadata source.
 */
export function applyFreeLabel(info: OcGoModelInfo): OcGoModelInfo {
  const baseName = stripBadges(info.displayName || info.name);
  const badges: string[] = [];
  if (info.isFree) {
    badges.push("free");
  }
  if (info.metadataSource === "opencode-go") {
    badges.push("go");
  } else if (info.metadataSource === "opencode") {
    badges.push("opencode");
  }
  const labeled = badges.length > 0 ? `${baseName} [${badges.join(" · ")}]` : baseName;
  info.displayName = labeled;
  info.name = labeled;
  return info;
}

/** Valid reasoning efforts we can present in the VS Code dropdown. */
const VALID_REASONING_EFFORTS: readonly ReasoningEffort[] = [
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

/**
 * Metadata shape coming from the models.dev catalog (the same source the
 * OpenCode CLI uses). Only the fields we consume are typed here.
 */
export interface ModelsDevMetadata {
  name?: string;
  attachment?: boolean;
  reasoning?: boolean;
  reasoning_options?: Array<{ type: string; values?: string[] }>;
  tool_call?: boolean;
  temperature?: boolean;
  modalities?: { input?: string[]; output?: string[] };
  limit?: { context?: number; input?: number; output?: number };
  cost?: { input?: number; output?: number; cache_read?: number; cache_write?: number };
  /** models.dev bucket this metadata came from. */
  source?: string;
}

/**
 * Merge authoritative models.dev metadata over the ID-inferred model info.
 * Fields absent from the catalog keep the inferred value (graceful fallback).
 * Free tier is decided by zero pricing, not by the "-free" name suffix.
 */
export function applyModelsDevMetadata(base: OcGoModelInfo, md?: ModelsDevMetadata): OcGoModelInfo {
  if (!md) {
    return base;
  }

  const merged: OcGoModelInfo = { ...base };

  // Prefer the catalog's human-readable name when available.
  if (md.name && md.name.trim()) {
    merged.displayName = md.name.trim();
  }

  // Context window / output limits
  if (md.limit?.context && md.limit.context > 0) {
    merged.contextWindow = md.limit.context;
  }
  if (md.limit?.output && md.limit.output > 0) {
    merged.maxOutput = md.limit.output;
  }

  // Vision support: attachment OR image modality
  if (typeof md.attachment === "boolean") {
    merged.supportsVision = md.attachment;
  }
  if (md.modalities?.input?.includes("image")) {
    merged.supportsVision = true;
  }

  // Tool calling
  if (typeof md.tool_call === "boolean") {
    merged.supportsTools = md.tool_call;
  }

  // Thinking / reasoning efforts (keep Anthropic adaptive-thinking models clean)
  if (base.apiFormat !== "anthropic") {
    if (typeof md.reasoning === "boolean") {
      merged.supportsThinking = md.reasoning;
    }
    const effortOption = md.reasoning_options?.find(
      (o) => o.type === "effort" && Array.isArray(o.values) && o.values.length > 0,
    );
    if (effortOption?.values) {
      const filtered = effortOption.values.filter((v): v is ReasoningEffort =>
        (VALID_REASONING_EFFORTS as readonly string[]).includes(v),
      );
      if (filtered.length > 0) {
        merged.supportedReasoningEfforts = filtered;
      }
    } else if (md.reasoning === false) {
      // Model does not reason at all: hide the dropdown explicitly.
      merged.supportsThinking = false;
      merged.supportedReasoningEfforts = undefined;
    }
  }

  // Models that don't accept a temperature param must not receive one.
  if (md.temperature === false) {
    merged.fixedTemperature = undefined;
  }

  // Free tier: pricing of zero on both input and output.
  const cost = md.cost;
  if (cost && typeof cost.input === "number" && typeof cost.output === "number") {
    merged.isFree = cost.input === 0 && cost.output === 0;
    merged.costInput = cost.input;
    merged.costOutput = cost.output;
  }
  if (md.source) {
    merged.metadataSource = md.source;
  }

  return applyFreeLabel(merged);
}

// ============================================================================
// Anthropic Messages API types
// Used by MiniMax M2.5 and M2.7 via OpenCode Go proxy
// ============================================================================

/** Anthropic message content block */
export type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "tool_use"; id: string; name: string; input: JsonObject }
  | { type: "tool_result"; tool_use_id: string; content: string | AnthropicContentBlock[] };

/** Anthropic message format */
export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
  reasoning_content?: string;
}

/** Anthropic tool definition */
export interface AnthropicTool {
  name: string;
  description?: string;
  input_schema: JsonObject;
}

/** Anthropic request body */
export interface AnthropicRequestBody {
  model: string;
  messages: AnthropicMessage[];
  system?: string | Array<{ type: "text"; text: string }>;
  max_tokens: number;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  tools?: AnthropicTool[];
  tool_choice?: "auto" | "any" | { type: "tool"; name: string };
}

/** Anthropic SSE event types */
export interface AnthropicMessageStartEvent {
  type: "message_start";
  message: {
    id: string;
    type: "message";
    role: "assistant";
    content: AnthropicContentBlock[];
    model: string;
    stop_reason: string | null;
    usage: { input_tokens: number; output_tokens: number };
  };
}

export interface AnthropicContentBlockStartEvent {
  type: "content_block_start";
  index: number;
  content_block: AnthropicContentBlock;
}

export interface AnthropicContentBlockDeltaEvent {
  type: "content_block_delta";
  index: number;
  delta:
    | { type: "text_delta"; text: string }
    | { type: "input_json_delta"; partial_json: string }
    | { type: "thinking_delta"; thinking: string };
}

export interface AnthropicContentBlockStopEvent {
  type: "content_block_stop";
  index: number;
}

export interface AnthropicMessageDeltaEvent {
  type: "message_delta";
  delta: { stop_reason: string | null; stop_sequence: string | null };
  usage: { output_tokens: number };
}

export interface AnthropicMessageStopEvent {
  type: "message_stop";
}

export type AnthropicSSEEvent =
  | AnthropicMessageStartEvent
  | AnthropicContentBlockStartEvent
  | AnthropicContentBlockDeltaEvent
  | AnthropicContentBlockStopEvent
  | AnthropicMessageDeltaEvent
  | AnthropicMessageStopEvent;

// ============================================================================
// OpenAI Responses API types
// Used by GPT 5.6 Luna via the OpenCode Go proxy (/responses endpoint)
// ============================================================================

/** Content part inside a Responses API message item */
export type OcGoResponsesContentPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string }
  | { type: "output_text"; text: string };

/** Input item for the Responses API */
export type OcGoResponsesInputItem =
  | {
      type: "message";
      role: "user" | "assistant";
      content: string | OcGoResponsesContentPart[];
    }
  | { type: "function_call"; call_id: string; name: string; arguments: string }
  | { type: "function_call_output"; call_id: string; output: string };

/** Function tool definition for the Responses API */
export interface OcGoResponsesTool {
  type: "function";
  name: string;
  description?: string;
  parameters?: JsonObject;
}

/** Responses API request body */
export interface OcGoResponsesRequest {
  model: string;
  instructions?: string;
  input: OcGoResponsesInputItem[];
  tools?: OcGoResponsesTool[];
  tool_choice?: "auto" | "required" | "none" | { type: "function"; name: string };
  temperature?: number;
  max_output_tokens?: number;
  stream?: boolean;
  store?: boolean;
  reasoning?: { effort?: string; summary?: string };
}

/** Responses API SSE stream event */
export interface OcGoResponsesStreamEvent {
  type: string;
  item_id?: string;
  output_index?: number;
  delta?: string;
  item?: {
    id?: string;
    type?: string;
    name?: string;
    call_id?: string;
    arguments?: string;
    status?: string;
    role?: string;
  };
  response?: {
    status?: string;
    incomplete_details?: { reason?: string };
  };
  error?: { message?: string; code?: string };
}
