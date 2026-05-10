# MCP Server with Artifacts

## Goal
Build a Python MCP server that produces interactive HTML artifacts (charts, tables, diagrams) displayed inline via the MCP Apps extension. Follows the same technology stack and patterns as the MedScout MCP server (`mcp-service`).

## Runtime & Transport (matching MedScout)
- **Language**: Python (>=3.10)
- **MCP SDK**: `mcp>=1.0.0`
- **Transport**: Streamable HTTP (via `FastMCP.streamable_http_app()` + Uvicorn)
- **HTTP Client**: `httpx>=0.27.0`
- **Validation**: `pydantic>=2.0.0`
- **ASGI**: `starlette>=0.27.0` + `uvicorn>=0.24.0`
- **Package Manager**: `uv`
- **Build System**: `hatchling`
- **Linting/Formatting**: `ruff==0.5.6`
- **Testing**: `pytest>=8.0.0` + `pytest-asyncio>=0.23.0`
- **Pre-commit**: `pre-commit>=3.8.0,<4.0.0` (Ruff hooks)
- **Task Runner**: `justfile`
- **Interactive UI**: MCP Apps extension (SEP-1865) — renders HTML in sandboxed iframes

## How MCP Apps Works (Python)
1. Register an HTML resource with a `ui://` URI and `mime_type="text/html;profile=mcp-app"`
2. Link tools to the UI resource via `meta={"ui": {"resourceUri": "ui://..."}}`
3. Claude renders the HTML in a sandboxed `<iframe>`
4. The iframe communicates with the host via `postMessage`-based JSON-RPC

No TypeScript required — FastMCP's `meta=` parameter and `@mcp.resource()` are sufficient.

Reference examples: `qr-server` and `say-server` in [ext-apps repo](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples).

## Tools to Implement
1. **create_chart** — takes data + chart config, returns an interactive Chart.js visualization
2. **create_table** — takes structured data, returns a styled interactive HTML table
3. **create_diagram** — takes Mermaid syntax, returns a rendered diagram
4. **create_html** — freeform HTML artifact for custom visualizations

## Architecture (following MedScout patterns)

### Project Structure
```
mcp-server-with-artifacts/
├── pyproject.toml                 # Dependencies, scripts, ruff config
├── uv.lock                       # Dependency lock file
├── justfile                       # Build/task automation
├── .pre-commit-config.yaml        # Ruff pre-commit hooks
├── .gitignore
├── README.md
└── artifact_server/               # Main package
    ├── __init__.py
    ├── fast.py                    # Server entry point (FastMCP + Uvicorn)
    ├── settings.py                # Configuration (env vars via pydantic)
    ├── tools/                     # Tool handler modules
    │   ├── __init__.py
    │   ├── base.py                # BaseToolHandler + @tool decorator
    │   ├── chart.py               # ChartToolHandler
    │   ├── table.py               # TableToolHandler
    │   ├── diagram.py             # DiagramToolHandler
    │   └── html.py                # HtmlToolHandler
    ├── templates/                 # HTML templates for MCP Apps
    │   ├── chart.html             # Chart.js template (bundled inline)
    │   ├── table.html             # Table template
    │   ├── diagram.html           # Mermaid diagram template
    │   └── html.html              # Freeform HTML template
    └── tests/
        ├── __init__.py
        └── test_tools.py          # pytest + pytest-asyncio
```

### Key Patterns (matching MedScout)

**Server entry point** (`fast.py`):
```python
import argparse
import uvicorn
from mcp.server.fastmcp import FastMCP
from artifact_server.settings import settings

mcp = FastMCP("artifact-server")

# Register tool handlers (MedScout pattern)
ChartToolHandler().register(mcp)
TableToolHandler().register(mcp)
DiagramToolHandler().register(mcp)
HtmlToolHandler().register(mcp)

# Register MCP Apps UI resources
@mcp.resource("ui://artifact-server/chart.html", mime_type="text/html;profile=mcp-app")
def chart_view() -> str:
    return load_template("chart.html")

app = mcp.streamable_http_app()

# Health check endpoint
@app.route("/health")
async def health(request):
    return JSONResponse({"status": "ok"})

def main():
    parser = argparse.ArgumentParser(description="Artifact MCP Server")
    parser.add_argument("--host", default=settings.host)
    parser.add_argument("--port", type=int, default=settings.port)
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port)
```

**Tool handler pattern** (`tools/base.py`):
```python
class BaseToolHandler:
    def register(self, mcp):
        """Auto-register all @tool-decorated methods with the MCP server."""
        # Introspects class for @tool() decorated methods and registers them
```

**Settings** (`settings.py`):
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 3003

settings = Settings()
```

### Dependencies (pyproject.toml)
```toml
[project]
name = "artifact-server"
version = "0.1.0"
description = "MCP server for interactive HTML artifacts"
requires-python = ">=3.10"
dependencies = [
    "mcp>=1.0.0",
    "httpx>=0.27.0",
    "pydantic>=2.0.0",
    "starlette>=0.27.0",
    "uvicorn>=0.24.0",
]

[project.scripts]
artifact-server = "artifact_server.fast:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "ruff==0.5.6",
    "pre-commit>=3.8.0,<4.0.0",
]

[tool.ruff]
line-length = 120

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

### Self-Contained HTML Strategy
- **Default**: Inline all CSS/JS in templates (no external dependencies)
- **Optional**: Use `_meta.ui.csp.resourceDomains` to whitelist CDNs if bundling is too large
- Chart.js and Mermaid.js are small enough to inline via copy or a build step

## Research Findings
- [x] How does the MCP Python SDK handle artifact/content responses?
  - 5 content types: TextContent, ImageContent, AudioContent, EmbeddedResource, ResourceLink
  - FastMCP auto-converts `str` returns to TextContent
  - Explicit `mcp.types.*` objects pass through as-is
- [x] What content types does Claude support for inline display?
  - Text, images (PNG/JPEG/GIF), and **MCP Apps HTML** (sandboxed iframe)
  - MCP Apps supported in both Claude Desktop and Claude.ai (web)
- [x] How are artifacts structured in the MCP protocol?
  - MCP Apps: `ui://` resource + `_meta.ui.resourceUri` on tools
  - Tool returns data as text/JSON; the UI resource renders it
  - Communication between iframe and host via postMessage JSON-RPC
- [x] Best practices for self-contained HTML artifacts?
  - Bundle all CSS/JS inline (use `vite-plugin-singlefile` or manual inlining)
  - Deny-by-default CSP — no external requests unless whitelisted via `_meta.ui.csp`
  - Use `@modelcontextprotocol/ext-apps` App class in the iframe for host communication

## Approach
1. ~~Research the MCP Python SDK and artifact capabilities~~ (done)
2. ~~Plan the architecture and file structure~~ (done)
3. Scaffold project (pyproject.toml, justfile, .pre-commit-config.yaml, settings)
4. Build `BaseToolHandler` with `@tool` decorator and auto-registration
5. Build tool handlers (chart, table, diagram, html)
6. Build HTML templates with inline Chart.js and Mermaid.js
7. Wire up `fast.py` with resource registrations and health check
8. Test with MCP Inspector (`npx @modelcontextprotocol/inspector`)
9. Configure and test in Claude Desktop / Claude.ai

## Status
**Ready to build** — research complete, architecture planned, aligned with MedScout stack.
