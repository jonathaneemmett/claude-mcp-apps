'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ChartData } from '@/lib/types';
import { Card } from './card';

const COLORS = [
	'#007856',
	'#0284c7',
	'#e78829',
	'#2335d9',
	'#611ed3',
	'#c70075',
	'#00B696',
	'#ef4444',
];

interface ChartProps extends ChartData {
	onDrillDown?: (label: string, value: number) => void;
}

export function Chart({
	title,
	subtitle,
	labels,
	values,
	chartType,
	onDrillDown,
}: ChartProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!svgRef.current) return;
		if (!Array.isArray(labels) || !Array.isArray(values) || labels.length === 0) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove();

		const container = svgRef.current.parentElement;
		if (!container) return;
		const width = container.clientWidth;
		const height = 400;

		svg.attr('viewBox', `0 0 ${width} ${height}`);

		if (chartType === 'pie')
			renderPie(svg, { labels, values }, width, height, onDrillDown);
		else if (chartType === 'line')
			renderLine(svg, { labels, values }, width, height, onDrillDown);
		else renderBar(svg, { labels, values }, width, height, onDrillDown);
	}, [labels, values, chartType, onDrillDown]);

	return (
		<Card title={title} subtitle={subtitle} data-testid='widget-chart'>
			<svg
				ref={svgRef}
				className='w-full'
				role='img'
				aria-label={title ? `${chartType} chart: ${title}` : `${chartType} chart`}
			/>
		</Card>
	);
}

type OnDrillDown = ((label: string, value: number) => void) | undefined;

function renderBar(
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	data: { labels: string[]; values: number[] },
	width: number,
	height: number,
	onDrillDown?: OnDrillDown,
) {
	const m = { top: 10, right: 10, bottom: 28, left: 40 };
	const w = width - m.left - m.right;
	const h = height - m.top - m.bottom;
	const g = svg
		.append('g')
		.attr('transform', `translate(${m.left},${m.top})`);

	const x = d3.scaleBand().domain(data.labels).range([0, w]).padding(0.3);
	const y = d3
		.scaleLinear()
		.domain([0, d3.max(data.values)! * 1.1])
		.nice()
		.range([h, 0]);

	g.append('g')
		.attr('transform', `translate(0,${h})`)
		.call(d3.axisBottom(x).tickSize(0).tickPadding(8))
		.call((g) => g.select('.domain').remove())
		.selectAll('text')
		.style('font-size', '11px')
		.style('fill', '#737373');

	g.append('g')
		.call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8))
		.call((g) => g.select('.domain').remove())
		.selectAll('text')
		.style('font-size', '11px')
		.style('fill', '#737373');

	g.selectAll('.gl')
		.data(y.ticks(5))
		.enter()
		.append('line')
		.attr('x1', 0)
		.attr('x2', w)
		.attr('y1', (d) => y(d))
		.attr('y2', (d) => y(d))
		.style('stroke', 'rgba(0,0,0,0.06)');

	g.selectAll('rect')
		.data(data.values)
		.enter()
		.append('rect')
		.attr('x', (_, i) => x(data.labels[i])!)
		.attr('y', (d) => y(d))
		.attr('width', x.bandwidth())
		.attr('height', (d) => h - y(d))
		.attr('rx', 3)
		.attr('fill', COLORS[0])
		.style('cursor', onDrillDown ? 'pointer' : 'default')
		.on('mouseover', function () {
			if (onDrillDown) d3.select(this).attr('opacity', 0.8);
		})
		.on('mouseout', function () {
			d3.select(this).attr('opacity', 1);
		})
		.on('click', (_, d) => {
			const i = data.values.indexOf(d);
			onDrillDown?.(data.labels[i], d);
		});
}

function renderLine(
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	data: { labels: string[]; values: number[] },
	width: number,
	height: number,
	onDrillDown?: OnDrillDown,
) {
	const m = { top: 10, right: 10, bottom: 28, left: 40 };
	const w = width - m.left - m.right;
	const h = height - m.top - m.bottom;
	const g = svg
		.append('g')
		.attr('transform', `translate(${m.left},${m.top})`);

	const x = d3.scalePoint().domain(data.labels).range([0, w]).padding(0.4);
	const y = d3
		.scaleLinear()
		.domain([0, d3.max(data.values)! * 1.15])
		.nice()
		.range([h, 0]);

	g.append('g')
		.attr('transform', `translate(0,${h})`)
		.call(d3.axisBottom(x).tickSize(0).tickPadding(8))
		.call((g) => g.select('.domain').remove())
		.selectAll('text')
		.style('font-size', '11px')
		.style('fill', '#737373');

	g.append('g')
		.call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8))
		.call((g) => g.select('.domain').remove())
		.selectAll('text')
		.style('font-size', '11px')
		.style('fill', '#737373');

	g.selectAll('.gl')
		.data(y.ticks(5))
		.enter()
		.append('line')
		.attr('x1', 0)
		.attr('x2', w)
		.attr('y1', (d) => y(d))
		.attr('y2', (d) => y(d))
		.style('stroke', 'rgba(0,0,0,0.06)');

	const line = d3
		.line<number>()
		.x((_, i) => x(data.labels[i])!)
		.y((d) => y(d))
		.curve(d3.curveMonotoneX);

	g.append('path')
		.datum(data.values)
		.attr('d', line)
		.style('fill', 'none')
		.style('stroke', COLORS[0])
		.style('stroke-width', 2);

	g.selectAll('circle')
		.data(data.values)
		.enter()
		.append('circle')
		.attr('cx', (_, i) => x(data.labels[i])!)
		.attr('cy', (d) => y(d))
		.attr('r', 4)
		.attr('fill', COLORS[0])
		.attr('stroke', '#fff')
		.attr('stroke-width', 2)
		.style('cursor', onDrillDown ? 'pointer' : 'default')
		.on('mouseover', function () {
			if (onDrillDown) d3.select(this).attr('r', 6);
		})
		.on('mouseout', function () {
			d3.select(this).attr('r', 4);
		})
		.on('click', (_, d) => {
			const i = data.values.indexOf(d);
			onDrillDown?.(data.labels[i], d);
		});
}

function renderPie(
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	data: { labels: string[]; values: number[] },
	width: number,
	height: number,
	onDrillDown?: OnDrillDown,
) {
	const s = Math.min(width, height);
	const r = s / 2 - 8;
	const ir = r * 0.55;

	svg.attr('viewBox', `0 0 ${s} ${s}`);
	const g = svg.append('g').attr('transform', `translate(${s / 2},${s / 2})`);

	const pie = d3
		.pie<number>()
		.value((d) => d)
		.sort(null)
		.padAngle(0.02);
	const arc = d3.arc<d3.PieArcDatum<number>>().innerRadius(ir).outerRadius(r);

	g.selectAll('path')
		.data(pie(data.values))
		.enter()
		.append('path')
		.attr('d', arc)
		.attr('fill', (_, i) => COLORS[i % COLORS.length])
		.style('cursor', onDrillDown ? 'pointer' : 'default')
		.on('mouseover', function () {
			if (onDrillDown) d3.select(this).attr('opacity', 0.8);
		})
		.on('mouseout', function () {
			d3.select(this).attr('opacity', 1);
		})
		.on('click', (_, d) => {
			onDrillDown?.(data.labels[d.index], data.values[d.index]);
		});
}
