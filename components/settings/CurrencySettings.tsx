
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { SalaryConfig, Currency, ConversionRate } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const CurrencySettings: React.FC = () => {
    const [config, setConfig] = useState<SalaryConfig | null>(null);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [rates, setRates] = useState<ConversionRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for modals and forms
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(null);
    const [rateToDelete, setRateToDelete] = useState<ConversionRate | null>(null);
    const [newRate, setNewRate] = useState({ from: 'USD', to: 'EUR', rate: 1.0 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, currenciesData, ratesData] = await Promise.all([
                api.getSalaryConfig(),
                api.getCurrencies(),
                api.getConversionRates(),
            ]);
            setConfig(configData);
            setCurrencies(currenciesData);
            setRates(ratesData);
            if(configData.primaryCurrency) {
                setNewRate(prev => ({...prev, from: configData.primaryCurrency}));
            }
        } catch (err) {
            setError('Failed to load currency settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConfigChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (config) {
            const newConfig = { ...config, [e.target.name]: e.target.value };
            setConfig(newConfig);
            await api.updateSalaryConfig(newConfig);
        }
    };
    
    const handleSaveCurrency = async (currencyData: Omit<Currency, 'id'> | Currency) => {
        await ('id' in currencyData ? api.updateCurrency(currencyData) : api.addCurrency(currencyData));
        fetchData();
        setIsCurrencyModalOpen(false);
    };
    
    const handleAddRate = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newRate.from === newRate.to) {
            setError("Cannot convert a currency to itself.");
            return;
        }
        setError('');
        await api.addConversionRate(newRate);
        fetchData();
    };
    
    const handleConfirmDeleteCurrency = async () => {
        if(currencyToDelete) {
            await api.deleteCurrency(currencyToDelete.id);
            setCurrencyToDelete(null);
            fetchData();
        }
    };
    
    const handleConfirmDeleteRate = async () => {
        if(rateToDelete) {
            await api.deleteConversionRate(rateToDelete.id);
            setRateToDelete(null);
            fetchData();
        }
    };

    if (loading) return <div className="h-64"><Spinner /></div>;

    return (
        <div className="space-y-8">
            {error && <p className="text-red-400 text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
            
            {/* Main Currency Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="block text-lg font-semibold text-on-surface mb-2">Moneda Principal</label>
                    <select name="primaryCurrency" value={config?.primaryCurrency} onChange={handleConfigChange} className="w-full bg-slate-700 rounded-md p-2">
                        {currencies.map(c => <option key={c.id} value={c.code}>{c.name} ({c.code})</option>)}
                    </select>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="block text-lg font-semibold text-on-surface mb-2">Moneda Secundaria</label>
                     <select name="secondaryCurrency" value={config?.secondaryCurrency} onChange={handleConfigChange} className="w-full bg-slate-700 rounded-md p-2">
                        {currencies.map(c => <option key={c.id} value={c.code}>{c.name} ({c.code})</option>)}
                    </select>
                </div>
            </div>

            {/* Currency Management */}
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-on-surface">Gestionar Monedas</h3>
                    <button onClick={() => { setEditingCurrency(null); setIsCurrencyModalOpen(true); }} className="bg-secondary text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-secondary/80 text-sm">+ Añadir Moneda</button>
                </div>
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                     <ul className="divide-y divide-slate-700">
                        {currencies.map(c => (
                            <li key={c.id} className="p-3 flex justify-between items-center hover:bg-slate-800">
                                <div><span className="font-bold">{c.code}</span> - {c.name}</div>
                                <div className="space-x-2">
                                    <button onClick={() => { setEditingCurrency(c); setIsCurrencyModalOpen(true); }} className="p-1.5 text-yellow-400"><PencilIcon/></button>
                                    <button onClick={() => setCurrencyToDelete(c)} className="p-1.5 text-red-400"><TrashIcon/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

             {/* Conversion Rate Management */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-on-surface">Tasas de Conversión</h3>
                <form onSubmit={handleAddRate} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 grid grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Desde</label>
                        <select value={newRate.from} onChange={e => setNewRate({...newRate, from: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md">{currencies.map(c=><option key={c.id} value={c.code}>{c.code}</option>)}</select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Hacia</label>
                        <select value={newRate.to} onChange={e => setNewRate({...newRate, to: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md">{currencies.map(c=><option key={c.id} value={c.code}>{c.code}</option>)}</select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Tasa (1 {newRate.from} = ?)</label>
                        <input type="number" step="any" value={newRate.rate} onChange={e => setNewRate({...newRate, rate: parseFloat(e.target.value)})} required className="w-full bg-slate-700 p-2 rounded-md"/>
                    </div>
                    <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary/80 h-10">Añadir/Actualizar Tasa</button>
                </form>

                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                    <ul className="divide-y divide-slate-700">
                        {rates.map(r => (
                            <li key={r.id} className="p-3 flex justify-between items-center hover:bg-slate-800">
                                <div>1 {r.from} = <span className="font-bold text-secondary">{r.rate} {r.to}</span></div>
                                <button onClick={() => setRateToDelete(r)} className="p-1.5 text-red-400"><TrashIcon/></button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Modals */}
            {isCurrencyModalOpen && <CurrencyModal onClose={() => setIsCurrencyModalOpen(false)} onSave={handleSaveCurrency} currency={editingCurrency}/>}
            {currencyToDelete && <ConfirmationModal isOpen={!!currencyToDelete} onClose={() => setCurrencyToDelete(null)} onConfirm={handleConfirmDeleteCurrency} title="Confirmar Eliminación" message={`¿Eliminar la moneda ${currencyToDelete.code}?`}/>}
            {rateToDelete && <ConfirmationModal isOpen={!!rateToDelete} onClose={() => setRateToDelete(null)} onConfirm={handleConfirmDeleteRate} title="Confirmar Eliminación" message={`¿Eliminar la tasa de ${rateToDelete.from} a ${rateToDelete.to}?`}/>}
        </div>
    );
};

interface CurrencyModalProps { onClose: () => void; onSave: (data: Currency | Omit<Currency, 'id'>) => void; currency: Currency | null; }
const CurrencyModal: React.FC<CurrencyModalProps> = ({ onClose, onSave, currency }) => {
    const [form, setForm] = useState({ code: currency?.code || '', name: currency?.name || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [e.target.name]: e.target.value});
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(currency ? {...form, id: currency.id} : form); };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
             <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold">{currency ? 'Editar' : 'Añadir'} Moneda</h3>
                        <div><label className="block text-sm mb-1">Código (ej. USD)</label><input name="code" value={form.code} onChange={handleChange} required className="w-full bg-slate-700 p-2 rounded-md"/></div>
                        <div><label className="block text-sm mb-1">Nombre (ej. Dólar estadounidense)</label><input name="name" value={form.name} onChange={handleChange} required className="w-full bg-slate-700 p-2 rounded-md"/></div>
                    </div>
                    <div className="flex justify-end p-4 border-t border-slate-700 space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 font-semibold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default CurrencySettings;
