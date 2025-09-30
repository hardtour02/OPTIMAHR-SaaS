
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../../types';

interface EmployeeSummaryTableProps {
    filteredEmployees: Employee[];
}

const EmployeeSummaryTable: React.FC<EmployeeSummaryTableProps> = ({ filteredEmployees }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border space-y-4">
            <h2 className="text-xl font-semibold text-on-surface">Resumen de Análisis de Empleados</h2>
            <div className="overflow-x-auto border border-neutral-border rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre Completo</th>
                            <th scope="col" className="px-6 py-3">Cargo</th>
                            <th scope="col" className="px-6 py-3">Empresa</th>
                            <th scope="col" className="px-6 py-3">Estatus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length > 0 ? filteredEmployees.slice(0, 10).map((employee) => (
                            <tr key={employee.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover cursor-pointer" onClick={() => navigate(`/employee/${employee.id}`)}>
                                <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap flex items-center gap-3">
                                    <img className="w-8 h-8 rounded-full object-cover" src={employee.photoUrl} alt="" />
                                    {employee.firstName} {employee.lastName}
                                </td>
                                <td className="px-6 py-4">{employee.title}</td>
                                <td className="px-6 py-4">{employee.company}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'active' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                        {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8">No se encontraron empleados con los filtros aplicados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeSummaryTable;
