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
        'bg-950': '#050709',
        'bg-900': '#080C10',
        'bg-850': '#0B1116',
        
        // Surfaces
        'surface': '#0F161C',
        'surface-2': '#131C23',
        'surface-elevated': '#17232C',
        'surface-hover': '#15212A',
        
        // Borders
        'border-color': '#1B2A32',
        'border-hi': '#263D46',
        'border-subtle': '#132027',
        
        // AI / Intelligence (CYAN - exclusively AI/system activity)
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
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      }
    },
  },
  plugins: [],
}
