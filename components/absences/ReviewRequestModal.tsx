
import React, { useState } from 'react';
import { LeaveRequest } from '../../types';
import { api } from '../../services/api';
import { useFormatting } from '../../hooks/useFormatting';

interface ReviewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReviewed: () => void;
    request: LeaveRequest;
    employeeName: string;
    policyName: string;
}

const ReviewRequestModal: React.FC<ReviewRequestModalProps> = ({ isOpen, onClose, onReviewed, request, employeeName, policyName }) => {
    const [managerNotes, setManagerNotes] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { formatDate } = useFormatting();

    // FIX: Changed status type to match the API expectation ('Aprobado' | 'Rechazado').
    const handleAction = async (status: 'Aprobado' | 'Rechazado') => {
        setError('');
        setIsSubmitting(true);
        try {
            await api.reviewLeaveRequest(request.id, status, managerNotes);
            onReviewed();
        } catch (err: any) {
            setError(err.message || `Error al ${status === 'Aprobado' ? 'aprobar' : 'rechazar'} la solicitud.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Revisar Solicitud de Ausencia</h3>
                    <div className="space-y-3 text-sm">
                        <p><span className="font-semibold text-on-surface-variant">Empleado:</span> {employeeName}</p>
                        <p><span className="font-semibold text-on-surface-variant">Tipo:</span> {policyName}</p>
                        <p><span className="font-semibold text-on-surface-variant">Fechas:</span> {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.requestedDays} días)</p>
                        <p><span className="font-semibold text-on-surface-variant">Motivo:</span></p>
                        <p className="p-2 bg-background rounded text-on-surface-variant border border-neutral-border">{request.reason}</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Notas del Gerente (Opcional)</label>
                            <textarea value={managerNotes} onChange={e => setManagerNotes(e.target.value)} rows={2} className="w-full bg-background border border-neutral-border rounded-md p-2"></textarea>
                        </div>
                         {error && <p className="text-sm text-error text-center">{error}</p>}
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                    <button onClick={() => handleAction('Rechazado')} disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-error text-white hover:opacity-90 font-semibold disabled:opacity-50">
                        {isSubmitting ? '...' : 'Rechazar'}
                    </button>
                    <button onClick={() => handleAction('Aprobado')} disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-success text-white hover:opacity-90 font-semibold disabled:opacity-50">
                        {isSubmitting ? '...' : 'Aprobar'}
                    </button>
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewRequestModal;
