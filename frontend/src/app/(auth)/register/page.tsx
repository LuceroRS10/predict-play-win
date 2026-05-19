'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '16px',
        background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--accent)' }}>PREDICT</span>
            <span style={{ color: 'var(--tx3)', margin: '0 6px' }}>•</span>
            <span style={{ color: 'var(--green)' }}>PLAY</span>
            <span style={{ color: 'var(--tx3)', margin: '0 6px' }}>•</span>
            <span style={{ color: 'var(--gold)' }}>WIN</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--tx3)', marginTop: '8px' }}>
            Create your account
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
            background: 'var(--red-dim)', border: '1px solid var(--red)',
            fontSize: '13px', color: 'var(--red)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx2)', display: 'block', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--tx)', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx2)', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--tx)', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx2)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--tx)', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx2)', display: 'block', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--tx)', outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', fontSize: '14px',
              fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer',
              background: 'var(--accent)', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--tx3)' }}>
          Already have an account?{' '}
          <span
            onClick={() => router.push('/login')}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}
