
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { Notification } from '../types';
import Spinner from '../components/ui/Spinner';
import { useFormatting } from '../hooks/useFormatting';

type MainTab = 'recent' | 'archived';
type StatusFilter = 'all' | 'read' | 'unread';

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [mainTab, setMainTab] = useState<MainTab>('recent');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('unread');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const filters: { status?: any; search?: string } = { search: searchTerm };
            if (mainTab === 'archived') {
                filters.status = 'archived';
            } else if (statusFilter !== 'all') {
                filters.status = statusFilter;
            } else {
                filters.status = 'recent'; // 'recent' fetches both read and unread
            }
            
            const data = await api.getNotifications(filters);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [mainTab, statusFilter, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleAction = async (action: 'read' | 'unread' | 'archive' | 'unarchive', id: string) => {
        switch(action) {
            case 'read': await api.markNotificationAsRead(id); break;
            case 'unread': await api.markNotificationAsUnread(id); break;
            case 'archive': await api.archiveNotification(id); break;
            case 'unarchive': await api.unarchiveNotification(id); break;
        }
        fetchData();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Centro de Notificaciones</h1>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <button onClick={() => setMainTab('recent')} className={`${mainTab === 'recent' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Recientes</button>
                        <button onClick={() => setMainTab('archived')} className={`${mainTab === 'archived' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Archivadas</button>
                    </nav>
                </div>

                <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-neutral-border">
                     <input
                        type="search"
                        placeholder="Buscar en notificaciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow bg-background border border-neutral-border rounded-md p-2 text-on-surface"
                    />
                    {mainTab === 'recent' && (
                        <div className="flex-shrink-0 flex items-center gap-2 p-1 bg-background rounded-lg">
                             <button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'bg-primary text-white' : 'text-on-surface-variant'} py-1 px-3 rounded-md font-medium text-sm`}>Todas</button>
                             <button onClick={() => setStatusFilter('unread')} className={`${statusFilter === 'unread' ? 'bg-primary text-white' : 'text-on-surface-variant'} py-1 px-3 rounded-md font-medium text-sm`}>No Leídas</button>
                             <button onClick={() => setStatusFilter('read')} className={`${statusFilter === 'read' ? 'bg-primary text-white' : 'text-on-surface-variant'} py-1 px-3 rounded-md font-medium text-sm`}>Leídas</button>
                        </div>
                    )}
                </div>

                {loading ? <div className="h-96 flex items-center justify-center"><Spinner /></div> : (
                     <NotificationList notifications={notifications} onAction={handleAction} />
                )}
            </div>
        </div>
    );
};

const NotificationList: React.FC<{ notifications: Notification[], onAction: (action: any, id: string) => void }> = ({ notifications, onAction }) => {
    const { formatDate, formatTime } = useFormatting();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;
    
    useEffect(() => { setCurrentPage(1); }, [notifications]);

    const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = notifications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getIconForNotif = (type: Notification['type']) => {
        switch(type) {
            case 'birthday': return <span title="Cumpleaños">🎂</span>;
            case 'loan': return <span title="Préstamo">❗</span>;
            case 'low_stock': return <span title="Bajo Stock">📦</span>;
            case 'accessory_low_stock': return <span title="Bajo Stock (Accesorio)">🔧</span>;
            case 'contract_expiry': return <span title="Vencimiento de Contrato">📜</span>;
            default: return <span>🔔</span>;
        }
    };
    
    if (notifications.length === 0) {
        return <p className="text-center text-on-surface-variant py-16">No se encontraron notificaciones.</p>;
    }

    return (
        <div>
            <ul className="divide-y divide-neutral-border">
                {paginatedNotifications.map(notif => (
                    <li key={notif.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${notif.status === 'unread' ? 'bg-primary/10' : ''}`}>
                        <div className="flex items-start gap-3">
                            <div className="text-xl pt-1">{getIconForNotif(notif.type)}</div>
                            <div>
                                <p className="text-on-surface">{notif.message}</p>
                                <p className="text-xs text-on-surface-variant/80 mt-1">{formatDate(notif.timestamp)} a las {formatTime(notif.timestamp)}</p>
                            </div>
                        </div>
                         <div className="flex-shrink-0 flex items-center gap-2">
                             {notif.status === 'unread' && <button onClick={() => onAction('read', notif.id)} className="text-xs text-success hover:underline">Marcar como leída</button>}
                             {notif.status === 'read' && <button onClick={() => onAction('unread', notif.id)} className="text-xs text-on-surface-variant hover:underline">Marcar no leída</button>}
                             {notif.status !== 'archived' && <button onClick={() => onAction('archive', notif.id)} className="text-xs text-alert hover:underline">Archivar</button>}
                             {notif.status === 'archived' && <button onClick={() => onAction('unarchive', notif.id)} className="text-xs text-info hover:underline">Desarchivar</button>}
                         </div>
                    </li>
                ))}
            </ul>
             {totalPages > 1 && (
                <div className="flex justify-end items-center p-4 border-t border-neutral-border">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Anterior</button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Siguiente</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
