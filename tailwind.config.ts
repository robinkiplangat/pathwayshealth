import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'resilience-green': 'var(--resilience-green)',
                'earth-brown': 'var(--earth-brown)',
                'sky-blue': 'var(--sky-blue)',
                'sunrise-orange': 'var(--sunrise-orange)',
                'seed-yellow': 'var(--seed-yellow)',
                'storm-gray': 'var(--storm-gray)',
                'risk-low': 'var(--risk-low)',
                'risk-medium': 'var(--risk-medium)',
                'risk-high': 'var(--risk-high)',
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-panel': 'var(--bg-panel)',
            },
        },
    },
    plugins: [],
};
export default config;
