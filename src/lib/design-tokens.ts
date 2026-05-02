export const COLORS = {
  // Primary
  green:    '#10b981',  // FoodFlow primary
  orange:   '#f97316',  // Urgency/accent
  
  // Valorization channels
  biogas:   '#fbbf24',  // Yellow — energy
  cattle:   '#a855f7',  // Purple — livestock
  farmer:   '#84cc16',  // Lime — crops
  compost:  '#14b8a6',  // Teal — soil

  // Trust score
  verified: '#10b981',  // Green
  good:     '#84cc16',  // Lime
  warning:  '#f97316',  // Orange
  review:   '#ef4444',  // Red
  suspended:'#6b7280',  // Gray

  // Urgency (countdown timers)
  fresh:    '#10b981',  // > 12 hours
  medium:   '#fbbf24',  // 6–12 hours
  urgent:   '#f97316',  // 2–6 hours
  critical: '#ef4444',  // < 2 hours
  expired:  '#6b7280',  // Expired

  // Role colors
  donor:    '#3b82f6',  // Blue
  ngo:      '#10b981',  // Green
  driver:   '#f97316',  // Orange
  partner:  '#14b8a6',  // Teal
  admin:    '#6366f1',  // Purple

  // Background layers
  bg:       '#0a0a0a',
  surface:  '#111111',
  card:     '#1a1a1a',
  border:   '#2a2a2a',
};

export const ANIMATION = {
  spring:   { type: 'spring', stiffness: 300, damping: 30 },
  smooth:   { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  bounce:   { type: 'spring', stiffness: 400, damping: 15 },
  slow:     { duration: 0.6, ease: 'easeInOut' },
};

export const SHADOWS = {
  green:  '0 0 20px rgba(16, 185, 129, 0.15)',
  orange: '0 0 20px rgba(249, 115, 22, 0.15)',
  card:   '0 4px 24px rgba(0, 0, 0, 0.4)',
};
