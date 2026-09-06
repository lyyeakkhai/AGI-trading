/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Obsidian Backgrounds
        'bg-950': '#000000',
        'bg-900': '#050505',
        'bg-850': '#0A0A0A',
        
        // Surfaces
        'surface': '#0E0E0E',
        'surface-2': '#121212',
        'surface-elevated': '#181818',
        'surface-hover': '#1C1C1C',

        // Dark Iron & Brushed Titanium (Concept 2 Hardware Palette)
        'iron-950': '#080A0C',
        'iron-900': '#101417',
        'iron-850': '#151A1E',
        'iron-800': '#1C2329',
        'iron-700': '#28323A',
        'iron-600': '#3A4752',
        'iron-500': '#4E5F6D',
        'iron-400': '#728594',
        
        // Borders
        'border-color': '#242D35',
        'border-hi': '#3A4752',
        'border-subtle': '#151A1E',
        
        // AI / Intelligence (Electric Cyan)
        'cyan-500': '#00E5FF',
        'cyan-400': '#22DFFF',
        'cyan-300': '#63EBFF',
        'cyan-dim': '#0A5965',
        'cyan-dimmer': '#063138',
        
        // Financial & System Semantics (Green/Red/Amber/Blue)
        'profit': '#00E676',
        'profit-dim': '#063720',
        'loss': '#FF3B30',
        'loss-dim': '#3D0F12',
        'warning': '#F59E0B',
        'warning-dim': '#3D2605',
        'info': '#3B82F6',
        'info-dim': '#0F223D',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
      },
      boxShadow: {
        'glow-cyan': '0 0 12px -2px rgba(0, 229, 255, 0.25)',
        'glow-cyan-sm': '0 0 6px -1px rgba(0, 229, 255, 0.2)',
        'glow-profit': '0 0 10px -2px rgba(0, 230, 118, 0.2)',
        'glow-loss': '0 0 10px -2px rgba(255, 59, 48, 0.2)',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        plex: ['var(--font-ibm-plex-sans)', 'sans-serif'],
        jetbrains: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      animation: {
        'spin-reverse': 'spin-reverse 12s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
