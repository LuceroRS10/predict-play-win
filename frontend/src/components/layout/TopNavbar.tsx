'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TopNavbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  type: 'challenge' | 'result' | 'reminder';
  title: string;
  titleKey: string;
  subtitle: string;
  subtitleKey: string;
  borderColor: string;
  bgClass?: string;
  icon: React.ReactNode;
  read: boolean;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'challenge',
    titleKey: 'notif_diego_challenge',
    title: 'Diego challenged you!',
    subtitleKey: 'notif_diego_sub',
    subtitle: '1v1 Challenge — La Liga • 2 min ago',
    borderColor: 'var(--accent)',
    bgClass: 'accent-dim',
    read: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.92 5L5.5 6.42 10.08 11 5.5 15.58 6.92 17 13 11 6.92 5zm6 0L11.5 6.42 16.08 11 11.5 15.58 12.92 17 19 11 12.92 5z" />
      </svg>
    ),
  },
  {
    id: 2,
    type: 'result',
    titleKey: 'notif_pred_correct',
    title: 'Prediction correct! +3 pts',
    subtitleKey: 'notif_pred_sub',
    subtitle: 'Real Madrid 2-0 Getafe • 1h ago',
    borderColor: 'var(--green)',
    read: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E" style={{ display: 'inline', verticalAlign: 'middle' }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    id: 3,
    type: 'reminder',
    titleKey: 'notif_lock_2h',
    title: 'Predictions lock in 2 hours!',
    subtitleKey: 'notif_lock_sub',
    subtitle: 'Matchday 2 — La Liga • 2h ago',
    borderColor: 'var(--yellow)',
    read: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" style={{ display: 'inline', verticalAlign: 'middle' }}>
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { t, language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchValue, setSearchValue] = useState('');

  // Refs for click-outside handling
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = () => {
    setNotifOpen(false);
    router.push('/notifications');
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    router.push('/login');
  };

  // User initials & display name (from auth context or mock)
  const displayName = user?.displayName ?? 'Carlos';
  const initials = user?.initials ?? 'CM';

  return (
    <nav className="ppw-nav">
      {/* ── Hamburger (mobile) ── */}
      <button className="mob-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {/* ── Brand / Logo ── */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          router.push('/dashboard');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          marginRight: '16px',
        }}
      >
        <span style={{ fontSize: '22px' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ display: 'inline', verticalAlign: 'middle' }}
          >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="currentColor" opacity="0.1" />
          </svg>
        </span>
        <span
          style={{
            fontWeight: 800,
            fontSize: '16px',
            color: 'var(--tx)',
            whiteSpace: 'nowrap',
          }}
          className="desk-only"
        >
          Predict <span style={{ color: 'var(--accent)' }}>•</span> Play{' '}
          <span style={{ color: 'var(--accent)' }}>•</span> Win
        </span>
      </a>

      {/* ── Search (desktop only) ── */}
      <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }} className="desk-only">
        <input
          type="text"
          className="ppw-input"
          placeholder={t?.search_placeholder ?? 'Search players, tournaments...'}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
        />
        <span
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--tx3)',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          {/* Search icon SVG */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </span>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Right-side actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* ── Notification bell ── */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setUserMenuOpen(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--tx2)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '6px',
              position: 'relative',
            }}
            aria-label="Notifications"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="notif-dropdown" style={{ display: 'block' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '14px' }}>
                  {t?.nav_notifications ?? 'Notifications'}
                </span>
                <button
                  onClick={handleMarkAllRead}
                  className="btn btn-o"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  {t?.mark_all_read ?? 'Mark All Read'}
                </button>
              </div>

              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="notif-item"
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${notif.borderColor}`,
                    background:
                      notif.type === 'challenge' ? 'var(--accent-dim)' : undefined,
                    marginBottom: '4px',
                    cursor: 'pointer',
                    opacity: notif.read ? 0.6 : 1,
                  }}
                  onClick={handleNotifClick}
                >
                  <span>{notif.icon}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {t?.[notif.titleKey as keyof typeof t] as string ?? notif.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>
                      {t?.[notif.subtitleKey as keyof typeof t] as string ?? notif.subtitle}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', padding: '8px' }}>
                <button
                  onClick={handleNotifClick}
                  className="btn btn-o"
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  {t?.view_all ?? 'View All'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Language toggle ── */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: '2px' }}
          title="Language"
        >
          {/* Globe icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: 'var(--tx3)', marginRight: '2px' }}
          >
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
          </svg>
          <div className="lang-toggle">
            <button
              className={`lang-btn${language === 'en' ? ' active' : ''}`}
              onClick={() => language !== 'en' && toggleLanguage()}
            >
              {/* UK flag mini */}
              <svg width="16" height="12" viewBox="0 0 60 30" style={{ marginRight: '3px', verticalAlign: 'middle', borderRadius: '2px' }}>
                <clipPath id="ukClip"><rect width="60" height="30" /></clipPath>
                <g clipPath="url(#ukClip)">
                  <rect width="60" height="30" fill="#012169" />
                  <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
                  <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="2" />
                  <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
                  <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
                </g>
              </svg>
              EN
            </button>
            <button
              className={`lang-btn${language === 'es' ? ' active' : ''}`}
              onClick={() => language !== 'es' && toggleLanguage()}
            >
              {/* Spain flag mini */}
              <svg width="16" height="12" viewBox="0 0 60 30" style={{ marginRight: '3px', verticalAlign: 'middle', borderRadius: '2px' }}>
                <rect width="60" height="30" fill="#c60b1e" />
                <rect width="60" height="15" y="7.5" fill="#FFC400" />
              </svg>
              ES
            </button>
          </div>
        </div>

        {/* ── Theme toggle ── */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--tx2)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '6px',
          }}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDark ? (
            /* Moon icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          ) : (
            /* Sun icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
            </svg>
          )}
        </button>

        {/* ── User avatar & dropdown ── */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <button
            onClick={() => {
              setUserMenuOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 0 10px rgba(59,130,246,0.25)',
              }}
            >
              {initials}
            </div>
            <span className="desk-only" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx)' }}>
              {displayName}
            </span>
            <span className="desk-only" style={{ color: 'var(--tx3)', fontSize: '10px' }}>
              ▼
            </span>
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <div className="user-dropdown" style={{ display: 'block' }}>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push('/settings');
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
                </svg>{' '}
                {t?.settings ?? 'Settings'}
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push('/profile');
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>{' '}
                {t?.my_profile ?? 'My Profile'}
              </button>
              <button
                onClick={handleLogout}
                style={{ color: 'var(--red)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>{' '}
                {t?.log_out ?? 'Log Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
