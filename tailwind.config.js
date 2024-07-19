/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],  
  theme: {
    extend: {
      colors: {
        'sidebar-bg': '#1f2937',
        'sidebar-text': '#f9fafb',
        'sidebar-hover': '#374151',
        'chat-bg': '#f5f5f5',
        'chat-message': '#e1f5fe',
        'chat-reply': '#c8e6c9',
      },
    },
  },
  plugins: [],
}

