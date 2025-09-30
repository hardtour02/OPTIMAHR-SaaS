

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomize } from '../../contexts/CustomizeContext';

const Sidebar: React.FC = () => {
  const { hasPermission } = useAuth();
  const { settings } = useCustomize();

  const [isCollapsed, setIsCollapsed] = useState(settings?.layout?.sidebarDefaultCollapsed ?? false);

  useEffect(() => {
    if (settings?.layout) {
      setIsCollapsed(settings.layout.sidebarDefaultCollapsed);
    }
  }, [settings?.layout?.sidebarDefaultCollapsed]);

  const accessibleNavLinks = NAV_LINKS.filter(link => {
      if (link.path === '/settings') {
          return hasPermission('settings:write') || hasPermission('roles:write');
      }
      return link.permission ? hasPermission(link.permission) : true;
  });

  const isFooterVisible = settings?.layout?.footerVisible ?? true;

  return (
    <aside className={`flex-shrink-0 bg-primary text-white flex flex-col transition-width duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`h-16 flex items-center border-b border-white/20 ${isCollapsed ? 'justify-center' : 'justify-center px-4'}`}>
         <h1 className={`font-bold text-white transition-all duration-300 ${isCollapsed ? 'text-2xl tracking-tighter' : 'text-2xl tracking-wider'}`}>
            {isCollapsed ? 'OHR' : 'OPTIMAHR'}
         </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {accessibleNavLinks.map((link) => {
          return (
            <NavLink
              key={link.name}
              to={link.path}
              title={isCollapsed ? link.name : ''}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''} ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className={isCollapsed ? '' : 'mr-3'}>{link.icon}</span>
              {!isCollapsed && link.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/20">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full flex items-center justify-center p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors" title={isCollapsed ? "Expandir" : "Colapsar"}>
            {isCollapsed ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
        </button>
        {isFooterVisible && !isCollapsed && (
            <div className="text-xs text-white/60 mt-4 text-center">
                <p>{settings?.branding.footerText || '© 2023 HR Pro SaaS. Todos los derechos reservados.'}</p>
            </div>
        )}
      </div>
    </aside>
  );
};

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

export default Sidebar;