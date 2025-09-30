
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { LeaveRequest, LeavePolicy } from '../../types';
import { useFormatting } from '../../hooks/useFormatting';
import Spinner from '../ui/Spinner';

interface AbsenceHistoryProps {
    employeeId: string;
}

const statusStyles: { [key: string]: string } = {
    Pendiente: 'bg-alert/20 text-alert',
    Aprobado: 'bg-success/20 text-success',
    Rechazado: 'bg-error/20 text-error',
    Cancelado: 'bg-on-surface-variant/20 text-on-surface-variant',
};

const AbsenceHistory: React.FC<AbsenceHistoryProps> = ({ employeeId }) => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatDate } = useFormatting();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [requestsData, policiesData] = await Promise.all([
                    api.getEmployeeLeaveRequests(employeeId),
                    api.getLeavePolicies()
                ]);
                setRequests(requestsData);
                setPolicies(policiesData);
            } catch (error) {
                console.error("Failed to fetch absence history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [employeeId]);

    const policyMap = useMemo(() => new Map(policies.map(p => [p.id, p.name])), [policies]);

    if (loading) {
        return <div className="h-48 flex items-center justify-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-on-surface">Historial de Ausencias</h3>
            <div className="overflow-x-auto border border-neutral-border rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tipo de Ausencia</th>
                            <th scope="col" className="px-6 py-3">Fechas</th>
                            <th scope="col" className="px-6 py-3">Días</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Motivo del Empleado</th>
                            <th scope="col" className="px-6 py-3">Notas del Gerente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(request => (
                            <tr key={request.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover">
                                <td className="px-6 py-4 font-medium text-on-surface">{policyMap.get(request.policyId) || 'Desconocido'}</td>
                                <td className="px-6 py-4">{formatDate(request.startDate)} - {formatDate(request.endDate)}</td>
                                <td className="px-6 py-4">{request.requestedDays}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[request.status] || 'bg-on-surface-variant/20 text-on-surface-variant'}`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs max-w-xs truncate" title={request.reason}>{request.reason}</td>
                                <td className="px-6 py-4 text-xs max-w-xs truncate" title={request.managerNotes}>{request.managerNotes || 'N/A'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8">Este empleado no tiene solicitudes de ausencia.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AbsenceHistory;
