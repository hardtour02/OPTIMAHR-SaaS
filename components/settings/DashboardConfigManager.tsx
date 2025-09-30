import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { DashboardConfig, CardConfig, FilterConfig, ChartConfig } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

type DashboardType = 'employees' | 'loans' | 'inventory_items' | 'inventory_accessories';
type SubTab = 'cards' | 'filters' | 'charts';
type DataKeys = {
    card: { key: string, label: string }[];
    filter: { key: string, label: string }[];
    chart: { key: string, label: string }[];
};

const DashboardConfigManager: React.FC = () => {
    const [selectedDashboard, setSelectedDashboard] = useState<DashboardType>('employees');
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [dataKeys, setDataKeys] = useState<DataKeys | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<SubTab>('cards');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: SubTab, id: string, name: string } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [configData, keysData] = await Promise.all([
                api.getDashboardConfig(selectedDashboard),
                api.getAvailableDataKeys(selectedDashboard),
            ]);
            setConfig(configData);
            setDataKeys(keysData);
        } catch (err) {
            setError('No se pudo cargar la configuración.');
        } finally {
            setLoading(false);
        }
    }, [selectedDashboard]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdate = async (newConfig: DashboardConfig) => {
        try {
            setError('');
            setConfig(newConfig);
            await api.updateDashboardConfig(selectedDashboard, newConfig);
        } catch (err) {
            setError('No se pudo guardar la configuración.');
            fetchData(); // Revert optimistic update
        }
    };
    
    const handleAddItem = (type: SubTab, newItem: any) => {
        if (!config) return;
        const newConfig = { ...config };
        switch (type) {
            case 'cards':
                newConfig.cards.push(newItem as CardConfig);
                break;
            case 'filters':
                newConfig.filters.push(newItem as FilterConfig);
                break;
            case 'charts':
                newConfig.charts.push(newItem as ChartConfig);
                break;
        }
        handleUpdate(newConfig);
        setIsModalOpen(false);
    };

    const handleEditItem = (type: SubTab, id: string, field: string, value: any) => {
        if (!config) return;
        const newConfig = { ...config };
        switch (type) {
            case 'cards': {
                const index = newConfig.cards.findIndex((item) => item.id === id);
                if (index > -1) newConfig.cards[index] = { ...newConfig.cards[index], [field]: value };
                break;
            }
            case 'filters': {
                const index = newConfig.filters.findIndex((item) => item.id === id);
                if (index > -1) newConfig.filters[index] = { ...newConfig.filters[index], [field]: value };
                break;
            }
            case 'charts': {
                const index = newConfig.charts.findIndex((item) => item.id === id);
                if (index > -1) newConfig.charts[index] = { ...newConfig.charts[index], [field]: value };
                break;
            }
        }
        handleUpdate(newConfig);
    };

    const confirmDeleteItem = async () => {
        if (!config || !itemToDelete) return;
        const { type, id } = itemToDelete;
        const newConfig = { ...config };
        switch (type) {
            case 'cards':
                newConfig.cards = newConfig.cards.filter((item) => item.id !== id);
                break;
            case 'filters':
                newConfig.filters = newConfig.filters.filter((item) => item.id !== id);
                break;
            case 'charts':
                newConfig.charts = newConfig.charts.filter((item) => item.id !== id);
                break;
        }
        handleUpdate(newConfig);
        setItemToDelete(null);
    };

    if (loading) return <div className="h-64"><Spinner /></div>;
    if (error && !config) return <p className="text-red-400 text-center">{error}</p>;
    if (!config || !dataKeys) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-bold text-on-surface">Configuración de Dashboards</h2>
                    <p className="text-on-surface-variant mt-1">Seleccione el dashboard que desea configurar.</p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
                    <select 
                        value={selectedDashboard} 
                        onChange={(e) => setSelectedDashboard(e.target.value as DashboardType)}
                        className="bg-slate-700 border border-slate-600 rounded-md p-2 text-on-surface font-semibold"
                    >
                        <option value="employees">Empleados</option>
                        <option value="loans">Préstamos</option>
                        <option value="inventory_items">Inventario (Ítems)</option>
                        <option value="inventory_accessories">Inventario (Accesorios)</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <nav className="-mb-px flex space-x-6" aria-label="Sub-Tabs">
                    <button onClick={() => setActiveTab('cards')} className={`${activeTab === 'cards' ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}>Tarjetas</button>
                    <button onClick={() => setActiveTab('filters')} className={`${activeTab === 'filters' ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}>Filtros</button>
                    <button onClick={() => setActiveTab('charts')} className={`${activeTab === 'charts' ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}>Gráficas</button>
                </nav>
            </div>
            
            <div className="space-y-4">
                {activeTab === 'cards' && config.cards.map(item => (
                    <ConfigItem key={item.id} onEdit={(field, value) => handleEditItem('cards', item.id, field, value)} onDelete={() => setItemToDelete({type: 'cards', id: item.id, name: item.title})} item={item} type="cards" />
                ))}
                {activeTab === 'filters' && config.filters.map(item => (
                    <ConfigItem key={item.id} onEdit={(field, value) => handleEditItem('filters', item.id, field, value)} onDelete={() => setItemToDelete({type: 'filters', id: item.id, name: item.label})} item={item} type="filters" />
                ))}
                {activeTab === 'charts' && config.charts.map(item => (
                    <ConfigItem key={item.id} onEdit={(field, value) => handleEditItem('charts', item.id, field, value)} onDelete={() => setItemToDelete({type: 'charts', id: item.id, name: item.title})} item={item} type="charts" />
                ))}
                 <button onClick={() => setIsModalOpen(true)} className="w-full text-center py-3 border-2 border-dashed border-slate-600 rounded-lg text-on-surface-variant hover:bg-slate-800 hover:border-slate-500 transition-colors">
                    + Añadir {activeTab === 'cards' ? 'Tarjeta' : activeTab === 'filters' ? 'Filtro' : 'Gráfica'}
                </button>
            </div>

            {error && <p className="text-red-400 text-right mt-2">{error}</p>}
            
            {isModalOpen && <AddItemModal type={activeTab} dataKeys={dataKeys} onClose={() => setIsModalOpen(false)} onSave={handleAddItem} />}
            {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDeleteItem} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar "${itemToDelete.name}"?`} />}
        </div>
    );
};

const ConfigItem: React.FC<{item: any, type: SubTab, onEdit: (field: string, value: any) => void, onDelete: () => void}> = ({ item, type, onEdit, onDelete }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
        <div className="flex justify-between items-start">
            <input 
                type="text" 
                value={item.title || item.label} 
                onChange={(e) => onEdit(type === 'filters' ? 'label' : 'title', e.target.value)} 
                className="w-full bg-slate-700 p-2 rounded-md text-on-surface text-lg font-semibold"
            />
            <div className="flex items-center gap-2 pl-4">
                <ToggleSwitch enabled={item.visible} onChange={() => onEdit('visible', !item.visible)} />
                <button onClick={onDelete} className="p-1.5 text-red-400 hover:bg-slate-700 rounded-md"><TrashIcon/></button>
            </div>
        </div>
        {type === 'charts' && (
             <div>
                <label className="text-sm text-on-surface-variant">Tipo de Gráfica</label>
                <select value={item.type} onChange={(e) => onEdit('type', e.target.value)} className="w-full bg-slate-700 p-2 rounded-md mt-1">
                    <option value="bar">Barras</option>
                    <option value="pie">Torta</option>
                </select>
            </div>
        )}
    </div>
);

const AddItemModal: React.FC<{type: SubTab, dataKeys: DataKeys, onClose: () => void, onSave: (type: SubTab, item: any) => void}> = ({ type, dataKeys, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [dataKey, setDataKey] = useState('');
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
    const [icon, setIcon] = useState<CardConfig['icon']>('users');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newItem;
        const baseItem = { id: `${type}_${Date.now()}`, visible: true, dataKey };

        switch (type) {
            case 'cards':
                newItem = { ...baseItem, title: title || 'Nueva Tarjeta', icon };
                break;
            case 'filters':
                newItem = { ...baseItem, label: title || 'Nuevo Filtro' };
                break;
            case 'charts':
                newItem = { ...baseItem, title: title || 'Nueva Gráfica', type: chartType };
                break;
        }
        onSave(type, newItem);
    };

    const keys = type === 'cards' ? dataKeys.card : type === 'filters' ? dataKeys.filter : dataKeys.chart;
    const icons: { value: CardConfig['icon'], label: string }[] = [
        {value: 'users', label: 'Grupo de Usuarios'},
        {value: 'check', label: 'Check'},
        {value: 'x', label: 'X'},
        {value: 'clipboard', label: 'Portapapeles'},
        {value: 'alert', label: 'Alerta'},
        {value: 'archive', label: 'Archivo'},
    ]

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold">Añadir {type === 'cards' ? 'Tarjeta' : type === 'filters' ? 'Filtro' : 'Gráfica'}</h3>
                        <div>
                            <label className="block text-sm mb-1">{type === 'filters' ? 'Etiqueta del Filtro' : 'Título'}</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Dato del Sistema a Usar</label>
                            <select value={dataKey} onChange={e => setDataKey(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md">
                                <option value="" disabled>Seleccione un dato</option>
                                {keys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                            </select>
                        </div>
                        {type === 'charts' && (
                             <div>
                                <label className="block text-sm mb-1">Tipo de Gráfica</label>
                                <select value={chartType} onChange={e => setChartType(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md">
                                    <option value="bar">Barras</option><option value="pie">Torta</option>
                                </select>
                            </div>
                        )}
                        {type === 'cards' && (
                             <div>
                                <label className="block text-sm mb-1">Icono</label>
                                <select value={icon} onChange={e => setIcon(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md">
                                    {icons.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                     <div className="flex justify-end p-4 border-t border-slate-700 space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 font-semibold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button type="button" onClick={onChange} className={`${enabled ? 'bg-primary' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors`}>
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition`} />
    </button>
);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default DashboardConfigManager;