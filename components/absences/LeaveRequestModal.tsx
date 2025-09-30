
import React, { useState, useMemo } from 'react';
import { LeavePolicy } from '../../types';
import { api } from '../../services/api';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    policies: LeavePolicy[];
    employeeId: string;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSave, policies, employeeId }) => {
    const [policyId, setPolicyId] = useState(policies[0]?.id || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const requestedDays = useMemo(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return diffDays;
            }
        }
        return 0;
    }, [startDate, endDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (requestedDays <= 0) {
            setError('La fecha de fin debe ser igual o posterior a la fecha de inicio.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.addLeaveRequest({
                employeeId,
                policyId,
                startDate,
                endDate,
                reason,
                requestedDays,
            });
            onSave();
        } catch (err) {
            setError('Error al enviar la solicitud.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">Solicitar Ausencia</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Tipo de Ausencia</label>
                                <select value={policyId} onChange={e => setPolicyId(e.target.value)} required className="w-full bg-background border border-neutral-border rounded-md p-2">
                                    {policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha de Inicio</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-background border border-neutral-border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha de Fin</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-background border border-neutral-border rounded-md p-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Motivo</label>
                                <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3} className="w-full bg-background border border-neutral-border rounded-md p-2"></textarea>
                            </div>
                            <div className="text-center text-on-surface-variant pt-2">
                                Total de días solicitados: <span className="font-bold text-secondary">{requestedDays}</span>
                            </div>
                            {error && <p className="text-sm text-error text-center">{error}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover font-semibold disabled:opacity-50">
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveRequestModal;
