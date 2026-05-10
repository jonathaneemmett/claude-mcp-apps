SHADCN_STYLES = """
:root {
    --background: #fafafa;
    --foreground: #262626;
    --card: #ffffff;
    --card-border: #e5e5e5;
    --muted: #f5f5f5;
    --secondary: #525252;
    --tertiary: #737373;
    --neutral-50: #fafafa;
    --neutral-100: #f5f5f5;
    --neutral-200: #e5e5e5;
    --neutral-900: #171717;
    --radius: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--background);
    color: var(--foreground);
    padding: 12px;
    -webkit-font-smoothing: antialiased;
}

.card {
    background: var(--card);
    border: 1px solid var(--card-border);
    border-radius: var(--radius);
    padding: 14px;
}

.card-header { margin-bottom: 10px; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--neutral-900); }
.card-description { font-size: 0.8rem; color: var(--tertiary); margin-top: 2px; }

table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
thead { background: var(--neutral-50); }
thead tr { border-bottom: 1px solid var(--neutral-200); }
th { padding: 8px 12px; text-align: left; font-weight: 600; color: var(--foreground); }
td { padding: 10px 12px; color: var(--foreground); }
tbody tr { border-bottom: 1px solid var(--neutral-200); }
tbody tr:hover { background: var(--neutral-100); }
tbody tr:last-child { border-bottom: none; }

.tooltip {
    position: absolute; opacity: 0;
    background: var(--foreground); color: #fff;
    padding: 6px 10px; border-radius: 4px;
    font-size: 0.75rem; font-weight: 500;
    pointer-events: none; z-index: 10;
    transition: opacity 0.15s ease;
}
"""
