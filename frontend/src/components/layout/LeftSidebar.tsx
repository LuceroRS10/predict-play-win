'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LeftSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

interface NavItem {
  key: string;
  label: string;
  i18nKey: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ---------------------------------------------------------------------------
// SVG Icons (inline, no external icon libraries)
// ---------------------------------------------------------------------------
const icons = {
  dashboard: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM13 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z" />
    </svg>
  ),
  liveScores: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z" />
    </svg>
  ),
  tournaments: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  leagues: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  rankings: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
    </svg>
  ),
  challenges: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.2 4L3 7.2l4.4 4.4L3 16l3.2 3.2L12 13.4l5.8 5.8L21 16l-4.4-4.4L21 7.2 17.8 4 12 9.8 6.2 4z" />
    </svg>
  ),
  players: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  rules: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
  settings: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  ),
  admin: (
    <svg className="sb-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  ),
  trophy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FFD700' }}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Navigation data
// ---------------------------------------------------------------------------
const navGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        i18nKey: 'nav_dashboard',
        href: '/dashboard',
        icon: icons.dashboard,
      },
      {
        key: 'live-scores',
        label: 'Live Scores',
        i18nKey: 'nav_fixtures',
        href: '/live-scores',
        icon: icons.liveScores,
      },
    ],
  },
  {
    label: 'COMPETITIONS',
    items: [
      {
        key: 'tournaments',
        label: 'Tournaments',
        i18nKey: 'nav_tournaments',
        href: '/tournaments',
        icon: icons.tournaments,
      },
      {
        key: 'leagues',
        label: 'Leagues',
        i18nKey: 'nav_leagues',
        href: '/leagues',
        icon: icons.leagues,
      },
      {
        key: 'rankings',
        label: 'Rankings',
        i18nKey: 'nav_rankings',
        href: '/rankings',
        icon: icons.rankings,
      },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      {
        key: 'challenges',
        label: 'Challenges',
        i18nKey: 'nav_challenges',
        href: '/challenges',
        icon: icons.challenges,
      },
      {
        key: 'players',
        label: 'Players',
        i18nKey: 'nav_players',
        href: '/players',
        icon: icons.players,
      },
    ],
  },
];

const utilityItems: NavItem[] = [
  {
    key: 'rules',
    label: 'Rules',
    i18nKey: 'nav_rules',
    href: '/rules',
    icon: icons.rules,
  },
  {
    key: 'settings',
    label: 'Settings',
    i18nKey: 'nav_settings',
    href: '/settings',
    icon: icons.settings,
  },
  {
    key: 'admin',
    label: 'Admin Panel',
    i18nKey: 'nav_admin',
    href: '/admin',
    icon: icons.admin,
    adminOnly: true,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LeftSidebar({ open, onClose }: LeftSidebarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  /** Check if a nav item is active based on current pathname */
  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  /** Navigate to a page and close mobile sidebar */
  const navigate = (href: string) => {
    router.push(href);
    onClose?.();
  };

  /** Handle logout action */
  const handleLogout = () => {
    // TODO: integrate with AuthContext logout
    router.push('/');
  };

  // Translate helper — tries t[key], falls back to label
  const label = (i18nKey: string, fallback: string): string => {
    try {
      const val = (t as Record<string, unknown>)[i18nKey];
      return typeof val === 'string' ? val : fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* ---- Logo ---- */}
        <div className="sb-logo">
          <span className="sb-logo-text">PREDICT &bull; PLAY &bull; WIN</span>
        </div>

        {/* ---- Nav groups ---- */}
        {navGroups.map((group) => (
          <div className="sb-nav-group" key={group.label}>
            <div className="sb-nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.key}
                className={`sb-nav-item${isActive(item.href) ? ' active' : ''}`}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                <span>{label(item.i18nKey, item.label)}</span>
              </button>
            ))}
          </div>
        ))}

        {/* ---- Utility items ---- */}
        <div className="sb-nav-group sb-nav-group-utility">
          {utilityItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <button
                key={item.key}
                className={`sb-nav-item${isActive(item.href) ? ' active' : ''}`}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                <span>{label(item.i18nKey, item.label)}</span>
              </button>
            ))}
        </div>

        {/* ---- Spacer ---- */}
        <div style={{ flex: 1 }} />

        {/* ---- Tournament info card ---- */}
        <div className="sb-tour-card" style={{ fontSize: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <div className="sb-tour-icon">{icons.trophy}</div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '12px',
                  color: 'var(--tx)',
                }}
              >
                {label('sidebar_tourney_name', 'La Liga Pred. Cup S2')}
              </div>
              <div style={{ color: 'var(--tx3)', fontSize: '10px' }}>
                {label('sidebar_tourney_stage', 'Group Stage - MD 2/3')}
              </div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: '6px' }}>
            <div className="progress-fill" style={{ width: '66%' }} />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--tx3)',
              fontSize: '10px',
            }}
          >
            <span>{label('sidebar_md_progress', 'Matchday 2 of 3')}</span>
            <span>66%</span>
          </div>
        </div>

        {/* ---- Logout ---- */}
        <button className="sb-logout" onClick={handleLogout}>
          {icons.logout} Log Out
        </button>
      </aside>
    </>
  );
}
