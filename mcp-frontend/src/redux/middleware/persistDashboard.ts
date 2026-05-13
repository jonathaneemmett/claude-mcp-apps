import type { Middleware } from '@reduxjs/toolkit';

const STORAGE_KEY = 'mcp-dashboard-state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const persistDashboardMiddleware: Middleware<object, any> =
	(store) => (next) => (action) => {
		const result = next(action);

		if (
			typeof action === 'object' &&
			action !== null &&
			'type' in action &&
			typeof action.type === 'string' &&
			action.type.startsWith('dashboard/')
		) {
			try {
				const state = store.getState().dashboard;
				localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			} catch {
				// localStorage may be unavailable
			}
		}

		return result;
	};

export function loadDashboardState() {
	try {
		const serialized = localStorage.getItem(STORAGE_KEY);
		if (serialized) {
			return JSON.parse(serialized);
		}
	} catch {
		// localStorage may be unavailable
	}
	return undefined;
}
