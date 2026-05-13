'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { hydrateDashboard } from '@/redux/slices/dashboardSlice';
import { loadDashboardState } from '@/redux/middleware/persistDashboard';

const ReduxProvider = Provider as unknown as React.FC<{
	store: typeof store;
	children: React.ReactNode;
}>;

export function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const persisted = loadDashboardState();
		if (persisted?.artifacts?.length) {
			store.dispatch(hydrateDashboard(persisted.artifacts));
		}
	}, []);

	return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
