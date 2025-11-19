/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          body: {
            light: '#f8fafc',
            dark: '#0f172a',
          },
          glass: {
            light: 'rgba(255, 255, 255, 0.95)',
            dark: 'rgba(30, 41, 59, 0.8)',
          },
          card: {
            light: '#ffffff',
            dark: '#1e293b',
          },
        },
        foreground: {
          light: '#475569',
          dark: '#94a3b8',
        },
        heading: {
          light: '#0f172a',
          dark: '#e5e7eb',
        },
        primary: {
          DEFAULT: '#3B82F6',
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        },
        border: {
          light: 'rgba(15, 23, 42, 0.08)',
          dark: 'rgba(255, 255, 255, 0.1)',
        },
        muted: {
          DEFAULT: {
            light: '#94a3b8',
            dark: '#64748b',
          },
          bg: {
            light: '#f1f5f9',
            dark: '#334155',
          },
        },
        memo: {
          yellow: {
            bg: { light: '#fef9c3', dark: '#2a261a' },
            border: { light: '#facc15', dark: '#a18a38' },
            text: { light: '#713f12', dark: '#f5e3a7' },
          },
          blue: {
            bg: { light: '#dbeafe', dark: '#1a2333' },
            border: { light: '#60a5fa', dark: '#386ea1' },
            text: { light: '#1e40af', dark: '#a7c7f5' },
          },
          green: {
            bg: { light: '#dcfce7', dark: '#1a2a22' },
            border: { light: '#4ade80', dark: '#38a169' },
            text: { light: '#166534', dark: '#a7f5c7' },
          },
          pink: {
            bg: { light: '#fce7f3', dark: '#301f2a' },
            border: { light: '#f472b6', dark: '#a13884' },
            text: { light: '#831843', dark: '#f5a7e3' },
          },
          purple: {
            bg: { light: '#f3e8ff', dark: '#261f30' },
            border: { light: '#c084fc', dark: '#7538a1' },
            text: { light: '#581c87', dark: '#d6a7f5' },
          },
          gray: {
            bg: { light: '#f1f5f9', dark: '#22252a' },
            border: { light: '#94a3b8', dark: '#626e82' },
            text: { light: '#334155', dark: '#c8d1e0' },
          },
        },
        stat: {
          total: '#3B82F6',
          review: '#F59E0B',
          subjects: '#10B981',
          mastery: '#8B5CF6',
        }
      },
      boxShadow: {
        sm: {
          light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          dark: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        },
        md: {
          light: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          dark: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        },
        lg: {
          light: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          dark: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        },
        xl: {
          light: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          dark: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
        },
      }
    },
  },
  plugins: [],
}
