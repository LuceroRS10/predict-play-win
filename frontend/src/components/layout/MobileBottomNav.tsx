'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const navItems = [
  {
    key: 'dashboard',
    path: '/dashboard',
    i18nKey: 'mob_home',
    fallback: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    key: 'live',
    path: '/live-scores',
    i18nKey: 'mob_live',
    fallback: 'Live',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z" />
      </svg>
    ),
  },
  {
    key: 'leagues',
    path: '/leagues',
    i18nKey: 'mob_leagues',
    fallback: 'Leagues',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    key: 'rankings',
    path: '/rankings',
    i18nKey: 'mob_rankings',
    fallback: 'Rankings',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
      </svg>
    ),
  },
  {
    key: 'profile',
    path: '/profile',
    i18nKey: 'mob_profile',
    fallback: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const isActive = (itemPath: string) => {
    if (itemPath === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(itemPath);
  };

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="mob-bottom-nav" id="mobBottomNav">
      <div className="mob-bottom-nav-inner">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`mob-nav-btn${isActive(item.path) ? ' active' : ''}`}
            onClick={() => handleNavClick(item.path)}
          >
            {item.icon}
            <span>
              {(t as Record<string, string>)[item.i18nKey] ?? item.fallback}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
