# OpenCode Go Provider

[![CI](https://github.com/Y3R41D/opencode-go-provider/actions/workflows/ci.yml/badge.svg)](https://github.com/Y3R41D/opencode-go-provider/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%E2%89%A5%201.104.0-007ACC.svg)](https://code.visualstudio.com/)

Use OpenCode Go's 30+ models inside **GitHub Copilot Chat** with your own OpenCode Go
subscription. The extension registers a `LanguageModelChatProvider` that converts Copilot Chat
messages into the right **OpenAI / Anthropic / Responses** request, streams the reply back, and
relays tool calls and image analysis.

> **Fork.** Personal fork of
> [hidenobunagai/opencode-go-provider](https://github.com/hidenobunagai/opencode-go-provider) by
> [@Y3R41D](https://github.com/Y3R41D) (MIT). See [Fork & maintenance](#fork--maintenance) to keep
> it in sync with upstream.

## Features

- **Dynamic model catalog** fetched from the API at runtime, with a bundled fallback for offline /
  first-run.
- **models.dev metadata** merged in: context window, output limit, vision, tools, reasoning efforts,
  and pricing.
- **Three API formats**, auto-selected per model: OpenAI, Anthropic Messages, and OpenAI Responses.
- **Tool calling** with parsing/repair of calls embedded in text, plus an action-announcement nudge.
- **Vision**: native where supported, otherwise automatic delegation plus the
  `opencode_go_analyze_image` tool.
- **Quota in the status bar** (rolling 5h / weekly / monthly), with an 80%-monthly warning.
- **Zero runtime dependencies** — built only on Node.js and VS Code APIs.

## Requirements

- VS Code **1.104.0** or later, with the GitHub Copilot extension active
- An **OpenCode Go API key** ([get one here](https://opencode.ai/))

## Installation

From a VSIX:

```bash
git clone https://github.com/Y3R41D/opencode-go-provider.git
cd opencode-go-provider
bun install --ignore-scripts
bun run package:vsix
```

Then install the generated `opencode-go-provider-<version>.vsix` via Extensions →
`Install from VSIX...`.

From source: `bun install --ignore-scripts && bun run compile`, then press `F5` in VS Code to launch
the Extension Development Host.

## Setup

1. Open Copilot Chat (`Cmd/Ctrl + Alt + I`) and open the model picker.
2. Choose **Manage Models**, add or configure **OpenCode Go**, and enter your API key (or run
   `OpenCode Go: Manage OpenCode Go API Key` from the Command Palette).
3. Select **OpenCode Go** and a model, and start chatting.

## Usage

Pick **OpenCode Go** in Copilot Chat and choose a model. Your quota (rolling 5h / weekly / monthly)
is shown in the status bar and refreshes after every response. Click it or run
`OpenCode Go: Show OpenCode Go Usage` to see the full line with reset countdowns.

| Command | Purpose |
|---------|---------|
| `OpenCode Go: Manage OpenCode Go API Key` | Set or clear the API key. |
| `OpenCode Go: Show OpenCode Go Usage` | Full quota line with reset countdowns. |
| `OpenCode Go: Toggle Debug Logging` | Verbose request logs in the Output panel. |
| `OpenCode Go: Open Debug Log` | Reveal the extension's Output panel. |

## Supported Models

The list is fetched from the OpenCode Go API at runtime; a bundled `FALLBACK_MODELS` list
(`src/types.ts`) covers offline / first-run. Bundled ids: GLM-5/.1/.2/.3 · DeepSeek V4 Pro/Flash ·
Kimi K2.5/K2.6/K2.7 Code/K3 · MiMo-V2-Pro/Omni, V2.5-Pro/V2.5 · MiniMax M2.5/M2.7/M3 ·
Qwen3.5–3.8 Plus/Max · Grok 4.5 · GPT 5.6 Luna · Muse Spark 1.2 · Hy3. Full table with context
windows and API formats: [docs/models.md](docs/models.md).

> **Zen vs Go.** This extension targets the **OpenCode Go** endpoint (`/zen/go/v1`). The
> pay-as-you-go **Zen** endpoint (`/zen/v1`) hosts a different catalog — including many free models
> such as `deepseek-v4.1-flash-free` — that the Go API does not list, so they never appear in the
> picker. Both products share the same Console API key. Details:
> [docs/models.md](docs/models.md#zen-vs-go-two-endpoints-one-key).

## Privacy

- Your API key is stored in VS Code `SecretStorage` (`opencode-go.apiKey`).
- Requests go only to `https://opencode.ai/zen/go/v1`, and debug logs never contain the key.

## Development

Prerequisites: [Bun](https://bun.sh/) ≥ 1.2, VS Code ≥ 1.104.0.

```bash
bun install --ignore-scripts
bun run compile && bun run lint && bun run test -- --runInBand
```

Scripts: `compile`, `watch`, `test`, `test:coverage`, `lint`, `lint:fix`, `format`,
`check-changelog`, `sync:pi`, `sync:pi:write` (model-catalog sync), `package:vsix`. Press `F5` for
the Extension Development Host.

More: [Architecture](docs/architecture.md) · [Contributing](docs/contributing.md) ·
[CHANGELOG.md](CHANGELOG.md)

## Fork & Maintenance

```bash
git remote add upstream https://github.com/hidenobunagai/opencode-go-provider.git
git fetch upstream
git merge upstream/main    # or: git rebase upstream/main
bun install --ignore-scripts && bun run compile && bun run test -- --runInBand
```

Publishing under the fork's publisher (`Y3R41D`) needs a Marketplace PAT with the **Manage** scope;
see [docs/contributing.md](docs/contributing.md).

## License

[MIT](LICENSE). Original work © Hidenobu Nagai and contributors; fork maintained by
[@Y3R41D](https://github.com/Y3R41D).
