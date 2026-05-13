'use client';

import { useState, useRef, useEffect } from 'react';
import type { UIMessage } from 'ai';

interface Command {
	name: string;
	description: string;
}

const COMMANDS: Command[] = [
	{ name: '/clear', description: 'Clear all widgets from the dashboard' },
	{ name: '/export', description: 'Export dashboard as image' },
	{ name: '/help', description: 'Show available commands' },
];

interface ChatBarProps {
	messages: UIMessage[];
	isLoading: boolean;
	onSend: (text: string) => void;
	onCommand?: (command: string) => void;
}

export function ChatBar({
	messages,
	isLoading,
	onSend,
	onCommand,
}: ChatBarProps) {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const [showPalette, setShowPalette] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredCommands = input.startsWith('/')
		? COMMANDS.filter((c) => c.name.startsWith(input.toLowerCase()))
		: [];

	useEffect(() => {
		const shouldShow = input.startsWith('/') && filteredCommands.length > 0;
		setShowPalette(shouldShow);
		setSelectedIndex(0);
	}, [input, filteredCommands.length]);

	function handleSubmit() {
		const value = input.trim();
		if (!value) return;

		if (value.startsWith('/')) {
			const cmd = COMMANDS.find(
				(c) => c.name === value.toLowerCase(),
			);
			if (cmd) {
				onCommand?.(cmd.name);
				setInput('');
				setShowPalette(false);
				return;
			}
		}

		onSend(value);
		setInput('');
		setShowPalette(false);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!showPalette) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex((i) =>
				i < filteredCommands.length - 1 ? i + 1 : 0,
			);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex((i) =>
				i > 0 ? i - 1 : filteredCommands.length - 1,
			);
		} else if (e.key === 'Tab' || e.key === 'Enter') {
			e.preventDefault();
			const cmd = filteredCommands[selectedIndex];
			if (cmd) {
				setInput(cmd.name);
				setShowPalette(false);
			}
		} else if (e.key === 'Escape') {
			setShowPalette(false);
		}
	}

	const lastAssistant = [...messages]
		.reverse()
		.find((m) => m.role === 'assistant');
	const lastText = lastAssistant?.parts.find((p) => p.type === 'text');
	const preview =
		lastText && 'text' in lastText
			? lastText.text.length > 120
				? lastText.text.slice(0, 120) + '...'
				: lastText.text
			: null;

	return (
		<div
			className='border-t border-neutral-200 bg-white'
			data-testid='chat-bar'
		>
			{open && (
				<div
					className='max-h-64 overflow-y-auto border-b border-neutral-100 px-6 py-3 space-y-2'
					data-testid='chat-history'
					role='log'
					aria-label='Chat history'
				>
					{messages.map((message) => (
						<div
							key={message.id}
							className={`text-sm ${
								message.role === 'user'
									? 'text-neutral-500'
									: 'text-neutral-800'
							}`}
						>
							<span className='font-medium text-xs uppercase text-neutral-400 mr-2'>
								{message.role === 'user' ? 'You' : 'AI'}
							</span>
							{message.parts
								.filter((p) => p.type === 'text')
								.map((p) => (
									<span key={'text' in p ? p.text.slice(0, 20) : ''}>
										{'text' in p ? p.text : ''}
									</span>
								))}
						</div>
					))}
				</div>
			)}

			{preview && !open && (
				<button
					onClick={() => setOpen(true)}
					className='w-full text-left px-6 py-2 text-xs text-neutral-500 hover:bg-neutral-50 border-b border-neutral-100'
					aria-label='Expand chat history'
					data-testid='chat-preview'
				>
					<span className='font-medium text-neutral-400'>
						AI:{' '}
					</span>
					{preview}
					<span className='ml-2 text-neutral-300'>
						(click to expand)
					</span>
				</button>
			)}

			{open && (
				<button
					onClick={() => setOpen(false)}
					className='w-full text-left px-6 py-1 text-xs text-neutral-400 hover:bg-neutral-50 border-b border-neutral-100'
					aria-label='Collapse chat history'
					data-testid='chat-collapse'
				>
					Hide chat history
				</button>
			)}

			<div className='relative px-6 py-3'>
				{showPalette && (
					<div
						className='absolute bottom-full left-6 right-6 mb-1 max-w-4xl mx-auto'
						role='listbox'
						aria-label='Command suggestions'
						data-testid='command-palette'
					>
						<div className='bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden'>
							{filteredCommands.map((cmd, i) => (
								<button
									key={cmd.name}
									role='option'
									aria-selected={i === selectedIndex}
									onClick={() => {
										setInput(cmd.name);
										setShowPalette(false);
										inputRef.current?.focus();
									}}
									className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 ${
										i === selectedIndex
											? 'bg-teal-50 text-teal-700'
											: 'text-neutral-700 hover:bg-neutral-50'
									}`}
									data-testid={`command-${cmd.name.slice(1)}`}
								>
									<span className='font-mono font-medium text-xs'>
										{cmd.name}
									</span>
									<span className='text-neutral-400'>
										{cmd.description}
									</span>
								</button>
							))}
						</div>
					</div>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					data-testid='chat-form'
				>
					<div className='flex gap-2 max-w-4xl mx-auto'>
						<input
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='Ask me to create a chart, table, or widget... (type / for commands)'
							disabled={isLoading}
							aria-label='Chat message input'
							aria-expanded={showPalette}
							aria-haspopup='listbox'
							role='combobox'
							autoComplete='off'
							className='flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm
									   focus:outline-none focus:ring-2 focus:ring-teal-600
									   disabled:opacity-50'
							data-testid='chat-input'
						/>
						<button
							type='submit'
							disabled={isLoading || !input.trim()}
							aria-label={isLoading ? 'Processing request' : 'Send message'}
							className='rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white
									   hover:bg-teal-800 disabled:opacity-50'
							data-testid='chat-send'
						>
							{isLoading ? 'Working...' : 'Send'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
