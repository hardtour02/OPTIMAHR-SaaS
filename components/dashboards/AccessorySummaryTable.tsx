
import React from 'react';
import { Accessory } from '../../types';

interface AccessorySummaryTableProps {
    filteredAccessories: Accessory[];
}

const AccessorySummaryTable: React.FC<AccessorySummaryTableProps> = ({ filteredAccessories }) => {
    // Sort by items closest to their minimum stock level
    const sortedAccessories = [...filteredAccessories].sort((a, b) => {
        const aUrgency = (a.availableStock ?? 0) - a.minStock;
        const bUrgency = (b.availableStock ?? 0) - b.minStock;
        return aUrgency - bUrgency;
    });

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border space-y-4">
            <h2 className="text-xl font-semibold text-on-surface">Resumen de Análisis de Accesorios (Críticos)</h2>
            <div className="overflow-x-auto border border-neutral-border rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Accesorio</th>
                            <th scope="col" className="px-6 py-3">Disponible</th>
                            <th scope="col" className="px-6 py-3">Mínimo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAccessories.length > 0 ? sortedAccessories.slice(0, 10).map((acc) => (
                            <tr key={acc.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover">
                                <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">{acc.name}</td>
                                <td className={`px-6 py-4 font-bold ${acc.availableStock! <= acc.minStock ? 'text-error' : 'text-success'}`}>{acc.availableStock}</td>
                                <td className="px-6 py-4">{acc.minStock}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${acc.status === 'Activo' ? 'bg-success/20 text-success' : 'bg-on-surface-variant/20 text-on-surface-variant'}`}>
                                        {acc.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8">No se encontraron accesorios con los filtros aplicados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccessorySummaryTable;
