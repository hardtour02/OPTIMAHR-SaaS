

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomizeProvider, useCustomize } from './contexts/CustomizeContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Birthdays from './pages/Birthdays';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import EmployeeProfile from './pages/EmployeeProfile';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Loans from './pages/Loans';
import Inventory from './pages/Inventory';
import Notifications from './pages/Notifications';
import Documents from './pages/Documents';
import Absences from './pages/Absences';
import Organization from './pages/Organization';
import MyProfile from './pages/MyProfile';


const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : null;
};

const PALETTES = {
  dark: {
    default: {
      '--color-primary': hexToRgb('#1E88E5'),
      '--color-secondary': hexToRgb('#43A047'),
      '--color-background': hexToRgb('#121212'),
      '--color-surface': hexToRgb('#212121'),
      '--color-on-surface': hexToRgb('#F5F5F5'),
      '--color-on-surface-variant': hexToRgb('#BDBDBD'),
      '--color-error': hexToRgb('#E53935'),
      '--color-alert': hexToRgb('#FB8C00'),
      '--color-success': hexToRgb('#66BB6A'),
      '--color-info': hexToRgb('#64B5F6'),
      '--color-primary-dark-hover': hexToRgb('#1565C0'),
      '--color-secondary-dark-hover': hexToRgb('#388E3C'),
      '--color-primary-light-hover': hexToRgb('#1E293B'),
      '--color-neutral-border': hexToRgb('#424242'),
      '--color-table-row-striped': hexToRgb('#2a2a2a'),
    },
    variant1: {
      '--color-primary': hexToRgb('#dc2626'),
      '--color-secondary': hexToRgb('#f43f5e'),
      '--color-background': hexToRgb('#171717'),
      '--color-surface': hexToRgb('#262626'),
      '--color-on-surface': hexToRgb('#f5f5f5'),
      '--color-on-surface-variant': hexToRgb('#a3a3a3'),
    },
    variant2: {
      '--color-primary': hexToRgb('#f59e0b'),
      '--color-secondary': hexToRgb('#f97316'),
      '--color-background': hexToRgb('#1c1917'),
      '--color-surface': hexToRgb('#292524'),
      '--color-on-surface': hexToRgb('#f5f5f4'),
      '--color-on-surface-variant': hexToRgb('#a8a29e'),
    },
  },
  light: {
    default: {
      '--color-primary': hexToRgb('#1E88E5'),
      '--color-secondary': hexToRgb('#43A047'),
      '--color-background': hexToRgb('#F5F5F5'),
      '--color-surface': hexToRgb('#FFFFFF'),
      '--color-on-surface': hexToRgb('#212121'),
      '--color-on-surface-variant': hexToRgb('#757575'),
      '--color-error': hexToRgb('#E53935'),
      '--color-alert': hexToRgb('#FB8C00'),
      '--color-success': hexToRgb('#66BB6A'),
      '--color-info': hexToRgb('#64B5F6'),
      '--color-primary-dark-hover': hexToRgb('#1565C0'),
      '--color-secondary-dark-hover': hexToRgb('#388E3C'),
      '--color-primary-light-hover': hexToRgb('#E3F2FD'),
      '--color-neutral-border': hexToRgb('#BDBDBD'),
      '--color-table-row-striped': hexToRgb('#FAFAFA'),
    },
    variant1: {
      '--color-primary': hexToRgb('#0ea5e9'),
      '--color-secondary': hexToRgb('#06b6d4'),
      '--color-background': hexToRgb('#f0f9ff'),
      '--color-surface': hexToRgb('#ffffff'),
      '--color-on-surface': hexToRgb('#0c4a6e'),
      '--color-on-surface-variant': hexToRgb('#38bdf8'),
    },
    variant2: {
      '--color-primary': hexToRgb('#c026d3'),
      '--color-secondary': hexToRgb('#ec4899'),
      '--color-background': hexToRgb('#fdf2f8'),
      '--color-surface': hexToRgb('#ffffff'),
      '--color-on-surface': hexToRgb('#500724'),
      '--color-on-surface-variant': hexToRgb('#701a75'),
    },
  },
};

const App: React.FC = () => {
  return (
    <CustomizeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </CustomizeProvider>
  );
};

const Main: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { settings, loading: customizeLoading } = useCustomize();
  
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Favicon logic
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.branding.faviconUrl;

      // Theme logic
      const { mode, colorVariant } = settings.theme;
      if (mode === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }

      let selectedPalette;
      const customTheme = settings.customThemes?.find(t => t.id === colorVariant);
      
      if (customTheme) {
          selectedPalette = customTheme.palettes[mode];
      } else {
          selectedPalette = PALETTES[mode][colorVariant as 'default' | 'variant1' | 'variant2'] || PALETTES[mode].default;
      }
      
      for (const [key, value] of Object.entries(selectedPalette)) {
          if(value) root.style.setProperty(key, value as string);
      }
      
      // Accessibility logic
      if (settings.accessibility) {
          const { fontSize, highContrast } = settings.accessibility;
          
          if (highContrast) {
              root.classList.add('high-contrast');
          } else {
              root.classList.remove('high-contrast');
          }

          if (fontSize === 'small') root.style.fontSize = '14px';
          else if (fontSize === 'large') root.style.fontSize = '18px';
          else root.style.fontSize = '16px'; // medium
      }

      // Animation logic
      if (settings.layout?.animationsEnabled === false) {
          root.classList.add('no-animations');
      } else {
          root.classList.remove('no-animations');
      }
    }
  }, [settings]);

  // Prevent flash of unstyled content while settings are loading for the first time
  if (customizeLoading && !settings) {
    return null; 
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/new" element={<AddEmployee />} />
                    <Route path="/employee/:id" element={<EmployeeProfile />} />
                    <Route path="/employee/:id/edit" element={<EditEmployee />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/loans" element={<Loans />} />
                    <Route path="/absences" element={<Absences />} />
                    <Route path="/birthdays" element={<Birthdays />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/organization" element={<Organization />} />
                    <Route path="/my-profile" element={<MyProfile />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        } />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;