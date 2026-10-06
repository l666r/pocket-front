import React from 'react';

// Default icon props helper
const baseProps = (size = 20, strokeWidth = 2, className = '') => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: `pr-icon ${className}`.trim(),
});

// 1. Explore / Home
export function IconExplore({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// 2. Compass / Discovery
export function IconCompass({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

// 3. Map / Trips
export function IconMap({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

// 4. Route / Journey
export function IconRoute({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

// 5. Plus / Add / Contribute
export function IconPlus({ size = 20, strokeWidth = 2.5, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// 6. Favorites Heart
export function IconHeart({ size = 20, strokeWidth = 2, filled = false, className = '' }) {
  return (
    <svg
      {...baseProps(size, strokeWidth, className)}
      fill={filled ? 'currentColor' : 'none'}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// 7. User / Profile
export function IconUser({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// 8. Sparkles / AI / Smart
export function IconSparkles({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

// 9. Location Pin
export function IconPin({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// 10. Shuffle / Re-order
export function IconShuffle({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

// 11. Transit / Train / Metro
export function IconTransit({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <rect width="16" height="16" x="4" y="3" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <path d="m8 19-2 3" />
      <path d="m16 19 2 3" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </svg>
  );
}

// 12. Water Ferry / Boat
export function IconFerry({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M2 20a4.5 4.5 0 0 0 4 0 4.5 4.5 0 0 1 4 0 4.5 4.5 0 0 0 4 0 4.5 4.5 0 0 1 4 0 4.5 4.5 0 0 0 4 0" />
      <path d="M4 16l2-8h12l2 8H4z" />
      <path d="M12 4v4" />
      <path d="M9 8h6" />
    </svg>
  );
}

// 13. Budget / Wallet
export function IconWallet({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

// 14. Events / Calendar
export function IconCalendar({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// 15. Bot / AI Chat
export function IconBot({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

// 16. Emergency SOS / Shield
export function IconSOS({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// 17. Camera / Story Pass
export function IconCamera({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

// 18. Sun
export function IconSun({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

// 19. Moon
export function IconMoon({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

// 20. Idea / Bulb
export function IconBulb({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

// 21. LogOut
export function IconLogOut({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// 22. Share
export function IconShare({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

// 23. Save / Disk
export function IconSave({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

// 24. Directions / Navigate
export function IconDirections({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

// 25. Check
export function IconCheck({ size = 20, strokeWidth = 2.5, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// 26. Trash
export function IconTrash({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// 27. Folder / Saved Vault
export function IconFolder({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// 28. Clipboard / Itinerary
export function IconItinerary({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <rect width="14" height="18" x="5" y="3" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}
