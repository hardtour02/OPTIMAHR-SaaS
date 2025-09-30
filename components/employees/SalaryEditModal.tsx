
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, SalaryConfig, ConversionRate } from '../../types';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';

interface SalaryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: Employee;
}

const SalaryEditModal: React.FC<SalaryEditModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const [formData, setFormData] = useState({
        minSalary: employee.minSalary || 0,
        currentSalary: employee.currentSalary || 0,
        maxSalary: employee.maxSalary || 0,
    });
    const [config, setConfig] = useState<SalaryConfig | null>(null);
    const [rates, setRates] = useState<ConversionRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configData, ratesData] = await Promise.all([api.getSalaryConfig(), api.getConversionRates()]);
                setConfig(configData);
                setRates(ratesData);
            } catch (error) {
                console.error("Failed to load salary config", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const conversionRate = useMemo(() => {
        if (!config || rates.length === 0) return 1;
        const rate = rates.find(r => r.from === config.primaryCurrency && r.to === config.secondaryCurrency);
        return rate?.rate || 1;
    }, [config, rates]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.updateEmployee({ ...employee, ...formData });
            onSave();
        } catch (error) {
            console.error("Failed to update salary", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const convertedSalaries = {
        min: (formData.minSalary * conversionRate).toLocaleString(undefined, {style: 'currency', currency: config?.secondaryCurrency}),
        current: (formData.currentSalary * conversionRate).toLocaleString(undefined, {style: 'currency', currency: config?.secondaryCurrency}),
        max: (formData.maxSalary * conversionRate).toLocaleString(undefined, {style: 'currency', currency: config?.secondaryCurrency}),
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface">Gestionar Salario</h3>
                        <p className="text-on-surface-variant">para {employee.firstName} {employee.lastName} ({employee.idNumber})</p>
                        <div className="mt-4">
                            {loading ? <Spinner/> : (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Primary Currency */}
                                    <h4 className="font-semibold text-primary col-span-full">Moneda Principal ({config?.primaryCurrency})</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Salario Mínimo</label>
                                        <input type="number" step="0.01" name="minSalary" value={formData.minSalary} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Salario Máximo</label>
                                        <input type="number" step="0.01" name="maxSalary" value={formData.maxSalary} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2"/>
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Salario Actual (el que se usa en el sistema)</label>
                                        <input type="number" step="0.01" name="currentSalary" value={formData.currentSalary} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-lg font-bold"/>
                                    </div>
                                    
                                    {/* Secondary Currency */}
                                    <h4 className="font-semibold text-secondary col-span-full mt-4 border-t border-neutral-border pt-4">Moneda Secundaria ({config?.secondaryCurrency}) - Autocalculado</h4>
                                    <p className="text-sm">Mínimo: <span className="font-mono">{convertedSalaries.min}</span></p>
                                    <p className="text-sm">Máximo: <span className="font-mono">{convertedSalaries.max}</span></p>
                                    <p className="col-span-full text-lg">Actual: <strong className="font-mono">{convertedSalaries.current}</strong></p>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting || loading} className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryEditModal;
