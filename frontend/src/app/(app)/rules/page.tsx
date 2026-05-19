'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function RulesPage() {
  const { t } = useLanguage();

  return (
    <div className="page" id="page-rules">
      {/* Rules Header */}
      <div className="section-head" style={{ marginBottom: '28px' }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent)" style={{ flexShrink: 0 }}>
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
          </svg>
          {t.rules_title || 'Rules & How It Works'}
        </div>
        <div className="section-sub">{t.rules_sub || 'Everything you need to know about the platform'}</div>
      </div>

      {/* Section 1: What is Predict Play Win? */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(59,130,246,0.15)', boxShadow: '0 0 20px rgba(59,130,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--tx1)', letterSpacing: '-0.3px' }}>
            {t.rules_what_is || 'What is Predict Play Win?'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.7 }}>
          {t.rules_what_is_text || (
            <>
              Predict Play Win is a prediction tournament platform where you compete against other players by predicting real football match results. This is <strong style={{ color: 'var(--tx1)' }}>NOT</strong> betting or gambling — no money is wagered. You compete for bragging rights, ELO rankings, and tournament glory.
            </>
          )}
        </div>
      </div>

      {/* Section 2: How Predictions Work */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #22C55E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(34,197,94,0.15)', boxShadow: '0 0 20px rgba(34,197,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#22C55E">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--tx1)', letterSpacing: '-0.3px' }}>
            {t.rules_predictions || 'How Predictions Work'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.8 }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '12px', color: '#22C55E',
            }}>1</div>
            <span>
              {t.rules_pred_step1 || (
                <>For each football match, predict the result: <strong style={{ color: 'var(--tx1)' }}>Home Win (1)</strong>, <strong style={{ color: 'var(--tx1)' }}>Draw (X)</strong>, or <strong style={{ color: 'var(--tx1)' }}>Away Win (2)</strong>.</>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '12px', color: '#22C55E',
            }}>2</div>
            <span>
              {t.rules_pred_step2 || (
                <>You can edit your predictions at any time <strong style={{ color: 'var(--tx1)' }}>until 5 minutes before kickoff</strong>. After that, predictions are locked.</>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '12px', color: '#22C55E',
            }}>3</div>
            <span>
              {t.rules_pred_step3 || (
                <>Your opponent&apos;s predictions are <strong style={{ color: 'var(--tx1)' }}>hidden until the match locks</strong>. Once locked, both players&apos; picks are revealed simultaneously — no cheating possible.</>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '12px', color: '#EF4444',
            }}>!</div>
            <span>
              {t.rules_pred_missed || (
                <><strong style={{ color: '#EF4444' }}>Missed prediction = 0 points.</strong> If you forget to predict, you get zero for that match. No exceptions.</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Head-to-Head Scoring */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #F59E0B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.15)', boxShadow: '0 0 20px rgba(245,158,11,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--tx1)', letterSpacing: '-0.3px' }}>
            {t.rules_h2h_scoring || 'Head-to-Head Scoring'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.7 }}>
          {t.rules_h2h_intro || (
            <>Every matchday, your predictions go head-to-head against your opponent. Each correct prediction counts as <strong style={{ color: 'var(--tx1)' }}>1 goal</strong> in the H2H scoreline.</>
          )}
        </div>
        {/* Example box */}
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '10px', padding: '16px', marginTop: '12px',
        }}>
          <div style={{
            fontWeight: 700, fontSize: '13px', color: '#F59E0B', marginBottom: '10px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {t.rules_example || 'Example'}
          </div>
          <div style={{ color: 'var(--tx2)', fontSize: '13px', lineHeight: 1.8 }}>
            {t.rules_h2h_example || (
              <>
                A matchday has 10 matches. Carlos predicts 6 correctly, Diego predicts 4 correctly.<br />
                <strong style={{ color: 'var(--tx1)' }}>Result: Carlos 6 – 4 Diego</strong> → Carlos wins the matchday.<br /><br />
                If both predict the same number correctly (e.g., 5–5), it&apos;s a <strong style={{ color: 'var(--tx1)' }}>draw</strong>.
              </>
            )}
          </div>
        </div>
        {/* Points table */}
        <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '8px', padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#22C55E' }}>3</div>
            <div style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '2px' }}>
              {t.rules_pts_win || 'pts for a Win'}
            </div>
          </div>
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '8px', padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#F59E0B' }}>1</div>
            <div style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '2px' }}>
              {t.rules_pts_draw || 'pt for a Draw'}
            </div>
          </div>
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#EF4444' }}>0</div>
            <div style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '2px' }}>
              {t.rules_pts_loss || 'pts for a Loss'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Tournaments */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #8B5CF6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#8B5CF6">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_tournaments || 'Tournaments'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.7 }}>
          {/* Group Stage */}
          <div style={{ fontWeight: 600, color: 'var(--tx1)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B5CF6">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <span>{t.rules_group_stage_title || 'Group Stage'}</span>
          </div>
          <ul style={{ margin: '0 0 16px 20px', padding: 0 }}>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_group_1 || (
                <>Players are randomly drawn into <strong style={{ color: 'var(--tx1)' }}>groups of 4</strong>.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_group_2 || (
                <>Each group plays a full round-robin: <strong style={{ color: 'var(--tx1)' }}>3 matchdays</strong> (everyone plays everyone once).</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_group_3 || (
                <>The <strong style={{ color: '#22C55E' }}>top 2 players</strong> from each group advance to the Knockout Stage.</>
              )}
            </li>
            <li>
              {t.rules_group_4 || 'Tiebreakers: 1) Head-to-head result, 2) Goal difference, 3) ELO rating.'}
            </li>
          </ul>

          {/* Tournament Formats */}
          <div style={{ fontWeight: 600, color: 'var(--tx1)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B5CF6">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>{t.rules_formats_title || 'Tournament Formats'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '8px', padding: '12px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#8B5CF6' }}>
                {t.rules_format_16 || '16 Players'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '4px' }}>
                {t.rules_format_16_desc || '4 groups → QF → SF → Final'}
              </div>
            </div>
            <div style={{
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '8px', padding: '12px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#8B5CF6' }}>
                {t.rules_format_24 || '24 Players'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '4px' }}>
                {t.rules_format_24_desc || '6 groups → R16 → QF → SF → Final'}
              </div>
            </div>
          </div>

          {/* Knockout Stage */}
          <div style={{ fontWeight: 600, color: 'var(--tx1)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B5CF6">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
            </svg>
            <span>{t.rules_knockout_title || 'Knockout Stage'}</span>
          </div>
          <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_knockout_1 || (
                <><strong style={{ color: 'var(--tx1)' }}>Single elimination</strong> — lose and you&apos;re out.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_knockout_2 || (
                <>Each round is decided over <strong style={{ color: 'var(--tx1)' }}>one matchday</strong> of real fixtures.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_knockout_3 || (
                <>If tied, the player with the <strong style={{ color: 'var(--tx1)' }}>higher ELO rating</strong> advances.</>
              )}
            </li>
            <li>
              {t.rules_knockout_4 || (
                <>The tournament champion receives a <strong style={{ color: '#F59E0B' }}>trophy badge</strong> and <strong style={{ color: '#22C55E' }}>+50 ELO bonus</strong>.</>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Section 5: Leagues */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #06B6D4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#06B6D4">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_leagues || 'Leagues'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.7 }}>
          <ul style={{ margin: '0 0 14px 20px', padding: 0 }}>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_league_1 || 'Leagues are long-term competitions based on a real football league (La Liga, Premier League, etc.).'}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_league_2 || (
                <>Players are placed into <strong style={{ color: 'var(--tx1)' }}>divisions</strong> (Division 1, Division 2, Division 3…).</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_league_3 || (
                <>Every player plays every other player in their division. Each matchday uses a <strong style={{ color: 'var(--tx1)' }}>real football round</strong> as the prediction fixtures.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_league_4 || (
                <>Standings use the same points system: <strong style={{ color: '#22C55E' }}>Win = 3 pts</strong>, <strong style={{ color: '#F59E0B' }}>Draw = 1 pt</strong>, <strong style={{ color: '#EF4444' }}>Loss = 0 pts</strong>.</>
              )}
            </li>
            <li>
              {t.rules_league_5 || (
                <>At the end of the season: <strong style={{ color: '#22C55E' }}>top players get promoted</strong> to a higher division, <strong style={{ color: '#EF4444' }}>bottom players get relegated</strong> to a lower division.</>
              )}
            </li>
          </ul>
          {/* Promotion/Relegation visual */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '6px', padding: '6px 12px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#22C55E">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E' }}>
                {t.rules_promotion || 'Promotion Zone'}
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '6px', padding: '6px 12px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#EF4444">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
                {t.rules_relegation || 'Relegation Zone'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: 1v1 Challenges */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #EC4899' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#EC4899">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_challenges || '1v1 Challenges'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.7 }}>
          <ul style={{ margin: '0 0 14px 20px', padding: 0 }}>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_challenge_1 || (
                <>Any registered player can <strong style={{ color: 'var(--tx1)' }}>challenge another player</strong> to a 1v1 duel.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_challenge_2 || (
                <>The challenger picks the league — the system auto-selects the <strong style={{ color: 'var(--tx1)' }}>upcoming matchday&apos;s fixtures</strong>.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_challenge_3 || (
                <>The challenged player has <strong style={{ color: '#F59E0B' }}>24 hours</strong> to accept or decline. After 24h, the challenge expires automatically.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_challenge_4 || (
                <>Maximum <strong style={{ color: 'var(--tx1)' }}>3 active challenges</strong> per player at any time.</>
              )}
            </li>
            <li>
              {t.rules_challenge_5 || (
                <>Challenge results affect your <strong style={{ color: 'var(--tx1)' }}>ELO rating</strong>, just like tournaments and leagues.</>
              )}
            </li>
          </ul>
          {/* Diminishing returns */}
          <div style={{
            background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)',
            borderRadius: '8px', padding: '14px', marginTop: '4px',
          }}>
            <div style={{
              fontWeight: 700, fontSize: '12px', color: '#EC4899',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
            }}>
              {t.rules_diminishing_title || 'Repeated Opponent ELO (Challenges Only)'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#22C55E' }}>100%</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.rules_dim_1st || '1st match'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#84CC16' }}>80%</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.rules_dim_2nd || '2nd match'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#F59E0B' }}>50%</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.rules_dim_3rd || '3rd match'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#EF4444' }}>25%</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.rules_dim_4th || '4th+ match'}</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '8px', textAlign: 'center' }}>
              {t.rules_dim_reset || 'Resets every 21 days'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: ELO Rating System */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #F59E0B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_elo || 'ELO Rating System'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.7 }}>
          <ul style={{ margin: '0 0 14px 20px', padding: 0 }}>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_elo_1 || (
                <>Every player starts at <strong style={{ color: 'var(--tx1)' }}>1,000 ELO</strong>.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_elo_2 || (
                <>After every H2H match, both players&apos; ratings are adjusted based on the result and the <strong style={{ color: 'var(--tx1)' }}>difference in ratings</strong>.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_elo_3 || (
                <>Beat a <strong style={{ color: '#22C55E' }}>higher-rated</strong> opponent → earn more ELO. Lose to a <strong style={{ color: '#EF4444' }}>lower-rated</strong> opponent → lose more ELO.</>
              )}
            </li>
            <li style={{ marginBottom: '6px' }}>
              {t.rules_elo_4 || (
                <>ELO is <strong style={{ color: 'var(--tx1)' }}>global and rolling</strong> — it carries across tournaments, leagues, and challenges (last 365 days).</>
              )}
            </li>
            <li>
              {t.rules_elo_5 || 'The global leaderboard ranks all players by their current ELO rating.'}
            </li>
          </ul>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '8px', padding: '12px', textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#22C55E' }}>
                {t.rules_elo_win_ex || 'Win vs higher rated'}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#22C55E', marginTop: '4px' }}>+25 to +40</div>
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '8px', padding: '12px', textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#EF4444' }}>
                {t.rules_elo_loss_ex || 'Loss vs lower rated'}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#EF4444', marginTop: '4px' }}>-25 to -40</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 8: Supported Leagues */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #3B82F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_supported_leagues || 'Supported Leagues'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd)',
            borderRadius: '8px', padding: '10px 14px',
          }}>
            <img src="https://media.api-sports.io/football/leagues/140.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="La Liga" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tx1)' }}>La Liga</div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>Spain</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd)',
            borderRadius: '8px', padding: '10px 14px',
          }}>
            <img src="https://media.api-sports.io/football/leagues/39.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Premier League" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tx1)' }}>Premier League</div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>England</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd)',
            borderRadius: '8px', padding: '10px 14px',
          }}>
            <img src="https://media.api-sports.io/football/leagues/135.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Serie A" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tx1)' }}>Serie A</div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>Italy</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd)',
            borderRadius: '8px', padding: '10px 14px',
          }}>
            <img src="https://media.api-sports.io/football/leagues/61.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Ligue 1" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tx1)' }}>Ligue 1</div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>France</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--tx3)', marginTop: '10px', fontStyle: 'italic' }}>
          {t.rules_more_leagues || 'More leagues can be added in future updates.'}
        </div>
      </div>

      {/* Section 9: Important Rules */}
      <div className="crd mb-16" style={{ borderLeft: '3px solid #EF4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_important || 'Important Rules'}
          </div>
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '14px', lineHeight: 1.8 }}>
          {[
            { key: 'rules_important_1', text: (<><strong style={{ color: 'var(--tx1)' }}>Predictions lock 5 minutes before kickoff.</strong> Once locked, you cannot change your pick.</>) },
            { key: 'rules_important_2', text: (<><strong style={{ color: 'var(--tx1)' }}>Opponent picks are hidden</strong> until the match locks. Both predictions are revealed at the same time — fair play guaranteed.</>) },
            { key: 'rules_important_3', text: (<><strong style={{ color: 'var(--tx1)' }}>Suspended matches</strong> are automatically excluded from scoring. No one is penalized.</>) },
            { key: 'rules_important_4', text: (<><strong style={{ color: 'var(--tx1)' }}>Match results are automatic</strong> — pulled from live football data. Admins can override if needed.</>) },
            { key: 'rules_important_5', text: (<><strong style={{ color: 'var(--tx1)' }}>You can participate in multiple tournaments and leagues</strong> at the same time.</>) },
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 4 ? '10px' : undefined, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444" style={{ flexShrink: 0, marginTop: '3px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{(t as any)[rule.key] || rule.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Quick Summary */}
      <div className="crd" style={{
        border: '1px solid rgba(59,130,246,0.3)',
        background: 'linear-gradient(135deg,rgba(59,130,246,0.05),rgba(139,92,246,0.05))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--tx1)' }}>
            {t.rules_summary || 'Quick Summary'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { key: 'rules_sum_1', text: 'Predict real football matches' },
            { key: 'rules_sum_2', text: '1 correct prediction = 1 goal' },
            { key: 'rules_sum_3', text: 'Win 3 pts, Draw 1 pt, Loss 0 pts' },
            { key: 'rules_sum_4', text: 'ELO tracks your global ranking' },
            { key: 'rules_sum_5', text: 'No betting — pure competition' },
            { key: 'rules_sum_6', text: 'Fair play — hidden picks until lock' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--tx2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span>{(t as any)[item.key] || item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
