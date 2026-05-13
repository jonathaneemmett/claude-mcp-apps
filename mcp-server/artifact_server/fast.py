import argparse
import logging
import sys

import uvicorn
from mcp.server.fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.routing import Route

from artifact_server.settings import settings
from artifact_server.tools.chart import ChartToolHandler
from artifact_server.tools.html import HtmlToolHandler
from artifact_server.tools.table import TableToolHandler
from artifact_server.views import CHART_VIEW, HTML_VIEW, TABLE_VIEW

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

CDN_DOMAINS = ["https://unpkg.com", "https://cdn.jsdelivr.net"]

mcp = FastMCP(
    "artifact-server",
    transport_security={"allowed_hosts": ["localhost:3003", "mcp-server:3003"]},
)

# Register tool handlers
ChartToolHandler().register(mcp)
TableToolHandler().register(mcp)
HtmlToolHandler().register(mcp)


# Register MCP App UI resources — served verbatim to Claude's iframe
@mcp.resource(
    "ui://artifact-server/chart.html",
    mime_type="text/html;profile=mcp-app",
    meta={"ui": {"csp": {"resourceDomains": CDN_DOMAINS}}},
)
def chart_view() -> str:
    return CHART_VIEW


@mcp.resource(
    "ui://artifact-server/table.html",
    mime_type="text/html;profile=mcp-app",
    meta={"ui": {"csp": {"resourceDomains": CDN_DOMAINS}}},
)
def table_view() -> str:
    return TABLE_VIEW



@mcp.resource(
    "ui://artifact-server/html.html",
    mime_type="text/html;profile=mcp-app",
    meta={"ui": {"csp": {"resourceDomains": CDN_DOMAINS}}},
)
def html_view() -> str:
    return HTML_VIEW


# Health check
async def health(request):
    return JSONResponse({"status": "ok"})


app = mcp.streamable_http_app()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.routes.append(Route("/health", health))


def main():
    parser = argparse.ArgumentParser(description="Artifact MCP Server")
    parser.add_argument("--host", default=settings.host)
    parser.add_argument("--port", type=int, default=settings.port)
    parser.add_argument("--stdio", action="store_true", help="Run with stdio transport (for Claude Desktop)")
    args = parser.parse_args()

    if args.stdio:
        logger.info("Starting artifact-server with stdio transport")
        mcp.run(transport="stdio")
    else:
        logger.info("Starting artifact-server on %s:%s", args.host, args.port)
        uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
