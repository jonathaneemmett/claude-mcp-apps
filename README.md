# MCP Dashboard

An AI-powered dashboard builder. Chat with an LLM to create charts, tables, and HTML widgets — they appear as interactive cards on a live dashboard.

Built with Next.js 16, the Vercel AI SDK, and a Python MCP server.

## Architecture

```
mcp-server/          Python MCP server (FastMCP + Uvicorn, port 3003)
mcp-frontend/        Next.js 16 app (Turbopack, port 3000)
docker-compose.yml   Orchestrates both services
```

The frontend connects to the MCP server via Streamable HTTP. When a user sends a chat message, the Next.js API route calls Claude with the MCP tools available. Tool results render as dashboard widgets.

## Quick Start

```bash
# 1. Copy env file and add your Anthropic API key
cp .env.example .env

# 2. Start both services
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key (required) | — |
| `MCP_SERVER_URL` | MCP server endpoint | `http://localhost:3003/mcp` |

See `.env.example` for a template.

## Features

### Dashboard
- **Widget grid** — charts, tables, and HTML widgets in a responsive 2-column layout
- **Drag-and-drop** — reorder widgets by dragging
- **Widget toolbar** — hover any card for data preview, PNG export, expand, or remove
- **Column sorting** — click table headers to sort ascending/descending
- **Drill-down** — click chart bars or table rows to ask follow-up questions
- **Skeleton loading** — shimmer placeholders while tools execute
- **Animated transitions** — smooth enter/exit/reorder via framer-motion
- **Persist state** — dashboard survives page reloads (localStorage)

### Chat
- **Chat bar** — pinned to the bottom, expandable message history
- **Suggested prompts** — clickable chips on empty dashboard
- **Command palette** — type `/` for commands (`/clear`, `/export`, `/help`)
- **LLM context** — system prompt includes current dashboard state so the LLM can reference widgets

### LLM Tools
- `create_chart` — bar, line, or pie chart (D3.js)
- `create_table` — styled table with sortable columns
- `create_html` — freeform HTML content
- `remove_widget` — remove a widget by ID
- `reorder_widgets` — reorder dashboard widgets
- `update_widget` — update existing widget data in-place

### Export
- **Individual widget** — download as PNG via toolbar button
- **Full dashboard** — `/export` command captures entire dashboard
- **Copy JSON** — copy raw widget data to clipboard

## Development

### Local (without Docker)

**MCP Server:**
```bash
cd mcp-server
uv sync
uv run artifact-server --host 0.0.0.0 --port 3003
```

**Frontend:**
```bash
cd mcp-frontend
yarn install
yarn dev
```

### Docker (dev mode)

The `docker-compose.override.yml` enables hot reload with volume mounts:

```bash
docker compose up --build
```

Source changes in `mcp-frontend/src/` are reflected immediately via Turbopack HMR.

### Docker (production)

Remove or rename `docker-compose.override.yml` to use the production Dockerfile (multi-stage build with `next build` + `next start`):

```bash
mv docker-compose.override.yml docker-compose.override.yml.bak
docker compose up --build
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| State | Redux Toolkit, localStorage persistence |
| AI | Vercel AI SDK v6, Anthropic Claude |
| MCP | `@ai-sdk/mcp`, Streamable HTTP transport |
| Charts | D3.js v7 |
| Animation | framer-motion |
| Export | html2canvas |
| Server | Python 3.10+, FastMCP, Uvicorn, Starlette |
| Infra | Docker Compose, Turbopack |

## Project Structure

```
mcp-frontend/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    API route (streamText + MCP tools)
│   │   ├── layout.tsx           Root layout with Redux Provider
│   │   ├── page.tsx             Main page (dashboard + chat bar)
│   │   └── providers.tsx        Redux store provider
│   ├── components/
│   │   ├── card.tsx             Shared card wrapper
│   │   ├── chart.tsx            D3.js chart widget
│   │   ├── chat-bar.tsx         Chat input + command palette
│   │   ├── dashboard.tsx        Widget grid + toolbar + DnD
│   │   ├── data-table.tsx       Sortable table widget
│   │   ├── html-preview.tsx     HTML iframe widget
│   │   ├── icons.tsx            Shared SVG icon components
│   │   └── toast-container.tsx  Toast notifications
│   ├── lib/
│   │   ├── mcp-client.ts        MCP client factory
│   │   ├── parse-tool-output.ts Tool output parser
│   │   └── types.ts             Shared TypeScript interfaces
│   └── redux/
│       ├── middleware/
│       │   └── persistDashboard.ts  localStorage sync
│       ├── slices/
│       │   ├── dashboardSlice.ts    Widget state
│       │   └── toastSlice.ts        Toast state
│       └── store.ts                 Redux store config
mcp-server/
├── artifact_server/
│   ├── fast.py              Entry point (FastMCP + Uvicorn)
│   ├── settings.py          Server config
│   ├── styles.py            CSS design tokens
│   ├── views.py             MCP App HTML templates
│   └── tools/
│       ├── base.py          BaseToolHandler
│       ├── chart.py         create_chart tool
│       ├── table.py         create_table tool
│       └── html.py          create_html tool
├── pyproject.toml
└── Dockerfile
```

## Conductor

This repo includes a `.env.conductor` file (gitignored) for use with [Conductor](https://www.conductor.build/), a macOS app for running parallel AI coding agents.
