
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { SystemLog, InventoryMovementLog, Notification, InventoryItem, Accessory } from '../types';
import Spinner from '../components/ui/Spinner';
import { useFormatting } from '../hooks/useFormatting';

type MainTab = 'system' | 'inventory' | 'birthdays' | 'loans' | 'employee';
type InventorySubTab = 'items' | 'accessories' | 'alerts';

const History: React.FC = () => {
    const [mainTab, setMainTab] = useState<MainTab>('system');
    const [inventorySubTab, setInventorySubTab] = useState<InventorySubTab>('items');

    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [movements, setMovements] = useState<InventoryMovementLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);

    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { formatDate, formatTime } = useFormatting();
    
    const itemMap = useMemo(() => new Map(items.map(i => [i.id, i.name])), [items]);
    const accessoryMap = useMemo(() => new Map(accessories.map(a => [a.id, a.name])), [accessories]);

    const [uniqueLogActions, setUniqueLogActions] = useState<string[]>([]);

    // from the API for the filter dropdown, instead of relying on an unavailable mock constant.
    useEffect(() => {
        api.getSystemLogs({}).then((allLogs) => {
            const allActions = allLogs.map((log) => log.action);
            setUniqueLogActions([...new Set(allActions)]);
        });
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [
                    systemLogsData, 
                    movementsData, 
                    notificationsData, 
                    itemsData, 
                    accessoriesData
                ] = await Promise.all([
                    api.getSystemLogs({ userFilter, startDate, endDate, actionFilter }),
                    api.getAllInventoryMovements(),
                    api.getNotifications(),
                    api.getInventoryItemsWithStock(),
                    api.getAllAccessories()
                ]);
                setLogs(systemLogsData);
                setMovements(movementsData);
                setNotifications(notificationsData);
                setItems(itemsData);
                setAccessories(accessoriesData);
            } catch (error) {
                console.error("Failed to fetch history data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [userFilter, startDate, endDate, actionFilter]);
    
    const filteredMovements = useMemo(() => movements.filter(m => m.itemType === (inventorySubTab === 'items' ? 'item' : 'accessory')), [movements, inventorySubTab]);
    const filteredAlerts = useMemo(() => notifications.filter(n => n.type === 'low_stock' || n.type === 'accessory_low_stock'), [notifications]);
    
    const birthdayNotifications = useMemo(() => notifications.filter(n => n.type === 'birthday'), [notifications]);
    const loanLogs = useMemo(() => logs.filter(l => l.action.toLowerCase().includes('préstamo') || l.action.toLowerCase().includes('asignación')), [logs]);
    const employeeLogs = useMemo(() => logs.filter(l => l.action.toLowerCase().includes('empleado')), [logs]);

    const renderContent = () => {
        if (loading) return <div className="h-64 flex items-center justify-center"><Spinner/></div>;
        
        switch(mainTab) {
            case 'system': return <SystemLogTable logs={logs} />;
            case 'inventory': 
                 switch(inventorySubTab) {
                    case 'items':
                    case 'accessories':
                        return <MovementLogTable movements={filteredMovements} itemMap={itemMap} accessoryMap={accessoryMap} />;
                    case 'alerts':
                        return <AlertsTable alerts={filteredAlerts} />;
                    default: return null;
                }
            case 'birthdays': return <BirthdayHistoryTable notifications={birthdayNotifications} />;
            case 'loans': return <SystemLogTable logs={loanLogs} />;
            case 'employee': return <SystemLogTable logs={employeeLogs} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Historial del Sistema</h1>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                     <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <button onClick={() => setMainTab('system')} className={`${mainTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Sistema</button>
                        <button onClick={() => setMainTab('inventory')} className={`${mainTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Inventario</button>
                        <button onClick={() => setMainTab('birthdays')} className={`${mainTab === 'birthdays' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Cumpleaños</button>
                        <button onClick={() => setMainTab('loans')} className={`${mainTab === 'loans' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Préstamos</button>
                        <button onClick={() => setMainTab('employee')} className={`${mainTab === 'employee' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Empleado</button>
                     </nav>
                </div>
                {mainTab === 'system' && (
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        <input type="text" placeholder="Filtrar por usuario (email)..." value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="flex-grow bg-background border border-neutral-border rounded-md p-2 text-on-surface"/>
                        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2 text-on-surface">
                            <option value="">Todas las acciones</option>
                            {uniqueLogActions.map(action => <option key={action} value={action}>{action}</option>)}
                        </select>
                        <div className="flex items-center gap-2"><label className="text-sm">Desde:</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2 text-on-surface"/></div>
                        <div className="flex items-center gap-2"><label className="text-sm">Hasta:</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2 text-on-surface"/></div>
                    </div>
                )}
                 {mainTab === 'inventory' && (
                    <div className="p-4 border-b border-neutral-border">
                         <nav className="flex space-x-4" aria-label="Sub-Tabs">
                            <button onClick={() => setInventorySubTab('items')} className={`${inventorySubTab === 'items' ? 'bg-primary/20 text-primary' : 'hover:bg-primary-light-hover'} py-2 px-3 rounded-md font-medium text-sm`}>Movimientos de Ítems</button>
                            <button onClick={() => setInventorySubTab('accessories')} className={`${inventorySubTab === 'accessories' ? 'bg-primary/20 text-primary' : 'hover:bg-primary-light-hover'} py-2 px-3 rounded-md font-medium text-sm`}>Movimientos de Accesorios</button>
                            <button onClick={() => setInventorySubTab('alerts')} className={`${inventorySubTab === 'alerts' ? 'bg-primary/20 text-primary' : 'hover:bg-primary-light-hover'} py-2 px-3 rounded-md font-medium text-sm`}>Alertas de Stock</button>
                        </nav>
                    </div>
                )}
                <div className="overflow-x-auto p-4">{renderContent()}</div>
            </div>
        </div>
    );
};

const SystemLogTable: React.FC<{logs: SystemLog[]}> = ({ logs }) => {
    const { formatDate, formatTime } = useFormatting();
    return (
        <table className="w-full text-sm text-left text-on-surface-variant">
            <thead className="text-xs text-white uppercase bg-primary">
                <tr>
                    <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                    <th scope="col" className="px-6 py-3">Usuario</th>
                    <th scope="col" className="px-6 py-3">Acción</th>
                    <th scope="col" className="px-6 py-3">Detalles</th>
                </tr>
            </thead>
            <tbody>
                {logs.length > 0 ? logs.map((log) => (
                    <tr key={log.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                        <td className="px-6 py-4">{formatDate(log.timestamp)} {formatTime(log.timestamp)}</td>
                        <td className="px-6 py-4 font-medium text-on-surface">{log.user}</td>
                        <td className="px-6 py-4">{log.action}</td>
                        <td className="px-6 py-4">{log.details}</td>
                    </tr>
                )) : (
                    <tr><td colSpan={4} className="text-center py-8">No se encontraron registros.</td></tr>
                )}
            </tbody>
        </table>
    );
};

const MovementLogTable: React.FC<{movements: InventoryMovementLog[], itemMap: Map<string, string>, accessoryMap: Map<string, string>}> = ({ movements, itemMap, accessoryMap }) => {
    const { formatDate, formatTime } = useFormatting();
     const getActionColor = (action: InventoryMovementLog['action']) => {
        if (action.includes('(+)')) return 'text-success';
        if (action.includes('(-)') || action.includes('Creado') || action.includes('Eliminado')) return 'text-error';
        if (action.includes('Devuelto')) return 'text-info';
        return 'text-on-surface-variant';
    };
    return (
        <table className="w-full text-sm text-left text-on-surface-variant">
            <thead className="text-xs text-white uppercase bg-primary">
                <tr>
                    <th scope="col" className="px-6 py-3">Fecha</th>
                    <th scope="col" className="px-6 py-3">Ítem/Accesorio</th>
                    <th scope="col" className="px-6 py-3">Acción</th>
                    <th scope="col" className="px-6 py-3">Cambio</th>
                    <th scope="col" className="px-6 py-3">Usuario</th>
                    <th scope="col" className="px-6 py-3">Notas</th>
                </tr>
            </thead>
            <tbody>
                {movements.length > 0 ? movements.map(mov => (
                    <tr key={mov.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                        <td className="px-6 py-4">{formatDate(mov.timestamp)} {formatTime(mov.timestamp)}</td>
                        <td className="px-6 py-4 font-medium text-on-surface">{mov.itemType === 'item' ? itemMap.get(mov.itemId) : accessoryMap.get(mov.itemId)}</td>
                        <td className={`px-6 py-4 font-semibold ${getActionColor(mov.action)}`}>{mov.action}</td>
                        <td className={`px-6 py-4 font-mono ${mov.quantityChange > 0 ? 'text-success' : 'text-error'}`}>{mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}</td>
                        <td className="px-6 py-4">{mov.user}</td>
                        <td className="px-6 py-4 text-xs">{mov.notes}</td>
                    </tr>
                )) : (
                    <tr><td colSpan={6} className="text-center py-8">No se encontraron movimientos.</td></tr>
                )}
            </tbody>
        </table>
    )
};

const AlertsTable: React.FC<{alerts: Notification[]}> = ({ alerts }) => {
    const { formatDate, formatTime } = useFormatting();
    return (
        <table className="w-full text-sm text-left text-on-surface-variant">
            <thead className="text-xs text-white uppercase bg-primary">
                <tr>
                    <th scope="col" className="px-6 py-3">Fecha</th>
                    <th scope="col" className="px-6 py-3">Mensaje</th>
                    <th scope="col" className="px-6 py-3">Estado</th>
                </tr>
            </thead>
            <tbody>
                {alerts.length > 0 ? alerts.map(alert => (
                    <tr key={alert.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                        <td className="px-6 py-4">{formatDate(alert.timestamp)} {formatTime(alert.timestamp)}</td>
                        <td className="px-6 py-4">{alert.message}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${alert.status === 'read' ? 'bg-on-surface-variant/20 text-on-surface-variant' : 'bg-alert/20 text-alert'}`}>{alert.status === 'read' ? 'Leída' : 'No leída'}</span></td>
                    </tr>
                )) : (
                    <tr><td colSpan={3} className="text-center py-8">No se encontraron alertas de stock.</td></tr>
                )}
            </tbody>
        </table>
    );
}

const BirthdayHistoryTable: React.FC<{notifications: Notification[]}> = ({ notifications }) => {
    const { formatDate, formatTime } = useFormatting();
    return (
        <table className="w-full text-sm text-left text-on-surface-variant">
            <thead className="text-xs text-white uppercase bg-primary">
                <tr>
                    <th scope="col" className="px-6 py-3">Fecha de Notificación</th>
                    <th scope="col" className="px-6 py-3">Mensaje</th>
                </tr>
            </thead>
            <tbody>
                {notifications.length > 0 ? notifications.map(notif => (
                    <tr key={notif.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                        <td className="px-6 py-4">{formatDate(notif.timestamp)} {formatTime(notif.timestamp)}</td>
                        <td className="px-6 py-4">{notif.message}</td>
                    </tr>
                )) : (
                    <tr><td colSpan={2} className="text-center py-8">No hay historial de cumpleaños.</td></tr>
                )}
            </tbody>
        </table>
    );
};


export default History;