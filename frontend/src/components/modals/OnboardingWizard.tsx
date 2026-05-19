'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

// ── Types ──────────────────────────────────────────────────────────
interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface Club {
  id: number;
  name: string;
  logo: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const clubs: Club[] = [
  { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
  { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
  { id: 530, name: 'Atlético Madrid', logo: 'https://media.api-sports.io/football/teams/530.png' },
  { id: 531, name: 'Athletic Club', logo: 'https://media.api-sports.io/football/teams/531.png' },
  { id: 548, name: 'Real Sociedad', logo: 'https://media.api-sports.io/football/teams/548.png' },
  { id: 533, name: 'Villarreal', logo: 'https://media.api-sports.io/football/teams/533.png' },
  { id: 543, name: 'Real Betis', logo: 'https://media.api-sports.io/football/teams/543.png' },
  { id: 536, name: 'Sevilla', logo: 'https://media.api-sports.io/football/teams/536.png' },
  { id: 532, name: 'Valencia', logo: 'https://media.api-sports.io/football/teams/532.png' },
  { id: 547, name: 'Girona', logo: 'https://media.api-sports.io/football/teams/547.png' },
  { id: 727, name: 'Osasuna', logo: 'https://media.api-sports.io/football/teams/727.png' },
  { id: 798, name: 'Mallorca', logo: 'https://media.api-sports.io/football/teams/798.png' },
  { id: 538, name: 'Celta Vigo', logo: 'https://media.api-sports.io/football/teams/538.png' },
  { id: 728, name: 'Rayo Vallecano', logo: 'https://media.api-sports.io/football/teams/728.png' },
  { id: 534, name: 'Las Palmas', logo: 'https://media.api-sports.io/football/teams/534.png' },
  { id: 542, name: 'Alavés', logo: 'https://media.api-sports.io/football/teams/542.png' },
  { id: 540, name: 'Espanyol', logo: 'https://media.api-sports.io/football/teams/540.png' },
  { id: 546, name: 'Getafe', logo: 'https://media.api-sports.io/football/teams/546.png' },
  { id: 745, name: 'Leganés', logo: 'https://media.api-sports.io/football/teams/745.png' },
  { id: 535, name: 'Real Valladolid', logo: 'https://media.api-sports.io/football/teams/535.png' },
];

// ── SVG Icons ──────────────────────────────────────────────────────
const WelcomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 64, height: 64 }}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 48, height: 48 }}>
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 64, height: 64 }}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ── Slide variants ─────────────────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ── Component ──────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

export default function OnboardingWizard({ isOpen, onComplete }: OnboardingWizardProps) {
  const { t, language, setLanguage } = useLanguage();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<'en' | 'es'>(language);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setDirection(1);
      setSelectedClub(null);
      setSelectedLang(language);
    }
  }, [isOpen, language]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onComplete]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Navigation ───────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  const handleComplete = useCallback(() => {
    // Apply language if changed
    if (selectedLang !== language) {
      setLanguage(selectedLang);
    }
    onComplete();
  }, [selectedLang, language, setLanguage, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Step content ─────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="onb-step onb-welcome">
            <div className="onb-icon-wrap" style={{ color: 'var(--accent, #3B82F6)' }}>
              <WelcomeIcon />
            </div>
            <h2 className="onb-title">Welcome to Predict Play Win!</h2>
            <p className="onb-desc">
              Challenge friends in prediction duels, compete in tournaments and leagues,
              and climb the global leaderboard. Make your picks for real football matches
              and prove you know the beautiful game better than anyone.
            </p>
            <div className="onb-features">
              <div className="onb-feature">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, color: '#3B82F6' }}>
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
                </svg>
                <span>Tournaments &amp; Leagues</span>
              </div>
              <div className="onb-feature">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, color: '#22C55E' }}>
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
                </svg>
                <span>ELO Rankings</span>
              </div>
              <div className="onb-feature">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, color: '#F59E0B' }}>
                  <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 5.86 13.95 4c-2.94 1.35-4.14 3.86-4.2 6.18-.02.65.04 1.3.2 1.92.15.6.4 1.18.74 1.7-.42-.12-.82-.35-1.14-.65-.04-.04-.08-.08-.12-.12-.66-.65-1.03-1.55-1.03-2.5 0-.18.01-.36.05-.53C6.4 11.25 5.5 13.36 5.5 15.5c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5c0-1.56-.55-3.06-1.34-4.3z" />
                </svg>
                <span>1v1 Challenges</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="onb-step onb-club-select">
            <div className="onb-icon-wrap" style={{ color: 'var(--accent, #3B82F6)' }}>
              <TrophyIcon />
            </div>
            <h2 className="onb-title">Choose Your Club</h2>
            <p className="onb-desc">
              Select your favourite club. This will be displayed on your profile
              and help personalise your experience.
            </p>
            <div className="onb-club-grid">
              {clubs.map(club => (
                <button
                  key={club.id}
                  className={`onb-club-item${selectedClub === club.id ? ' selected' : ''}`}
                  onClick={() => setSelectedClub(club.id)}
                  title={club.name}
                >
                  <img src={club.logo} alt={club.name} className="onb-club-logo" />
                  <span className="onb-club-name">{club.name}</span>
                  {selectedClub === club.id && (
                    <div className="onb-club-check">
                      <CheckIcon />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onb-step onb-lang-select">
            <div className="onb-icon-wrap" style={{ color: 'var(--accent, #3B82F6)' }}>
              <GlobeIcon />
            </div>
            <h2 className="onb-title">Set Your Language</h2>
            <p className="onb-desc">
              Choose your preferred language. You can always change this later in Settings.
            </p>
            <div className="onb-lang-options">
              <button
                className={`onb-lang-btn${selectedLang === 'en' ? ' selected' : ''}`}
                onClick={() => setSelectedLang('en')}
              >
                <div className="onb-lang-flag">
                  <svg viewBox="0 0 60 30" style={{ width: 48, height: 24, borderRadius: 4 }}>
                    <clipPath id="s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
                    <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
                    <g clipPath="url(#s)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                    </g>
                  </svg>
                </div>
                <div className="onb-lang-info">
                  <div className="onb-lang-name">English</div>
                  <div className="onb-lang-native">English</div>
                </div>
                {selectedLang === 'en' && (
                  <div className="onb-lang-check">
                    <CheckIcon />
                  </div>
                )}
              </button>

              <button
                className={`onb-lang-btn${selectedLang === 'es' ? ' selected' : ''}`}
                onClick={() => setSelectedLang('es')}
              >
                <div className="onb-lang-flag">
                  <svg viewBox="0 0 60 30" style={{ width: 48, height: 24, borderRadius: 4 }}>
                    <rect width="60" height="30" fill="#AA151B" />
                    <rect y="7.5" width="60" height="15" fill="#F1BF00" />
                  </svg>
                </div>
                <div className="onb-lang-info">
                  <div className="onb-lang-name">Spanish</div>
                  <div className="onb-lang-native">Espa&ntilde;ol</div>
                </div>
                {selectedLang === 'es' && (
                  <div className="onb-lang-check">
                    <CheckIcon />
                  </div>
                )}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onb-step onb-ready">
            <div className="onb-icon-wrap" style={{ color: 'var(--accent, #3B82F6)' }}>
              <RocketIcon />
            </div>
            <h2 className="onb-title">You&apos;re Ready to Play!</h2>
            <p className="onb-desc">
              Your profile is all set. Jump in and start predicting matches,
              challenge your friends, and climb the leaderboard!
            </p>
            <div className="onb-summary">
              <div className="onb-summary-row">
                <span className="onb-summary-label">Club</span>
                <span className="onb-summary-value">
                  {selectedClub
                    ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <img
                          src={clubs.find(c => c.id === selectedClub)?.logo || ''}
                          alt=""
                          style={{ width: 20, height: 20, objectFit: 'contain' }}
                        />
                        {clubs.find(c => c.id === selectedClub)?.name || 'None'}
                      </span>
                    )
                    : 'Not selected'}
                </span>
              </div>
              <div className="onb-summary-row">
                <span className="onb-summary-label">Language</span>
                <span className="onb-summary-value">
                  {selectedLang === 'en' ? 'English' : 'Espa\u00f1ol'}
                </span>
              </div>
              <div className="onb-summary-row">
                <span className="onb-summary-label">Starting ELO</span>
                <span className="onb-summary-value">1000</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="onb-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="onb-modal"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Skip button */}
            <button className="onb-skip" onClick={handleSkip}>
              Skip
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* Step content with animation */}
            <div className="onb-content">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer: dots + nav */}
            <div className="onb-footer">
              {/* Progress dots */}
              <div className="onb-dots">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`onb-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="onb-nav">
                {step > 0 && (
                  <button className="onb-btn onb-btn-back" onClick={goBack}>
                    <ArrowLeftIcon />
                    Back
                  </button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <button className="onb-btn onb-btn-next" onClick={goNext}>
                    Next
                    <ArrowRightIcon />
                  </button>
                ) : (
                  <button className="onb-btn onb-btn-start" onClick={handleComplete}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
