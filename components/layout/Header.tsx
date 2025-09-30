


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Notification } from '../../types';
import { useCustomize } from '../../contexts/CustomizeContext';
import { useToast } from '../../contexts/ToastContext';

const Header: React.FC = () => {
  const { logout, user } = useAuth();
  const { settings } = useCustomize();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastNotifCount, setLastNotifCount] = useState(0);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      const updatedNotifications = await api.getNotifications();
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };


  useEffect(() => {
    const fetchAndCheckNotifications = async () => {
      try {
        await Promise.all([
          api.checkAndCreateBirthdayNotifications(),
          api.checkAndCreateLoanNotifications(),
          api.checkStockLevels(),
          api.checkAndCreateContractNotifications(),
        ]);
        const allNotifications = await api.getNotifications({ status: 'recent' });
        setNotifications(allNotifications);

        const newUnreadCount = allNotifications.filter(n => n.status === 'unread').length;

        if (newUnreadCount > lastNotifCount) {
            const newNotifications = allNotifications.filter(n => n.status === 'unread').slice(0, newUnreadCount - lastNotifCount);
            const enabledModules = settings?.notifications.enabledModules;
            newNotifications.forEach(n => {
                let canShow = false;
                switch(n.type){
                    case 'birthday': canShow = enabledModules?.birthdays ?? false; break;
                    case 'loan': canShow = enabledModules?.loans ?? false; break;
                    case 'contract_expiry': canShow = enabledModules?.contracts ?? false; break;
                    case 'low_stock':
                    case 'accessory_low_stock': 
                        canShow = enabledModules?.inventory ?? false; break;
                    case 'leave_balance_limit': canShow = true; break;
                }
                if (canShow) showToast(n.message);
            });
        }
        setLastNotifCount(newUnreadCount);

      } catch (error) {
        console.error("Failed to check for notifications", error);
      }
    };

    fetchAndCheckNotifications();
    const intervalId = setInterval(fetchAndCheckNotifications, 10000); 

    return () => clearInterval(intervalId);
  }, [lastNotifCount, showToast, settings]);

  const unreadNotifications = notifications.filter(n => n.status === 'unread');
  const unreadCount = unreadNotifications.length;
  
  const getIconForNotif = (type: Notification['type']) => {
    switch(type) {
        case 'birthday': return '🎂';
        case 'loan': return '❗';
        case 'low_stock': return '📦';
        case 'accessory_low_stock': return '🔧';
        case 'contract_expiry': return '📜';
        case 'leave_balance_limit': return '⚠️';
        default: return '🔔';
    }
  }

  const headerTitle = settings?.branding.headerTitle.replace('{userRole}', user?.roleName || 'Usuario') || `Bienvenido, ${user?.roleName || 'Usuario'}`;
  const headerSubtitle = settings?.branding.headerSubtitle || 'Gestión de Recursos Humanos Simplificada';

  return (
    <>
      <header className="h-16 bg-primary text-white border-b border-white/20 flex items-center justify-between px-6">
         <div>
           <h2 className="text-lg font-semibold">{headerTitle}</h2>
           <p className="text-xs text-white/80">{headerSubtitle}</p>
         </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(prev => !prev)} className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <BellIcon/>
              {unreadCount > 0 && 
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-error text-white text-xs flex items-center justify-center border-2 border-primary">
                  {unreadCount}
                </span>
              }
            </button>
            
            {isDropdownOpen && (
               <div className="absolute right-0 mt-2 w-80 bg-surface border border-neutral-border rounded-md shadow-lg z-10">
                  <div className="p-3 font-semibold border-b border-neutral-border flex justify-between items-center text-on-surface">
                    <span>Notificaciones</span>
                  </div>
                  {unreadCount > 0 ? (
                      <>
                        <ul className="py-2 max-h-64 overflow-y-auto">
                            {unreadNotifications.slice(0, 5).map((notif) => (
                                <li key={notif.id} className="px-4 py-2 text-sm text-on-surface-variant border-b border-neutral-border/50 last:border-b-0">
                                    <p>{getIconForNotif(notif.type)} {notif.message}</p>
                                    <div className="text-right mt-2">
                                        <button 
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="text-xs font-semibold text-success hover:opacity-80 bg-success/10 px-2 py-1 rounded-md transition-colors"
                                        >
                                            Marcar como leído
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         <div className="p-2 border-t border-neutral-border text-center">
                            <Link to="/notifications" onClick={() => setIsDropdownOpen(false)} className="text-sm font-medium text-primary hover:underline">
                                Ver todas las notificaciones
                            </Link>
                        </div>
                      </>
                  ) : (
                      <p className="p-4 text-sm text-center text-on-surface-variant">No hay notificaciones nuevas.</p>
                  )}
               </div>
            )}
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-3 p-2 -m-2 rounded-lg">
              <img className="h-9 w-9 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${user?.email}`} alt="Avatar" />
              <div>
                   <p className="text-sm font-medium">{user?.roleName}</p>
                   <p className="text-xs text-white/80">{user?.email}</p>
              </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <LogoutIcon />
            <span>Salir</span>
          </button>
        </div>
      </header>
    </>
  );
};

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
)

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
)

export default Header;