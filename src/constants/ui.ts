// Кольори для графіків
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#f97316'  // orange
] as const

// CSS класи для кольорів
export const COLOR_CLASSES = {
  green: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    bgLight: 'bg-green-50',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    bgLight: 'bg-red-50',
    border: 'border-red-200'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200'
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  gray: {
    bg: 'bg-gray-500',
    text: 'text-gray-600',
    bgLight: 'bg-gray-50',
    border: 'border-gray-200'
  }
} as const

// Іконки
export const ICONS = {
  deposit: '💰',
  withdrawal: '💸',
  debt: '💰',
  chart: '📊',
  filter: '🔽',
  money: '💵',
  euro: '💶'
} as const

// Брейкпоінти
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
} as const
