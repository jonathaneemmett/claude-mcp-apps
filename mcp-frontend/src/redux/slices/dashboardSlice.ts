import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Artifact {
	id: string;
	toolName: string;
	title: string;
	data: Record<string, unknown>;
	position: number;
	gridSize: 'half' | 'full';
}

interface DashboardState {
	artifacts: Artifact[];
}

const initialState: DashboardState = {
	artifacts: [],
};

function inferGridSize(toolName: string): 'half' | 'full' {
	switch (toolName) {
		case 'create_table':
		case 'create_html':
			return 'full';
		default:
			return 'half';
	}
}

function inferTitle(toolName: string, data: Record<string, unknown>): string {
	if (typeof data.title === 'string' && data.title) return data.title;
	switch (toolName) {
		case 'create_chart':
			return 'Chart';
		case 'create_table':
			return 'Table';
		case 'create_html':
			return 'HTML Widget';
		default:
			return 'Widget';
	}
}

const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState,
	reducers: {
		addArtifact(
			state,
			action: PayloadAction<{
				id: string;
				toolName: string;
				data: Record<string, unknown>;
			}>,
		) {
			const { id, toolName, data } = action.payload;
			if (state.artifacts.some((a) => a.id === id)) return;
			state.artifacts.push({
				id,
				toolName,
				title: inferTitle(toolName, data),
				data,
				position: state.artifacts.length,
				gridSize: inferGridSize(toolName),
			});
		},
		removeArtifact(state, action: PayloadAction<string>) {
			state.artifacts = state.artifacts
				.filter((a) => a.id !== action.payload)
				.map((a, i) => ({ ...a, position: i }));
		},
		reorderArtifacts(state, action: PayloadAction<string[]>) {
			const ordered: Artifact[] = [];
			for (const id of action.payload) {
				const artifact = state.artifacts.find((a) => a.id === id);
				if (artifact)
					ordered.push({ ...artifact, position: ordered.length });
			}
			state.artifacts = ordered;
		},
		updateArtifact(
			state,
			action: PayloadAction<{
				id: string;
				data: Record<string, unknown>;
			}>,
		) {
			const artifact = state.artifacts.find(
				(a) => a.id === action.payload.id,
			);
			if (artifact) {
				artifact.data = action.payload.data;
				artifact.title = inferTitle(artifact.toolName, action.payload.data);
			}
		},
		clearDashboard(state) {
			state.artifacts = [];
		},
		hydrateDashboard(state, action: PayloadAction<Artifact[]>) {
			state.artifacts = action.payload;
		},
	},
});

export const {
	addArtifact,
	removeArtifact,
	reorderArtifacts,
	updateArtifact,
	clearDashboard,
	hydrateDashboard,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
