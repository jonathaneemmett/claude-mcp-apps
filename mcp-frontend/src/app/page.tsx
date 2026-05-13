'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Dashboard } from '@/components/dashboard';
import { ChatBar } from '@/components/chat-bar';
import { parseToolOutput } from '@/lib/parse-tool-output';
import { store, useAppDispatch, useAppSelector } from '@/redux/store';
import type { Artifact } from '@/redux/slices/dashboardSlice';
import {
	addArtifact,
	removeArtifact,
	reorderArtifacts,
	updateArtifact,
	clearDashboard,
} from '@/redux/slices/dashboardSlice';
import { showToast } from '@/redux/slices/toastSlice';
import { ToastContainer } from '@/components/toast-container';

const META_TOOLS = new Set(['remove_widget', 'reorder_widgets', 'update_widget']);

export default function Home() {
	const dispatch = useAppDispatch();
	const artifacts: Artifact[] = useAppSelector(
		(state) => state.dashboard.artifacts,
	);
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				body: () => ({
					dashboardState: store
						.getState()
						.dashboard.artifacts.map((a: Artifact) => ({
							id: a.id,
							toolName: a.toolName,
							title: a.title,
							position: a.position,
						})),
				}),
			}),
		[],
	);

	const { messages, sendMessage, status } = useChat({
		transport,
	});
	const isLoading = status === 'streaming' || status === 'submitted';

	// Track which meta tool calls we've already handled
	const handledToolCalls = useRef(new Set<string>());

	// Process messages: sync artifacts to Redux + handle meta tools
	useEffect(() => {
		for (const message of messages) {
			if (message.role !== 'assistant') continue;
			for (const part of message.parts) {
				if (part.type !== 'dynamic-tool') continue;

				// Only process output-available state, once per tool call
				if (
					part.state !== 'output-available' ||
					!part.output ||
					handledToolCalls.current.has(part.toolCallId)
				) {
					continue;
				}
				handledToolCalls.current.add(part.toolCallId);

				// Handle meta tools
				if (META_TOOLS.has(part.toolName)) {
					const result = typeof part.output === 'string'
						? JSON.parse(part.output)
						: part.output;

					if (result?.action === 'remove') {
						const widget = store
							.getState()
							.dashboard.artifacts.find(
								(a: Artifact) => a.id === result.widgetId,
							);
						dispatch(removeArtifact(result.widgetId));
						dispatch(
							showToast(
								widget
									? `${widget.title} removed`
									: 'Widget removed',
							),
						);
					}

					if (result?.action === 'reorder') {
						dispatch(reorderArtifacts(result.widgetIds));
						dispatch(showToast('Dashboard reordered'));
					}

					if (result?.action === 'update') {
						dispatch(
							updateArtifact({
								id: result.widgetId,
								data: result.data,
							}),
						);
						dispatch(showToast('Widget updated'));
					}
					continue;
				}

				// Sync MCP tool results to Redux
				const data = parseToolOutput(part.output);
				if (data) {
					const title =
						typeof data.title === 'string' && data.title
							? data.title
							: 'Widget';
					dispatch(
						addArtifact({
							id: part.toolCallId,
							toolName: part.toolName,
							data,
						}),
					);
					dispatch(showToast(`${title} added to dashboard`));
				}
			}
		}
	}, [messages, dispatch]);

	// Track in-flight tool calls for skeleton cards
	const pendingTools = useMemo(() => {
		const pending: { toolCallId: string; toolName: string }[] = [];
		for (const message of messages) {
			if (message.role !== 'assistant') continue;
			for (const part of message.parts) {
				if (
					part.type === 'dynamic-tool' &&
					(part.state === 'input-streaming' ||
						part.state === 'input-available') &&
					!META_TOOLS.has(part.toolName)
				) {
					pending.push({
						toolCallId: part.toolCallId,
						toolName: part.toolName,
					});
				}
			}
		}
		return pending;
	}, [messages]);

	const dashboardRef = useRef<HTMLElement>(null);

	return (
		<div className='flex flex-col h-full bg-neutral-50' data-testid='page-root'>
			<header className='border-b border-neutral-200 bg-white px-6 py-3' data-testid='page-header'>
				<h1 className='text-lg font-semibold text-neutral-800'>
					MCP Dashboard
				</h1>
			</header>

			<main ref={dashboardRef} className='flex-1 overflow-y-auto p-6' data-testid='page-main'>
			<div className='max-w-7xl mx-auto'>
				<Dashboard
					artifacts={artifacts}
					pendingTools={pendingTools}
					onSend={(text: string) => sendMessage({ text })}
				/>
			</div>
			</main>

			<ChatBar
				messages={messages}
				isLoading={isLoading}
				onSend={(text: string) => sendMessage({ text })}
				onCommand={(cmd: string) => {
					switch (cmd) {
						case '/clear':
							dispatch(clearDashboard());
							dispatch(showToast('Dashboard cleared'));
							break;
						case '/export':
							if (dashboardRef.current) {
								import('html2canvas').then(
									({ default: html2canvas }) => {
										html2canvas(
											dashboardRef.current!,
											{
												backgroundColor: '#fafafa',
												scale: 2,
											},
										).then((canvas: HTMLCanvasElement) => {
											const link =
												document.createElement('a');
											link.download = 'dashboard.png';
											link.href =
												canvas.toDataURL('image/png');
											link.click();
											dispatch(
												showToast(
													'Dashboard exported as PNG',
												),
											);
										});
									},
								);
							}
							break;
						case '/help':
							dispatch(
								showToast(
									'Commands: /clear, /export, /help',
								),
							);
							break;
					}
				}}
			/>

			<ToastContainer />
		</div>
	);
}
