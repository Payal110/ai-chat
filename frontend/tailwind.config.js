/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0d1117',
                    800: '#161b22',
                    700: '#1c2128',
                    600: '#21262d',
                    500: '#30363d',
                    400: '#484f58',
                    300: '#6e7681',
                    200: '#8b949e',
                    100: '#b1bac4',
                    50: '#c9d1d9',
                },
                accent: {
                    500: '#6366f1',
                    400: '#818cf8',
                    600: '#4f46e5',
                    700: '#4338ca',
                    glow: '#6366f180',
                }
            },
        },
    },
    plugins: [],
}
