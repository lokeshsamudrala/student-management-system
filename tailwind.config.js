module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}