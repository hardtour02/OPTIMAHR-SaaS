
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { LeaveRequest, LeavePolicy, Employee, Company } from '../../types';
import Spinner from '../ui/Spinner';
import { useFormatting } from '../../hooks/useFormatting';
import ReviewRequestModal from './ReviewRequestModal';

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

interface ManageAbsencesViewProps {
    policies: LeavePolicy[];
}

const ManageAbsencesView: React.FC<ManageAbsencesViewProps> = ({ policies }) => {
    const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<LeaveRequest['status'] | 'all'>('Pendiente');
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [requestToReview, setRequestToReview] = useState<LeaveRequest | null>(null);
    const { formatDate } = useFormatting();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [requestsData, employeesData, companiesData] = await Promise.all([
                api.getAllLeaveRequests(),
                api.getEmployees(),
                api.getCompanies(),
            ]);
            setAllRequests(requestsData);
            setEmployees(employeesData);
            setCompanies(companiesData);
        } catch (error) {
            console.error("Failed to fetch management data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const employeeDataMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);
    const policyMap = useMemo(() => new Map(policies.map(p => [p.id, p.name])), [policies]);

    const filteredRequests = useMemo(() => {
        return allRequests
            .filter(req => {
                const employee = employeeDataMap.get(req.employeeId);
                if (!employee) return false;

                const statusMatch = statusFilter === 'all' || req.status === statusFilter;
                const companyMatch = !companyFilter || employee.company === companyFilter;
                const employeeName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
                const searchMatch = searchTerm === '' || employeeName.includes(searchTerm.toLowerCase());
                
                return statusMatch && searchMatch && companyMatch;
            })
    }, [allRequests, statusFilter, searchTerm, companyFilter, employeeDataMap]);

    const handleReviewFinished = () => {
        setRequestToReview(null);
        fetchData(); // Refresh data after review
    };

    if (loading) return <div className="h-96"><Spinner /></div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Buscar por empleado..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
                />
                <select
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                    className="bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
                >
                    <option value="">Todas las Empresas</option>
                    {companies.map(comp => <option key={comp.id} value={comp.name}>{comp.name}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
                >
                    <option value="all">Todos los Estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Cancelado">Cancelado</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Empleado</th>
                            <th scope="col" className="px-6 py-3">Tipo de Ausencia</th>
                            <th scope="col" className="px-6 py-3">Fechas</th>
                            <th scope="col" className="px-6 py-3">Días</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Motivo</th>
                            <th scope="col" className="px-6 py-3 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(request => {
                            const employee = employeeDataMap.get(request.employeeId);
                            return (
                                <tr key={request.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                                    <td className="px-6 py-4 font-medium text-on-surface">{employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}</td>
                                    <td className="px-6 py-4">{policyMap.get(request.policyId)}</td>
                                    <td className="px-6 py-4">{formatDate(request.startDate)} - {formatDate(request.endDate)}</td>
                                    <td className="px-6 py-4">{request.requestedDays}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[request.status]}`}>
                                            {statusLabels[request.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs max-w-xs truncate" title={request.reason}>{request.reason}</td>
                                    <td className="px-6 py-4 text-center">
                                        {request.status === 'Pendiente' && (
                                            <button 
                                                onClick={() => setRequestToReview(request)}
                                                className="text-primary hover:underline text-xs font-semibold"
                                            >
                                                Revisar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                         {filteredRequests.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-8">No se encontraron solicitudes.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {requestToReview && (
                <ReviewRequestModal
                    isOpen={!!requestToReview}
                    onClose={() => setRequestToReview(null)}
                    onReviewed={handleReviewFinished}
                    request={requestToReview}
                    employeeName={(() => {
                        const emp = employeeDataMap.get(requestToReview.employeeId);
                        return emp ? `${emp.firstName} ${emp.lastName}` : '';
                    })()}
                    policyName={policyMap.get(requestToReview.policyId) || ''}
                />
            )}
        </div>
    );
};

export default ManageAbsencesView;
