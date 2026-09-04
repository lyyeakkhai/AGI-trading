/**
 * OBSIDIAN INTELLIGENCE DESIGN TOKENS
 * AGI Trading System Source of Truth
 */

export const colors = {
  // Backgrounds
  background: {
    base: '#050709', // BG-950
    secondary: '#080C10', // BG-900
    tertiary: '#0B1116', // BG-850
  },
  
  // Surfaces
  surface: {
    default: '#0F161C', // SURFACE
    raised: '#131C23', // SURFACE-2
    elevated: '#17232C', // SURFACE-ELEVATED
    hover: '#15212A', // SURFACE-HOVER
  },
  
  // Borders
  border: {
    subtle: '#132027',
    default: '#1B2A32', // BORDER
    high: '#263D46', // BORDER-HI
    cyan: 'rgba(0, 229, 255, 0.4)',
  },
  
  // AI / Intelligence System (Cyan = AI / Intelligence / Active / System Activity)
  // NEVER use cyan to indicate financial profit.
  ai: {
    primary: '#00E5FF', // CYAN-500
    bright: '#22DFFF', // CYAN-400
    light: '#63EBFF', // CYAN-300
    dim: '#0A5965', // CYAN-DIM
    dimmer: '#063138',
    glow: 'rgba(0, 229, 255, 0.25)',
  },
  
  // Financial Semantics (Strictly separated from AI Cyan)
  financial: {
    profit: '#00E676', // POSITIVE / LONG
    profitDim: '#063720',
    profitText: '#69F0AE',
    
    loss: '#FF3B30', // NEGATIVE / SHORT
    lossDim: '#3D0F12',
    lossText: '#FF8A80',
    
    warning: '#F59E0B', // WARNING / ELEVATED RISK
    warningDim: '#3D2605',
    warningText: '#FCD34D',
    
    info: '#3B82F6', // INFO
    infoDim: '#0F223D',
    infoText: '#93C5FD',
    
    neutral: '#64748B', // NEUTRAL / SLATE
    neutralDim: '#1E293B',
    neutralText: '#94A3B8',
  },
  
  // Text
  text: {
    primary: '#EDEDED',
    secondary: '#94A3B8',
    muted: '#607380',
    disabled: '#3B4D57',
  }
} as const;

export const typography = {
  fonts: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'var(--font-jetbrains-mono), "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  },
  sizes: {
    display: 'text-2xl font-bold tracking-tight',
    pageTitle: 'text-lg font-semibold tracking-tight',
    sectionTitle: 'text-sm font-semibold tracking-wide uppercase',
    body: 'text-sm font-normal leading-relaxed',
    secondary: 'text-xs text-gray-400 leading-normal',
    label: 'text-[11px] font-medium uppercase tracking-wider',
    caption: 'text-[10px] tracking-wide',
    metric: 'text-2xl font-mono font-bold tracking-tight',
    numericValue: 'font-mono text-sm tracking-tight',
  }
} as const;

export const spacing = {
  baseUnit: 4,
  scale: {
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  }
} as const;

export const radius = {
  sm: '4px',
  default: '6px',
  md: '6px',
  lg: '8px',
  xl: '10px',
} as const;

export const shadows = {
  glowCyan: '0 0 12px -2px rgba(0, 229, 255, 0.25)',
  glowCyanSm: '0 0 6px -1px rgba(0, 229, 255, 0.2)',
  glowProfit: '0 0 10px -2px rgba(0, 230, 118, 0.2)',
  glowLoss: '0 0 10px -2px rgba(255, 59, 48, 0.2)',
} as const;

export const transitions = {
  default: 'transition-all duration-150 ease-out',
  subtle: 'transition-colors duration-100 ease-in-out',
} as const;
