import { createMCPClient } from '@ai-sdk/mcp';

const MCP_SERVER_URL =
	process.env.MCP_SERVER_URL ?? 'http://localhost:3003/mcp';

export async function getMcpClient() {
	return createMCPClient({
		transport: {
			type: 'http',
			url: MCP_SERVER_URL,
		},
	});
}
