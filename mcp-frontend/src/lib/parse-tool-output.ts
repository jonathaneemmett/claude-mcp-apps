export function parseToolOutput(output: unknown): Record<string, unknown> | null {
	try {
		const raw = typeof output === 'string' ? JSON.parse(output) : output;

		// MCP tools return {content: [{type: "text", text: "..."}]}
		if (raw?.content && Array.isArray(raw.content)) {
			const textContent = raw.content.find(
				(c: { type: string }) => c.type === 'text',
			);
			if (textContent?.text) {
				return JSON.parse(textContent.text);
			}
		}

		if (typeof raw === 'string') {
			return JSON.parse(raw);
		}

		return raw as Record<string, unknown>;
	} catch {
		return null;
	}
}
