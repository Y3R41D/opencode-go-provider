/**
 * Live checks against the real OpenCode endpoints.
 *
 * They are opt-in so `bun run test` and CI never touch the network:
 *
 *   OPENCODE_INTEGRATION=1 OPENCODE_API_KEY=sk-... bun run test:integration
 *
 * The key is the one from the OpenCode Console. Behaviour verified on
 * 2026-10-17:
 *  - the Go endpoint (`/zen/go/v1`) serves `deepseek-v4.1-flash` to third-party
 *    clients, but only when the request carries `x-opencode-session` (without it
 *    the proxy answers 400 `MissingSessionID`);
 *  - the Zen endpoint (`/zen/v1`) needs Console credits for paid models (402
 *    "Insufficient account funds") and refuses the free tier outside the
 *    OpenCode client itself (403 `FreeTierError`), so `deepseek-v4.1-flash-free`
 *    and the other `*-free` models are not reachable from an extension.
 */
const ENABLED = process.env.OPENCODE_INTEGRATION === "1";
const API_KEY = process.env.OPENCODE_API_KEY ?? "";
const maybeDescribe = ENABLED && API_KEY ? describe : describe.skip;

const GO_BASE = "https://opencode.ai/zen/go/v1";
const ZEN_BASE = "https://opencode.ai/zen/v1";

type ChatResult = { status: number; body: any };

async function chat(
  base: string,
  model: string,
  init: { maxTokens?: number; session?: boolean } = {},
): Promise<ChatResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "opencode-go-provider/2.0.0 (integration test)",
  };
  if (init.session !== false) {
    headers["x-opencode-session"] = crypto.randomUUID();
  }
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with the single word: pong" }],
      max_tokens: init.maxTokens ?? 512,
      stream: false,
    }),
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

maybeDescribe("OpenCode endpoints (live)", () => {
  jest.setTimeout(120_000);

  it("serves deepseek-v4.1-flash from the Go endpoint", async () => {
    const { status, body } = await chat(GO_BASE, "deepseek-v4.1-flash");
    expect(status).toBe(200);
    expect(body.usage?.prompt_tokens ?? 0).toBeGreaterThan(0);
    expect(body.usage?.total_tokens ?? 0).toBeGreaterThan(0);
  });

  it("rejects Go requests without the x-opencode-session header", async () => {
    const { status, body } = await chat(GO_BASE, "deepseek-v4.1-flash", { session: false });
    expect(status).toBe(400);
    expect(body.error?.type).toBe("MissingSessionID");
  });

  it("refuses Zen's free tier for outside clients", async () => {
    const { status, body } = await chat(ZEN_BASE, "deepseek-v4.1-flash-free");
    expect(status).toBe(403);
    expect(body.error?.type).toBe("FreeTierError");
  });
});
