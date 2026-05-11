import json

from mcp import types

from artifact_server.tools.base import BaseToolHandler, tool


class TableToolHandler(BaseToolHandler):
    @tool(meta={
        "ui": {"resourceUri": "ui://artifact-server/table.html"},
        "ui/resourceUri": "ui://artifact-server/table.html",
    })
    async def create_table(
        self,
        headers: list[str],
        rows: list[list[str]],
        title: str = "",
        subtitle: str = "",
        footer: str = "",
    ) -> list[types.TextContent]:
        """Create a styled HTML table. The result renders in a UI widget — do not show the raw data in text.

        Args:
            headers: Column header labels
            rows: List of rows, each row is a list of cell values
            title: Optional table title
            subtitle: Optional subtitle shown below the title
            footer: Optional footer text shown below the table
        """
        return [types.TextContent(type="text", text=json.dumps({
            "title": title,
            "headers": headers,
            "rows": rows,
            "subtitle": subtitle,
            "footer": footer,
        }))]
