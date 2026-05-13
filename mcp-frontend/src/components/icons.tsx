interface IconProps {
	className?: string;
}

export function CloseIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 20 20'
			fill='currentColor'
			className={className}
			aria-hidden='true'
		>
			<path d='M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z' />
		</svg>
	);
}

export function ExpandIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 20 20'
			fill='currentColor'
			className={className}
			aria-hidden='true'
		>
			<path d='M13.28 3.22a.75.75 0 010 1.06L9.56 8h2.69a.75.75 0 010 1.5H7.5a.75.75 0 01-.75-.75V4a.75.75 0 011.5 0v2.69l3.72-3.72a.75.75 0 011.06 0zM7.72 16.78a.75.75 0 010-1.06l3.72-3.72H8.75a.75.75 0 010-1.5h4.75a.75.75 0 01.75.75V16a.75.75 0 01-1.5 0v-2.69l-3.72 3.72a.75.75 0 01-1.06 0z' />
		</svg>
	);
}

export function DownloadIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 20 20'
			fill='currentColor'
			className={className}
			aria-hidden='true'
		>
			<path d='M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z' />
			<path d='M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z' />
		</svg>
	);
}

export function InfoIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 20 20'
			fill='currentColor'
			className={className}
			aria-hidden='true'
		>
			<path
				fillRule='evenodd'
				d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
				clipRule='evenodd'
			/>
		</svg>
	);
}

export function SortAscIcon({ className = 'w-3 h-3' }: IconProps) {
	return (
		<span className={`text-teal-600 ${className}`} aria-hidden='true'>
			▲
		</span>
	);
}

export function SortDescIcon({ className = 'w-3 h-3' }: IconProps) {
	return (
		<span className={`text-teal-600 ${className}`} aria-hidden='true'>
			▼
		</span>
	);
}

export function SortNeutralIcon({ className = 'w-3 h-3' }: IconProps) {
	return (
		<span className={`text-gray-300 ${className}`} aria-hidden='true'>
			⇅
		</span>
	);
}
