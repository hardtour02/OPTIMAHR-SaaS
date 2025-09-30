
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useCustomize } from '../../contexts/CustomizeContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useCustomize();
  const isHeaderVisible = settings?.layout?.headerVisible ?? true;

  return (
    <div className="flex h-screen bg-background font-sans text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {isHeaderVisible && <Header />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;