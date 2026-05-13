import { streamText, convertToModelMessages } from 'ai';
import { tool } from '@ai-sdk/provider-utils';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { getMcpClient } from '@/lib/mcp-client';
import type { DashboardStateItem } from '@/lib/types';

export async function POST(req: Request) {
	const { messages, dashboardState } = await req.json();

	const mcpClient = await getMcpClient();
	const mcpTools = await mcpClient.tools();

	const systemPrompt = buildSystemPrompt(dashboardState);

	const result = streamText({
		model: anthropic('claude-sonnet-4-20250514'),
		system: systemPrompt,
		messages: await convertToModelMessages(messages),
		tools: {
			...mcpTools,
			remove_widget: tool({
				description:
					'Remove a widget from the dashboard. Use the widget ID from the dashboard state.',
				inputSchema: z.object({
					widgetId: z.string().describe('The ID of the widget to remove'),
				}),
				execute: async ({ widgetId }) => ({ action: 'remove', widgetId }),
			}),
			reorder_widgets: tool({
				description:
					'Reorder widgets on the dashboard. Provide all widget IDs in the desired order.',
				inputSchema: z.object({
					widgetIds: z
						.array(z.string())
						.describe('Array of all widget IDs in the new display order'),
				}),
				execute: async ({ widgetIds }) => ({ action: 'reorder', widgetIds }),
			}),
			update_widget: tool({
				description:
					'Update an existing widget with new data. Use this to sort, filter, or modify data within a widget instead of creating a new one. Provide the widget ID and the complete new data object matching the original tool format.',
				inputSchema: z.object({
					widgetId: z.string().describe('The ID of the widget to update'),
					data: z.record(z.string(), z.unknown()).describe('The complete new data object for the widget'),
				}),
				execute: async ({ widgetId, data }) => ({ action: 'update', widgetId, data }),
			}),
		},
		onFinish: async () => {
			await mcpClient.close();
		},
		onError: async () => {
			await mcpClient.close();
		},
	});

	return result.toUIMessageStreamResponse();
}

function buildSystemPrompt(
	dashboardState?: DashboardStateItem[],
): string {
	let prompt = `You are a dashboard assistant that manages widgets on a user's dashboard.

TOOL CATEGORIES:
1. CREATION tools (create_chart, create_table, create_html) — ONLY use when the user asks for completely NEW data or visualizations.
2. MANAGEMENT tools (remove_widget, reorder_widgets, update_widget) — Use when the user asks to modify, sort, filter, remove, reorder, rearrange, or move existing widgets.

CRITICAL RULES:
- When the user refers to an existing widget (sort this table, reorder rows, change chart type, etc.), use update_widget with the widget ID — do NOT create a new widget.
- update_widget requires the complete new data object matching the original format (title, headers, rows, etc. for tables; title, labels, values, chartType for charts).
- When removing or reordering widgets on the dashboard, use remove_widget or reorder_widgets.
- Only use creation tools when the user asks for something that doesn't exist yet.
- Never mix creation and management tools in a single response.`;

	if (dashboardState && dashboardState.length > 0) {
		prompt += `\n\nThe user's dashboard currently has these widgets:\n`;
		for (const widget of dashboardState) {
			prompt += `- [${widget.position + 1}] "${widget.title}" (${widget.toolName}, id: ${widget.id})\n`;
		}
	} else {
		prompt += `\n\nThe dashboard is currently empty.`;
	}

	return prompt;
}
