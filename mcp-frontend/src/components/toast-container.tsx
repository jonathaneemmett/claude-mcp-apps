'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { dismissToast, type Toast } from '@/redux/slices/toastSlice';
import { CloseIcon } from './icons';

export function ToastContainer() {
	const toasts = useAppSelector((state) => state.toast.toasts);
	const dispatch = useAppDispatch();

	return (
		<div
			className='fixed bottom-20 right-6 z-50 flex flex-col gap-2'
			aria-live='polite'
			aria-label='Notifications'
			data-testid='toast-container'
		>
			{toasts.map((toast: Toast) => (
				<ToastItem
					key={toast.id}
					id={toast.id}
					message={toast.message}
					onDismiss={() => dispatch(dismissToast(toast.id))}
				/>
			))}
		</div>
	);
}

function ToastItem({
	id,
	message,
	onDismiss,
}: {
	id: string;
	message: string;
	onDismiss: () => void;
}) {
	useEffect(() => {
		const timer = setTimeout(onDismiss, 3000);
		return () => clearTimeout(timer);
	}, [id, onDismiss]);

	return (
		<div
			className='flex items-center gap-3 bg-neutral-800 text-white text-sm rounded-lg px-4 py-3 shadow-lg animate-[slideIn_0.2s_ease-out]'
			role='status'
			data-testid={`toast-${id}`}
		>
			<span>{message}</span>
			<button
				onClick={onDismiss}
				className='text-neutral-400 hover:text-white ml-1'
				aria-label='Dismiss notification'
			>
				<CloseIcon />
			</button>
		</div>
	);
}
