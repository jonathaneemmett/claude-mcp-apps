import json

from mcp import types

from artifact_server.tools.base import BaseToolHandler, tool


class ChartToolHandler(BaseToolHandler):
    @tool(meta={
        "ui": {"resourceUri": "ui://artifact-server/chart.html"},
        "ui/resourceUri": "ui://artifact-server/chart.html",
    })
    async def create_chart(
        self,
        title: str,
        labels: list[str],
        values: list[float],
        chart_type: str = "bar",
        subtitle: str = "",
    ) -> list[types.TextContent]:
        """Create an interactive chart. The result renders in a UI widget — do not show the raw data in text.

        Args:
            title: The title of the chart.
            labels: A list of labels for the data points (x-axis).
            values: A list of numerical values for each label.
            chart_type: The type of chart to create (bar, line, pie).
            subtitle: Optional subtitle shown below the title.
        """
        return [types.TextContent(type="text", text=json.dumps({
            "title": title,
            "labels": labels,
            "values": values,
            "chartType": chart_type,
            "subtitle": subtitle,
        }))]
