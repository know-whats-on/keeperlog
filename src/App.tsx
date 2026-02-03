import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, useLocation } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { SessionStart } from './pages/SessionStart';
import { SessionActive } from './pages/SessionActive';
import { SessionCapture } from './pages/SessionCapture';
import { SessionComplete } from './pages/SessionComplete';
import { LogHistory } from './pages/LogHistory';
import { ExportPage } from './pages/Export';
import { SettingsPage } from './pages/Settings';
import { MediaManager } from './pages/MediaManager';
import { PrintView } from './pages/PrintView';
import { seedCompetencies } from './lib/competencies';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('keeperlog_onboarding_v1');
    const profile = localStorage.getItem('keeperLog_profile');
    
    if (!onboardingComplete || !profile) {
      navigate('/onboarding', { replace: true });
    }
  }, [navigate, location]);

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '/',
    element: <AuthGuard><Layout /></AuthGuard>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'session',
        children: [
          {
            path: 'new',
            element: <SessionStart />
          },
          {
            path: ':id',
            element: <SessionActive />
          },
          {
            path: ':id/capture',
            element: <SessionCapture />
          },
          {
            path: ':id/complete',
            element: <SessionComplete />
          }
        ]
      },
      {
        path: 'logs',
        element: <LogHistory />,
      },
      {
        path: 'add',
        element: <Navigate to="/session/new" replace />, // Legacy redirect
      },
      {
        path: 'export',
        element: <ExportPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'settings/storage',
        element: <MediaManager />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
  {
    path: '/print',
    element: <PrintView />,
  },
]);

export default function App() {
  useEffect(() => {
    seedCompetencies().catch(console.error);
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return <RouterProvider router={router} />;
}
