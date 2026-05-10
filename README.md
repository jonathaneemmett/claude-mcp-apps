# Artifact Server

A Python MCP server that renders interactive visualizations (charts, tables, diagrams) directly inside Claude Desktop using the MCP Apps extension.

## Tools

| Tool | Description |
|---|---|
| `create_chart` | Bar, line, or pie chart via D3.js |
| `create_table` | Styled HTML table |
| `create_diagram` | Mermaid diagram (flowchart, sequence, etc.) |
| `create_html` | Freeform HTML content |

## Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) package manager
- Claude Desktop

## Installation

```bash
git clone <repo-url>
cd mcp-server-with-artifacts
uv sync
```

## Configure Claude Desktop

Add the server to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "artifact-server": {
      "command": "uv",
      "args": [
        "--directory", "/absolute/path/to/mcp-server-with-artifacts",
        "run", "artifact-server", "--stdio"
      ]
    }
  }
}
```

Replace `/absolute/path/to/mcp-server-with-artifacts` with the actual path to this project.

After editing, **fully quit** Claude Desktop (Cmd+Q / Alt+F4) and reopen it.

## Verify

In Claude Desktop, look for the tools icon in the chat input. You should see `create_chart`, `create_table`, `create_diagram`, and `create_html` listed under `artifact-server`.

## Usage Examples

### Bar Chart

```
Use the create_chart tool with title "Quarterly Revenue",
labels ["Q1","Q2","Q3","Q4"], values [120000,200000,150000,300000],
chart_type "bar"
```

### Line Chart

```
Use the create_chart tool with title "Monthly Users",
labels ["Jan","Feb","Mar","Apr","May","Jun"],
values [10000,25000,40000,35000,60000,80000], chart_type "line"
```

### Pie Chart

```
Use the create_chart tool with title "Market Share",
labels ["Product A","Product B","Product C","Other"],
values [45,25,20,10], chart_type "pie"
```

### Table

```
Use the create_table tool with title "Team Directory",
headers ["Name","Role","Department","Status"],
rows [["Alice","Engineer","Platform","Active"],
      ["Bob","Designer","Product","Active"],
      ["Carol","PM","Analytics","On Leave"]]
```

### Mermaid Diagram

```
Use the create_diagram tool with title "Deploy Pipeline",
mermaid_syntax "graph LR
    A[Code Push] --> B[CI Build]
    B --> C{Tests Pass?}
    C -->|Yes| D[Deploy Staging]
    C -->|No| E[Fix & Retry]
    D --> F[Production]"
```

### Freeform HTML

```
Use the create_html tool with title "KPI Summary",
html_content "<div style='display:flex;gap:16px'>
  <div style='flex:1;padding:16px;background:#D6F6F1;border-radius:8px;text-align:center'>
    <div style='font-size:2rem;font-weight:700'>$1.2M</div>
    <div style='font-size:.8rem;color:#525252'>Revenue</div>
  </div>
</div>"
```

## Running the HTTP Server

For development or remote access, run with Streamable HTTP transport:

```bash
uv run artifact-server
# Starts on http://localhost:3003

uv run artifact-server --port 8000
# Custom port
```

Health check: `GET http://localhost:3003/health`

## Development

```bash
# Install dependencies
uv sync

# Run tests
uv run pytest

# Lint
uv run ruff check .

# Format
uv run ruff format .
```

## How It Works

This server uses [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) (SEP-1865) to render interactive HTML directly in Claude's chat. Unlike standard MCP tool responses which Claude can rewrite, MCP Apps deliver HTML verbatim to a sandboxed iframe.

1. Each tool declares a `_meta.ui.resourceUri` pointing to a `ui://` resource
2. The server registers HTML views as resources with MIME type `text/html;profile=mcp-app`
3. Views use the `@modelcontextprotocol/ext-apps` SDK to perform the `ui/initialize` handshake
4. When Claude calls a tool, the view receives the data via `ontoolresult` and renders it with D3.js/Mermaid

## Stack

- **Python** with FastMCP (`mcp` SDK)
- **D3.js** for charts (bar, line, pie)
- **Mermaid.js** for diagrams
- **MCP Apps** (`@modelcontextprotocol/ext-apps`) for iframe rendering
- **uv** for package management
- **ruff** for linting/formatting
- **pytest** for testing
