'use client';

import type { HtmlData } from '@/lib/types';
import { Card } from './card';

export function HtmlPreview({ title, subtitle, html }: HtmlData) {
	return (
		<Card title={title} subtitle={subtitle} data-testid='widget-html'>
			<iframe
				srcDoc={html}
				sandbox='allow-scripts'
				className='w-full h-[400px] border border-gray-200 rounded'
				title={title || 'HTML preview'}
			/>
		</Card>
	);
}
