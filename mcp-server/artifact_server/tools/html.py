import json

from mcp import types

from artifact_server.tools.base import BaseToolHandler, tool


class HtmlToolHandler(BaseToolHandler):
    @tool(meta={
        "ui": {"resourceUri": "ui://artifact-server/html.html"},
        "ui/resourceUri": "ui://artifact-server/html.html",
    })
    async def create_html(
        self,
        html_content: str,
        title: str = "",
        subtitle: str = "",
    ) -> list[types.TextContent]:
        """Create a freeform HTML visualization. The result renders in a UI widget — do not show the raw data in text.

        Args:
            html_content: HTML content to render (can include CSS and JS)
            title: Optional artifact title
            subtitle: Optional subtitle shown below the title
        """
        return [types.TextContent(type="text", text=json.dumps({
            "title": title,
            "html": html_content,
            "subtitle": subtitle,
        }))]
