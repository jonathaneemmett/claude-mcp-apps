'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Artifact } from '@/redux/slices/dashboardSlice';
import type { ChartData, TableData, HtmlData } from '@/lib/types';
import { useAppDispatch } from '@/redux/store';
import { removeArtifact, reorderArtifacts } from '@/redux/slices/dashboardSlice';
import { showToast } from '@/redux/slices/toastSlice';
import { CloseIcon, ExpandIcon, DownloadIcon, InfoIcon } from './icons';
import { Chart } from './chart';
import { DataTable } from './data-table';
import { HtmlPreview } from './html-preview';

interface PendingTool {
	toolCallId: string;
	toolName: string;
}

const SUGGESTED_PROMPTS = [
	'Show a bar chart of the top 5 most populated countries',
	'Create a table of programming languages with year created and creator',
	'Show a pie chart of global energy sources',
	'Build a line chart of average temperature by month',
];

interface DashboardProps {
	artifacts: Artifact[];
	pendingTools?: PendingTool[];
	onSend?: (text: string) => void;
}

export function Dashboard({
	artifacts,
	pendingTools = [],
	onSend,
}: DashboardProps) {
	const dispatch = useAppDispatch();
	const [expanded, setExpanded] = useState<string | null>(null);
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);

	const resolvedIds = new Set(artifacts.map((a) => a.id));
	const activePending = pendingTools.filter(
		(p) => !resolvedIds.has(p.toolCallId),
	);

	function handleDragStart(id: string) {
		setDraggedId(id);
	}

	function handleDragOver(e: React.DragEvent, id: string) {
		e.preventDefault();
		if (id !== draggedId) {
			setDragOverId(id);
		}
	}

	function handleDrop(targetId: string) {
		if (!draggedId || draggedId === targetId) {
			setDraggedId(null);
			setDragOverId(null);
			return;
		}

		const ids = artifacts.map((a) => a.id);
		const fromIndex = ids.indexOf(draggedId);
		const toIndex = ids.indexOf(targetId);
		if (fromIndex === -1 || toIndex === -1) return;

		ids.splice(fromIndex, 1);
		ids.splice(toIndex, 0, draggedId);

		dispatch(reorderArtifacts(ids));
		dispatch(showToast('Dashboard reordered'));
		setDraggedId(null);
		setDragOverId(null);
	}

	function handleDragEnd() {
		setDraggedId(null);
		setDragOverId(null);
	}

	if (artifacts.length === 0 && activePending.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className='flex flex-col items-center justify-center h-full gap-6'
				data-testid='dashboard-empty'
			>
				<div className='text-center'>
					<h2 className='text-lg font-medium text-neutral-700'>
						What would you like to see?
					</h2>
					<p className='text-sm text-neutral-400 mt-1'>
						Ask me to create charts, tables, or HTML widgets.
					</p>
				</div>
				<div
					className='flex flex-wrap justify-center gap-2 max-w-2xl'
					role='group'
					aria-label='Suggested prompts'
				>
					{SUGGESTED_PROMPTS.map((prompt) => (
						<button
							key={prompt}
							onClick={() => onSend?.(prompt)}
							aria-label={`Create: ${prompt}`}
							data-testid='suggested-prompt'
							className='rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600
									   hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50
									   transition-colors shadow-sm'
						>
							{prompt}
						</button>
					))}
				</div>
			</motion.div>
		);
	}

	return (
		<>
			<LayoutGroup>
				<div
					className='grid grid-cols-1 lg:grid-cols-2 gap-6'
					data-testid='dashboard-grid'
				>
					<AnimatePresence mode='popLayout'>
						{artifacts.map((artifact) => (
							<motion.div
								key={artifact.id}
								layout
								draggable
								onDragStart={() => handleDragStart(artifact.id)}
								onDragOver={(e) => handleDragOver(e, artifact.id)}
								onDrop={() => handleDrop(artifact.id)}
								onDragEnd={handleDragEnd}
								initial={{ opacity: 0, scale: 0.95, y: 12 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -12 }}
								transition={{
									layout: { duration: 0.3, ease: 'easeInOut' },
									opacity: { duration: 0.2 },
									scale: { duration: 0.2 },
								}}
								className={`${
									artifact.gridSize === 'full'
										? 'lg:col-span-2'
										: 'lg:col-span-1'
								} ${
									draggedId === artifact.id
										? 'opacity-50'
										: ''
								} ${
									dragOverId === artifact.id
										? 'ring-2 ring-teal-400 ring-offset-2 rounded-lg'
										: ''
								}`}
							>
								<WidgetCard
									artifact={artifact}
									onExpand={() => setExpanded(artifact.id)}
									onDrillDown={onSend}
								/>
							</motion.div>
						))}
						{activePending.map((pending) => (
							<motion.div
								key={pending.toolCallId}
								layout
								initial={{ opacity: 0, scale: 0.95, y: 12 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.2 }}
								className='lg:col-span-1'
							>
								<SkeletonCard toolName={pending.toolName} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</LayoutGroup>

			<AnimatePresence>
				{expanded && (
					<ExpandedOverlay
						artifact={artifacts.find((a) => a.id === expanded)!}
						onClose={() => setExpanded(null)}
					/>
				)}
			</AnimatePresence>
		</>
	);
}

function ToolbarButton({
	onClick,
	label,
	title,
	active,
	variant = 'default',
	children,
}: {
	onClick: () => void;
	label: string;
	title: string;
	active?: boolean;
	variant?: 'default' | 'danger';
	children: React.ReactNode;
}) {
	const baseClass = 'rounded-md border p-1.5 shadow-sm';
	const variantClass = active
		? 'bg-teal-50 border-teal-200 text-teal-600'
		: variant === 'danger'
			? 'bg-white/90 border-neutral-200 text-neutral-500 hover:text-red-600 hover:bg-white'
			: 'bg-white/90 border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-white';

	return (
		<button
			onClick={onClick}
			aria-label={label}
			title={title}
			className={`${baseClass} ${variantClass}`}
			data-testid={`widget-action-${title.toLowerCase().replace(/\s+/g, '-')}`}
		>
			{children}
		</button>
	);
}

function WidgetCard({
	artifact,
	onExpand,
	onDrillDown,
}: {
	artifact: Artifact;
	onExpand: () => void;
	onDrillDown?: (query: string) => void;
}) {
	const dispatch = useAppDispatch();
	const [showData, setShowData] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	const handleExportPng = useCallback(async () => {
		if (!cardRef.current) return;
		const html2canvas = (await import('html2canvas')).default;
		const canvas = await html2canvas(cardRef.current, {
			backgroundColor: '#ffffff',
			scale: 2,
		});
		const link = document.createElement('a');
		link.download = `${artifact.title.replace(/\s+/g, '-').toLowerCase()}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
		dispatch(showToast('Exported as PNG'));
	}, [artifact.title, dispatch]);

	return (
		<div className='group relative' data-testid={`widget-card-${artifact.id}`}>
			<div className='absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
				<ToolbarButton
					onClick={() => setShowData((v) => !v)}
					label={showData ? 'Hide raw data' : 'View raw data'}
					title='View data'
					active={showData}
				>
					<InfoIcon />
				</ToolbarButton>
				<ToolbarButton
					onClick={handleExportPng}
					label='Export widget as PNG'
					title='Export as PNG'
				>
					<DownloadIcon />
				</ToolbarButton>
				<ToolbarButton
					onClick={onExpand}
					label='Expand widget to full screen'
					title='Expand'
				>
					<ExpandIcon />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => {
						dispatch(removeArtifact(artifact.id));
						dispatch(showToast(`${artifact.title} removed`));
					}}
					label={`Remove ${artifact.title}`}
					title='Remove'
					variant='danger'
				>
					<CloseIcon />
				</ToolbarButton>
			</div>

			<div ref={cardRef}>
				<DashboardCard artifact={artifact} onDrillDown={onDrillDown} />
			</div>

			<AnimatePresence>
				{showData && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className='overflow-hidden'
					>
						<div className='bg-neutral-50 border border-t-0 border-gray-200 rounded-b-lg px-4 py-3'>
							<div className='flex items-center justify-between mb-2'>
								<span className='text-xs font-medium text-neutral-500'>
									Raw data
								</span>
								<button
									onClick={() => {
										navigator.clipboard.writeText(
											JSON.stringify(artifact.data, null, 2),
										);
										dispatch(showToast('Copied to clipboard'));
									}}
									className='text-xs text-teal-600 hover:text-teal-800'
									aria-label='Copy raw data as JSON'
									data-testid='copy-json'
								>
									Copy JSON
								</button>
							</div>
							<pre
								className='text-xs text-neutral-600 overflow-x-auto max-h-48 overflow-y-auto'
								data-testid='raw-data'
							>
								{JSON.stringify(artifact.data, null, 2)}
							</pre>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function ExpandedOverlay({
	artifact,
	onClose,
}: {
	artifact: Artifact;
	onClose: () => void;
}) {
	const overlayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleEscape(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		document.addEventListener('keydown', handleEscape);
		overlayRef.current?.focus();
		return () => document.removeEventListener('keydown', handleEscape);
	}, [onClose]);

	return (
		<motion.div
			ref={overlayRef}
			tabIndex={-1}
			role='dialog'
			aria-modal='true'
			aria-label={`Expanded view: ${artifact.title}`}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.15 }}
			className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8 focus:outline-none'
			onClick={onClose}
			data-testid='expanded-overlay'
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.2, ease: 'easeOut' }}
				className='bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto p-6 relative'
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className='absolute top-3 right-3 rounded-md p-1.5 text-neutral-400 hover:text-neutral-800'
					aria-label='Close expanded view'
					data-testid='close-expanded'
				>
					<CloseIcon className='w-5 h-5' />
				</button>
				<DashboardCard artifact={artifact} />
			</motion.div>
		</motion.div>
	);
}

function SkeletonCard({ toolName }: { toolName: string }) {
	const label =
		toolName === 'create_chart'
			? 'chart'
			: toolName === 'create_table'
				? 'table'
				: 'widget';

	return (
		<div
			className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse'
			role='status'
			aria-label={`Loading ${label}`}
			data-testid='skeleton-card'
		>
			<div className='h-4 w-32 bg-neutral-200 rounded mb-3' />
			<div className='h-3 w-20 bg-neutral-100 rounded mb-4' />
			<div className='space-y-2'>
				<div className='h-3 bg-neutral-100 rounded w-full' />
				<div className='h-3 bg-neutral-100 rounded w-5/6' />
				<div className='h-3 bg-neutral-100 rounded w-4/6' />
				<div className='h-24 bg-neutral-100 rounded w-full' />
			</div>
			<p className='mt-3 text-xs text-neutral-400 text-center'>
				Creating {label}...
			</p>
		</div>
	);
}

function DashboardCard({
	artifact,
	onDrillDown,
}: {
	artifact: Artifact;
	onDrillDown?: (query: string) => void;
}) {
	switch (artifact.toolName) {
		case 'create_chart':
			return (
				<Chart
					{...(artifact.data as unknown as ChartData)}
					onDrillDown={
						onDrillDown
							? (label: string, value: number) =>
									onDrillDown(
										`Tell me more about "${label}" (value: ${value}) from the "${artifact.title}" chart`,
									)
							: undefined
					}
				/>
			);
		case 'create_table':
			return (
				<DataTable
					{...(artifact.data as unknown as TableData)}
					onDrillDown={
						onDrillDown
							? (rowLabel: string) =>
									onDrillDown(
										`Tell me more about "${rowLabel}" from the "${artifact.title}" table`,
									)
							: undefined
					}
				/>
			);
		case 'create_html':
			return <HtmlPreview {...(artifact.data as unknown as HtmlData)} />;
		default:
			return (
				<div
					className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm'
					data-testid='widget-unknown'
				>
					<pre className='text-sm text-gray-500'>
						{JSON.stringify(artifact.data, null, 2)}
					</pre>
				</div>
			);
	}
}
