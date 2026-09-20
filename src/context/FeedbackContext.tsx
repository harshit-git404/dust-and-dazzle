'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, RefreshCw, X } from 'lucide-react';
import { FlameSpinner } from '@/components/ui/FlameSpinner';

export type FeedbackType = 'success' | 'error' | 'info' | 'pending';

export interface ToastItem {
  id: string;
  type: FeedbackType;
  message: string;
  detail?: string;
  onRetry?: () => void;
  duration?: number;
  isLongRunning?: boolean;
}

interface FeedbackContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  showSuccess: (message: string, detail?: string) => string;
  showError: (message: string, onRetry?: () => void) => string;
  startAsyncOperation: (initialMessage: string) => {
    finish: (successMessage: string) => void;
    fail: (errorMessage: string, onRetry?: () => void) => void;
  };
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>): string => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      if (toast.duration !== 0 && toast.type !== 'error' && toast.type !== 'pending') {
        const timeout = toast.duration || 3500;
        setTimeout(() => {
          dismissToast(id);
        }, timeout);
      }

      return id;
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (message: string, detail?: string) => {
      return showToast({ type: 'success', message, detail });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, onRetry?: () => void) => {
      return showToast({ type: 'error', message, onRetry, duration: 0 });
    },
    [showToast]
  );

  const startAsyncOperation = useCallback(
    (initialMessage: string) => {
      const id = showToast({
        type: 'pending',
        message: initialMessage,
        duration: 0,
      });

      // 4-second dwell warning
      const warnTimer = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isLongRunning: true,
                  detail: 'This is taking longer than usual...',
                }
              : t
          )
        );
      }, 4000);

      // 30-second timeout safety
      const timeoutTimer = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  type: 'error',
                  isLongRunning: false,
                  message: 'Operation timed out after 30 seconds.',
                  detail: 'Please check your connection and try again.',
                }
              : t
          )
        );
      }, 30000);

      return {
        finish: (successMessage: string) => {
          clearTimeout(warnTimer);
          clearTimeout(timeoutTimer);
          setToasts((prev) =>
            prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    type: 'success',
                    isLongRunning: false,
                    message: successMessage,
                    detail: undefined,
                  }
                : t
            )
          );
          setTimeout(() => dismissToast(id), 3000);
        },
        fail: (errorMessage: string, onRetry?: () => void) => {
          clearTimeout(warnTimer);
          clearTimeout(timeoutTimer);
          setToasts((prev) =>
            prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    type: 'error',
                    isLongRunning: false,
                    message: errorMessage,
                    onRetry,
                  }
                : t
            )
          );
        },
      };
    },
    [showToast, dismissToast]
  );

  return (
    <FeedbackContext.Provider
      value={{
        showToast,
        dismissToast,
        showSuccess,
        showError,
        startAsyncOperation,
      }}
    >
      {children}

      {/* Accessible Live Region Toasts */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-sm border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-[var(--bg-surface-elevated)]/95 border-emerald-500/40 text-[var(--text-primary)]'
                : toast.type === 'error'
                ? 'bg-[var(--bg-surface-elevated)]/95 border-red-500/50 text-[var(--text-primary)]'
                : toast.type === 'pending'
                ? 'bg-[var(--bg-surface-elevated)]/95 border-[var(--color-diya)]/40 text-[var(--text-primary)]'
                : 'bg-[var(--bg-surface-elevated)]/95 border-[var(--border-subtle)] text-[var(--text-primary)]'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              {toast.type === 'pending' && (
                <FlameSpinner size="sm" className="text-[var(--color-diya)]" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-[var(--color-banyan)]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-xs font-serif space-y-0.5">
              <p className="font-medium">{toast.message}</p>
              {toast.detail && (
                <p className="text-[11px] text-[var(--text-secondary)] italic">
                  {toast.detail}
                </p>
              )}
              {toast.onRetry && (
                <button
                  type="button"
                  onClick={() => {
                    dismissToast(toast.id);
                    toast.onRetry?.();
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-terracotta)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--color-diya)]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-diya)]"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
