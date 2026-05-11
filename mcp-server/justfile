default:
	@just --list

# Run the server locally
run:
	cd artifact_server && uv run artifact-server

# Run with custom port
run-port port="3003":
	cd artifact_server && uv run artifact-server --port {{port}}

# Run tests
test:
	cd artifact_server && uv run pytest

# Lint check
lint-check:
	cd artifact_server && uv run ruff check .

# Lint fix
lint-fix:
	cd artifact_server && uv run ruff check --fix .

# Format check
format-check:
	cd artifact_server && uv run ruff format --check .

# Format fix
format-fix:
	cd artifact_server && uv run ruff format .

# Install dependencies
install:
	cd artifact_server && uv sync

# Clean
clean:
	rm -rf artifact_server/.venv artifact_server/__pycache__
