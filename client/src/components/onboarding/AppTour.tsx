import React, { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import ReactDOMServer from 'react-dom/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// UserRole type for clarity
export type UserRole = 'Admin' | 'Manager' | 'Regular' | undefined;

interface AppTourProps {
  isConnected: boolean;
  userRole: UserRole;
}

// Helper to create custom step content with shadcn/ui components
function getStepContent({
  stepId,
  title,
  description,
  showBack,
  showNext,
  showFinish,
  showClose,
}: {
  stepId: string;
  title: string;
  description: string;
  showBack?: boolean;
  showNext?: boolean;
  showFinish?: boolean;
  showClose?: boolean;
}) {
  return ReactDOMServer.renderToString(
    <Card className="max-w-xs shadow-lg relative">
      {showClose && (
        <button
          id={`shepherd-close-${stepId}`}
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-red-500 transition-colors rounded-full focus:outline-none"
          aria-label="Close tour"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2 mt-2">
          {showBack && (
            <Button variant="outline" size="sm" id={`shepherd-back-${stepId}`}>
              Back
            </Button>
          )}
          {showNext && (
            <Button size="sm" id={`shepherd-next-${stepId}`}>
              Next
            </Button>
          )}
          {showFinish && (
            <Button size="sm" id={`shepherd-finish-${stepId}`}>
              Finish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AppTour component: Handles onboarding tour for all user states.
 * - Shows connect wallet step if not connected
 * - Shows role-based tour if connected
 * - Listens for 'start-shepherd-tour' event to re-trigger
 */
const AppTour: React.FC<AppTourProps> = ({ isConnected, userRole }) => {
  const tourRef = useRef<Tour | null>(null);

  // Helper to wire up custom button actions with unique IDs
  function wireStepButtons(
    tour: Tour,
    stepId: string,
    hasBack: boolean,
    hasNext: boolean,
    hasFinish: boolean,
    hasClose: boolean
  ) {
    setTimeout(() => {
      if (hasBack) {
        const backBtn = document.getElementById(`shepherd-back-${stepId}`);
        if (backBtn) backBtn.onclick = () => tour.back();
      }
      if (hasNext) {
        const nextBtn = document.getElementById(`shepherd-next-${stepId}`);
        if (nextBtn) nextBtn.onclick = () => tour.next();
      }
      if (hasFinish) {
        const finishBtn = document.getElementById(`shepherd-finish-${stepId}`);
        if (finishBtn) finishBtn.onclick = () => tour.complete();
      }
      if (hasClose) {
        const closeBtn = document.getElementById(`shepherd-close-${stepId}`);
        if (closeBtn) closeBtn.onclick = () => tour.complete();
      }
    }, 0);
  }

  // Helper to start the correct tour
  const startTour = () => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        scrollTo: true,
        cancelIcon: { enabled: false }, // Disable Shepherd's default X
        classes: 'shepherd-theme-arrows',
      },
      useModalOverlay: true,
    });

    // If not connected, only show connect wallet step
    if (!isConnected) {
      tour.addStep({
        id: 'wallet-connect',
        text: getStepContent({
          stepId: 'wallet-connect',
          title: 'Connect Wallet',
          description: 'Connect your wallet to get started!',
          showFinish: true,
          showClose: true,
        }),
        attachTo: { element: '.wallet-connect-btn', on: 'bottom' },
        buttons: [],
        when: {
          show: () =>
            wireStepButtons(tour, 'wallet-connect', false, false, true, true),
        },
      });
      tour.start();
      tourRef.current = tour;
      return;
    }

    // Connected: show role-based tour
    // All roles see Dashboard and Transactions
    tour.addStep({
      id: 'dashboard',
      text: getStepContent({
        stepId: 'dashboard',
        title: 'Dashboard',
        description: 'This is your dashboard overview.',
        showNext: true,
        showClose: true,
      }),
      attachTo: { element: '.sidebar-dashboard', on: 'right' },
      buttons: [],
      when: {
        show: () =>
          wireStepButtons(tour, 'dashboard', false, true, false, true),
      },
    });
    tour.addStep({
      id: 'transactions',
      text: getStepContent({
        stepId: 'transactions',
        title: 'Transactions',
        description: 'View and create transactions here.',
        showBack: true,
        showNext: userRole === 'Regular' ? false : true,
        showFinish: userRole === 'Regular',
        showClose: true,
      }),
      attachTo: { element: '.sidebar-transactions', on: 'right' },
      buttons: [],
      when: {
        show: () =>
          wireStepButtons(
            tour,
            'transactions',
            true,
            userRole === 'Regular' ? false : true,
            userRole === 'Regular',
            true
          ),
      },
    });

    // Manager and Admin see Approvals
    if (userRole === 'Manager' || userRole === 'Admin') {
      tour.addStep({
        id: 'approvals',
        text: getStepContent({
          stepId: 'approvals',
          title: 'Approvals',
          description: 'Approve or reject transactions here.',
          showBack: true,
          showNext: userRole === 'Admin',
          showFinish: userRole === 'Manager',
          showClose: true,
        }),
        attachTo: { element: '.sidebar-approvals', on: 'right' },
        buttons: [],
        when: {
          show: () =>
            wireStepButtons(
              tour,
              'approvals',
              true,
              userRole === 'Admin',
              userRole === 'Manager',
              true
            ),
        },
      });
    }

    // Admin sees Users
    if (userRole === 'Admin') {
      tour.addStep({
        id: 'users',
        text: getStepContent({
          stepId: 'users',
          title: 'User Management',
          description: 'Manage users (admins only).',
          showBack: true,
          showNext: true,
          showClose: true,
        }),
        attachTo: { element: '.sidebar-users', on: 'right' },
        buttons: [],
        when: {
          show: () => wireStepButtons(tour, 'users', true, true, false, true),
        },
      });
    }

    // All roles see Disconnect as last step
    tour.addStep({
      id: 'disconnect',
      text: getStepContent({
        stepId: 'disconnect',
        title: 'Disconnect',
        description: 'Disconnect your wallet here.',
        showBack: true,
        showFinish: true,
        showClose: true,
      }),
      attachTo: { element: '.disconnect-btn', on: 'top' },
      buttons: [],
      when: {
        show: () =>
          wireStepButtons(tour, 'disconnect', true, false, true, true),
      },
    });

    tour.start();
    tourRef.current = tour;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Show on first visit
    if (!localStorage.getItem('hasSeenTour')) {
      startTour();
      localStorage.setItem('hasSeenTour', 'true');
    }
    // Listen for manual trigger
    const handler = () => startTour();
    window.addEventListener('start-shepherd-tour', handler);
    return () => window.removeEventListener('start-shepherd-tour', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userRole]);

  return null;
};

export default AppTour;
