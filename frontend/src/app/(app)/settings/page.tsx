'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

// Types
interface NotificationSetting {
  key: string;
  labelKey: string;
  labelFallback: string;
  subKey: string;
  subFallback: string;
  defaultChecked: boolean;
}

// Mock notification settings
const notificationSettings: NotificationSetting[] = [
  {
    key: 'challenge',
    labelKey: 'challenge_notif',
    labelFallback: 'Challenge notifications',
    subKey: 'challenge_notif_sub',
    subFallback: 'When someone challenges you',
    defaultChecked: true,
  },
  {
    key: 'predictions',
    labelKey: 'pred_reminders',
    labelFallback: 'Prediction reminders',
    subKey: 'pred_reminders_sub',
    subFallback: 'Before prediction locks',
    defaultChecked: true,
  },
  {
    key: 'results',
    labelKey: 'result_notif',
    labelFallback: 'Result notifications',
    subKey: 'result_notif_sub',
    subFallback: 'When match results are in',
    defaultChecked: true,
  },
  {
    key: 'elo',
    labelKey: 'elo_updates',
    labelFallback: 'ELO updates',
    subKey: 'elo_updates_sub',
    subFallback: 'Rating changes after matches',
    defaultChecked: false,
  },
  {
    key: 'digest',
    labelKey: 'email_digest',
    labelFallback: 'Email digest',
    subKey: 'email_digest_sub',
    subFallback: 'Weekly summary email',
    defaultChecked: false,
  },
];

const clubs = ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla'];

export default function SettingsPage() {
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Account form state
  const [email, setEmail] = useState('carlos@example.com');
  const [displayName, setDisplayName] = useState('Carlos Martinez');
  const [favoriteClub, setFavoriteClub] = useState('Real Madrid');

  // Notification toggles
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationSettings.map((n) => [n.key, n.defaultChecked]))
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNotificationToggle = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = () => {
    // TODO: API call to save account changes
    console.log('Saving changes:', { email, displayName, favoriteClub });
  };

  const handleUpdatePassword = () => {
    // TODO: API call to update password
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Updating password');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="page" id="page-settings">
      <div className="section-head">
        <div className="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          {t.settings_title || 'Settings'}
        </div>
      </div>

      {/* Theme */}
      <div className="crd mb-16" id="themeSettingsCard">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm0-18.5c-3.49 0-6 2.51-6 6v.5l-2 2V14h16v-2l-2-2v-.5c0-3.49-2.51-6-6-6zm-1 4c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-1 3h4v1h-4v-1z" />
          </svg>
          {t.theme_section || 'Theme'}
        </div>
        <div className="grid-2" style={{ maxWidth: '400px' }}>
          <div
            className={`crd crd-glow${isDark ? '' : ''}`}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              borderColor: isDark ? 'var(--accent)' : undefined,
            }}
            onClick={() => toggleTheme()}
          >
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>
              {t.dark_mode || 'Dark Mode'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>
              {t.default_theme || 'Default theme'}
            </div>
          </div>
          <div
            className="crd crd-glow"
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              borderColor: !isDark ? 'var(--accent)' : undefined,
            }}
            onClick={() => toggleTheme()}
          >
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>
              {t.light_mode || 'Light Mode'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>
              {t.easier_eyes || 'Easier on the eyes'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="crd mb-16">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {t.account_info || 'Account Information'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '500px' }}>
          <div>
            <label className="ppw-label">{t.username_label || 'Username'}</label>
            <input
              type="text"
              className="ppw-input"
              value="carlos_martinez"
              readOnly
              style={{ opacity: 0.6 }}
            />
          </div>
          <div>
            <label className="ppw-label">{t.email_label || 'Email'}</label>
            <input
              type="text"
              className="ppw-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="ppw-label">{t.display_name_label || 'Display Name'}</label>
            <input
              type="text"
              className="ppw-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="ppw-label">{t.fav_club_label || 'Favorite Club'}</label>
            <select
              className="ppw-input"
              value={favoriteClub}
              onChange={(e) => setFavoriteClub(e.target.value)}
            >
              {clubs.map((club) => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-p mt-12" style={{ fontSize: '13px' }} onClick={handleSaveChanges}>
          {t.save_changes || 'Save Changes'}
        </button>
      </div>

      {/* Notification Preferences */}
      <div className="crd mb-16">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          {t.notif_preferences || 'Notification Preferences'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          {notificationSettings.map((setting) => (
            <div key={setting.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {(t as any)[setting.labelKey] || setting.labelFallback}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>
                  {(t as any)[setting.subKey] || setting.subFallback}
                </div>
              </div>
              <label className="toggle-wrap">
                <input
                  type="checkbox"
                  checked={notifications[setting.key]}
                  onChange={() => handleNotificationToggle(setting.key)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="crd">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          {t.security_section || 'Security'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          <div>
            <label className="ppw-label">{t.current_password || 'Current Password'}</label>
            <input
              type="password"
              className="ppw-input"
              placeholder={t.enter_current_pw || 'Enter current password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="ppw-label">{t.new_password || 'New Password'}</label>
            <input
              type="password"
              className="ppw-input"
              placeholder={t.enter_new_pw || 'Enter new password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="ppw-label">{t.confirm_password || 'Confirm New Password'}</label>
            <input
              type="password"
              className="ppw-input"
              placeholder={t.confirm_new_pw || 'Confirm new password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            className="btn btn-o"
            style={{ fontSize: '13px', width: 'fit-content' }}
            onClick={handleUpdatePassword}
          >
            {t.update_password || 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
