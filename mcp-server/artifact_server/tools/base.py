import functools
import inspect


def tool(meta=None):
    """Decorator to mark a method as an MCP tool."""
    def decorator(func):
        func._is_tool = True
        func._tool_meta = meta
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        wrapper._is_tool = True
        wrapper._tool_meta = meta
        return wrapper
    return decorator


class BaseToolHandler:
    def register(self, mcp):
        """Auto-register all @tool-decorated methods with the MCP server."""
        for name, method in inspect.getmembers(self, predicate=inspect.ismethod):
            if getattr(method, "_is_tool", False):
                meta = getattr(method, "_tool_meta", None)
                if meta:
                    mcp.tool(meta=meta)(method)
                else:
                    mcp.tool()(method)
