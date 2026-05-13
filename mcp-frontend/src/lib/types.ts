export interface ChartData {
	title: string;
	subtitle: string;
	labels: string[];
	values: number[];
	chartType: 'bar' | 'line' | 'pie';
}

export interface TableData {
	title: string;
	subtitle: string;
	headers: string[];
	rows: string[][];
	footer: string;
}

export interface HtmlData {
	title: string;
	subtitle: string;
	html: string;
}

export interface DashboardStateItem {
	id: string;
	toolName: string;
	title: string;
	position: number;
}