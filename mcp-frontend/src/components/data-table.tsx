'use client';

import { useState, useMemo } from 'react';
import type { TableData } from '@/lib/types';
import { Card } from './card';
import { SortAscIcon, SortDescIcon, SortNeutralIcon } from './icons';

interface DataTableProps extends TableData {
	onDrillDown?: (rowLabel: string) => void;
}

type SortDir = 'asc' | 'desc';

export function DataTable({
	title,
	subtitle,
	headers,
	rows,
	footer,
	onDrillDown,
}: DataTableProps) {
	const [sortCol, setSortCol] = useState<number | null>(null);
	const [sortDir, setSortDir] = useState<SortDir>('asc');

	function handleSort(colIndex: number) {
		if (sortCol === colIndex) {
			setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortCol(colIndex);
			setSortDir('asc');
		}
	}

	const sortedRows = useMemo(() => {
		if (sortCol === null) return rows;
		return [...rows].sort((a, b) => {
			const aVal = a[sortCol] ?? '';
			const bVal = b[sortCol] ?? '';
			const aNum = Number(aVal);
			const bNum = Number(bVal);
			const isNumeric =
				!isNaN(aNum) && !isNaN(bNum) && aVal !== '' && bVal !== '';
			const cmp = isNumeric ? aNum - bNum : aVal.localeCompare(bVal);
			return sortDir === 'asc' ? cmp : -cmp;
		});
	}, [rows, sortCol, sortDir]);

	return (
		<Card title={title} subtitle={subtitle} data-testid='widget-table'>
			<div className='overflow-x-auto'>
				<table
					className='w-full text-sm border-collapse'
					data-testid='data-table'
				>
					<thead>
						<tr className='border-b border-gray-200 bg-gray-50'>
							{headers.map((h, i) => (
								<th
									key={h}
									onClick={() => handleSort(i)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleSort(i);
										}
									}}
									tabIndex={0}
									role='columnheader'
									aria-sort={
										sortCol === i
											? sortDir === 'asc'
												? 'ascending'
												: 'descending'
											: 'none'
									}
									aria-label={`Sort by ${h}${sortCol === i ? `, currently ${sortDir === 'asc' ? 'ascending' : 'descending'}` : ''}`}
									className='px-3 py-2 text-left font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 transition-colors'
								>
									<span className='inline-flex items-center gap-1'>
										{h}
										{sortCol === i ? (
											sortDir === 'asc' ? (
												<SortAscIcon />
											) : (
												<SortDescIcon />
											)
										) : (
											<SortNeutralIcon />
										)}
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sortedRows.map((row, i) => (
							<tr
								key={row.join('|')}
								onClick={() => onDrillDown?.(row[0])}
								onKeyDown={(e) => {
									if (
										onDrillDown &&
										(e.key === 'Enter' || e.key === ' ')
									) {
										e.preventDefault();
										onDrillDown(row[0]);
									}
								}}
								tabIndex={onDrillDown ? 0 : undefined}
								role={onDrillDown ? 'button' : undefined}
								aria-label={
									onDrillDown
										? `View details for ${row[0]}`
										: undefined
								}
								className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
									onDrillDown
										? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-inset'
										: ''
								}`}
								data-testid={`table-row-${i}`}
							>
								{row.map((cell, j) => (
									<td
										key={`${row.join('|')}-${j}`}
										className='px-3 py-2.5 text-gray-900'
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{footer && <p className='mt-2 text-xs text-gray-500'>{footer}</p>}
		</Card>
	);
}
