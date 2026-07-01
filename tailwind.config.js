/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
            },
            boxShadow: {
                soft: "0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
            },
            transitionDuration: {
                250: "250ms",
            },
        },
    },
    plugins: [],
};
