import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { LoanConfig } from '../../types';
import Spinner from '../ui/Spinner';

const LoanSettingsManager: React.FC = () => {
    const [config, setConfig] = useState<LoanConfig | null>(null);
    const [loading, setLoading] = useState({ config: true });

    const fetchConfig = useCallback(async () => {
        setLoading(prev => ({ ...prev, config: true }));
        const conf = await api.getLoanConfig();
        setConfig(conf);
        setLoading(prev => ({ ...prev, config: false }));
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleConfigChange = async (days: number) => {
        if (config) {
            const newConfig = { ...config, alertDaysBeforeExpiry: days };
            setConfig(newConfig);
            await api.updateLoanConfig(newConfig);
        }
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-on-surface">Configuración de Préstamos</h2>
            
            {loading.config ? <Spinner/> : (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="block text-lg font-semibold text-on-surface mb-2">Alertas de Vencimiento de Préstamo</label>
                    <div className="flex items-center gap-2">
                        <span>Avisar con</span>
                        <input 
                            type="number" 
                            value={config?.alertDaysBeforeExpiry || 0} 
                            onChange={e => handleConfigChange(parseInt(e.target.value, 10))} 
                            className="w-20 bg-slate-700 p-1 rounded-md text-center" 
                        />
                        <span>días de anticipación.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanSettingsManager;