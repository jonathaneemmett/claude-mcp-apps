import json

import pytest

from artifact_server.tools.chart import ChartToolHandler
from artifact_server.tools.diagram import DiagramToolHandler
from artifact_server.tools.html import HtmlToolHandler
from artifact_server.tools.table import TableToolHandler


class TestChartToolHandler:
    @pytest.fixture
    def handler(self):
        return ChartToolHandler()

    async def test_create_chart_returns_json(self, handler):
        result = await handler.create_chart(title="Sales", labels=["Q1", "Q2"], values=[100, 200])
        data = json.loads(result[0].text)
        assert data["title"] == "Sales"
        assert data["labels"] == ["Q1", "Q2"]
        assert data["values"] == [100, 200]
        assert data["chartType"] == "bar"

    async def test_create_chart_line(self, handler):
        result = await handler.create_chart(title="T", labels=["A"], values=[1], chart_type="line")
        data = json.loads(result[0].text)
        assert data["chartType"] == "line"

    async def test_create_chart_pie(self, handler):
        result = await handler.create_chart(title="T", labels=["A", "B"], values=[60, 40], chart_type="pie")
        data = json.loads(result[0].text)
        assert data["chartType"] == "pie"


class TestTableToolHandler:
    @pytest.fixture
    def handler(self):
        return TableToolHandler()

    async def test_create_table_returns_json(self, handler):
        result = await handler.create_table(headers=["Name", "Age"], rows=[["Alice", "30"]])
        data = json.loads(result[0].text)
        assert data["headers"] == ["Name", "Age"]
        assert data["rows"] == [["Alice", "30"]]


class TestDiagramToolHandler:
    @pytest.fixture
    def handler(self):
        return DiagramToolHandler()

    async def test_create_diagram_returns_json(self, handler):
        result = await handler.create_diagram(mermaid_syntax="graph TD\n    A-->B")
        data = json.loads(result[0].text)
        assert data["mermaid"] == "graph TD\n    A-->B"


class TestHtmlToolHandler:
    @pytest.fixture
    def handler(self):
        return HtmlToolHandler()

    async def test_create_html_returns_json(self, handler):
        result = await handler.create_html(html_content="<p>Hello</p>")
        data = json.loads(result[0].text)
        assert data["html"] == "<p>Hello</p>"
