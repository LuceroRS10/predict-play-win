'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const router = useRouter();
  useEffect(() => {
    // Notifications are handled in the navbar dropdown
    // This page redirects to dashboard
    router.replace('/dashboard');
  }, [router]);
  return null;
}
