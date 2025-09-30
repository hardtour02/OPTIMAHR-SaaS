
import React from 'react';
import { InventoryItem } from '../../types';

interface InventorySummaryTableProps {
    filteredItems: InventoryItem[];
}

const InventorySummaryTable: React.FC<InventorySummaryTableProps> = ({ filteredItems }) => {
    // Sort by items closest to their minimum stock level
    const sortedItems = [...filteredItems].sort((a, b) => {
        const aUrgency = (a.availableStock ?? 0) - a.minStock;
        const bUrgency = (b.availableStock ?? 0) - b.minStock;
        return aUrgency - bUrgency;
    });

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border space-y-4">
            <h2 className="text-xl font-semibold text-on-surface">Resumen de Análisis de Inventario (Ítems Críticos)</h2>
            <div className="overflow-x-auto border border-neutral-border rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-6 py-3">Ítem</th>
                            <th scope="col" className="px-6 py-3">Identificador</th>
                            <th scope="col" className="px-6 py-3">Disponible</th>
                            <th scope="col" className="px-6 py-3">Mínimo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.length > 0 ? sortedItems.slice(0, 10).map((item) => (
                            <tr key={item.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover">
                                <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">{item.name}</td>
                                <td className="px-6 py-4">{item.identifier}</td>
                                <td className={`px-6 py-4 font-bold ${item.availableStock! <= item.minStock ? 'text-error' : 'text-success'}`}>{item.availableStock}</td>
                                <td className="px-6 py-4">{item.minStock}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Activo' ? 'bg-success/20 text-success' : 'bg-on-surface-variant/20 text-on-surface-variant'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8">No se encontraron ítems con los filtros aplicados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventorySummaryTable;
