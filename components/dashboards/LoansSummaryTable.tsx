
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loan, Employee, InventoryItem } from '../../types';
import { api } from '../../services/api';

interface LoansSummaryTableProps {
    filteredLoans: Loan[];
    allLoans: Loan[];
}

const LoansSummaryTable: React.FC<LoansSummaryTableProps> = ({ filteredLoans, allLoans }) => {
    const navigate = useNavigate();
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            const [emps, inv] = await Promise.all([api.getEmployees(), api.getInventoryItemsWithStock()]);
            setEmployees(emps);
            setInventory(inv);
        };
        fetchData();
    }, []);

    const dataMap = useMemo(() => ({
        employeeMap: new Map(employees.map(e => [e.id, `${e.firstName} ${e.lastName}`])),
        inventoryMap: new Map(inventory.map(i => [i.id, i.name])),
    }), [employees, inventory]);

    const loansToDisplay = (filteredLoans.length > 0 ? filteredLoans : allLoans)
        .slice(0, 10)
        .map(loan => {
            const isOverdue = loan.status === 'Activo' && new Date(loan.returnDate) < new Date();
            return {
                ...loan,
                employeeName: dataMap.employeeMap.get(loan.employeeId) || 'N/A',
                itemName: dataMap.inventoryMap.get(loan.inventoryItemId) || 'N/A',
                effectiveStatus: isOverdue ? 'Vencido' : loan.status,
            };
        });

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border space-y-4">
            <h2 className="text-xl font-semibold text-on-surface">Resumen de Análisis de Préstamos</h2>
            <div className="overflow-x-auto border border-neutral-border rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Ítem Prestado</th>
                            <th scope="col" className="px-6 py-3">Empleado</th>
                            <th scope="col" className="px-6 py-3">Fecha Devolución</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loansToDisplay.length > 0 ? loansToDisplay.map((loan) => {
                            const statusColors: Record<string, string> = { 'Activo': 'bg-success/20 text-success', 'Devuelto': 'bg-on-surface-variant/20 text-on-surface-variant', 'Vencido': 'bg-alert/20 text-alert' };
                            return (
                                <tr key={loan.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover">
                                    <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                                        {loan.itemName}
                                    </td>
                                    <td className="px-6 py-4">{loan.employeeName}</td>
                                    <td className="px-6 py-4">{new Date(loan.returnDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[loan.effectiveStatus]}`}>
                                            {loan.effectiveStatus}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8">No se encontraron préstamos.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoansSummaryTable;
