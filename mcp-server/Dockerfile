FROM python:3.14-slim

RUN pip install uv

WORKDIR /app

COPY pyproject.toml uv.lock README.md ./
COPY artifact_server/ artifact_server/
RUN uv sync --frozen --no-editable

EXPOSE 3003

CMD ["uv", "run", "artifact-server", "--host", "0.0.0.0", "--port", "3003"]
