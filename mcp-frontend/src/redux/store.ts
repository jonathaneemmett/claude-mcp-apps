import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import dashboardReducer from './slices/dashboardSlice';
import toastReducer from './slices/toastSlice';
import { persistDashboardMiddleware } from './middleware/persistDashboard';

export const store = configureStore({
	reducer: {
		dashboard: dashboardReducer,
		toast: toastReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(persistDashboardMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
