import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaveRequest, Employee, LeavePolicy } from '../../types';
import { api } from '../../services/api';
import { useFormatting } from '../../hooks/useFormatting';

interface AbsencesSummaryTableProps {
    filteredRequests: LeaveRequest[];
}

const AbsencesSummaryTable: React.FC<AbsencesSummaryTableProps> = ({ filteredRequests }) => {
    const navigate = useNavigate();
    const { formatDate } = useFormatting();
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [policies, setPolicies] = React.useState<LeavePolicy[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            const [emps, pols] = await Promise.all([api.getEmployees(), api.getLeavePolicies()]);
            setEmployees(emps);
            setPolicies(pols);
        };
        fetchData();
    }, []);

    const dataMap = useMemo(() => ({
        employeeMap: new Map(employees.map(e => [e.id, `${e.firstName} ${e.lastName}`])),
        policyMap: new Map(policies.map(p => [p.id, p.name])),
    }), [employees, policies]);
    
    // Sort by pending requests first, then by start date
    const requestsToDisplay = [...filteredRequests]
        .sort((a, b) => {
            if (a.status === 'Pendiente' && b.status !== 'Pendiente') return -1;
            if (a.status !== 'Pendiente' && b.status === 'Pendiente') return 1;
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        })
        .slice(0, 10);
        
    const statusStyles: { [key in LeaveRequest['status']]: string } = {
        Pendiente: 'bg-yellow-500/20 text-yellow-400',
        Aprobado: 'bg-green-500/20 text-green-400',
        Rechazado: 'bg-red-500/20 text-red-400',
        Cancelado: 'bg-slate-500/20 text-slate-400',
    };

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-slate-700 space-y-4">
            <h2 className="text-xl font-semibold text-on-surface">Resumen de Solicitudes de Ausencia</h2>
            <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Empleado</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Fechas</th>
                            <th scope="col" className="px-6 py-3">Días</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requestsToDisplay.length > 0 ? requestsToDisplay.map((req) => (
                            <tr key={req.id} className="bg-surface border-b border-slate-700 hover:bg-slate-800 cursor-pointer" onClick={() => navigate(`/employee/${req.employeeId}`)}>
                                <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                                    {dataMap.employeeMap.get(req.employeeId) || 'N/A'}
                                </td>
                                <td className="px-6 py-4">{dataMap.policyMap.get(req.policyId) || 'N/A'}</td>
                                <td className="px-6 py-4">{formatDate(req.startDate)} - {formatDate(req.endDate)}</td>
                                <td className="px-6 py-4 text-center">{req.requestedDays}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[req.status]}`}>
                                        {req.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8">No se encontraron solicitudes de ausencia con los filtros aplicados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AbsencesSummaryTable;
