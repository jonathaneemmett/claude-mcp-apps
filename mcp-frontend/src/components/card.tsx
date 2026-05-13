interface CardProps {
	title?: string;
	subtitle?: string;
	children: React.ReactNode;
	'data-testid'?: string;
}

export function Card({
	title,
	subtitle,
	children,
	'data-testid': testId,
}: CardProps) {
	return (
		<div
			className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm'
			data-testid={testId}
		>
			{title && (
				<div className='mb-3'>
					<h2 className='text-base font-bold text-gray-900'>
						{title}
					</h2>
					{subtitle && (
						<p className='text-sm text-gray-500 mt-0.5'>
							{subtitle}
						</p>
					)}
				</div>
			)}
			{children}
		</div>
	);
}
