/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'aegis-navy': '#0F172A',
                'aegis-surface': '#1E293B',
                'aegis-card': '#334155',
                'aegis-text': '#F8FAFC',
                'aegis-muted': '#94A3B8',
                'aegis-accent': '#3B82F6',
                'aegis-danger': '#EF4444',
                'aegis-safe': '#22C55E',
                'aegis-warning': '#F59E0B',
                'aegis-border': '#475569',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
