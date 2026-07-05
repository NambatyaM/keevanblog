'use client';

import { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Settings, X } from 'lucide-react';

export function HomeAdminTrigger() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Floating button (bottom-right) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition"
        style={{ backgroundColor: '#00854a' }}
        aria-label="Open admin dashboard"
        title="Admin dashboard (Ctrl+Shift+A)"
      >
        <Settings className="w-5 h-5" />
      </button>

      <AdminDashboard open={open} onClose={() => setOpen(false)} />
    </>
  );
}
