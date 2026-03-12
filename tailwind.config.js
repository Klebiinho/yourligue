/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6d28d9',
                    glow: 'rgba(109, 40, 217, 0.5)',
                },
                accent: {
                    DEFAULT: '#10b981',
                    glow: 'rgba(16, 185, 129, 0.5)',
                },
                danger: {
                    DEFAULT: '#ef4444',
                    glow: 'rgba(239, 68, 68, 0.5)',
                },
                warning: '#f59e0b',
                'bg-dark': '#0a0a0f',
                'bg-card': 'rgba(28, 28, 36, 0.6)',
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
