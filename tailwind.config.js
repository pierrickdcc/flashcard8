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
        // Mapping Tailwind colors to CSS variables defined in NewStyles.css
        // This ensures bg-bg-body uses var(--bg-body)
        'bg-body': 'var(--bg-body)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'bg-card': 'var(--bg-card)',
        'primary': 'var(--primary)',
        'primary-gradient': 'var(--primary-gradient)', // Note: gradients usually need backgroundImage, but if used as color it might fail. Let's check usage.
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border': 'var(--border)',
        // Custom stats colors
        'color-flashcards': 'var(--color-flashcards)',
        'color-subjects': 'var(--color-subjects)',
        'color-review': 'var(--color-review)',
      },
      backgroundImage: {
        'primary-gradient': 'var(--primary-gradient)',
      },
      spacing: {
        'nav-height': 'var(--nav-height)',
        'sidebar-width': 'var(--sidebar-width)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      }
    },
  },
  plugins: [],
}
