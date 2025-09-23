
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              color: 'white',
              backgroundColor: 
                toast.type === 'success' ? '#10b981' :
                toast.type === 'error' ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}