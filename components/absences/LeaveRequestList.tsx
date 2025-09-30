
import React, { useState } from 'react';
import { LeaveRequest, LeavePolicy } from '../../types';
import { useFormatting } from '../../hooks/useFormatting';
import ConfirmationModal from '../ui/ConfirmationModal';

interface LeaveRequestListProps {
    requests: LeaveRequest[];
    policies: LeavePolicy[];
    onCancel: (requestId: string) => void;
}

const statusStyles: { [key in LeaveRequest['status']]: string } = {
    Pendiente: 'bg-alert/20 text-alert',
    Aprobado: 'bg-success/20 text-success',
    Rechazado: 'bg-error/20 text-error',
    Cancelado: 'bg-on-surface-variant/20 text-on-surface-variant',
};

const statusLabels: { [key in LeaveRequest['status']]: string } = {
    Pendiente: 'Pendiente',
    Aprobado: 'Aprobado',
    Rechazado: 'Rechazado',
    Cancelado: 'Cancelado',
};

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({ requests, policies, onCancel }) => {
    const { formatDate } = useFormatting();
    const [requestToCancel, setRequestToCancel] = useState<LeaveRequest | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    const policyMap = new Map(policies.map(p => [p.id, p.name]));
    
    const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
    const paginatedRequests = requests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    return (
        <div className="bg-surface rounded-lg shadow-lg border border-neutral-border overflow-hidden">
            <h2 className="text-xl font-bold text-on-surface p-4 border-b border-neutral-border">Mis Solicitudes</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tipo de Ausencia</th>
                            <th scope="col" className="px-6 py-3">Fechas</th>
                            <th scope="col" className="px-6 py-3">Días</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Motivo</th>
                            <th scope="col" className="px-6 py-3">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRequests.map(request => (
                            <tr key={request.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover">
                                <td className="px-6 py-4 font-medium text-on-surface">{policyMap.get(request.policyId)}</td>
                                <td className="px-6 py-4">{formatDate(request.startDate)} - {formatDate(request.endDate)}</td>
                                <td className="px-6 py-4">{request.requestedDays}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[request.status]}`}>
                                        {statusLabels[request.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs max-w-xs truncate" title={request.reason}>{request.reason}</td>
                                <td className="px-6 py-4">
                                    {request.status === 'Pendiente' && (
                                        <button 
                                            onClick={() => setRequestToCancel(request)}
                                            className="text-error hover:underline text-xs"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                         {requests.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8">No has realizado ninguna solicitud.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             {totalPages > 1 && (
                <div className="flex justify-end items-center p-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Anterior</button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Siguiente</button>
                    </div>
                </div>
            )}
             {requestToCancel && (
                <ConfirmationModal
                    isOpen={!!requestToCancel}
                    onClose={() => setRequestToCancel(null)}
                    onConfirm={() => { onCancel(requestToCancel.id); setRequestToCancel(null); }}
                    title="Confirmar Cancelación"
                    message="¿Estás seguro de que deseas cancelar esta solicitud de ausencia?"
                />
            )}
        </div>
    );
};

export default LeaveRequestList;
