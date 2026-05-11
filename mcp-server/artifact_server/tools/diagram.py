import json

from mcp import types

from artifact_server.tools.base import BaseToolHandler, tool


class DiagramToolHandler(BaseToolHandler):
    @tool(meta={
        "ui": {"resourceUri": "ui://artifact-server/diagram.html"},
        "ui/resourceUri": "ui://artifact-server/diagram.html",
    })
    async def create_diagram(
        self,
        mermaid_syntax: str,
        title: str = "",
        subtitle: str = "",
    ) -> list[types.TextContent]:
        """Create a Mermaid diagram. The result renders in a UI widget — do not show the raw data in text.

        Args:
            mermaid_syntax: The Mermaid diagram definition (flowchart, sequence, etc.)
            title: Optional diagram title
            subtitle: Optional subtitle shown below the title
        """
        return [types.TextContent(type="text", text=json.dumps({
            "title": title,
            "mermaid": mermaid_syntax,
            "subtitle": subtitle,
        }))]
