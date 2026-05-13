import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
	id: string;
	message: string;
}

interface ToastState {
	toasts: Toast[];
}

const initialState: ToastState = {
	toasts: [],
};

let nextId = 0;

const toastSlice = createSlice({
	name: 'toast',
	initialState,
	reducers: {
		showToast(state, action: PayloadAction<string>) {
			state.toasts.push({
				id: String(nextId++),
				message: action.payload,
			});
		},
		dismissToast(state, action: PayloadAction<string>) {
			state.toasts = state.toasts.filter((t) => t.id !== action.payload);
		},
	},
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
