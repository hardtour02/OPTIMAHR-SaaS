import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { PendingChangeRequest } from '../../types';
import Spinner from '../ui/Spinner';
import { useFormatting } from '../../hooks/useFormatting';

const PendingChangesManager: React.FC = () => {
    const [requests, setRequests] = useState<PendingChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
    const { formatDate, formatTime } = useFormatting();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getPendingChanges();
            setRequests(data);
        } catch (err) {
            setError('No se pudieron cargar las solicitudes de cambio.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            setError('');
            if (action === 'approve') {
                await api.approveChangeRequest(requestId);
            } else {
                await api.rejectChangeRequest(requestId);
            }
            fetchData(); // Refresh data
        } catch (err) {
            setError('Error al procesar la solicitud.');
        }
    };

    const renderValue = (value: any) => {
        if (value === null || value === undefined) return <i className="text-slate-500">Vacío</i>;
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object') {
                 return Object.entries(parsed).map(([k, v]) => <div key={k}>{k}: {String(v)}</div>);
            }
        } catch (e) { /* Not a JSON string, render as is */ }
        return String(value);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">Solicitudes de Cambio Pendientes</h2>
            {error && <p className="text-red-400 text-center">{error}</p>}
            {loading ? <div className="h-64"><Spinner /></div> : (
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                    {requests.length > 0 ? (
                        <ul className="divide-y divide-slate-700">
                            {requests.map(req => (
                                <li key={req.id}>
                                    <div className="p-4 hover:bg-slate-800 cursor-pointer flex justify-between items-center" onClick={() => setExpandedRequestId(prev => prev === req.id ? null : req.id)}>
                                        <div>
                                            <p className="font-bold text-on-surface">{req.employeeName}</p>
                                            <p className="text-sm text-on-surface-variant">Solicitado el {formatDate(req.requestedAt)} a las {formatTime(req.requestedAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-secondary">{req.changes.length} campo(s)</span>
                                            <svg className={`w-5 h-5 transition-transform ${expandedRequestId === req.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {expandedRequestId === req.id && (
                                        <div className="p-4 bg-slate-800 border-t border-slate-700">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs uppercase text-on-surface-variant">
                                                    <tr>
                                                        <th className="py-2">Campo</th>
                                                        <th className="py-2">Valor Anterior</th>
                                                        <th className="py-2">Valor Nuevo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {req.changes.map((change, index) => (
                                                        <tr key={index} className="border-t border-slate-700/50">
                                                            <td className="py-2 font-semibold">{change.field}</td>
                                                            <td className="py-2 text-red-400 font-mono text-xs">{renderValue(change.oldValue)}</td>
                                                            <td className="py-2 text-green-400 font-mono text-xs">{renderValue(change.newValue)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <button onClick={() => handleAction(req.id, 'reject')} className="py-1 px-3 rounded-lg bg-red-600 hover:bg-red-500 font-semibold text-sm">Rechazar</button>
                                                <button onClick={() => handleAction(req.id, 'approve')} className="py-1 px-3 rounded-lg bg-green-600 hover:bg-green-500 font-semibold text-sm">Aprobar</button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-on-surface-variant p-8">No hay solicitudes de cambio pendientes.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PendingChangesManager;
